// src/app/api/categories/route.ts
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const categorias = await prisma.categoryFood.findMany(); // Ajusta si tu modelo tiene otro nombre
    return NextResponse.json(categorias);
  } catch (error) {
    console.error("Error al obtener categorías:", error);
    return new NextResponse("Error al obtener categorías", { status: 500 });
  }
}
