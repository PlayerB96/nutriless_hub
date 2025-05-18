"use client";

import MainContent from "@/components/ui/MainContent";

export default function SettingsPage() {
  return (
    <MainContent>
      <h1 className="text-4xl font-bold mb-6 text-primary">Configuración</h1>

      <section className="space-y-4">
        {/* Aquí podrías agregar más configuraciones */}
        <div>
          <h2 className="text-2xl font-semibold mb-2 text-secondary">
            Otras opciones
          </h2>
          <p className="text-muted dark:text-muted-secondary">
            Aquí puedes agregar más opciones de configuración según tus
            necesidades.
          </p>
        </div>
      </section>
    </MainContent>
  );
}
