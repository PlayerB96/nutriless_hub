"use client";

import AuthGuard from "@/components/auth/AuthGuard";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthGuard>{children}</AuthGuard>;
}
