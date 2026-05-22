import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth-helpers";

export async function GET() {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  const nutrients = await prisma.optionalNutrient.findMany({
    select: { name: true },
  });
  return NextResponse.json(nutrients.map((n) => n.name));
}
