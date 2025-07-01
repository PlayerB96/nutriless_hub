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

// ⬇️ GET: listar todas las recetas del usuario
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = Number(searchParams.get("userId"));

  if (isNaN(userId)) {
    return new Response(JSON.stringify({ message: "ID de usuario inválido" }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  try {
    const recipes = await prisma.recipe.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        detail: true,
      },
    });

    return new Response(JSON.stringify(recipes), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error) {
    console.error("Error al obtener recetas:", error);
    return new Response(JSON.stringify({ message: "Error interno" }), {
      status: 500,
      headers: corsHeaders,
    });
  }
}

// ⬇️ POST: registrar una receta nueva
export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const name = formData.get("name")?.toString().trim() || "";
    const tagsStr = formData.get("tags")?.toString().trim() || "";
    const portions = Number(formData.get("portions")?.toString() || "0");
    const prepTime = Number(formData.get("prepTime")?.toString() || "0");
    const cookTimeStr = formData.get("cookTime")?.toString().trim() || "";
    const difficulty = formData.get("difficulty")?.toString().trim() || "";
    const isPublic = formData.get("isPublic") === "true";
    const userId = Number(formData.get("userId") || "0");

    const tags = tagsStr
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    if (!name || tags.length === 0 || !difficulty || isNaN(userId)) {
      return new Response(JSON.stringify({ message: "Campos inválidos" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    const newRecipe = await prisma.recipe.create({
      data: {
        name,
        tags,
        portions,
        prepTime,
        cookTime: cookTimeStr ? Number(cookTimeStr) : null,
        difficulty,
        isPublic,
        userId,
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
    return new Response(JSON.stringify({ message: "Error interno" }), {
      status: 500,
      headers: corsHeaders,
    });
  }
}
