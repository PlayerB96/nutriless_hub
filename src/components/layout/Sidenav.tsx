"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

interface SideNavProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (value: boolean) => void;
}

export default function SideNav({
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
}: SideNavProps) {
  const menuItems = [
    { href: "/", label: "Inicio", icon: "🏠" },
    { href: "/dashboard", label: "Dashboard", icon: "📊" },
    { href: "/settings", label: "Configuración", icon: "⚙️" },
  ];

  // Cerrar menú mobile al cambiar a desktop
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 768 && isMobileOpen) {
        setIsMobileOpen(false);
      }
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isMobileOpen, setIsMobileOpen]);

  return (
    <>
      {/* Sidebar para desktop */}
      <aside
        className={`hidden md:flex flex-col fixed inset-y-0 left-0 z-40 bg-gray-900 text-white transition-all duration-300
          ${isCollapsed ? "w-16" : "w-64"}`}
      >
        <div className="p-4 flex justify-end">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-white focus:outline-none"
            title={isCollapsed ? "Expandir" : "Colapsar"}
          >
            {isCollapsed ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}{" "}
          </button>
        </div>
        <nav className="flex-1 px-2 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 hover:bg-gray-800 rounded px-2 py-2 transition"
              onClick={() => setIsMobileOpen(false)} // No hace nada en desktop, safe
            >
              <span className="text-xl">{item.icon}</span>
              {!isCollapsed && <span className="text-sm">{item.label}</span>}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Drawer para mobile */}
      <div
        className={`fixed inset-0 z-50 md:hidden transition-transform duration-300 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Fondo semitransparente para cerrar al hacer click afuera */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        ></div>

        {/* Menu drawer - ocupa todo el ancho y alto */}
        <aside className="relative w-full h-full bg-gray-900 text-white p-4">
          <button
            onClick={() => setIsMobileOpen(false)}
            className="mb-4 text-white focus:outline-none"
            aria-label="Cerrar menú"
          >
            ✖️
          </button>
          <nav className="flex flex-col space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 hover:bg-gray-800 rounded px-2 py-2 transition"
                onClick={() => setIsMobileOpen(false)} // Cerrar al seleccionar
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-sm">{item.label}</span>
              </Link>
            ))}
          </nav>
        </aside>
      </div>
    </>
  );
}
