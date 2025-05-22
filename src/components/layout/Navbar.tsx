"use client";

import { useTheme } from "next-themes";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  Sun,
  Moon,
  ChevronDown,
  ChevronUp,
  Menu,
} from "lucide-react";
import { signOut } from "next-auth/react";

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
            <Menu size={24} />
          </button>

        </div>


        {/* Derecha: Botón de tema + perfil */}
        <div className="flex items-center space-x-4">
          {/* Botón de modo oscuro / claro con iconos */}
          <button
            onClick={() => setTheme(currentTheme === "dark" ? "light" : "dark")}
            className="bg-secondary text-white p-2 rounded hover:opacity-90 flex items-center justify-center"
            aria-label="Cambiar tema"
          >
            {currentTheme === "dark" ? (
              <Sun className="w-5 h-5 cursor-pointer" />
            ) : (
              <Moon className="w-5 h-5 cursor-pointer" />
            )}
          </button>

          {/* Menú de perfil */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center space-x-2 bg-muted px-3 py-2 rounded hover:bg-muted/80 text-sm md:text-base cursor-pointer"
              aria-haspopup="true"
              aria-expanded={profileOpen}
            >
              <span className="font-medium">Perfil</span>
              {profileOpen ? (
                <ChevronUp className="w-4 h-4 ml-2 inline-block" />
              ) : (
                <ChevronDown className="w-4 h-4 ml-2 inline-block" />
              )}
            </button>
            {profileOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-zinc-800 rounded shadow-lg z-10">
                <Link
                  href="/settings"
                  className="block px-4 py-2 hover:bg-secondary dark:hover:bg-secondary text-sm"
                  onClick={() => setProfileOpen(false)}
                >
                  Configuración
                </Link>
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    signOut({ callbackUrl: "/login" });
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-secondary dark:hover:bg-secondary text-sm cursor-pointer "
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
