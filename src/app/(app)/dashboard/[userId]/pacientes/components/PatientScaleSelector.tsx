"use client";

import { scaleProgressPercent } from "@/lib/patient-lifestyle";

export type PatientScaleSelectorProps = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  label: string;
  description?: string;
  hint: (value: number) => string;
  lowLabel?: string;
  highLabel?: string;
  ariaLabel: string;
};

export default function PatientScaleSelector({
  value,
  onChange,
  min = 1,
  max = 10,
  label,
  description,
  hint,
  lowLabel = "1 · Baja",
  highLabel = "10 · Alta",
  ariaLabel,
}: PatientScaleSelectorProps) {
  const levels = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  const progress = scaleProgressPercent(value, min, max);
  const trackTop = "top-[0.7rem]";

  return (
    <div className="flex flex-col gap-2 rounded-lg bg-secondary/5 px-3 py-2.5 ring-1 ring-inset ring-[var(--border)]">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <span className="text-sm font-semibold leading-tight text-text">
            {label}
          </span>
          {description && (
            <p className="mt-0.5 text-[11px] leading-snug text-text-alt">
              {description}
            </p>
          )}
        </div>
        <div
          className="flex shrink-0 items-center gap-1 rounded-full bg-bg px-2 py-0.5 text-secondary ring-1 ring-[var(--border)]"
          aria-live="polite"
        >
          <span className="text-base font-bold tabular-nums leading-none">
            {value}
          </span>
          <span className="text-[10px] text-text-alt">/ {max}</span>
        </div>
      </div>

      <p className="text-[11px] font-medium leading-none text-secondary">
        {hint(value)}
      </p>

      <div
        className="h-1 overflow-hidden rounded-full bg-primary/80"
        role="progressbar"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-label={ariaLabel}
      >
        <div
          className="h-full rounded-full bg-secondary"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="relative" role="radiogroup" aria-label={ariaLabel}>
        <div
          className={`pointer-events-none absolute left-[3%] right-[3%] ${trackTop} h-px rounded-full bg-[var(--border)]`}
          aria-hidden
        />
        <div
          className={`pointer-events-none absolute left-[3%] ${trackTop} h-px rounded-full bg-secondary/40`}
          style={{ width: `${progress * 0.94}%` }}
          aria-hidden
        />
        <div className="relative flex justify-between gap-px">
          {levels.map((level) => {
            const isActive = level <= value;
            const isSelected = level === value;
            return (
              <button
                key={level}
                type="button"
                role="radio"
                aria-checked={isSelected}
                aria-label={`${label} ${level} de ${max}`}
                onClick={() => onChange(level)}
                className="group flex min-w-0 flex-1 cursor-pointer justify-center rounded-md py-0.5 hover:bg-secondary/10 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-secondary active:scale-95"
              >
                <span
                  className={`relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold leading-none ${
                    isSelected
                      ? "border-secondary bg-secondary text-white shadow-sm"
                      : isActive
                        ? "border-secondary/70 bg-secondary/20 text-secondary"
                        : "border-[var(--border)] bg-bg text-text-alt group-hover:border-secondary/60 group-hover:text-text"
                  }`}
                >
                  {level}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex justify-between text-[10px] font-medium text-text-alt">
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
    </div>
  );
}
