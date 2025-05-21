"use client";

import { ThemeProvider } from "next-themes";
import { SessionProvider } from "next-auth/react";
import "../../globals.css"; // ajusta la ruta si cambias de nivel

export default function LoginLayout({
  children,
  
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background text-foreground flex items-center justify-center min-h-screen">
        <SessionProvider>
          <ThemeProvider attribute="class" enableSystem defaultTheme="system">
            <main className="w-full max-w-md p-8">{children}</main>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
