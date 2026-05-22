"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  DIET_TYPE_OPTIONS,
  dietaryConditionsFromDetail,
  type DietTypeValue,
  isValidDietType,
} from "@/lib/patient-diet";
import PatientAutoSaveStatus from "./PatientAutoSaveStatus";
import PatientDietConditionSelect from "./PatientDietConditionSelect";

export type DatosAlimentacionDetail = {
  dietType: string | null;
  dietaryConditions: string[];
  glutenIntolerant: boolean | null;
  lactoseIntolerant: boolean | null;
  mealsPerDay: number | null;
  waterLitersPerDay: number | null;
  hadPreviousDiet: boolean | null;
} | null;

type AlimentacionForm = {
  dietType: DietTypeValue | "";
  dietaryConditions: string[];
  mealsPerDay: string;
  waterLitersPerDay: string;
  hadPreviousDiet: boolean;
};

type Props = {
  pacienteId: string;
  initialDetail?: DatosAlimentacionDetail;
};

const selectClass =
  "w-full cursor-pointer rounded-lg border border-primary bg-bg px-3 py-2 text-sm text-text hover:border-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary";

const inputClass =
  "w-full max-w-[12rem] rounded-lg border border-primary bg-bg px-3 py-2 text-sm text-text placeholder:text-text-alt";

function detailToForm(detail?: DatosAlimentacionDetail): AlimentacionForm {
  return {
    dietType: isValidDietType(detail?.dietType) ? detail.dietType : "",
    dietaryConditions: dietaryConditionsFromDetail(detail),
    mealsPerDay:
      detail?.mealsPerDay != null && !Number.isNaN(detail.mealsPerDay)
        ? String(detail.mealsPerDay)
        : "",
    waterLitersPerDay:
      detail?.waterLitersPerDay != null &&
      !Number.isNaN(detail.waterLitersPerDay)
        ? String(detail.waterLitersPerDay)
        : "",
    hadPreviousDiet: detail?.hadPreviousDiet === true,
  };
}

function formToPayload(data: AlimentacionForm) {
  const meals = data.mealsPerDay.trim();
  const water = data.waterLitersPerDay.trim();
  const conditions = data.dietaryConditions;

  return {
    dietType: data.dietType || null,
    dietaryConditions: conditions,
    glutenIntolerant: conditions.includes("intolerante_gluten"),
    lactoseIntolerant: conditions.includes("intolerante_lactosa"),
    mealsPerDay: meals === "" ? null : parseInt(meals, 10),
    waterLitersPerDay: water === "" ? null : parseFloat(water),
    hadPreviousDiet: data.hadPreviousDiet,
  };
}

export default function DatosAlimentacionPaciente({
  pacienteId,
  initialDetail,
}: Props) {
  const [form, setForm] = useState<AlimentacionForm>(() =>
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
    async (data: AlimentacionForm) => {
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
    (next: AlimentacionForm) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => persist(next), 500);
    },
    [persist],
  );

  const updateForm = useCallback(
    (patch: Partial<AlimentacionForm>) => {
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
        <h3 className="text-lg font-semibold text-text">Registro de alimentos</h3>
        <PatientAutoSaveStatus status={saveStatus} />
      </div>

      <section className="flex flex-col gap-4">
        <h4 className="text-base font-semibold text-text">Datos de alimentación</h4>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="diet-type" className="text-sm font-semibold text-text">
            Tipo de alimentación
          </label>
          <select
            id="diet-type"
            value={form.dietType}
            onChange={(e) =>
              updateForm({
                dietType: e.target.value as DietTypeValue | "",
              })
            }
            className={selectClass}
          >
            <option value="">Seleccionar tipo…</option>
            {DIET_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <PatientDietConditionSelect
          label="Condiciones de alimentación"
          description="Elige del listado o agrega otra condición"
          selected={form.dietaryConditions}
          onChange={(dietaryConditions) => updateForm({ dietaryConditions })}
        />

        <div className="flex flex-col gap-3 tablet:flex-row tablet:gap-6">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="meals-per-day"
              className="text-sm font-semibold text-text"
            >
              Comidas por día
            </label>
            <input
              id="meals-per-day"
              type="number"
              min={0}
              max={20}
              step={1}
              value={form.mealsPerDay}
              onChange={(e) => updateForm({ mealsPerDay: e.target.value })}
              placeholder="Ej. 3"
              className={inputClass}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="water-liters"
              className="text-sm font-semibold text-text"
            >
              Agua al día (litros)
            </label>
            <input
              id="water-liters"
              type="number"
              min={0}
              max={20}
              step={0.1}
              value={form.waterLitersPerDay}
              onChange={(e) =>
                updateForm({ waterLitersPerDay: e.target.value })
              }
              placeholder="Ej. 2"
              className={inputClass}
            />
          </div>
        </div>

        <label className="flex cursor-pointer items-center gap-2.5">
          <input
            type="checkbox"
            checked={form.hadPreviousDiet}
            onChange={(e) =>
              updateForm({ hadPreviousDiet: e.target.checked })
            }
            className="h-4 w-4 cursor-pointer rounded border-primary text-secondary focus:ring-secondary"
          />
          <span className="text-sm font-medium text-text">
            ¿Dieta previamente?
          </span>
        </label>
      </section>
    </div>
  );
}
