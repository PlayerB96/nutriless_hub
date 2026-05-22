import { getServerSession } from "next-auth";
import type { Session } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withDbRetry } from "@/lib/db-retry";

export type SessionAuth = {
  ok: true;
  userId: number;
  session: Session;
};

export type AuthFailure = {
  ok: false;
  response: NextResponse;
};

export type AuthResult = SessionAuth | AuthFailure;

export async function requireSession(): Promise<AuthResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return {
      ok: false,
      response: NextResponse.json({ error: "No autorizado" }, { status: 401 }),
    };
  }

  const userId = Number(session.user.id);
  if (Number.isNaN(userId)) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Sesión inválida" }, { status: 401 }),
    };
  }

  return { ok: true, userId, session };
}

export function forbid(message = "Prohibido"): AuthFailure {
  return {
    ok: false,
    response: NextResponse.json({ error: message }, { status: 403 }),
  };
}

export function assertUserIdMatch(
  authUserId: number,
  requestedUserId: number,
): NextResponse | null {
  if (authUserId !== requestedUserId) {
    return NextResponse.json({ error: "Prohibido" }, { status: 403 });
  }
  return null;
}

export async function requirePatientOwned(
  patientId: number,
  userId: number,
): Promise<
  | { ok: true; patient: Awaited<ReturnType<typeof prisma.patient.findUnique>> & object }
  | AuthFailure
> {
  const patient = await withDbRetry(() =>
    prisma.patient.findUnique({
      where: { id: patientId },
      include: { detail: true },
    }),
  );
  if (!patient) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Paciente no encontrado" },
        { status: 404 },
      ),
    };
  }
  if (patient.userId !== userId) {
    return forbid();
  }
  return { ok: true, patient };
}

export async function requireRecipeOwned(
  recipeId: number,
  userId: number,
): Promise<
  | { ok: true; recipe: { id: number; userId: number | null } }
  | AuthFailure
> {
  const recipe = await prisma.recipe.findUnique({
    where: { id: recipeId },
    select: { id: true, userId: true },
  });
  if (!recipe) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Receta no encontrada" },
        { status: 404 },
      ),
    };
  }
  if (recipe.userId !== userId) {
    return forbid();
  }
  return { ok: true, recipe };
}

export async function requireFoodOwned(
  foodId: number,
  userId: number,
): Promise<
  | { ok: true; food: { id: number; userId: number; imageUrl: string | null } }
  | AuthFailure
> {
  const food = await prisma.food.findUnique({
    where: { id: foodId },
    select: { id: true, userId: true, imageUrl: true },
  });
  if (!food) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Alimento no encontrado" },
        { status: 404 },
      ),
    };
  }
  if (food.userId !== userId) {
    return forbid();
  }
  return { ok: true, food };
}

/** Valida sesión + que el userId solicitado sea el de la sesión. */
export async function requireSessionUser(
  requestedUserId: number,
): Promise<SessionAuth | AuthFailure> {
  const auth = await requireSession();
  if (!auth.ok) return auth;

  const mismatch = assertUserIdMatch(auth.userId, requestedUserId);
  if (mismatch) {
    return { ok: false, response: mismatch };
  }

  return auth;
}
