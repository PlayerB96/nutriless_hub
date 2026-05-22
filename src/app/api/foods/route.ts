import { prisma } from "@/lib/prisma";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import { requireSession, assertUserIdMatch } from "@/lib/auth-helpers";
import { corsOptionsResponse, getCorsHeaders } from "@/lib/cors";

const R2_BUCKET = process.env.R2_BUCKET!;
const R2_ENDPOINT = process.env.R2_ENDPOINT!;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID!;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY!;

const s3Client = new S3Client({
  endpoint: R2_ENDPOINT,
  region: "auto",
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

type HouseholdMeasure = {
  description: string;
  quantity: string | number;
  weightGrams: string | number;
};

export async function OPTIONS() {
  return corsOptionsResponse();
}

export async function POST(req: Request) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  try {
    const formData = await req.formData();
    const name = formData.get("name")?.toString() || "";
    const category = formData.get("category")?.toString() || "";
    const userIdStr = formData.get("userId")?.toString() || "";
    const nutritionDetailsStr =
      formData.get("nutritionDetails")?.toString() || "{}";
    const householdMeasuresStr =
      formData.get("householdMeasures")?.toString() || "[]";

    if (!name || !category || !userIdStr) {
      return new Response(
        JSON.stringify({ message: "Faltan campos obligatorios" }),
        { status: 400, headers: getCorsHeaders() },
      );
    }

    const userId = Number(userIdStr);
    if (Number.isNaN(userId)) {
      return new Response(JSON.stringify({ message: "userId inválido" }), {
        status: 400,
        headers: getCorsHeaders(),
      });
    }

    const forbidden = assertUserIdMatch(auth.userId, userId);
    if (forbidden) return forbidden;

    const nutritionDetails = JSON.parse(nutritionDetailsStr);
    const householdMeasures = JSON.parse(householdMeasuresStr);

    const imageFile = formData.get("image") as File | null;
    let imageFilename = null;
    if (imageFile && imageFile.size > 0) {
      const extension = imageFile.name.split(".").pop();
      imageFilename = `${uuidv4()}.${extension}`;
      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      await s3Client.send(
        new PutObjectCommand({
          Bucket: R2_BUCKET,
          Key: imageFilename,
          Body: buffer,
          ContentType: imageFile.type,
          ACL: "public-read",
        }),
      );
    }

    const transformedNutritionDetails = Object.entries(nutritionDetails).map(
      ([key, value]) => ({
        nutrient: key,
        value: parseFloat(value as string),
        unit: "g",
      }),
    );

    const newFood = await prisma.food.create({
      data: {
        name,
        category,
        userId,
        imageUrl: imageFilename,
        nutritionDetails: {
          create: transformedNutritionDetails,
        },
        householdMeasures: {
          create:
            householdMeasures?.map((item: HouseholdMeasure) => ({
              description: item.description,
              quantity: parseFloat(item.quantity.toString()),
              weightGrams: parseFloat(item.weightGrams.toString()),
            })) || [],
        },
      },
      include: {
        nutritionDetails: true,
        householdMeasures: true,
      },
    });

    await prisma.userFood.create({
      data: {
        userId,
        foodId: newFood.id,
      },
    });

    return new Response(
      JSON.stringify({
        message: "Alimento registrado correctamente",
        food: newFood,
        imageUrlPublic: imageFilename
          ? `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${imageFilename}`
          : null,
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json", ...getCorsHeaders() },
      },
    );
  } catch (error) {
    console.error("Error al registrar alimento:", error);
    return new Response(
      JSON.stringify({ message: "Error interno del servidor" }),
      { status: 500, headers: getCorsHeaders() },
    );
  }
}
