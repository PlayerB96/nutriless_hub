"use client";

import MainContent from "@/components/ui/MainContent";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";
import { useRequireAuth } from "@/shared/hooks/useRequireAuth";

const IDLE_TIMEOUT_MS = 100_000;

export default function SettingsPage() {
  const { isAuthorized } = useRequireAuth();
  const router = useRouter();
  const timeoutId = useRef<NodeJS.Timeout | null>(null);

  const logout = useCallback(() => {
    signOut({ redirect: false });
    router.replace("/login");
  }, [router]);

  const resetTimer = useCallback(() => {
    if (timeoutId.current) clearTimeout(timeoutId.current);
    timeoutId.current = setTimeout(logout, IDLE_TIMEOUT_MS);
  }, [logout]);

  useEffect(() => {
    if (!isAuthorized) return;

    resetTimer();
    const events = ["mousemove", "keydown", "scroll", "touchstart"] as const;
    events.forEach((event) => window.addEventListener(event, resetTimer));

    return () => {
      if (timeoutId.current) clearTimeout(timeoutId.current);
      events.forEach((event) =>
        window.removeEventListener(event, resetTimer),
      );
    };
  }, [isAuthorized, resetTimer]);

  if (!isAuthorized) {
    return null;
  }

  return (
    <MainContent>
      <h1 className="text-2xl tablet:text-3xl desktop:text-4xl font-bold mb-4 tablet:mb-6 text-primary">
        Configuración
      </h1>

      <section className="space-y-3 tablet:space-y-4">
        <div>
          <h2 className="text-xl tablet:text-2xl font-semibold mb-2 text-secondary">
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
