import { prisma } from "@/lib/prisma";

type tParams = Promise<{ id: string }>;

// Obtener una receta por ID
export async function GET(req: Request, { params }: { params: tParams }) {
  const resolvedParams = await params;
  const recipeId = Number(resolvedParams.id);

  if (isNaN(recipeId)) {
    return new Response(JSON.stringify({ message: "ID inválido" }), {
      status: 400,
    });
  }

  try {
    const recipe = await prisma.recipe.findUnique({
      where: { id: recipeId },
      include: {
        detail: true,
      },
    });

    if (!recipe) {
      return new Response(JSON.stringify({ message: "Receta no encontrada" }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify(recipe), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error al obtener receta:", error);
    return new Response(JSON.stringify({ message: "Error interno" }), {
      status: 500,
    });
  }
}

// Actualizar una receta por ID
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const recipeId = Number(params.id);
  console.log("⏳ PUT /api/recipes/[id] llamado con ID:", recipeId);

  if (isNaN(recipeId)) {
    console.warn("❌ ID inválido:", params.id);
    return new Response(JSON.stringify({ message: "ID inválido" }), {
      status: 400,
    });
  }

  try {
    const body = await req.json();
    console.log("📦 Body recibido:", body);

    const updatedRecipe = await prisma.recipe.update({
      where: { id: recipeId },
      data: {
        name: body.name,
        tags: body.tags,
        portions: body.portions,
        prepTime: body.prepTime,
        cookTime: body.cookTime,
        difficulty: body.difficulty,
        image: body.image,
        isPublic: body.isPublic,
      },
    });

    console.log("✅ Receta actualizada:", updatedRecipe);

    return new Response(JSON.stringify(updatedRecipe), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("❌ Error al actualizar receta:", error);
    return new Response(
      JSON.stringify({ message: "Error interno", error: error.message }),
      {
        status: 500,
      }
    );
  }
}
