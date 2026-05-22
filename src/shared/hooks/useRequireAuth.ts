"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";

type UseRequireAuthOptions = {
  /** Si se indica, redirige a `/dashboard/{sessionUserId}` cuando no coincide. */
  requireUserId?: string;
};

export function useRequireAuth(options: UseRequireAuthOptions = {}) {
  const { requireUserId } = options;
  const { data: session, status } = useSession();
  const router = useRouter();

  const sessionUserId = session?.user?.id;

  const userIdMismatch = useMemo(() => {
    if (!requireUserId || !sessionUserId) return false;
    return String(sessionUserId) !== String(requireUserId);
  }, [requireUserId, sessionUserId]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated" && userIdMismatch && sessionUserId) {
      router.replace(`/dashboard/${sessionUserId}`);
    }
  }, [status, userIdMismatch, sessionUserId, router]);

  const isAuthorized =
    status === "authenticated" && !userIdMismatch && Boolean(sessionUserId);

  return {
    session,
    status,
    userId: sessionUserId,
    isAuthorized,
    isLoading: status === "loading",
  };
}
