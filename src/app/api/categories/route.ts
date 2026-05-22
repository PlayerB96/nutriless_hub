import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth-helpers";

export async function GET() {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  try {
    const categorias = await prisma.categoryFood.findMany();
    return NextResponse.json(categorias);
  } catch (error) {
    console.error("Error al obtener categorías:", error);
    return NextResponse.json(
      { error: "Error al obtener categorías" },
      { status: 500 },
    );
  }
}
