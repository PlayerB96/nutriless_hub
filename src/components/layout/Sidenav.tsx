"use client";

import {
  BarChart2,
  BookOpen,
  Contact,
  Home,
  Leaf,
  Package,
  Settings,
  X,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { BREAKPOINT_TABLET_PX } from "@/lib/breakpoints";

interface SideNavProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (value: boolean) => void;
}

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
  children?: NavItem[];
};

/** Coincide la ruta exacta o subrutas (p. ej. /dashboard/1/pacientes → /dashboard/1/pacientes). */
function isNavItemActive(pathname: string, href: string): boolean {
  if (pathname === href) return true;
  return pathname.startsWith(`${href}/`);
}

function isDashboardRootActive(pathname: string, userId?: string): boolean {
  if (pathname === "/dashboard") return true;
  if (userId && pathname === `/dashboard/${userId}`) return true;
  return false;
}

function NavLinks({
  items,
  pathname,
  userId,
  isCollapsed,
  onNavigate,
}: {
  items: NavItem[];
  pathname: string;
  userId?: string;
  isCollapsed: boolean;
  onNavigate?: () => void;
}) {
  return (
    <>
      {items.map((item) => {
        const isDashboard = item.href === "/dashboard";
        const isActive = isDashboard
          ? isDashboardRootActive(pathname, userId)
          : isNavItemActive(pathname, item.href);
        const showChildren =
          !isCollapsed && item.children && item.children.length > 0;

        return (
          <div key={item.href} className="space-y-1">
            <Link
              href={item.href}
              onClick={onNavigate}
              className={`
                flex items-center gap-3 rounded px-2 py-2 transition-colors
                focus:outline-none focus:ring-2 focus:ring-primary/50
                ${
                  isActive
                    ? "bg-secondary text-white dark:text-white font-semibold"
                    : "text-text hover:bg-secondary-secondary dark:text-white/90 dark:hover:bg-white/10"
                }
              `}
            >
              <span className="shrink-0 text-xl">{item.icon}</span>
              {!isCollapsed && (
                <span className="text-sm leading-snug">{item.label}</span>
              )}
            </Link>

            {showChildren && (
              <div className="ml-3 space-y-0.5 border-l border-white/20 pl-2">
                {item.children!.map((child) => {
                  const isChildActive = isNavItemActive(pathname, child.href);
                  return (
                    <Link
                      key={child.href}
                      href={child.href}
                      onClick={onNavigate}
                      className={`
                        flex items-center gap-2 rounded px-2 py-1.5 transition-colors
                        focus:outline-none focus:ring-2 focus:ring-primary/50
                        ${
                          isChildActive
                            ? "bg-secondary text-white dark:text-white font-medium"
                            : "text-text/90 hover:bg-secondary-secondary dark:text-white/80 dark:hover:bg-white/10"
                        }
                      `}
                    >
                      <span className="shrink-0">{child.icon}</span>
                      <span className="text-xs leading-snug">{child.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}

export default function SideNav({
  isCollapsed,
  isMobileOpen,
  setIsMobileOpen,
}: SideNavProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const menuItems = useMemo<NavItem[]>(() => {
    const dashboardChildren: NavItem[] = userId
      ? [
          {
            href: `/dashboard/${userId}/pacientes`,
            label: "Pacientes",
            icon: <Contact size={16} />,
          },
          {
            href: `/dashboard/${userId}/recetas`,
            label: "Recetas",
            icon: <BookOpen size={16} />,
          },
          {
            href: `/dashboard/${userId}/procesados`,
            label: "Alimentos procesados",
            icon: <Package size={16} />,
          },
          {
            href: `/dashboard/${userId}/organicos`,
            label: "Alimentos orgánicos",
            icon: <Leaf size={16} />,
          },
        ]
      : [];

    return [
      { href: "/home", label: "Inicio", icon: <Home size={20} /> },
      {
        href: "/dashboard",
        label: "Dashboard",
        icon: <BarChart2 size={20} />,
        children: dashboardChildren,
      },
      { href: "/settings", label: "Configuración", icon: <Settings size={20} /> },
    ];
  }, [userId]);

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= BREAKPOINT_TABLET_PX && isMobileOpen) {
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
        className={`hidden tablet:flex flex-col fixed inset-y-0 left-0 z-40 bg-primary border-r border-primary dark:bg-primary dark:border-transparent ${
          isCollapsed ? "w-16" : "w-60"
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
              style={{ height: "auto" }}
            />
          )}
        </div>

        <nav className="flex-1 overflow-y-auto px-2 pt-8 space-y-2">
          <NavLinks
            items={menuItems}
            pathname={pathname}
            userId={userId}
            isCollapsed={isCollapsed}
          />
        </nav>
      </aside>

      {/* Drawer móvil: panel 80% + 20% de contenido visible */}
      <div
        className={`fixed inset-0 z-50 tablet:hidden ${
          isMobileOpen ? "visible" : "invisible pointer-events-none"
        }`}
      >
        <button
          type="button"
          className={`fixed inset-y-0 right-0 w-[20%] bg-black/40 transition-opacity duration-300 ${
            isMobileOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setIsMobileOpen(false)}
          aria-label="Cerrar menú"
        />

        <aside
          className={`fixed inset-y-0 left-0 z-50 flex w-[80%] flex-col bg-primary p-4 shadow-xl transition-transform duration-300 dark:bg-primary ${
            isMobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="mb-4 flex justify-between items-center">
            <Image
              src="/images/logonutri.png"
              alt="Logo Nutri"
              width={120}
              height={40}
              priority
              className="mx-auto"
              style={{ height: "auto" }}
            />

            <button
              type="button"
              onClick={() => setIsMobileOpen(false)}
              className="text-gray-900 transition-opacity hover:opacity-70 focus:outline-none dark:text-white"
              aria-label="Cerrar menú"
            >
              <X size={24} />
            </button>
          </div>

          <nav className="flex flex-1 flex-col space-y-2 overflow-y-auto">
            <NavLinks
              items={menuItems}
              pathname={pathname}
              userId={userId}
              isCollapsed={false}
              onNavigate={() => setIsMobileOpen(false)}
            />
          </nav>
        </aside>
      </div>
    </>
  );
}
