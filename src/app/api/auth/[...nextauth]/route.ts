// auth/[...nextauth]/routes/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  // Por ejemplo, retornar datos de usuario autenticado
  return NextResponse.json({ message: "Ruta GET personalizada para auth" });
}

export async function POST(request: NextRequest) {
  // Procesar algún dato enviado en una ruta auth personalizada
  const data = await request.json();
  // lógica personalizada aquí
  return NextResponse.json({ success: true, data });
}
