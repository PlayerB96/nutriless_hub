import { prisma } from "@/lib/prisma";

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
    const formData = await req.formData();

    // Extraer campos del formulario
    const name = formData.get("name")?.toString().trim() || "";
    const tagsStr = formData.get("tags")?.toString().trim() || "";
    const portionsStr = formData.get("portions")?.toString().trim() || "";
    const prepTimeStr = formData.get("prepTime")?.toString().trim() || "";
    const cookTimeStr = formData.get("cookTime")?.toString().trim() || "";
    const difficulty = formData.get("difficulty")?.toString().trim() || "";
    const isPublicStr = formData.get("isPublic")?.toString().trim() || "";

    // Validaciones básicas
    if (!name || !tagsStr || !portionsStr || !prepTimeStr || !difficulty) {
      return new Response(
        JSON.stringify({ message: "Faltan campos requeridos" }),
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    // Convertir tags (string separado por comas) a array de strings
    const tags = tagsStr
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    if (tags.length === 0) {
      return new Response(
        JSON.stringify({ message: "Debe proporcionar al menos un tag válido" }),
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    const portions = Number(portionsStr);
    const prepTime = Number(prepTimeStr);
    const cookTime = cookTimeStr ? Number(cookTimeStr) : null;
    const isPublic = isPublicStr === "true";

    // Crear la receta en base de datos
    const newRecipe = await prisma.recipe.create({
      data: {
        name,
        tags,
        portions,
        prepTime,
        cookTime,
        difficulty,
        isPublic,
      },
    });

    return new Response(
      JSON.stringify({
        message: "Receta registrada correctamente",
        recipe: newRecipe,
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error) {
    console.error("Error al registrar receta:", error);
    return new Response(
      JSON.stringify({ message: "Error interno del servidor" }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}
