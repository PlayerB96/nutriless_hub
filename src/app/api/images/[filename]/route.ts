import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth-helpers";
import { getR2ObjectBytes, R2_BUCKET } from "@/lib/r2";
import { prisma } from "@/lib/prisma";

type RouteParams = Promise<{ filename: string }>;

export async function GET(
  _req: Request,
  { params }: { params: RouteParams },
) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  if (!R2_BUCKET) {
    return NextResponse.json(
      { error: "Almacenamiento no configurado" },
      { status: 500 },
    );
  }

  const { filename } = await params;
  const key = decodeURIComponent(filename).trim();

  if (!key || key.includes("..") || key.includes("/")) {
    return NextResponse.json({ error: "Nombre de archivo inválido" }, { status: 400 });
  }

  const food = await prisma.food.findFirst({
    where: { imageUrl: key, userId: auth.userId },
    select: { id: true },
  });

  if (!food) {
    return NextResponse.json({ error: "Imagen no encontrada" }, { status: 404 });
  }

  try {
    const { body, contentType } = await getR2ObjectBytes(key);

    return new NextResponse(Buffer.from(body), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Error al leer imagen de R2:", error);
    return NextResponse.json(
      { error: "No se pudo cargar la imagen" },
      { status: 502 },
    );
  }
}
