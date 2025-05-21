import { prisma } from "@/lib/prisma";
type tParams = Promise<{ id: string }>;

export async function GET(req: Request, { params }: { params: tParams }) {
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
  } catch {
    return new Response(JSON.stringify({ message: "Error interno" }), {
      status: 500,
    });
  }
}
