import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, requirePatientOwned } from "@/lib/auth-helpers";
import { uploadBase64ToR2, deleteFromR2 } from "@/lib/r2";

type RouteParams = { params: Promise<{ id: string; imageId: string }> };

async function resolveAndValidate(routeParams: RouteParams) {
  const auth = await requireSession();
  if (!auth.ok) return { ok: false as const, response: auth.response };

  const { id: idStr, imageId: imageIdStr } = await routeParams.params;
  const patientId = Number(idStr);
  const imageId = Number(imageIdStr);

  if (!patientId || !imageId) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "ID inválido" }, { status: 400 }),
    };
  }

  const access = await requirePatientOwned(patientId, auth.userId);
  if (!access.ok) return { ok: false as const, response: access.response };

  return { ok: true as const, patientId, imageId };
}

export async function PUT(request: Request, routeParams: RouteParams) {
  const validated = await resolveAndValidate(routeParams);
  if (!validated.ok) return validated.response;

  const { patientId, imageId } = validated;

  try {
    const existing = await prisma.patientImage.findFirst({
      where: { id: imageId, patientId },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Imagen no encontrada" },
        { status: 404 },
      );
    }

    const body = await request.json();
    const updateData: Record<string, unknown> = {};

    if (body.title !== undefined) updateData.title = String(body.title);
    if (body.date !== undefined) updateData.date = new Date(body.date);

    if (body.imageData !== undefined && typeof body.imageData === "string") {
      const newKey = await uploadBase64ToR2(body.imageData, "pacientes/imagenes");
      await deleteFromR2(existing.imageKey);
      updateData.imageKey = newKey;
    }

    const updated = await prisma.patientImage.update({
      where: { id: imageId },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT /api/pacientes/[id]/images/[imageId]:", error);
    return NextResponse.json(
      { error: "No se pudo actualizar la imagen" },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, routeParams: RouteParams) {
  const validated = await resolveAndValidate(routeParams);
  if (!validated.ok) return validated.response;

  const { patientId, imageId } = validated;

  try {
    const existing = await prisma.patientImage.findFirst({
      where: { id: imageId, patientId },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Imagen no encontrada" },
        { status: 404 },
      );
    }

    await deleteFromR2(existing.imageKey);
    await prisma.patientImage.delete({ where: { id: imageId } });
    return NextResponse.json({ message: "Imagen eliminada correctamente" });
  } catch (error) {
    console.error("DELETE /api/pacientes/[id]/images/[imageId]:", error);
    return NextResponse.json(
      { error: "No se pudo eliminar la imagen" },
      { status: 500 },
    );
  }
}
