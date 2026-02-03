import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export default function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  if (!items.length) return null;

  return (
    <nav aria-label="Breadcrumb" className="flex items-center text-sm text-text-alt mb-4">
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center">
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="hover:text-secondary transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span className={isLast ? "text-text font-semibold" : ""}>{item.label}</span>
              )}
              {!isLast && <ChevronRight className="mx-2 h-4 w-4 text-text-alt" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
