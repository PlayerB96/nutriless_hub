"use client";

import { BarChart2, Home, Settings, Menu, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

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
  const pathname = usePathname(); // ① obtenemos la ruta actual

  const menuItems = [
    { href: "/home", label: "Inicio", icon: <Home size={20} /> },
    { href: "/dashboard", label: "Dashboard", icon: <BarChart2 size={20} /> },
    { href: "/settings", label: "Configuración", icon: <Settings size={20} /> },
  ];

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
        className={`hidden md:flex flex-col fixed inset-y-0 left-0 z-40 bg-gray-900 text-white transition-all duration-300 ${
          isCollapsed ? "w-16" : "w-64"
        }`}
      >
        <div className="p-4 relative">
          {!isCollapsed && (
            <Image
              src="/images/logonutri.png"
              alt="Logo Nutri"
              width={120}
              height={40}
              priority
              className="mx-auto"
            />
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-white focus:outline-none absolute top-4 right-4 cursor-pointer"
            title={isCollapsed ? "Expandir" : "Colapsar"}
          >
            {isCollapsed ? <Menu size={24} /> : <X size={24} />}
          </button>
        </div>

        <nav className="flex-1 px-2 pt-8 space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href; // ② true si la ruta actual coincide
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3 rounded px-2 py-2 transition
                  hover:bg-gray-800
                  ${isActive ? "bg-gray-700" : ""}
                `}
              >
                <span className="text-xl">{item.icon}</span>
                {!isCollapsed && <span className="text-sm">{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Drawer para mobile */}
      <div
        className={`fixed inset-0 z-50 md:hidden transition-transform duration-300 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div
          className="fixed inset-0 bg-black bg-opacity-50"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />

        <aside className="relative w-full h-full bg-gray-900 text-white p-4">
          <div className="mb-4 flex justify-between items-center">
            <Image
              src="/images/logonutri.png"
              alt="Logo Nutri"
              width={80}
              height={20}
              priority
            />
            <button
              onClick={() => setIsMobileOpen(false)}
              className="text-white focus:outline-none"
              aria-label="Cerrar menú"
            >
              <X size={24} />
            </button>
          </div>

          <nav className="flex flex-col space-y-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-3 rounded px-2 py-2 transition
                    hover:bg-gray-800
                    ${isActive ? "bg-gray-700" : ""}
                  `}
                  onClick={() => setIsMobileOpen(false)}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-sm">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>
      </div>
    </>
  );
}
