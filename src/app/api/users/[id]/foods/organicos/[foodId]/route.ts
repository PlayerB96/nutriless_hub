import { requireSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: Request,
  context: { params: Promise<Record<string, string>> },
) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  const params = await context.params;
  const parsedFoodId = Number(params.foodId);

  if (Number.isNaN(parsedFoodId)) {
    return new Response(JSON.stringify({ message: "ID inválido" }), {
      status: 400,
    });
  }

  try {
    const existingFood = await prisma.traditionalFood.findUnique({
      where: { id: parsedFoodId },
    });

    if (!existingFood) {
      return new Response(
        JSON.stringify({ message: "El alimento no existe" }),
        { status: 404 },
      );
    }

    await prisma.recipeIngredient.deleteMany({
      where: { foodId: parsedFoodId },
    });
    await prisma.traditionalHouseholdMeasure.deleteMany({
      where: { foodId: parsedFoodId },
    });
    await prisma.traditionalNutrient.deleteMany({
      where: { foodId: parsedFoodId },
    });

    await prisma.traditionalFood.delete({ where: { id: parsedFoodId } });

    return new Response(
      JSON.stringify({ message: "Alimento eliminado correctamente" }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Error al eliminar alimento:", error);
    const message =
      error instanceof Error ? error.message : "Error desconocido";
    return new Response(JSON.stringify({ message }), { status: 500 });
  }
}
