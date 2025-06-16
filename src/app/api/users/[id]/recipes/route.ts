import { prisma } from "@/lib/prisma";

type tParams = Promise<{ id: string }>;

export async function GET(req: Request, { params }: { params: tParams }) {
  const resolvedParams = await params; // ✅ Await al inicio
  const userId = Number(resolvedParams.id); // ✅ Acceso después del await

  if (isNaN(userId)) {
    return new Response(JSON.stringify({ message: "ID inválido" }), {
      status: 400,
    });
  }

  try {
    const recipes = await prisma.recipe.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        detail: true, // 👈 Esto carga ingredients e instructions
      },
    });

    // console.log(recipes);

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
