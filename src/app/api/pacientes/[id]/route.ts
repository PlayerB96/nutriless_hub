import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, requirePatientOwned } from "@/lib/auth-helpers";
import { getDbErrorMessage } from "@/lib/db-retry";
import { isValidPatientGoal } from "@/lib/patient-goals";
import { isValidDietType, normalizeDietaryCondition } from "@/lib/patient-diet";
import {
  isValidIntestinalCondition,
  normalizeHealthTagArray,
} from "@/lib/patient-health";
import {
  isValidActivityLevel,
  isValidConsumptionFrequency,
  isValidScaleValue,
  isValidStressLevel,
  normalizeCustomTag,
} from "@/lib/patient-lifestyle";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  const { id: idStr } = await params;
  const id = Number(idStr);
  if (!id) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  try {
    const access = await requirePatientOwned(id, auth.userId);
    if (!access.ok) return access.response;

    return NextResponse.json(access.patient);
  } catch (error) {
    console.error("GET /api/pacientes/[id]:", error);
    return NextResponse.json(
      { error: getDbErrorMessage(error) },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  const { id: idStr } = await params;
  const id = Number(idStr);
  if (!id) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  const access = await requirePatientOwned(id, auth.userId);
  if (!access.ok) return access.response;

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

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  const { id: idStr } = await params;
  const id = Number(idStr);
  if (!id) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  const access = await requirePatientOwned(id, auth.userId);
  if (!access.ok) return access.response;

  try {
    const body = await request.json();
    const updateData: Record<string, unknown> = {};

    if (body.name !== undefined) updateData.name = body.name;
    if (body.lastName !== undefined) updateData.lastName = body.lastName;
    if (body.email !== undefined) updateData.email = body.email;
    if (body.gender !== undefined) updateData.gender = body.gender;
    if (body.birthDate !== undefined)
      updateData.birthDate = new Date(body.birthDate);
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.height !== undefined)
      updateData.height =
        body.height !== "" ? parseFloat(body.height) : null;
    if (body.weight !== undefined)
      updateData.weight =
        body.weight !== "" ? parseFloat(body.weight) : null;
    if (body.maritalStatus !== undefined)
      updateData.maritalStatus = body.maritalStatus;
    if (body.occupation !== undefined) updateData.occupation = body.occupation;
    if (body.photo !== undefined) updateData.photo = body.photo;

    const detailFields: Record<string, unknown> = {};

    const goalValue = body.goal ?? body.patientGoal;
    if (goalValue !== undefined) {
      if (goalValue === null || goalValue === "") {
        detailFields.goal = null;
      } else if (isValidPatientGoal(goalValue)) {
        detailFields.goal = goalValue;
      } else {
        return NextResponse.json(
          { error: "Objetivo del paciente no válido" },
          { status: 400 },
        );
      }
    }

    if (body.motivation !== undefined) {
      if (body.motivation === null || body.motivation === "") {
        detailFields.motivation = null;
      } else {
        const motivation = Number(body.motivation);
        if (
          Number.isNaN(motivation) ||
          motivation < 1 ||
          motivation > 10 ||
          !Number.isInteger(motivation)
        ) {
          return NextResponse.json(
            { error: "La motivación debe ser un número entre 1 y 10" },
            { status: 400 },
          );
        }
        detailFields.motivation = motivation;
      }
    }

    const commentValue = body.goalComment ?? body.objectiveComment;
    if (commentValue !== undefined) {
      detailFields.goalComment =
        commentValue === null || commentValue === ""
          ? null
          : String(commentValue);
    }

    if (body.activityLevel !== undefined) {
      if (body.activityLevel === null || body.activityLevel === "") {
        detailFields.activityLevel = null;
      } else if (isValidActivityLevel(body.activityLevel)) {
        detailFields.activityLevel = body.activityLevel;
      } else {
        return NextResponse.json(
          { error: "Nivel de actividad física no válido" },
          { status: 400 },
        );
      }
    }

    if (body.stressLevel !== undefined) {
      if (body.stressLevel === null || body.stressLevel === "") {
        detailFields.stressLevel = null;
      } else if (isValidStressLevel(body.stressLevel)) {
        detailFields.stressLevel = body.stressLevel;
      } else {
        return NextResponse.json(
          { error: "Nivel de estrés no válido" },
          { status: 400 },
        );
      }
    }

    if (body.stressReason !== undefined) {
      detailFields.stressReason =
        body.stressReason === null || body.stressReason === ""
          ? null
          : String(body.stressReason);
    }

    if (body.sleepHours !== undefined) {
      if (body.sleepHours === null || body.sleepHours === "") {
        detailFields.sleepHours = null;
      } else {
        const hours = Number(body.sleepHours);
        if (Number.isNaN(hours) || hours < 0 || hours > 24) {
          return NextResponse.json(
            { error: "Las horas de sueño deben estar entre 0 y 24" },
            { status: 400 },
          );
        }
        detailFields.sleepHours = hours;
      }
    }

    if (body.sleepQuality !== undefined) {
      if (body.sleepQuality === null || body.sleepQuality === "") {
        detailFields.sleepQuality = null;
      } else if (isValidScaleValue(body.sleepQuality)) {
        detailFields.sleepQuality = Number(body.sleepQuality);
      } else {
        return NextResponse.json(
          { error: "La calidad de sueño debe ser un número entre 1 y 10" },
          { status: 400 },
        );
      }
    }

    if (body.alcoholFrequency !== undefined) {
      if (body.alcoholFrequency === null || body.alcoholFrequency === "") {
        detailFields.alcoholFrequency = null;
      } else if (isValidConsumptionFrequency(body.alcoholFrequency)) {
        detailFields.alcoholFrequency = body.alcoholFrequency;
      } else {
        return NextResponse.json(
          { error: "Frecuencia de alcohol no válida" },
          { status: 400 },
        );
      }
    }

    if (body.tobaccoFrequency !== undefined) {
      if (body.tobaccoFrequency === null || body.tobaccoFrequency === "") {
        detailFields.tobaccoFrequency = null;
      } else if (isValidConsumptionFrequency(body.tobaccoFrequency)) {
        detailFields.tobaccoFrequency = body.tobaccoFrequency;
      } else {
        return NextResponse.json(
          { error: "Frecuencia de tabaco no válida" },
          { status: 400 },
        );
      }
    }

    const normalizeStringArray = (raw: unknown): string[] | null => {
      if (!Array.isArray(raw)) return null;
      const tags = raw
        .map((item) =>
          typeof item === "string" ? normalizeCustomTag(item) : "",
        )
        .filter(Boolean);
      return [...new Set(tags)];
    };

    if (body.alcoholTypes !== undefined) {
      const types = normalizeStringArray(body.alcoholTypes);
      if (types === null) {
        return NextResponse.json(
          { error: "Tipos de alcohol no válidos" },
          { status: 400 },
        );
      }
      detailFields.alcoholTypes = types;
    }

    if (body.supplementTypes !== undefined) {
      const types = normalizeStringArray(body.supplementTypes);
      if (types === null) {
        return NextResponse.json(
          { error: "Tipos de suplemento no válidos" },
          { status: 400 },
        );
      }
      detailFields.supplementTypes = types;
    }

    if (body.dietType !== undefined) {
      if (body.dietType === null || body.dietType === "") {
        detailFields.dietType = null;
      } else if (isValidDietType(body.dietType)) {
        detailFields.dietType = body.dietType;
      } else {
        return NextResponse.json(
          { error: "Tipo de alimentación no válido" },
          { status: 400 },
        );
      }
    }

    if (body.dietaryConditions !== undefined) {
      const conditions = normalizeStringArray(
        Array.isArray(body.dietaryConditions)
          ? body.dietaryConditions.map((c: unknown) =>
              typeof c === "string" ? normalizeDietaryCondition(c) : "",
            )
          : null,
      );
      if (conditions === null) {
        return NextResponse.json(
          { error: "Condiciones de alimentación no válidas" },
          { status: 400 },
        );
      }
      detailFields.dietaryConditions = conditions;
      detailFields.glutenIntolerant = conditions.includes("intolerante_gluten");
      detailFields.lactoseIntolerant =
        conditions.includes("intolerante_lactosa");
    }

    if (body.hadPreviousDiet !== undefined) {
      detailFields.hadPreviousDiet = Boolean(body.hadPreviousDiet);
    }

    if (body.mealsPerDay !== undefined) {
      if (body.mealsPerDay === null || body.mealsPerDay === "") {
        detailFields.mealsPerDay = null;
      } else {
        const meals = Number(body.mealsPerDay);
        if (
          Number.isNaN(meals) ||
          !Number.isInteger(meals) ||
          meals < 0 ||
          meals > 20
        ) {
          return NextResponse.json(
            { error: "Comidas por día debe ser un entero entre 0 y 20" },
            { status: 400 },
          );
        }
        detailFields.mealsPerDay = meals;
      }
    }

    if (body.waterLitersPerDay !== undefined) {
      if (body.waterLitersPerDay === null || body.waterLitersPerDay === "") {
        detailFields.waterLitersPerDay = null;
      } else {
        const liters = Number(body.waterLitersPerDay);
        if (Number.isNaN(liters) || liters < 0 || liters > 20) {
          return NextResponse.json(
            { error: "Agua al día debe estar entre 0 y 20 litros" },
            { status: 400 },
          );
        }
        detailFields.waterLitersPerDay = liters;
      }
    }

    if (body.currentConditions !== undefined) {
      const tags = normalizeHealthTagArray(body.currentConditions);
      if (tags === null) {
        return NextResponse.json(
          { error: "Condiciones patológicas actuales no válidas" },
          { status: 400 },
        );
      }
      detailFields.currentConditions = tags;
    }

    if (body.medications !== undefined) {
      const tags = normalizeHealthTagArray(body.medications);
      if (tags === null) {
        return NextResponse.json(
          { error: "Medicinas consumidas no válidas" },
          { status: 400 },
        );
      }
      detailFields.medications = tags;
    }

    if (body.pathologicalHistory !== undefined) {
      const tags = normalizeHealthTagArray(body.pathologicalHistory);
      if (tags === null) {
        return NextResponse.json(
          { error: "Antecedentes patológicos personales no válidos" },
          { status: 400 },
        );
      }
      detailFields.pathologicalHistory = tags;
    }

    if (body.familyPathologicalHistory !== undefined) {
      const tags = normalizeHealthTagArray(body.familyPathologicalHistory);
      if (tags === null) {
        return NextResponse.json(
          { error: "Antecedentes patológicos familiares no válidos" },
          { status: 400 },
        );
      }
      detailFields.familyPathologicalHistory = tags;
    }

    if (body.intestinalCondition !== undefined) {
      if (body.intestinalCondition === null || body.intestinalCondition === "") {
        detailFields.intestinalCondition = null;
      } else if (isValidIntestinalCondition(body.intestinalCondition)) {
        detailFields.intestinalCondition = body.intestinalCondition;
      } else {
        return NextResponse.json(
          { error: "Condición intestinal no válida" },
          { status: 400 },
        );
      }
    }

    const hasDetailUpdate = Object.keys(detailFields).length > 0;

    const paciente = await prisma.patient.update({
      where: { id },
      data: {
        ...updateData,
        ...(hasDetailUpdate
          ? {
              detail: {
                upsert: {
                  create: { ...detailFields },
                  update: detailFields,
                },
              },
            }
          : {}),
      },
      include: { detail: true },
    });

    return NextResponse.json(paciente);
  } catch (error) {
    console.error("Error al actualizar paciente:", error);

    if (
      error instanceof Error &&
      error.message.includes("Unique constraint failed")
    ) {
      return NextResponse.json(
        { error: "El email ya está registrado" },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "No se pudo actualizar el paciente" },
      { status: 500 },
    );
  }
}
