"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import {
  formatCustomTagLabel,
  normalizeCustomTag,
} from "@/lib/patient-lifestyle";

type Preset = { value: string; label: string };

type Props = {
  label: string;
  description?: string;
  presets: readonly Preset[];
  selected: string[];
  onChange: (selected: string[]) => void;
  addPlaceholder?: string;
};

export default function PatientMultiSelectChips({
  label,
  description,
  presets,
  selected,
  onChange,
  addPlaceholder = "Otro (escribir y agregar)",
}: Props) {
  const [customInput, setCustomInput] = useState("");

  const presetValues = new Set(presets.map((p) => p.value));
  const customSelected = selected.filter((v) => !presetValues.has(v));

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
    "cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary active:scale-95";
  const chipSelected = "border-secondary bg-secondary text-white shadow-sm";
  const chipUnselected =
    "border-primary bg-bg text-text hover:border-secondary hover:bg-secondary/10";

  return (
    <div className="flex flex-col gap-2">
      <div>
        <span className="text-sm font-semibold text-text">{label}</span>
        {description && (
          <p className="mt-0.5 text-xs text-text-alt">{description}</p>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => {
          const isOn = selected.includes(preset.value);
          return (
            <button
              key={preset.value}
              type="button"
              onClick={() => toggle(preset.value)}
              className={`${chipBase} ${isOn ? chipSelected : chipUnselected}`}
            >
              {preset.label}
            </button>
          );
        })}
        {customSelected.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => toggle(tag)}
            className={`${chipBase} ${chipSelected} inline-flex items-center gap-1`}
            aria-label={`Quitar ${formatCustomTagLabel(tag)}`}
          >
            {formatCustomTagLabel(tag)}
            <X size={14} className="shrink-0 opacity-90" aria-hidden />
          </button>
        ))}
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
