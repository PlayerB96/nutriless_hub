import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const nutrients = await prisma.optionalNutrient.findMany({
    select: { name: true },
  });
  return NextResponse.json(nutrients.map((n) => n.name)); 
}
