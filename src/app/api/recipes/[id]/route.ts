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
                    nutrients: true, // nutrientes del alimento
                    householdMeasures: true, // ✅ aquí
                  },
                },
                medida: true, // info de la medida usada
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

    // Reconstruir ingredientes enriquecidos con cantidad y tfingredientsipo de medida
    const enrichedIngredients =
      recipe.detail?.recipeIngredients.map((ri) => ({
        id: ri.food.id,
        name: ri.food.name,
        category: ri.food.category,
        origin: ri.food.origin,
        imageUrl: ri.food.imageUrl,
        nutrients: ri.food.nutrients || [],
        cantidad: ri.cantidad, // cantidad usada en la receta
        tipoMedida: ri.medidaId, // id de la medida
        medida: ri.medida!, // objeto completo de la medida
        householdMeasures: ri.food.householdMeasures || [], // ✅ obligatorio
      })) ?? [];

    const enrichedRecipe = {
      ...recipe,
      detail: {
        ...recipe.detail,
        ingredients: enrichedIngredients,
      },
    };

    console.log("📦 Receta enriquecida:", enrichedRecipe);
    enrichedRecipe.detail.ingredients.forEach((ingredient) => {
      // console.log("🍴 Ingrediente:", ingredient.name);
      console.log("   Cantidad usada en receta:", ingredient.cantidad); // ✅ viene de RecipeIngredient
      console.log("   Medida completa:", ingredient.medida.weightGrams);
      // console.log("   Nutrientes:", ingredient.nutrients);
    });

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

export async function DELETE(req: Request, { params }: { params: tParams }) {
  const resolvedParams = await params;
  const recipeId = Number(resolvedParams.id);

  if (isNaN(recipeId)) {
    return new Response(JSON.stringify({ message: "ID inválido" }), {
      status: 400,
    });
  }

  try {
    // 1️⃣ Buscar los detalles de la receta
    const recipeDetails = await prisma.recipeDetail.findMany({
      where: { recipeId },
      select: { id: true },
    });

    const detailIds = recipeDetails.map((d) => d.id);

    // 2️⃣ Borrar todos los RecipeIngredient asociados a esos detalles
    await prisma.recipeIngredient.deleteMany({
      where: { recipeDetailId: { in: detailIds } },
    });

    // 3️⃣ Borrar los RecipeDetail asociados
    await prisma.recipeDetail.deleteMany({
      where: { recipeId },
    });

    // 4️⃣ Finalmente borrar la receta
    await prisma.recipe.delete({
      where: { id: recipeId },
    });

    return new Response(
      JSON.stringify({ message: "Receta eliminada correctamente" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error al eliminar receta:", error);
    return new Response(JSON.stringify({ message: "Error interno" }), {
      status: 500,
    });
  }
}
