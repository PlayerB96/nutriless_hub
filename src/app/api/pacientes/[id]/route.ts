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
