"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ThemeProvider } from "next-themes";
import "../globals.css";
import { useState } from "react";
import SideNav from "@/components/layout/Sidenav";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast"; // <-- Importa Toaster

export default function RootLayout({
  children,
  session,
}: {
  children: React.ReactNode;
  session?: any;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <SessionProvider session={session}>
          <ThemeProvider attribute="class" enableSystem defaultTheme="system">
            <div className="flex min-h-screen relative">
              <SideNav
                isCollapsed={isCollapsed}
                setIsCollapsed={setIsCollapsed}
                isMobileOpen={isMobileOpen}
                setIsMobileOpen={setIsMobileOpen}
              />

              {isMobileOpen && (
                <div
                  className="fixed inset-0 bg-black bg-opacity-40 z-30 md:hidden"
                  onClick={() => setIsMobileOpen(false)}
                />
              )}

              <div
                className={`flex-1 min-h-screen transition-all duration-300
                ${isCollapsed ? "md:pl-16" : "md:pl-64"}
              `}
              >
                <Navbar setIsMobileOpen={setIsMobileOpen} />
                <main className="p-4">{children}</main>
                <Footer />
              </div>
            </div>
            <Toaster position="top-right" />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
