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
        detail: {
          include: {
            recipeIngredients: {
              include: {
                food: {
                  include: {
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
    // 🛠️ AQUI: reconstruir tipoMedida y cantidad desde householdMeasures
    // ejemplo: asumiendo que tú sabes qué medida usar (puede venir del primer elemento por ahora)
    const enrichedIngredients =
      recipe.detail?.recipeIngredients.map((ri) => {
        return {
          ...ri.food,
          cantidad: ri.cantidad,
          tipoMedida: ri.medidaId,
        };
      }) ?? [];

    const enrichedRecipe = {
      ...recipe,
      detail: {
        ...recipe.detail,
        ingredients: enrichedIngredients,
      },
    };
    console.log("📦 Receta enriquecida:", enrichedRecipe);
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
