"use client";

import type { ReactNode } from "react";

export type TabItem<T extends string> = {
  key: T;
  label: string;
};

type Props<T extends string> = {
  tabs: readonly TabItem<T>[];
  value: T;
  onChange: (value: T) => void;
  children: ReactNode;
  className?: string;
  listClassName?: string;
  panelClassName?: string;
  orientation?: "horizontal" | "vertical";
};

export default function Tabs<T extends string>({
  tabs,
  value,
  onChange,
  children,
  className,
  listClassName,
  panelClassName,
  orientation = "horizontal",
}: Props<T>) {
  return (
    <div className={className}>
      <div
        role="tablist"
        aria-orientation={orientation}
        className={listClassName}
      >
        {tabs.map((tab) => {
          const isActive = value === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`tab-panel-${tab.key}`}
              id={`tab-${tab.key}`}
              onClick={() => onChange(tab.key)}
              className={`px-4 py-2 rounded-lg text-left text-sm font-medium border ${
                isActive
                  ? "bg-secondary text-white border-secondary cursor-pointer"
                  : "bg-bg text-text border-primary hover:bg-primary-secondary cursor-pointer"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <div
        role="tabpanel"
        id={`tab-panel-${value}`}
        aria-labelledby={`tab-${value}`}
        className={panelClassName}
      >
        {children}
      </div>
    </div>
  );
}
