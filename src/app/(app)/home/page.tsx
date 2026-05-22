"use client";

import MainContent from "@/components/ui/MainContent";
import { useRequireAuth } from "@/shared/hooks/useRequireAuth";

export default function HomePage() {
  const { isAuthorized } = useRequireAuth();

  if (!isAuthorized) {
    return null;
  }

  return (
    <MainContent>
      <h1 className="text-4xl font-bold mb-6 text-primary">Inicio</h1>

      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold mb-2 text-secondary">
            Otras opciones
          </h2>
          <p className="text-muted dark:text-muted-secondary">
            Aquí se agregarán opciones del usuario.
          </p>
        </div>
      </section>
    </MainContent>
  );
}
