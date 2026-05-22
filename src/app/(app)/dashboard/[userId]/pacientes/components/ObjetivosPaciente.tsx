"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  PATIENT_GOAL_OPTIONS,
  type PatientGoalValue,
} from "@/lib/patient-goals";
import {
  SCALE_DEFAULT,
  SCALE_MAX,
  SCALE_MIN,
  motivationHint,
} from "@/lib/patient-lifestyle";
import PatientAutoSaveStatus from "./PatientAutoSaveStatus";
import PatientScaleSelector from "./PatientScaleSelector";

type PatientDetailData = {
  goal: string | null;
  motivation: number | null;
  goalComment: string | null;
} | null;

type ObjetivosForm = {
  goal: PatientGoalValue | "";
  motivation: number;
  goalComment: string;
};

type Props = {
  pacienteId: string;
  initialDetail?: PatientDetailData;
};

function detailToForm(detail?: PatientDetailData): ObjetivosForm {
  const goal = detail?.goal ?? "";
  const isKnownGoal = PATIENT_GOAL_OPTIONS.some((o) => o.value === goal);
  return {
    goal: isKnownGoal ? (goal as PatientGoalValue) : "",
    motivation:
      detail?.motivation != null &&
      detail.motivation >= SCALE_MIN &&
      detail.motivation <= SCALE_MAX
        ? detail.motivation
        : SCALE_DEFAULT,
    goalComment: detail?.goalComment ?? "",
  };
}

export default function ObjetivosPaciente({ pacienteId, initialDetail }: Props) {
  const [form, setForm] = useState<ObjetivosForm>(() =>
    detailToForm(initialDetail),
  );
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "success" | "error"
  >("idle");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setForm(detailToForm(initialDetail));
  }, [initialDetail]);

  const persist = useCallback(
    async (data: ObjetivosForm) => {
      try {
        setSaveStatus("saving");
        const response = await fetch(`/api/pacientes/${pacienteId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            goal: data.goal || null,
            motivation: data.motivation,
            goalComment: data.goalComment.trim() || null,
          }),
        });
        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error || "Error al guardar");
        }
        setSaveStatus("success");
        setTimeout(() => setSaveStatus("idle"), 2500);
      } catch {
        setSaveStatus("error");
        setTimeout(() => setSaveStatus("idle"), 3000);
      }
    },
    [pacienteId],
  );

  const scheduleSave = useCallback(
    (next: ObjetivosForm) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => persist(next), 500);
    },
    [persist],
  );

  const updateForm = useCallback(
    (patch: Partial<ObjetivosForm>) => {
      setForm((prev) => {
        const next = { ...prev, ...patch };
        scheduleSave(next);
        return next;
      });
    },
    [scheduleSave],
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-lg font-semibold text-text">Objetivos</h3>
        <PatientAutoSaveStatus status={saveStatus} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="patient-goal" className="text-sm font-semibold text-text">
          Objetivo del paciente
        </label>
        <select
          id="patient-goal"
          value={form.goal}
          onChange={(e) =>
            updateForm({
              goal: e.target.value as PatientGoalValue | "",
            })
          }
          className="w-full rounded-lg border border-primary bg-bg px-3 py-2 text-sm text-text"
        >
          <option value="">Seleccionar objetivo…</option>
          {PATIENT_GOAL_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <PatientScaleSelector
        value={form.motivation}
        onChange={(motivation) => updateForm({ motivation })}
        label="Motivación"
        description="Toca un nivel del 1 (baja) al 10 (alta)"
        hint={motivationHint}
        ariaLabel="Nivel de motivación del 1 al 10"
      />

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="objective-comment"
          className="text-sm font-semibold text-text"
        >
          Comentario
        </label>
        <textarea
          id="objective-comment"
          rows={4}
          value={form.goalComment}
          onChange={(e) => updateForm({ goalComment: e.target.value })}
          placeholder="Notas sobre objetivos y motivación…"
          className="w-full resize-y rounded-lg border border-primary bg-bg px-3 py-2 text-sm text-text placeholder:text-text-alt"
        />
      </div>
    </div>
  );
}
