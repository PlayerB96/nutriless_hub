"use client";

import { useState } from "react";
import Tabs from "@/components/ui/Tabs";
import CondicionesSaludPaciente from "./CondicionesSaludPaciente";
import DatosAlimentacionPaciente from "./DatosAlimentacionPaciente";
import EstiloVidaPaciente from "./EstiloVidaPaciente";
import ObjetivosPaciente from "./ObjetivosPaciente";

const SECTIONS = [
  { key: "objetivos", label: "Objetivos", title: "Objetivos" },
  { key: "estilo", label: "Estilo de vida", title: "Estilo de vida" },
  {
    key: "registros",
    label: "Registro de alimentos",
    title: "Registro de alimentos",
  },
  {
    key: "salud",
    label: "Condiciones de salud",
    title: "Condiciones de salud",
  },
  {
    key: "preferidos",
    label: "Alimentos preferidos",
    title: "Alimentos preferidos",
  },
  { key: "comentarios", label: "Comentarios", title: "Comentarios" },
  {
    key: "imagenes",
    label: "Imágenes del paciente",
    title: "Imágenes del paciente",
  },
] as const;

type SectionKey = (typeof SECTIONS)[number]["key"];

type PatientDetailPayload = {
  goal: string | null;
  motivation: number | null;
  goalComment: string | null;
  activityLevel: string | null;
  stressLevel: string | null;
  stressReason: string | null;
  sleepHours: number | null;
  sleepQuality: number | null;
  alcoholTypes: string[];
  alcoholFrequency: string | null;
  tobaccoFrequency: string | null;
  supplementTypes: string[];
  dietType: string | null;
  dietaryConditions: string[];
  glutenIntolerant: boolean | null;
  lactoseIntolerant: boolean | null;
  mealsPerDay: number | null;
  waterLitersPerDay: number | null;
  hadPreviousDiet: boolean | null;
  currentConditions: string[];
  medications: string[];
  pathologicalHistory: string[];
  familyPathologicalHistory: string[];
  intestinalCondition: string | null;
} | null;

type Props = {
  pacienteId: string;
  detail?: PatientDetailPayload;
};

function SectionPlaceholder({ title }: { title: string }) {
  return (
    <div className="flex min-h-[220px] flex-col">
      <h3 className="mb-3 text-lg font-semibold text-text">{title}</h3>
      <div
        className="min-h-[180px] flex-1 rounded-lg border border-dashed border-primary/50"
        aria-label={`Área de contenido: ${title}`}
      />
    </div>
  );
}

export default function InformacionCompletaPaciente({
  pacienteId,
  detail,
}: Props) {
  const [activeTab, setActiveTab] = useState<SectionKey>("objetivos");
  const activeSection = SECTIONS.find((s) => s.key === activeTab) ?? SECTIONS[0];

  const panelContent =
    activeTab === "objetivos" ? (
      <ObjetivosPaciente pacienteId={pacienteId} initialDetail={detail} />
    ) : activeTab === "estilo" ? (
      <EstiloVidaPaciente pacienteId={pacienteId} initialDetail={detail} />
    ) : activeTab === "registros" ? (
      <DatosAlimentacionPaciente pacienteId={pacienteId} initialDetail={detail} />
    ) : activeTab === "salud" ? (
      <CondicionesSaludPaciente pacienteId={pacienteId} initialDetail={detail} />
    ) : (
      <SectionPlaceholder title={activeSection.title} />
    );

  return (
    <section className="flex w-full min-h-[min(420px,70vh)] flex-col overflow-hidden rounded-xl border border-primary bg-primary p-4 shadow-lg tablet:p-6">
      <h2 className="mb-4 shrink-0 text-xl font-bold">Información completa</h2>
      <Tabs
        tabs={SECTIONS.map(({ key, label }) => ({ key, label }))}
        value={activeTab}
        onChange={setActiveTab}
        orientation="vertical"
        className="flex min-h-0 flex-1 flex-col gap-3 tablet:flex-row tablet:gap-6"
        listClassName="flex shrink-0 gap-1.5 overflow-x-auto pb-1 tablet:w-[11rem] tablet:flex-col tablet:overflow-x-visible tablet:overflow-y-auto tablet:pb-0 desktop:w-[13rem] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        panelClassName="min-h-0 flex-1 overflow-y-auto rounded-lg border border-primary bg-bg p-4"
      >
        {panelContent}
      </Tabs>
    </section>
  );
}
