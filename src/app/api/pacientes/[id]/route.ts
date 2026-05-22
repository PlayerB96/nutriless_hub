import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, requirePatientOwned } from "@/lib/auth-helpers";

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

  return NextResponse.json(access.patient);
}

export async function DELETE(
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
    await prisma.patient.delete({ where: { id } });
    return NextResponse.json({ message: "Paciente eliminado correctamente" });
  } catch {
    return NextResponse.json(
      { error: "No se pudo eliminar el paciente" },
      { status: 500 },
    );
  }
}

export async function PUT(
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
    const body = await request.json();
    const updateData: Record<string, unknown> = {};

    if (body.name !== undefined) updateData.name = body.name;
    if (body.lastName !== undefined) updateData.lastName = body.lastName;
    if (body.email !== undefined) updateData.email = body.email;
    if (body.gender !== undefined) updateData.gender = body.gender;
    if (body.birthDate !== undefined)
      updateData.birthDate = new Date(body.birthDate);
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.height !== undefined)
      updateData.height =
        body.height !== "" ? parseFloat(body.height) : null;
    if (body.weight !== undefined)
      updateData.weight =
        body.weight !== "" ? parseFloat(body.weight) : null;
    if (body.maritalStatus !== undefined)
      updateData.maritalStatus = body.maritalStatus;
    if (body.occupation !== undefined) updateData.occupation = body.occupation;
    if (body.photo !== undefined) updateData.photo = body.photo;

    const paciente = await prisma.patient.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(paciente);
  } catch (error) {
    console.error("Error al actualizar paciente:", error);

    if (
      error instanceof Error &&
      error.message.includes("Unique constraint failed")
    ) {
      return NextResponse.json(
        { error: "El email ya está registrado" },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "No se pudo actualizar el paciente" },
      { status: 500 },
    );
  }
}
