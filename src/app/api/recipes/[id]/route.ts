import { prisma } from "@/lib/prisma";

type tParams = Promise<{ id: string }>;

export async function GET(req: Request, { params }: { params: tParams }) {
  const resolvedParams = await params;
  const id = parseInt(resolvedParams.id);

  if (isNaN(id)) {
    return new Response(JSON.stringify({ message: "ID inválido" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const receta = await prisma.recipe.findUnique({
      where: { id },
    });

    if (!receta) {
      return new Response(JSON.stringify({ message: "Receta no encontrada" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(receta), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error al obtener receta:", error);
    return new Response(
      JSON.stringify({ message: "Error interno del servidor" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
