import { IngredientInput } from "@/domain/models/traditional-food";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request): Promise<Response> {
  try {
    const body = await req.json();
    const recipeId = Number(body.id);

    if (isNaN(recipeId)) {
      return new Response(JSON.stringify({ message: "ID inválido" }), {
        status: 400,
      });
    }

    // Actualiza la receta principal
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

    // Detalles de receta
    if (body.detail) {
      const updatedDetail = await prisma.recipeDetail.upsert({
        where: { recipeId },
        update: { instructions: body.detail.instructions },
        create: { recipeId, instructions: body.detail.instructions },
      });

      await prisma.recipeIngredient.deleteMany({
        where: { recipeDetailId: updatedDetail.id },
      });

      const ingredientesData = (
        body.detail.ingredients as IngredientInput[]
      ).map((ing) => ({
        recipeDetailId: updatedDetail.id,
        foodId: ing.id,
        medidaId: ing.tipoMedida,
        cantidad: ing.cantidad,
      }));

      await prisma.recipeIngredient.createMany({ data: ingredientesData });
    }

    return new Response(JSON.stringify(updatedRecipe), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error desconocido";
    console.error("❌ Error al actualizar receta:", message);
    return new Response(
      JSON.stringify({ message: "Error interno", error: message }),
      {
        status: 500,
      }
    );
  }
}
