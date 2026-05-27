import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth-helpers";
import { getR2ObjectBytes, R2_BUCKET } from "@/lib/r2";
import { prisma } from "@/lib/prisma";

type RouteParams = Promise<{ path: string[] }>;

async function userOwnsImage(key: string, userId: number): Promise<boolean> {
  const food = await prisma.food.findFirst({
    where: { imageUrl: key, userId },
    select: { id: true },
  });
  if (food) return true;

  const patientImage = await prisma.patientImage.findFirst({
    where: { imageKey: key, patient: { userId } },
    select: { id: true },
  });
  if (patientImage) return true;

  const patientPhoto = await prisma.patient.findFirst({
    where: { photo: key, userId },
    select: { id: true },
  });
  if (patientPhoto) return true;

  return false;
}

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

  const { path } = await params;
  const key = path.map(decodeURIComponent).join("/").trim();

  if (!key || key.includes("..")) {
    return NextResponse.json({ error: "Nombre de archivo inválido" }, { status: 400 });
  }

  const owns = await userOwnsImage(key, auth.userId);
  if (!owns) {
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
