"use client";

import { useTheme } from "next-themes";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";

interface NavbarProps {
  setIsMobileOpen: (open: boolean) => void;
}

export default function Navbar({ setIsMobileOpen }: NavbarProps) {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!mounted) return null;

  const currentTheme = theme === "system" ? systemTheme : theme;

  return (
    <nav className="bg-primary text-text dark:bg-primary dark:text-text shadow p-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Izquierda: Botón hamburguesa móvil + Mejorar plan */}
        <div className="flex items-center space-x-4">
          {/* Botón hamburguesa solo en móvil */}
          <button
            className="md:hidden text-text px-2 py-1 rounded hover:bg-muted/80 focus:outline-none"
            onClick={() => setIsMobileOpen(true)}
            aria-label="Abrir menú lateral"
          >
            ☰
          </button>

          <button className="bg-accent text-white px-4 py-2 rounded hover:opacity-90 text-sm md:text-base">
            Mejorar Plan
          </button>
        </div>

        {/* Derecha: Botón de tema + perfil */}
        <div className="flex items-center space-x-4">
          {/* Botón de modo oscuro / claro */}
          <button
            onClick={() => setTheme(currentTheme === "dark" ? "light" : "dark")}
            className="bg-secondary text-white px-3 py-2 rounded text-sm md:text-base hover:opacity-90"
          >
            {currentTheme === "dark" ? "Modo Claro" : "Modo Oscuro"}
          </button>

          {/* Menú de perfil */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center space-x-2 bg-muted px-3 py-2 rounded hover:bg-muted/80 text-sm md:text-base"
            >
              <span className="font-medium">Perfil</span>
              <span>▼</span>
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-zinc-800 rounded shadow-lg z-10">
                <Link
                  href="/settings"
                  className="block px-4 py-2 hover:bg-secondary dark:hover:bg-secondary text-sm"
                >
                  Configuración
                </Link>
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    console.log("Cerrar sesión");
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-secondary dark:hover:bg-secondary text-sm"
                >
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
