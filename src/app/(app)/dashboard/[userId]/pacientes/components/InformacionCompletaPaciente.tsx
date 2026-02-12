"use client";

import { useMemo, useState } from "react";
import Tabs from "@/components/ui/Tabs";

const TABS = [
  { key: "objetivos", label: "Objetivos" },
  { key: "estilo", label: "Estilo de vida" },
  { key: "registros", label: "Registros de alimentos" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function InformacionCompletaPaciente() {
  const [activeTab, setActiveTab] = useState<TabKey>("objetivos");

  const content = useMemo(() => {
    switch (activeTab) {
      case "objetivos":
        return (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Objetivos</h3>
            <ul className="list-disc pl-5 text-sm text-text-alt">
              <li>Perder 4 kg en 8 semanas.</li>
              <li>Mejorar hábitos de hidratación.</li>
              <li>Aumentar consumo de fibra.</li>
            </ul>
          </div>
        );
      case "estilo":
        return (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Estilo de vida</h3>
            <p className="text-sm text-text-alt">
              Actividad física: 3 días/semana · Sueño: 7 h · Estrés: medio.
            </p>
            <p className="text-sm text-text-alt">
              Horarios: desayuno 8:00, almuerzo 13:30, cena 20:00.
            </p>
          </div>
        );
      case "registros":
        return (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Registros de alimentos</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-text-alt">
              <div className="p-3 rounded-lg bg-bg border border-primary">
                <div className="font-medium text-text">24/01</div>
                <div>Desayuno: avena + fruta</div>
                <div>Almuerzo: pollo + ensalada</div>
              </div>
              <div className="p-3 rounded-lg bg-bg border border-primary">
                <div className="font-medium text-text">25/01</div>
                <div>Desayuno: yogurt + granola</div>
                <div>Cena: pescado + verduras</div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  }, [activeTab]);

  return (
    <section className="w-full bg-primary rounded-xl shadow-lg p-6 border border-primary h-[420px] overflow-y-auto">
      <h2 className="text-xl font-bold mb-4">Información completa</h2>
      <Tabs
        tabs={TABS}
        value={activeTab}
        onChange={setActiveTab}
        orientation="vertical"
        className="flex flex-col md:flex-row gap-6"
        listClassName="md:w-1/4 flex md:flex-col gap-2"
        panelClassName="flex-1 bg-bg rounded-lg p-4 border border-primary"
      >
        {content}
      </Tabs>
    </section>
  );
}
