"use client";

import MainContent from "@/components/ui/MainContent";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";

export default function SettingsPage() {
  const { status } = useSession();
  const router = useRouter();

  const timeoutId = useRef<NodeJS.Timeout | null>(null);

  // Función para cerrar sesión y redirigir
  const logout = useCallback(() => {
    signOut({ redirect: false });
    router.replace("/login");
  }, [router]);

  const resetTimer = useCallback(() => {
    if (timeoutId.current) clearTimeout(timeoutId.current);
    timeoutId.current = setTimeout(() => {
      logout();
    }, 100000);
  }, [logout]);

  useEffect(() => {
    if (status === "authenticated") {
      resetTimer();

      const events = ["mousemove", "keydown", "scroll", "touchstart"];
      events.forEach((event) => window.addEventListener(event, resetTimer));

      return () => {
        if (timeoutId.current) clearTimeout(timeoutId.current);
        events.forEach((event) =>
          window.removeEventListener(event, resetTimer)
        );
      };
    }
  }, [status, resetTimer]);

  // Setear listeners para actividad del usuario
  useEffect(() => {
    if (status === "authenticated") {
      resetTimer();

      const events = ["mousemove", "keydown", "scroll", "touchstart"];
      events.forEach((event) => window.addEventListener(event, resetTimer));
      return () => {
        if (timeoutId.current) clearTimeout(timeoutId.current);
        events.forEach((event) =>
          window.removeEventListener(event, resetTimer)
        );
      };
    }
  }, [status, resetTimer]);

  // Redirigir si no autenticado
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return <div>Cargando...</div>;
  }

  if (status === "authenticated") {
    return (
      <MainContent>
        <h1 className="text-4xl font-bold mb-6 text-primary">Inicio</h1>

        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold mb-2 text-secondary">
              Otras opciones
            </h2>
            <p className="text-muted dark:text-muted-secondary">
              Aquí puedes se agregaran opciones del usuario.
            </p>
          </div>
        </section>
      </MainContent>
    );
  }

  return null;
}
