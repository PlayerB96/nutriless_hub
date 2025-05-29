import { prisma } from "@/lib/prisma";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

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

type NutritionDetailInput = {
  nutrient: string;
  value: number | string;
  unit?: string;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
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
    const idStr = formData.get("id")?.toString() || "";
    const name = formData.get("name")?.toString() || "";
    const category = formData.get("category")?.toString() || "";
    const userIdStr = formData.get("userId")?.toString() || "";
    const nutritionDetailsStr =
      formData.get("nutritionDetails")?.toString() || "{}";
    const householdMeasuresStr =
      formData.get("householdMeasures")?.toString() || "[]";

    if (!idStr || !name || !category || !userIdStr) {
      return new Response(
        JSON.stringify({ message: "Faltan campos obligatorios" }),
        { status: 400 }
      );
    }

    const id = Number(idStr);
    const userId = Number(userIdStr);
    if (isNaN(id) || isNaN(userId)) {
      return new Response(JSON.stringify({ message: "ID inválido" }), {
        status: 400,
      });
    }

    // 3. Parsear JSON
    const nutritionDetails = JSON.parse(nutritionDetailsStr);
    const householdMeasures = JSON.parse(householdMeasuresStr);

    // 4. Buscar el alimento existente
    const existingFood = await prisma.food.findUnique({ where: { id } });
    if (!existingFood) {
      return new Response(
        JSON.stringify({ message: "Alimento no encontrado" }),
        { status: 404 }
      );
    }

    // 5. Procesar imagen (si se proporciona una nueva)
    const imageFile = formData.get("image") as File | null;
    let imageFilename = existingFood.imageUrl;

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
        })
      );

      if (existingFood.imageUrl) {
        try {
          await s3Client.send(
            new DeleteObjectCommand({
              Bucket: R2_BUCKET,
              Key: existingFood.imageUrl,
            })
          );
        } catch (error) {
          console.error("Error al borrar imagen antigua en R2:", error);
        }
      }
    }

    // 6. Transformar nutritionDetails
    const transformedNutritionDetails = (
      nutritionDetails as NutritionDetailInput[]
    ).map((item) => ({
      nutrient: item.nutrient,
      value: parseFloat(item.value.toString()),
      unit: item.unit || "g",
    }));

    // 7. Actualizar alimento en DB
    const updatedFood = await prisma.food.update({
      where: { id },
      data: {
        name,
        category,
        userId,
        imageUrl: imageFilename,
        nutritionDetails: {
          deleteMany: {},
          create: transformedNutritionDetails,
        },
        householdMeasures: {
          deleteMany: {},
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

    return new Response(
      JSON.stringify({
        message: "Alimento actualizado correctamente",
        food: updatedFood,
        imageUrlPublic: imageFilename
          ? `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${imageFilename}`
          : null,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    console.error("Error al actualizar alimento:", error);
    return new Response(
      JSON.stringify({ message: "Error interno del servidor" }),
      { status: 500 }
    );
  }
}
