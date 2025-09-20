import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: Request,
  context: { params: Promise<Record<string, string>> } // params es un Promise
) {
  // ✅ Esperar a que params se resuelvan
  const params = await context.params;
  const { foodId } = params;

  const parsedFoodId = Number(foodId);

  if (isNaN(parsedFoodId)) {
    return new Response(JSON.stringify({ message: "ID inválido" }), {
      status: 400,
    });
  }

  try {
    // Verificar que el alimento exista
    const existingFood = await prisma.traditionalFood.findUnique({
      where: { id: parsedFoodId },
    });

    if (!existingFood) {
      return new Response(
        JSON.stringify({ message: "El alimento no existe" }),
        { status: 404 }
      );
    }

    // Eliminar relaciones manualmente (opcional, dependiendo de onDelete: Cascade)
    await prisma.recipeIngredient.deleteMany({ where: { foodId: parsedFoodId } });
    await prisma.traditionalHouseholdMeasure.deleteMany({ where: { foodId: parsedFoodId } });
    await prisma.traditionalNutrient.deleteMany({ where: { foodId: parsedFoodId } });

    // Finalmente, eliminar el alimento
    await prisma.traditionalFood.delete({ where: { id: parsedFoodId } });

    return new Response(
      JSON.stringify({ message: "Alimento eliminado correctamente" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error al eliminar alimento:", error);

    const message = error instanceof Error ? error.message : "Error desconocido";
    return new Response(JSON.stringify({ message }), { status: 500 });
  }
}
