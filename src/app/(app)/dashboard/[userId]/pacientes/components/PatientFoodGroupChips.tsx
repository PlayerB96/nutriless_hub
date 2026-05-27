"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { type FoodGroup } from "@/lib/patient-food-preferences";
import {
  formatCustomTagLabel,
  normalizeCustomTag,
} from "@/lib/patient-lifestyle";

type Props = {
  label: string;
  description?: string;
  groups: FoodGroup[];
  selected: string[];
  onChange: (selected: string[]) => void;
  addPlaceholder?: string;
};

export default function PatientFoodGroupChips({
  label,
  description,
  groups,
  selected,
  onChange,
  addPlaceholder = "Otro (escribir y agregar)",
}: Props) {
  const [customInput, setCustomInput] = useState("");

  const allPresetValues = new Set(groups.flatMap((g) => g.items.map((i) => i.value)));
  const customSelected = selected.filter((v) => !allPresetValues.has(v));

  const toggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const addCustom = () => {
    const tag = normalizeCustomTag(customInput);
    if (!tag || selected.includes(tag)) {
      setCustomInput("");
      return;
    }
    onChange([...selected, tag]);
    setCustomInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addCustom();
    }
  };

  const chipBase =
    "cursor-pointer rounded-full border px-2.5 py-1 text-xs font-medium hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary active:scale-95 transition-all";
  const chipSelected = "border-secondary bg-secondary text-white shadow-sm";
  const chipUnselected =
    "border-primary bg-bg text-text hover:border-secondary hover:bg-secondary/10";

  return (
    <div className="flex flex-col gap-3">
      {label && (
        <div>
          <span className="text-sm font-semibold text-text">{label}</span>
          {description && (
            <p className="mt-0.5 text-xs text-text-alt">{description}</p>
          )}
        </div>
      )}

      <div className="flex flex-col gap-3">
        {groups.map((group) => (
          <div key={group.group} className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-text-alt uppercase tracking-wide">
              {group.group}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {group.items.map((item) => {
                const isOn = selected.includes(item.value);
                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => toggle(item.value)}
                    className={`${chipBase} ${isOn ? chipSelected : chipUnselected}`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {customSelected.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-text-alt uppercase tracking-wide">
              Personalizados
            </span>
            <div className="flex flex-wrap gap-1.5">
              {customSelected.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggle(tag)}
                  className={`${chipBase} ${chipSelected} inline-flex items-center gap-1`}
                  aria-label={`Quitar ${formatCustomTagLabel(tag)}`}
                >
                  {formatCustomTagLabel(tag)}
                  <X size={12} className="shrink-0 opacity-90" aria-hidden />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          onKeyDown={handleKeyDown}
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
