import { requireSessionUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

type tParams = Promise<{ id: string }>;

export async function GET(_req: Request, { params }: { params: tParams }) {
  const resolvedParams = await params;
  const userId = Number(resolvedParams.id);

  if (Number.isNaN(userId)) {
    return new Response(JSON.stringify({ message: "ID inválido" }), {
      status: 400,
    });
  }

  const auth = await requireSessionUser(userId);
  if (!auth.ok) return auth.response;

  try {
    const recipes = await prisma.recipe.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        detail: true,
      },
    });

    return new Response(JSON.stringify(recipes), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: "Error interno" }), {
      status: 500,
    });
  }
}
