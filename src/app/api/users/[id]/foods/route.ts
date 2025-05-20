import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const resolvedParams = await params;
  const userId = Number(resolvedParams.id);

  if (isNaN(userId)) {
    return new Response(JSON.stringify({ message: "ID inválido" }), {
      status: 400,
    });
  }

  try {
    const foods = await prisma.food.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        nutritionDetails: true,
        householdMeasures: true,
      },
    });

    return new Response(JSON.stringify(foods), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ message: "Error interno" }), {
      status: 500,
    });
  }
}
