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
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
