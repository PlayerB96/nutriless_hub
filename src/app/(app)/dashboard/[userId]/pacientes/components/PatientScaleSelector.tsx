"use client";

import { scaleProgressPercent } from "@/lib/patient-lifestyle";

type Props = {
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
}: Props) {
  const levels = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  const progress = scaleProgressPercent(value, min, max);

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-primary bg-primary-secondary/60 p-4 tablet:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <span className="text-sm font-semibold text-text">{label}</span>
          {description && (
            <p className="mt-0.5 text-xs text-text-alt">{description}</p>
          )}
        </div>
        <div
          className="flex shrink-0 items-baseline gap-1 rounded-full border border-primary bg-bg px-3 py-1.5 shadow-sm"
          aria-live="polite"
        >
          <span className="text-2xl font-bold leading-none text-secondary tabular-nums">
            {value}
          </span>
          <span className="text-xs text-text-alt">/ {max}</span>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <div
          className="h-2 overflow-hidden rounded-full bg-primary"
          role="progressbar"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-label={ariaLabel}
        >
          <div
            className="h-full rounded-full bg-secondary transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-center text-xs font-medium text-secondary">{hint(value)}</p>
      </div>

      <div className="relative pt-2" role="radiogroup" aria-label={ariaLabel}>
        <div
          className="pointer-events-none absolute left-[4%] right-[4%] top-[1.35rem] h-1 rounded-full bg-primary"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute left-[4%] top-[1.35rem] h-1 rounded-full bg-secondary/35 transition-all duration-300 ease-out"
          style={{ width: `${progress * 0.92}%` }}
          aria-hidden
        />
        <div className="relative flex justify-between gap-0.5">
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
                className="group flex min-w-0 flex-1 cursor-pointer flex-col items-center rounded-lg p-1 transition-all duration-200 hover:bg-secondary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-bg active:scale-95 tablet:p-1.5"
              >
                <span
                  className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-all duration-200 tablet:h-9 tablet:w-9 ${
                    isSelected
                      ? "scale-110 border-secondary bg-secondary text-white shadow-md shadow-secondary/25 ring-2 ring-secondary/30 ring-offset-2 ring-offset-bg"
                      : isActive
                        ? "border-secondary bg-secondary/25 text-secondary group-hover:scale-105 group-hover:bg-secondary/40 group-hover:shadow-sm"
                        : "border-primary bg-bg text-text-alt group-hover:scale-105 group-hover:border-secondary group-hover:bg-secondary/15 group-hover:text-text group-hover:shadow-sm"
                  }`}
                >
                  {level}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex justify-between gap-2 border-t border-primary/80 pt-2 text-[10px] font-medium text-text-alt tablet:text-xs">
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
    </div>
  );
}
