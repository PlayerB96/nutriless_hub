"use client";

import MainContent from "@/components/ui/MainContent";

export default function SettingsPage() {

  return (
    <MainContent>
      <h1 className="text-4xl font-bold mb-6">Configuración</h1>

      <section className="space-y-4">

        {/* Aquí podrías agregar más configuraciones */}
        <div>
          <h2 className="text-2xl font-semibold mb-2">Otras opciones</h2>
          <p className="text-gray-600 dark:text-gray-300">Aquí puedes agregar más opciones de configuración según tus necesidades.</p>
        </div>
      </section>
    </MainContent>
  );
}
