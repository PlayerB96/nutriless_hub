"use client";

import { LoaderCircle } from "lucide-react";
import { useRequireAuth } from "@/shared/hooks/useRequireAuth";

type AuthGuardProps = {
  children: React.ReactNode;
  requireUserId?: string;
};

export default function AuthGuard({ children, requireUserId }: AuthGuardProps) {
  const { isAuthorized, isLoading } = useRequireAuth({ requireUserId });

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoaderCircle className="h-8 w-8 animate-spin text-secondary" />
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
