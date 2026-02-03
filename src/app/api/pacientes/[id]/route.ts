import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/pacientes/[id]
export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  const id = Number(params.id);
  if (!id) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }
  try {
    const paciente = await prisma.patient.findUnique({ where: { id } });
    if (!paciente) {
      return NextResponse.json({ error: "Paciente no encontrado" }, { status: 404 });
    }
    return NextResponse.json(paciente);
  } catch {
    return NextResponse.json(
      { error: "No se pudo obtener el paciente" },
      { status: 500 },
    );
  }
}

// DELETE /api/pacientes/[id]
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  const id = Number(params.id);
  if (!id) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }
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

// PUT /api/pacientes/[id]
export async function PUT(
  request: Request,
  { params }: { params: { id: string } },
) {
  const id = Number(params.id);
  if (!id) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  try {
    const body = await request.json();
    
    // Mapeo de campos del formulario a los campos del modelo Patient
    const updateData: Record<string, unknown> = {};

    if (body.name !== undefined) updateData.name = body.name;
    if (body.lastName !== undefined) updateData.lastName = body.lastName;
    if (body.email !== undefined) updateData.email = body.email;
    if (body.gender !== undefined) updateData.gender = body.gender;
    if (body.birthDate !== undefined) updateData.birthDate = new Date(body.birthDate);
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.height !== undefined) updateData.height = body.height !== "" ? parseFloat(body.height) : null;
    if (body.weight !== undefined) updateData.weight = body.weight !== "" ? parseFloat(body.weight) : null;
    if (body.maritalStatus !== undefined) updateData.maritalStatus = body.maritalStatus;
    if (body.occupation !== undefined) updateData.occupation = body.occupation;
    if (body.photo !== undefined) updateData.photo = body.photo;

    const paciente = await prisma.patient.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(paciente);
  } catch (error) {
    console.error("Error al actualizar paciente:", error);
    
    if (error instanceof Error) {
      // Manejo de errores específicos de Prisma (ej: email duplicado)
      if (error.message.includes("Unique constraint failed")) {
        return NextResponse.json(
          { error: "El email ya está registrado" },
          { status: 400 },
        );
      }
    }

    return NextResponse.json(
      { error: "No se pudo actualizar el paciente" },
      { status: 500 },
    );
  }
}
