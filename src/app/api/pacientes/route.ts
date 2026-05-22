import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, assertUserIdMatch } from "@/lib/auth-helpers";

export async function GET(request: Request) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(request.url);
  const userId = Number(searchParams.get("userId"));
  if (!userId || Number.isNaN(userId)) {
    return NextResponse.json({ error: "userId requerido" }, { status: 400 });
  }

  const forbidden = assertUserIdMatch(auth.userId, userId);
  if (forbidden) return forbidden;

  const pacientes = await prisma.patient.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(pacientes);
}

export async function POST(request: Request) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  const data = await request.json();

  if (!data.userId || !data.name || !data.lastName || !data.gender || !data.birthDate) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 },
    );
  }

  const userId = Number(data.userId);
  const forbidden = assertUserIdMatch(auth.userId, userId);
  if (forbidden) return forbidden;

  try {
    const paciente = await prisma.patient.create({
      data: {
        userId,
        name: data.name,
        lastName: data.lastName,
        gender: data.gender,
        birthDate: new Date(data.birthDate),
        email: data.email?.trim() ? data.email.trim() : null,
        phone: data.phone?.trim() ? data.phone.trim() : null,
        height: data.height ? Number(data.height) : null,
        weight: data.weight ? Number(data.weight) : null,
        maritalStatus: data.maritalStatus?.trim()
          ? data.maritalStatus.trim()
          : null,
        occupation: data.occupation?.trim() ? data.occupation.trim() : null,
        photo: data.photo ?? null,
      },
    });

    return NextResponse.json(paciente);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("Unique constraint failed")
    ) {
      return NextResponse.json(
        { error: "El correo ya está registrado" },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "No se pudo crear el paciente" },
      { status: 500 },
    );
  }
}
