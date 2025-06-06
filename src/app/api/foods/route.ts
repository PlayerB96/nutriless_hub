import { prisma } from "@/lib/prisma";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
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
const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // O pon el dominio que necesites permitir, ej: "https://nutriless-hub.vercel.app"
  "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}
export async function POST(req: Request) {
  try {
    // 1. Obtener formData
    const formData = await req.formData();
    // 2. Extraer campos
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
        { status: 400 }
      );
    }
    const userId = Number(userIdStr);
    if (isNaN(userId)) {
      return new Response(JSON.stringify({ message: "userId inválido" }), {
        status: 400,
      });
    }
    // 3. Parsear JSON de nutritionDetails y householdMeasures
    const nutritionDetails = JSON.parse(nutritionDetailsStr);
    const householdMeasures = JSON.parse(householdMeasuresStr);

    // 4. Obtener archivo de imagen (suponiendo que el campo del form es "image")
    const imageFile = formData.get("image") as File | null;
    let imageFilename = null;
    if (imageFile && imageFile.size > 0) {
      // Generar nombre único para la imagen
      const extension = imageFile.name.split(".").pop();
      imageFilename = `${uuidv4()}.${extension}`;
      // Leer contenido del archivo como ArrayBuffer y luego Buffer
      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      // Subir a Cloudflare R2 con AWS SDK
      await s3Client.send(
        new PutObjectCommand({
          Bucket: R2_BUCKET,
          Key: imageFilename,
          Body: buffer,
          ContentType: imageFile.type,
          ACL: "public-read", // Opcional según configuración de R2
        })
      );
    }
    // 5. Transformar nutritionDetails para prisma
    const transformedNutritionDetails = Object.entries(nutritionDetails).map(
      ([key, value]) => ({
        nutrient: key,
        value: parseFloat(value as string),
        unit: "g",
      })
    );

    // 6. Crear el registro en la DB con prisma
    const newFood = await prisma.food.create({
      data: {
        name,
        category,
        userId,
        imageUrl: imageFilename, // Guarda solo el nombre de la imagen
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
    // 7. Relacionar con userFood si hace falta
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
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error) {
    console.error("Error al registrar alimento:", error);
    return new Response(
      JSON.stringify({ message: "Error interno del servidor" }),
      { status: 500 }
    );
  }
}
