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
              className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary active:scale-95 ${
                isOn
                  ? "border-secondary bg-secondary text-white shadow-sm"
                  : "border-primary bg-bg text-text hover:border-secondary hover:bg-secondary/10"
              }`}
            >
              {preset.label}
            </button>
          );
        })}
      </div>

      {customSelected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {customSelected.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full border border-secondary/50 bg-secondary/15 px-2.5 py-1 text-xs font-medium text-text"
            >
              {formatCustomTagLabel(tag)}
              <button
                type="button"
                onClick={() => toggle(tag)}
                className="cursor-pointer rounded-full p-0.5 text-text-alt transition hover:bg-secondary/20 hover:text-text"
                aria-label={`Quitar ${formatCustomTagLabel(tag)}`}
              >
                <X size={14} />
              </button>
            </span>
          ))}
        </div>
      )}

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
          className="inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-lg border border-primary bg-bg px-3 py-2 text-sm font-medium text-text transition hover:border-secondary hover:bg-secondary/10 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus size={16} />
          Agregar
        </button>
      </div>
    </div>
  );
}
