"use client";

import { useMemo, useState } from "react";
import { Plus, X } from "lucide-react";
import {
  DIETARY_CONDITION_PRESETS,
  formatDietaryConditionLabel,
  normalizeDietaryCondition,
} from "@/lib/patient-diet";

type Props = {
  label: string;
  description?: string;
  selected: string[];
  onChange: (selected: string[]) => void;
  addPlaceholder?: string;
};

const selectClass =
  "w-full cursor-pointer rounded-lg border border-primary bg-bg px-3 py-2 text-sm text-text hover:border-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary";

export default function PatientDietConditionSelect({
  label,
  description,
  selected,
  onChange,
  addPlaceholder = "Otra condición (escribir y agregar)",
}: Props) {
  const [pickValue, setPickValue] = useState("");
  const [customInput, setCustomInput] = useState("");
  const [extraOptions, setExtraOptions] = useState<string[]>([]);

  const presetValues = new Set<string>(
    DIETARY_CONDITION_PRESETS.map((p) => p.value),
  );

  const allOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of DIETARY_CONDITION_PRESETS) {
      map.set(p.value, p.label);
    }
    for (const tag of [...extraOptions, ...selected]) {
      if (!map.has(tag)) {
        map.set(tag, formatDietaryConditionLabel(tag));
      }
    }
    return [...map.entries()].map(([value, optionLabel]) => ({
      value,
      label: optionLabel,
    }));
  }, [extraOptions, selected]);

  const availableToPick = allOptions.filter((o) => !selected.includes(o.value));

  const addCondition = (raw: string) => {
    const tag = normalizeDietaryCondition(raw);
    if (!tag || selected.includes(tag)) return;
    if (!presetValues.has(tag) && !extraOptions.includes(tag)) {
      setExtraOptions((prev) => [...prev, tag]);
    }
    onChange([...selected, tag]);
  };

  const handlePick = (value: string) => {
    if (!value) return;
    addCondition(value);
    setPickValue("");
  };

  const addCustom = () => {
    addCondition(customInput);
    setCustomInput("");
  };

  const chipSelected =
    "inline-flex items-center gap-1 rounded-full border border-secondary bg-secondary px-2.5 py-1 text-xs font-medium text-white";

  return (
    <div className="flex flex-col gap-2">
      <div>
        <span className="text-sm font-semibold text-text">{label}</span>
        {description && (
          <p className="mt-0.5 text-xs text-text-alt">{description}</p>
        )}
      </div>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map((tag) => (
            <span key={tag} className={chipSelected}>
              {formatDietaryConditionLabel(tag)}
              <button
                type="button"
                onClick={() => onChange(selected.filter((v) => v !== tag))}
                className="cursor-pointer rounded-full p-0.5 opacity-90 hover:opacity-100"
                aria-label={`Quitar ${formatDietaryConditionLabel(tag)}`}
              >
                <X size={14} aria-hidden />
              </button>
            </span>
          ))}
        </div>
      )}

      <select
        value={pickValue}
        onChange={(e) => handlePick(e.target.value)}
        className={selectClass}
        aria-label={label}
      >
        <option value="">Seleccionar condición…</option>
        {availableToPick.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <div className="flex gap-2">
        <input
          type="text"
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addCustom();
            }
          }}
          placeholder={addPlaceholder}
          className="min-w-0 flex-1 rounded-lg border border-primary bg-bg px-3 py-2 text-sm text-text placeholder:text-text-alt"
        />
        <button
          type="button"
          onClick={addCustom}
          disabled={!customInput.trim()}
          className="inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-lg border border-primary bg-bg px-3 py-2 text-sm font-medium text-text hover:border-secondary hover:bg-secondary/10 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus size={16} />
          Agregar
        </button>
      </div>
    </div>
  );
}
