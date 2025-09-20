import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: Request,
  { params }: { params: { userId: string; foodId: string } }
) {
  const { foodId } = params;
  const parsedFoodId = Number(foodId);

  if (isNaN(parsedFoodId)) {
    return new Response(JSON.stringify({ message: "ID inválido" }), {
      status: 400,
    });
  }

  try {
    // ✅ Verificar que el alimento exista
    const existingFood = await prisma.traditionalFood.findUnique({
      where: { id: parsedFoodId },
    });

    if (!existingFood) {
      return new Response(
        JSON.stringify({ message: "El alimento no existe" }),
        { status: 404 }
      );
    }

    // 1️⃣ Eliminar RecipeIngredient asociados
    await prisma.recipeIngredient.deleteMany({
      where: { foodId: parsedFoodId },
    });

    // 2️⃣ Eliminar medidas caseras
    await prisma.traditionalHouseholdMeasure.deleteMany({
      where: { foodId: parsedFoodId },
    });

    // 3️⃣ Eliminar nutrientes asociados
    await prisma.traditionalNutrient.deleteMany({
      where: { foodId: parsedFoodId },
    });

    // 4️⃣ Finalmente, eliminar el alimento
    await prisma.traditionalFood.delete({
      where: { id: parsedFoodId },
    });

    return new Response(
      JSON.stringify({ message: "Alimento eliminado correctamente" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error al eliminar alimento:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Error desconocido al eliminar el alimento";

    return new Response(JSON.stringify({ message }), { status: 500 });
  }
}
