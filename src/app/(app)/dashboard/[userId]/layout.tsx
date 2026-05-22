"use client";

import { useParams } from "next/navigation";
import AuthGuard from "@/components/auth/AuthGuard";

export default function DashboardUserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const userId = params.userId as string;

  return <AuthGuard requireUserId={userId}>{children}</AuthGuard>;
}
