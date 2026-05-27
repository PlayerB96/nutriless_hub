import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, requirePatientOwned } from "@/lib/auth-helpers";
import { uploadBase64ToR2 } from "@/lib/r2";

const MAX_IMAGES_PER_PATIENT = 3;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  const { id: idStr } = await params;
  const id = Number(idStr);
  if (!id) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  const access = await requirePatientOwned(id, auth.userId);
  if (!access.ok) return access.response;

  try {
    const images = await prisma.patientImage.findMany({
      where: { patientId: id },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(images);
  } catch (error) {
    console.error("GET /api/pacientes/[id]/images:", error);
    return NextResponse.json(
      { error: "No se pudieron obtener las imágenes" },
      { status: 500 },
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  const { id: idStr } = await params;
  const id = Number(idStr);
  if (!id) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  const access = await requirePatientOwned(id, auth.userId);
  if (!access.ok) return access.response;

  try {
    const count = await prisma.patientImage.count({
      where: { patientId: id },
    });
    if (count >= MAX_IMAGES_PER_PATIENT) {
      return NextResponse.json(
        { error: `Solo se permiten hasta ${MAX_IMAGES_PER_PATIENT} imágenes por paciente` },
        { status: 400 },
      );
    }

    const body = await request.json();

    if (!body.imageData || typeof body.imageData !== "string") {
      return NextResponse.json(
        { error: "La imagen es requerida" },
        { status: 400 },
      );
    }

    const imageKey = await uploadBase64ToR2(body.imageData, "pacientes/imagenes");

    const image = await prisma.patientImage.create({
      data: {
        patientId: id,
        title: typeof body.title === "string" ? body.title : "",
        date: body.date ? new Date(body.date) : new Date(),
        imageKey,
      },
    });

    return NextResponse.json(image, { status: 201 });
  } catch (error) {
    console.error("POST /api/pacientes/[id]/images:", error);
    return NextResponse.json(
      { error: "No se pudo guardar la imagen" },
      { status: 500 },
    );
  }
}
