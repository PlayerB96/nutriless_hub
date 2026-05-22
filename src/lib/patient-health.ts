import { normalizeCustomTag } from "@/lib/patient-lifestyle";

export const CURRENT_CONDITION_PRESETS = [
  { value: "hipertension", label: "Hipertensión" },
  { value: "dislipemia", label: "Dislipemia" },
  { value: "diabetes", label: "Diabetes" },
  { value: "obesidad", label: "Obesidad" },
] as const;

export const MEDICATION_PRESETS = [{ value: "advil", label: "Advil" }] as const;

export const PERSONAL_HISTORY_PRESETS = [
  { value: "gastritis", label: "Gastritis" },
] as const;

export const INTESTINAL_CONDITION_VALUES = [
  "normal",
  "diarrea",
  "estrenimiento",
  "sangrado",
] as const;

export type IntestinalConditionValue =
  (typeof INTESTINAL_CONDITION_VALUES)[number];

export const INTESTINAL_CONDITION_OPTIONS: {
  value: IntestinalConditionValue;
  label: string;
}[] = [
  { value: "normal", label: "Normal" },
  { value: "diarrea", label: "Diarrea" },
  { value: "estrenimiento", label: "Estreñimiento" },
  { value: "sangrado", label: "Sangrado" },
];

const ALL_PRESETS = [
  ...CURRENT_CONDITION_PRESETS,
  ...MEDICATION_PRESETS,
  ...PERSONAL_HISTORY_PRESETS,
];

export function isValidIntestinalCondition(
  value: string | null | undefined,
): value is IntestinalConditionValue {
  if (!value) return false;
  return (INTESTINAL_CONDITION_VALUES as readonly string[]).includes(value);
}

export function normalizeHealthTag(value: string): string {
  const lower = value.trim().toLowerCase();
  const preset = ALL_PRESETS.find(
    (p) =>
      p.value === lower ||
      p.label.toLowerCase() === lower ||
      normalizeCustomTag(p.label) === normalizeCustomTag(value),
  );
  if (preset) return preset.value;
  return normalizeCustomTag(value);
}

export function formatHealthTagLabel(value: string): string {
  const preset = ALL_PRESETS.find((p) => p.value === value);
  if (preset) return preset.label;
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function normalizeHealthTagArray(raw: unknown): string[] | null {
  if (!Array.isArray(raw)) return null;
  const tags = raw
    .map((item) => (typeof item === "string" ? normalizeHealthTag(item) : ""))
    .filter(Boolean);
  return [...new Set(tags)];
}
