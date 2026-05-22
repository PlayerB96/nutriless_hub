import { prisma } from "@/lib/prisma";
import { requireSession, requireRecipeOwned } from "@/lib/auth-helpers";

type tParams = Promise<{ id: string }>;

export async function GET(_req: Request, { params }: { params: tParams }) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  const resolvedParams = await params;
  const recipeId = Number(resolvedParams.id);

  if (Number.isNaN(recipeId)) {
    return new Response(JSON.stringify({ message: "ID inválido" }), {
      status: 400,
    });
  }

  const access = await requireRecipeOwned(recipeId, auth.userId);
  if (!access.ok) return access.response;

  try {
    const recipe = await prisma.recipe.findUnique({
      where: { id: recipeId },
      include: {
        detail: {
          include: {
            recipeIngredients: {
              include: {
                food: {
                  include: {
                    nutrients: true,
                    householdMeasures: true,
                  },
                },
                medida: true,
              },
            },
          },
        },
      },
    });

    if (!recipe) {
      return new Response(JSON.stringify({ message: "Receta no encontrada" }), {
        status: 404,
      });
    }

    const enrichedIngredients =
      recipe.detail?.recipeIngredients.map((ri) => ({
        id: ri.food.id,
        name: ri.food.name,
        category: ri.food.category,
        origin: ri.food.origin,
        imageUrl: ri.food.imageUrl,
        nutrients: ri.food.nutrients || [],
        cantidad: ri.cantidad,
        tipoMedida: ri.medidaId,
        medida: ri.medida!,
        householdMeasures: ri.food.householdMeasures || [],
      })) ?? [];

    const enrichedRecipe = {
      ...recipe,
      detail: {
        ...recipe.detail,
        ingredients: enrichedIngredients,
      },
    };

    return new Response(JSON.stringify(enrichedRecipe), {
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

export async function DELETE(_req: Request, { params }: { params: tParams }) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  const resolvedParams = await params;
  const recipeId = Number(resolvedParams.id);

  if (Number.isNaN(recipeId)) {
    return new Response(JSON.stringify({ message: "ID inválido" }), {
      status: 400,
    });
  }

  const access = await requireRecipeOwned(recipeId, auth.userId);
  if (!access.ok) return access.response;

  try {
    const recipeDetails = await prisma.recipeDetail.findMany({
      where: { recipeId },
      select: { id: true },
    });

    const detailIds = recipeDetails.map((d) => d.id);

    await prisma.recipeIngredient.deleteMany({
      where: { recipeDetailId: { in: detailIds } },
    });

    await prisma.recipeDetail.deleteMany({
      where: { recipeId },
    });

    await prisma.recipe.delete({
      where: { id: recipeId },
    });

    return new Response(
      JSON.stringify({ message: "Receta eliminada correctamente" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error al eliminar receta:", error);
    return new Response(JSON.stringify({ message: "Error interno" }), {
      status: 500,
    });
  }
}
