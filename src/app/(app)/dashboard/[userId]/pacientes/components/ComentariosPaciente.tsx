"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import PatientAutoSaveStatus from "./PatientAutoSaveStatus";

const REFERRAL_SOURCE_OPTIONS = [
  { value: "facebook", label: "Facebook" },
  { value: "instagram", label: "Instagram" },
  { value: "referido", label: "Referido" },
  { value: "familiar", label: "Familiar" },
  { value: "amigo", label: "Por un amigo" },
  { value: "otra_red_social", label: "Por otra red social" },
  { value: "pagina_web", label: "Por página web" },
] as const;

export type ComentariosDetail = {
  address: string | null;
  referralSource: string | null;
  preAppointmentComment: string | null;
} | null;

type ComentariosForm = {
  address: string;
  referralSource: string;
  preAppointmentComment: string;
};

type Props = {
  pacienteId: string;
  initialDetail?: ComentariosDetail;
};

function detailToForm(detail?: ComentariosDetail): ComentariosForm {
  return {
    address: detail?.address ?? "",
    referralSource: detail?.referralSource ?? "",
    preAppointmentComment: detail?.preAppointmentComment ?? "",
  };
}

const selectClass =
  "w-full cursor-pointer rounded-lg border border-primary bg-bg px-3 py-2 text-sm text-text hover:border-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary";

const inputClass =
  "w-full rounded-lg border border-primary bg-bg px-3 py-2 text-sm text-text placeholder:text-text-alt focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary";

export default function ComentariosPaciente({
  pacienteId,
  initialDetail,
}: Props) {
  const [form, setForm] = useState<ComentariosForm>(() =>
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
    async (data: ComentariosForm) => {
      try {
        setSaveStatus("saving");
        const response = await fetch(`/api/pacientes/${pacienteId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            address: data.address || null,
            referralSource: data.referralSource || null,
            preAppointmentComment: data.preAppointmentComment || null,
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
    (next: ComentariosForm) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => persist(next), 500);
    },
    [persist],
  );

  const updateForm = useCallback(
    (patch: Partial<ComentariosForm>) => {
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
        <h3 className="text-lg font-semibold text-text">Comentarios</h3>
        <PatientAutoSaveStatus status={saveStatus} />
      </div>

      <section className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="patient-address" className="text-sm font-semibold text-text">
            Dirección del paciente
          </label>
          <input
            id="patient-address"
            type="text"
            value={form.address}
            onChange={(e) => updateForm({ address: e.target.value })}
            placeholder="Ej. Av. Reforma #123, Col. Centro, CDMX"
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="referral-source" className="text-sm font-semibold text-text">
            ¿Cómo conoció al nutricionista?
          </label>
          <select
            id="referral-source"
            value={form.referralSource}
            onChange={(e) => updateForm({ referralSource: e.target.value })}
            className={selectClass}
          >
            <option value="">Seleccionar referencia…</option>
            {REFERRAL_SOURCE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="pre-appointment-comment"
            className="text-sm font-semibold text-text"
          >
            Comentario previo a la cita
          </label>
          <textarea
            id="pre-appointment-comment"
            value={form.preAppointmentComment}
            onChange={(e) =>
              updateForm({ preAppointmentComment: e.target.value })
            }
            placeholder="Ej. Paciente que quiere tener estilo de vida más saludable"
            rows={4}
            className={`${inputClass} resize-y`}
          />
        </div>
      </section>
    </div>
  );
}
