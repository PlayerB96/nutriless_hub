"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  CURRENT_CONDITION_PRESETS,
  INTESTINAL_CONDITION_OPTIONS,
  MEDICATION_PRESETS,
  PERSONAL_HISTORY_PRESETS,
  type IntestinalConditionValue,
  isValidIntestinalCondition,
} from "@/lib/patient-health";
import PatientAutoSaveStatus from "./PatientAutoSaveStatus";
import PatientMultiSelectChips from "./PatientMultiSelectChips";

export type CondicionesSaludDetail = {
  currentConditions: string[];
  medications: string[];
  pathologicalHistory: string[];
  familyPathologicalHistory: string[];
  intestinalCondition: string | null;
} | null;

type SaludForm = {
  currentConditions: string[];
  medications: string[];
  pathologicalHistory: string[];
  familyPathologicalHistory: string[];
  intestinalCondition: IntestinalConditionValue | "";
};

type Props = {
  pacienteId: string;
  initialDetail?: CondicionesSaludDetail;
};

const selectClass =
  "w-full cursor-pointer rounded-lg border border-primary bg-bg px-3 py-2 text-sm text-text hover:border-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary";

const subsectionDivider = "border-t border-[var(--border)] pt-5";

function detailToForm(detail?: CondicionesSaludDetail): SaludForm {
  return {
    currentConditions: detail?.currentConditions ?? [],
    medications: detail?.medications ?? [],
    pathologicalHistory: detail?.pathologicalHistory ?? [],
    familyPathologicalHistory: detail?.familyPathologicalHistory ?? [],
    intestinalCondition: isValidIntestinalCondition(detail?.intestinalCondition)
      ? detail.intestinalCondition
      : "",
  };
}

function formToPayload(data: SaludForm) {
  return {
    currentConditions: data.currentConditions,
    medications: data.medications,
    pathologicalHistory: data.pathologicalHistory,
    familyPathologicalHistory: data.familyPathologicalHistory,
    intestinalCondition: data.intestinalCondition || null,
  };
}

function Subsection({
  title,
  children,
  first = false,
}: {
  title: string;
  children: React.ReactNode;
  first?: boolean;
}) {
  return (
    <section className={`flex flex-col gap-3 ${first ? "" : subsectionDivider}`}>
      <h4 className="text-base font-semibold text-text">{title}</h4>
      {children}
    </section>
  );
}

export default function CondicionesSaludPaciente({
  pacienteId,
  initialDetail,
}: Props) {
  const [form, setForm] = useState<SaludForm>(() => detailToForm(initialDetail));
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "success" | "error"
  >("idle");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setForm(detailToForm(initialDetail));
  }, [initialDetail]);

  const persist = useCallback(
    async (data: SaludForm) => {
      try {
        setSaveStatus("saving");
        const response = await fetch(`/api/pacientes/${pacienteId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formToPayload(data)),
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
    (next: SaludForm) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => persist(next), 500);
    },
    [persist],
  );

  const updateForm = useCallback(
    (patch: Partial<SaludForm>) => {
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
        <h3 className="text-lg font-semibold text-text">Condiciones de salud</h3>
        <PatientAutoSaveStatus status={saveStatus} />
      </div>

      <Subsection title="Condiciones patológicas actuales" first>
        <PatientMultiSelectChips
          label="Seleccionar condiciones"
          presets={CURRENT_CONDITION_PRESETS}
          selected={form.currentConditions}
          onChange={(currentConditions) => updateForm({ currentConditions })}
          addPlaceholder="Ej. hipotiroidismo, anemia…"
        />
      </Subsection>

      <Subsection title="Medicinas consumidas">
        <PatientMultiSelectChips
          label="Seleccionar medicinas"
          presets={MEDICATION_PRESETS}
          selected={form.medications}
          onChange={(medications) => updateForm({ medications })}
          addPlaceholder="Ej. paracetamol, omeprazol…"
        />
      </Subsection>

      <Subsection title="Antecedentes patológicos personales">
        <PatientMultiSelectChips
          label="Seleccionar antecedentes"
          presets={PERSONAL_HISTORY_PRESETS}
          selected={form.pathologicalHistory}
          onChange={(pathologicalHistory) => updateForm({ pathologicalHistory })}
          addPlaceholder="Ej. cirugía apendicitis, asma…"
        />
      </Subsection>

      <Subsection title="Antecedentes patológicos familiares">
        <PatientMultiSelectChips
          label="Seleccionar antecedentes familiares"
          presets={[]}
          selected={form.familyPathologicalHistory}
          onChange={(familyPathologicalHistory) =>
            updateForm({ familyPathologicalHistory })
          }
          addPlaceholder="Ej. diabetes, cáncer…"
        />
      </Subsection>

      <Subsection title="Condición intestinal">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="intestinal-condition"
            className="text-sm font-semibold text-text"
          >
            Estado intestinal
          </label>
          <select
            id="intestinal-condition"
            value={form.intestinalCondition}
            onChange={(e) =>
              updateForm({
                intestinalCondition: e.target.value as IntestinalConditionValue | "",
              })
            }
            className={selectClass}
          >
            <option value="">Seleccionar condición…</option>
            {INTESTINAL_CONDITION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </Subsection>
    </div>
  );
}
