"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ACTIVITY_LEVEL_OPTIONS,
  ALCOHOL_TYPE_PRESETS,
  CONSUMPTION_FREQUENCY_OPTIONS,
  SCALE_DEFAULT,
  SCALE_MAX,
  SCALE_MIN,
  STRESS_LEVEL_OPTIONS,
  SUPPLEMENT_TYPE_PRESETS,
  sleepQualityHint,
  type ActivityLevelValue,
  type ConsumptionFrequencyValue,
  type StressLevelValue,
} from "@/lib/patient-lifestyle";
import PatientAutoSaveStatus from "./PatientAutoSaveStatus";
import PatientMultiSelectChips from "./PatientMultiSelectChips";
import PatientScaleSelector from "./PatientScaleSelector";

export type EstiloVidaDetail = {
  activityLevel: string | null;
  stressLevel: string | null;
  stressReason: string | null;
  sleepHours: number | null;
  sleepQuality: number | null;
  alcoholTypes: string[];
  alcoholFrequency: string | null;
  tobaccoFrequency: string | null;
  supplementTypes: string[];
} | null;

type EstiloVidaForm = {
  activityLevel: ActivityLevelValue | "";
  stressLevel: StressLevelValue | "";
  stressReason: string;
  sleepHours: string;
  sleepQuality: number;
  alcoholTypes: string[];
  alcoholFrequency: ConsumptionFrequencyValue | "";
  tobaccoFrequency: ConsumptionFrequencyValue | "";
  supplementTypes: string[];
};

type Props = {
  pacienteId: string;
  initialDetail?: EstiloVidaDetail;
};

const selectClass =
  "w-full cursor-pointer rounded-lg border border-primary bg-bg px-3 py-2 text-sm text-text transition hover:border-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary";

function isActivityLevel(v: string | null | undefined): v is ActivityLevelValue {
  return ACTIVITY_LEVEL_OPTIONS.some((o) => o.value === v);
}

function isStressLevel(v: string | null | undefined): v is StressLevelValue {
  return STRESS_LEVEL_OPTIONS.some((o) => o.value === v);
}

function isConsumptionFrequency(
  v: string | null | undefined,
): v is ConsumptionFrequencyValue {
  return CONSUMPTION_FREQUENCY_OPTIONS.some((o) => o.value === v);
}

function detailToForm(detail?: EstiloVidaDetail): EstiloVidaForm {
  const sleepQuality =
    detail?.sleepQuality != null &&
    detail.sleepQuality >= SCALE_MIN &&
    detail.sleepQuality <= SCALE_MAX
      ? detail.sleepQuality
      : SCALE_DEFAULT;

  return {
    activityLevel: isActivityLevel(detail?.activityLevel)
      ? detail.activityLevel
      : "",
    stressLevel: isStressLevel(detail?.stressLevel) ? detail.stressLevel : "",
    stressReason: detail?.stressReason ?? "",
    sleepHours:
      detail?.sleepHours != null && !Number.isNaN(detail.sleepHours)
        ? String(detail.sleepHours)
        : "",
    sleepQuality,
    alcoholTypes: detail?.alcoholTypes ?? [],
    alcoholFrequency: isConsumptionFrequency(detail?.alcoholFrequency)
      ? detail.alcoholFrequency
      : "",
    tobaccoFrequency: isConsumptionFrequency(detail?.tobaccoFrequency)
      ? detail.tobaccoFrequency
      : "",
    supplementTypes: detail?.supplementTypes ?? [],
  };
}

function formToPayload(data: EstiloVidaForm) {
  const hours = data.sleepHours.trim();
  return {
    activityLevel: data.activityLevel || null,
    stressLevel: data.stressLevel || null,
    stressReason: data.stressReason.trim() || null,
    sleepHours: hours === "" ? null : parseFloat(hours),
    sleepQuality: data.sleepQuality,
    alcoholTypes: data.alcoholTypes,
    alcoholFrequency: data.alcoholFrequency || null,
    tobaccoFrequency: data.tobaccoFrequency || null,
    supplementTypes: data.supplementTypes,
  };
}

function Subsection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-primary/80 bg-bg/50 p-4">
      <h4 className="text-base font-semibold text-text">{title}</h4>
      {children}
    </div>
  );
}

export default function EstiloVidaPaciente({
  pacienteId,
  initialDetail,
}: Props) {
  const [form, setForm] = useState<EstiloVidaForm>(() =>
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
    async (data: EstiloVidaForm) => {
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
    (next: EstiloVidaForm) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => persist(next), 500);
    },
    [persist],
  );

  const updateForm = useCallback(
    (patch: Partial<EstiloVidaForm>) => {
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
        <h3 className="text-lg font-semibold text-text">Estilo de vida</h3>
        <PatientAutoSaveStatus status={saveStatus} />
      </div>

      <Subsection title="Actividad física">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="activity-level" className="text-sm font-semibold text-text">
            Nivel de actividad física
          </label>
          <select
            id="activity-level"
            value={form.activityLevel}
            onChange={(e) =>
              updateForm({
                activityLevel: e.target.value as ActivityLevelValue | "",
              })
            }
            className={selectClass}
          >
            <option value="">Seleccionar nivel…</option>
            {ACTIVITY_LEVEL_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </Subsection>

      <Subsection title="Estrés">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="stress-level" className="text-sm font-semibold text-text">
            Nivel de estrés
          </label>
          <select
            id="stress-level"
            value={form.stressLevel}
            onChange={(e) =>
              updateForm({
                stressLevel: e.target.value as StressLevelValue | "",
              })
            }
            className={selectClass}
          >
            <option value="">Seleccionar nivel…</option>
            {STRESS_LEVEL_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="stress-reason" className="text-sm font-semibold text-text">
            Motivo
          </label>
          <input
            id="stress-reason"
            type="text"
            value={form.stressReason}
            onChange={(e) => updateForm({ stressReason: e.target.value })}
            placeholder="Comentario sobre el estrés…"
            className="w-full rounded-lg border border-primary bg-bg px-3 py-2 text-sm text-text placeholder:text-text-alt"
          />
        </div>
      </Subsection>

      <Subsection title="Sueño">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="sleep-hours" className="text-sm font-semibold text-text">
            ¿Cuántas horas duerme?
          </label>
          <input
            id="sleep-hours"
            type="number"
            min={0}
            max={24}
            step={0.5}
            value={form.sleepHours}
            onChange={(e) => updateForm({ sleepHours: e.target.value })}
            placeholder="Ej. 7.5"
            className="w-full max-w-[12rem] rounded-lg border border-primary bg-bg px-3 py-2 text-sm text-text placeholder:text-text-alt"
          />
        </div>
        <PatientScaleSelector
          value={form.sleepQuality}
          onChange={(sleepQuality) => updateForm({ sleepQuality })}
          label="Calidad de sueño"
          description="Toca un nivel del 1 (mala) al 10 (excelente)"
          hint={sleepQualityHint}
          lowLabel="1 · Mala"
          highLabel="10 · Excelente"
          ariaLabel="Calidad de sueño del 1 al 10"
        />
      </Subsection>

      <Subsection title="Otros consumos">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold text-text">Alcohol</p>
          <PatientMultiSelectChips
            label="Tipos de alcohol"
            description="Selecciona uno o varios; puedes agregar otros"
            presets={ALCOHOL_TYPE_PRESETS}
            selected={form.alcoholTypes}
            onChange={(alcoholTypes) => updateForm({ alcoholTypes })}
            addPlaceholder="Ej. whisky, ron…"
          />
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="alcohol-frequency"
              className="text-sm font-semibold text-text"
            >
              Frecuencia de consumo
            </label>
            <select
              id="alcohol-frequency"
              value={form.alcoholFrequency}
              onChange={(e) =>
                updateForm({
                  alcoholFrequency: e.target.value as ConsumptionFrequencyValue | "",
                })
              }
              className={selectClass}
            >
              <option value="">Seleccionar frecuencia…</option>
              {CONSUMPTION_FREQUENCY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-1.5 border-t border-primary/60 pt-4">
          <p className="text-sm font-semibold text-text">Tabaco</p>
          <label
            htmlFor="tobacco-frequency"
            className="text-sm font-semibold text-text"
          >
            Frecuencia de consumo
          </label>
          <select
            id="tobacco-frequency"
            value={form.tobaccoFrequency}
            onChange={(e) =>
              updateForm({
                tobaccoFrequency: e.target.value as ConsumptionFrequencyValue | "",
              })
            }
            className={selectClass}
          >
            <option value="">Seleccionar frecuencia…</option>
            {CONSUMPTION_FREQUENCY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="border-t border-primary/60 pt-4">
          <PatientMultiSelectChips
            label="Suplementos"
            description="Selecciona uno o varios; puedes agregar otros"
            presets={SUPPLEMENT_TYPE_PRESETS}
            selected={form.supplementTypes}
            onChange={(supplementTypes) => updateForm({ supplementTypes })}
            addPlaceholder="Ej. proteína, magnesio…"
          />
        </div>
      </Subsection>
    </div>
  );
}
