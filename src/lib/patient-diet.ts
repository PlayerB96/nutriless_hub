import { normalizeCustomTag } from "@/lib/patient-lifestyle";

export const DIET_TYPE_VALUES = [
  "vegana",
  "vegetariana",
  "organica",
  "ketogenica",
  "sin_restricciones",
] as const;

export type DietTypeValue = (typeof DIET_TYPE_VALUES)[number];

export const DIET_TYPE_OPTIONS: { value: DietTypeValue; label: string }[] = [
  { value: "vegana", label: "Vegana" },
  { value: "vegetariana", label: "Vegetariana" },
  { value: "organica", label: "Orgánica" },
  { value: "ketogenica", label: "Ketogénica" },
  { value: "sin_restricciones", label: "Sin restricciones" },
];

export const DIETARY_CONDITION_PRESETS = [
  { value: "intolerante_lactosa", label: "Intolerante a la lactosa" },
  { value: "intolerante_gluten", label: "Intolerante al gluten" },
] as const;

export type DietaryConditionPreset =
  (typeof DIETARY_CONDITION_PRESETS)[number]["value"];

export function isValidDietType(
  value: string | null | undefined,
): value is DietTypeValue {
  if (!value) return false;
  return (DIET_TYPE_VALUES as readonly string[]).includes(value);
}

export function formatDietaryConditionLabel(value: string): string {
  const preset = DIETARY_CONDITION_PRESETS.find((p) => p.value === value);
  if (preset) return preset.label;
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function normalizeDietaryCondition(value: string): string {
  const known = DIETARY_CONDITION_PRESETS.find(
    (p) => p.value === value || p.label.toLowerCase() === value.toLowerCase(),
  );
  if (known) return known.value;
  return normalizeCustomTag(value);
}

/** Convierte flags legacy de Prisma al array de condiciones. */
export function dietaryConditionsFromDetail(detail: {
  dietaryConditions?: string[];
  glutenIntolerant?: boolean | null;
  lactoseIntolerant?: boolean | null;
} | null | undefined): string[] {
  const fromArray = detail?.dietaryConditions ?? [];
  if (fromArray.length > 0) return [...new Set(fromArray)];

  const legacy: string[] = [];
  if (detail?.lactoseIntolerant) legacy.push("intolerante_lactosa");
  if (detail?.glutenIntolerant) legacy.push("intolerante_gluten");
  return legacy;
}
