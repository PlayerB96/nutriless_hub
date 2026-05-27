"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  FOOD_GROUPS,
  FOOD_ALLERGY_PRESETS,
} from "@/lib/patient-food-preferences";
import PatientAutoSaveStatus from "./PatientAutoSaveStatus";
import PatientFoodGroupChips from "./PatientFoodGroupChips";
import PatientMultiSelectChips from "./PatientMultiSelectChips";

export type FoodPreferencesDetail = {
  preferredFoods: string[];
  dislikedFoods: string[];
  foodAllergies: string[];
} | null;

type FoodPreferencesForm = {
  preferredFoods: string[];
  dislikedFoods: string[];
  foodAllergies: string[];
};

type Props = {
  pacienteId: string;
  initialDetail?: FoodPreferencesDetail;
};

function detailToForm(detail?: FoodPreferencesDetail): FoodPreferencesForm {
  return {
    preferredFoods: detail?.preferredFoods ?? [],
    dislikedFoods: detail?.dislikedFoods ?? [],
    foodAllergies: detail?.foodAllergies ?? [],
  };
}

function CollapsibleSection({
  title,
  description,
  count,
  defaultOpen = false,
  children,
}: {
  title: string;
  description?: string;
  count: number;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-lg border border-primary/40 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-3 hover:bg-secondary/5 transition-colors"
      >
        <div className="flex flex-col items-start gap-0.5">
          <span className="text-sm font-semibold text-text">{title}</span>
          {description && (
            <span className="text-xs text-text-alt">{description}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {count > 0 && (
            <span className="rounded-full bg-secondary/15 px-2 py-0.5 text-xs font-medium text-secondary">
              {count} seleccionados
            </span>
          )}
          <ChevronDown
            size={18}
            className={`shrink-0 text-text-alt transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </div>
      </button>
      <div
        className={`grid transition-[grid-template-rows] duration-200 ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className="overflow-hidden">
          <div className="px-4 pb-4 pt-1">{children}</div>
        </div>
      </div>
    </div>
  );
}

export default function PreferenciasFoodPaciente({
  pacienteId,
  initialDetail,
}: Props) {
  const [form, setForm] = useState<FoodPreferencesForm>(() =>
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
    async (data: FoodPreferencesForm) => {
      try {
        setSaveStatus("saving");
        const response = await fetch(`/api/pacientes/${pacienteId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
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
    (next: FoodPreferencesForm) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => persist(next), 500);
    },
    [persist],
  );

  const updateForm = useCallback(
    (patch: Partial<FoodPreferencesForm>) => {
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
        <h3 className="text-lg font-semibold text-text">
          Preferencias alimentarias
        </h3>
        <PatientAutoSaveStatus status={saveStatus} />
      </div>

      <section className="flex flex-col gap-4">
        <CollapsibleSection
          title="Alimentos preferidos"
          description="Alimentos que el paciente prefiere, organizados por grupo"
          count={form.preferredFoods.length}
          defaultOpen={true}
        >
          <PatientFoodGroupChips
            label=""
            groups={FOOD_GROUPS}
            selected={form.preferredFoods}
            onChange={(preferredFoods) => updateForm({ preferredFoods })}
            addPlaceholder="Agregar otro alimento preferido"
          />
        </CollapsibleSection>

        <CollapsibleSection
          title="Alimentos que disgustan"
          description="Alimentos que el paciente no tolera o no le gustan"
          count={form.dislikedFoods.length}
          defaultOpen={false}
        >
          <PatientFoodGroupChips
            label=""
            groups={FOOD_GROUPS}
            selected={form.dislikedFoods}
            onChange={(dislikedFoods) => updateForm({ dislikedFoods })}
            addPlaceholder="Agregar otro alimento que disgusta"
          />
        </CollapsibleSection>

        <CollapsibleSection
          title="Alergias alimentarias"
          description="Alimentos a los que el paciente es alérgico"
          count={form.foodAllergies.length}
          defaultOpen={false}
        >
          <PatientMultiSelectChips
            label=""
            presets={[...FOOD_ALLERGY_PRESETS]}
            selected={form.foodAllergies}
            onChange={(foodAllergies) => updateForm({ foodAllergies })}
            addPlaceholder="Agregar otra alergia alimentaria"
          />
        </CollapsibleSection>
      </section>
    </div>
  );
}
