import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/pacientes?userId=1
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "userId requerido" }, { status: 400 });
  }
  const pacientes = await prisma.patient.findMany({
    where: { userId: Number(userId) },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(pacientes);
}

// POST /api/pacientes
export async function POST(request: Request) {
  const data = await request.json();
  // Validación mínima
  if (!data.userId || !data.name || !data.lastName || !data.gender || !data.birthDate) {
    return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
  }
  const paciente = await prisma.patient.create({
    data: {
      userId: Number(data.userId),
      name: data.name,
      lastName: data.lastName,
      gender: data.gender,
      birthDate: new Date(data.birthDate),
      email: data.email,
      phone: data.phone,
      height: data.height ? Number(data.height) : null,
      weight: data.weight ? Number(data.weight) : null,
    },
  });
  return NextResponse.json(paciente);
}
