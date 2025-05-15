"use client";

import Link from "next/link";
import { useTheme } from "@/shared/hooks/useTheme";
import { useEffect, useState, useRef } from "react";

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [dashboardOpen, setDashboardOpen] = useState(false);

  const submenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        submenuRef.current &&
        !submenuRef.current.contains(event.target as Node)
      ) {
        setDashboardOpen(false);
      }
    }

    if (dashboardOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dashboardOpen]);

  if (!mounted) {
    return null;
  }

  const dashboardIds = ["1", "2", "3"];

  return (
    <nav className="bg-gray-100 dark:bg-gray-900 shadow p-4 flex justify-between items-center relative">
      <div className="flex items-center space-x-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Mi Plataforma</h1>

        <Link href="/" className="text-gray-700 dark:text-gray-300 hover:underline">
          Home
        </Link>

        {/* Dashboard con link y submenu */}
        <div className="relative flex items-center" ref={submenuRef}>
          {/* Link normal a /dashboard */}
          <Link
            href="/dashboard"
            className="text-gray-700 dark:text-gray-300 hover:underline"
          >
            Dashboard
          </Link>

          {/* Botón para abrir submenu */}
          <button
            onClick={() => setDashboardOpen(!dashboardOpen)}
            aria-expanded={dashboardOpen}
            aria-haspopup="true"
            className="ml-1 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus:outline-none"
            title="Abrir submenu de IDs"
          >
            ▼
          </button>

          {dashboardOpen && (
            <div className="absolute left-0 mt-8 w-32 bg-white dark:bg-gray-800 rounded shadow-lg z-10">
              {dashboardIds.map((id) => (
                <Link
                  key={id}
                  href={`/dashboard/${id}`}
                  className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  onClick={() => setDashboardOpen(false)}
                >
                  ID {id}
                </Link>
              ))}
            </div>
          )}
        </div>

        <Link href="/settings" className="text-gray-700 dark:text-gray-300 hover:underline">
          Settings
        </Link>
      </div>

      <button
        onClick={toggleTheme}
        className="bg-cyan-700 dark:bg-sky-500/70 text-white px-4 py-2 rounded hover:bg-cyan-800 transition"
      >
        {theme === "dark" ? "Modo Claro" : "Modo Oscuro"}
      </button>
    </nav>
  );
}
