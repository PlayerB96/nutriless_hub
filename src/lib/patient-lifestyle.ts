export const ACTIVITY_LEVEL_VALUES = [
  "sedentario",
  "ligeramente_activo",
  "moderadamente_activo",
  "muy_activo",
] as const;

export type ActivityLevelValue = (typeof ACTIVITY_LEVEL_VALUES)[number];

export const ACTIVITY_LEVEL_OPTIONS: {
  value: ActivityLevelValue;
  label: string;
}[] = [
  { value: "sedentario", label: "Sedentario" },
  { value: "ligeramente_activo", label: "Ligeramente activo" },
  { value: "moderadamente_activo", label: "Moderadamente activo" },
  { value: "muy_activo", label: "Muy activo" },
];

export const STRESS_LEVEL_VALUES = [
  "ninguno",
  "leve",
  "moderado",
  "fuerte",
  "severo",
] as const;

export type StressLevelValue = (typeof STRESS_LEVEL_VALUES)[number];

export const STRESS_LEVEL_OPTIONS: { value: StressLevelValue; label: string }[] =
  [
    { value: "ninguno", label: "No tiene" },
    { value: "leve", label: "Leve" },
    { value: "moderado", label: "Moderado" },
    { value: "fuerte", label: "Fuerte" },
    { value: "severo", label: "Severo" },
  ];

export const CONSUMPTION_FREQUENCY_VALUES = [
  "todos_los_dias",
  "uno_dos_veces_semana",
  "una_vez_mes",
  "menos_una_vez_mes",
  "nunca",
] as const;

export type ConsumptionFrequencyValue =
  (typeof CONSUMPTION_FREQUENCY_VALUES)[number];

export const CONSUMPTION_FREQUENCY_OPTIONS: {
  value: ConsumptionFrequencyValue;
  label: string;
}[] = [
  { value: "todos_los_dias", label: "Todos los días" },
  { value: "uno_dos_veces_semana", label: "1 o 2 veces por semana" },
  { value: "una_vez_mes", label: "1 vez al mes" },
  { value: "menos_una_vez_mes", label: "Menos de 1 vez al mes" },
  { value: "nunca", label: "Nunca" },
];

export const ALCOHOL_TYPE_PRESETS = [
  { value: "pisco", label: "Pisco" },
  { value: "vodka", label: "Vodka" },
  { value: "gin", label: "Gin" },
  { value: "vino_blanco", label: "Vino blanco" },
  { value: "vino_tinto", label: "Vino tinto" },
  { value: "cerveza", label: "Cerveza" },
] as const;

export const SUPPLEMENT_TYPE_PRESETS = [
  { value: "vitamina_b12", label: "Vitamina B12" },
  { value: "creatina", label: "Creatina" },
  { value: "carnitina", label: "Carnitina" },
  { value: "omega_3", label: "Omega 3" },
] as const;

export const SCALE_MIN = 1;
export const SCALE_MAX = 10;
export const SCALE_DEFAULT = 5;

export function isValidActivityLevel(
  value: string | null | undefined,
): value is ActivityLevelValue {
  if (!value) return false;
  return (ACTIVITY_LEVEL_VALUES as readonly string[]).includes(value);
}

export function isValidStressLevel(
  value: string | null | undefined,
): value is StressLevelValue {
  if (!value) return false;
  return (STRESS_LEVEL_VALUES as readonly string[]).includes(value);
}

export function isValidConsumptionFrequency(
  value: string | null | undefined,
): value is ConsumptionFrequencyValue {
  if (!value) return false;
  return (CONSUMPTION_FREQUENCY_VALUES as readonly string[]).includes(value);
}

export function isValidScaleValue(value: unknown): value is number {
  const n = Number(value);
  return (
    Number.isInteger(n) && !Number.isNaN(n) && n >= SCALE_MIN && n <= SCALE_MAX
  );
}

export function normalizeCustomTag(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/\s+/g, "_")
    .slice(0, 48);
}

export function formatCustomTagLabel(value: string): string {
  const preset =
    ALCOHOL_TYPE_PRESETS.find((p) => p.value === value) ??
    SUPPLEMENT_TYPE_PRESETS.find((p) => p.value === value);
  if (preset) return preset.label;
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function motivationHint(value: number): string {
  if (value <= 2) return "Motivación muy baja";
  if (value <= 4) return "Motivación baja";
  if (value <= 6) return "Motivación moderada";
  if (value <= 8) return "Buena motivación";
  return "Motivación excelente";
}

export function sleepQualityHint(value: number): string {
  if (value <= 2) return "Calidad muy baja";
  if (value <= 4) return "Calidad baja";
  if (value <= 6) return "Calidad regular";
  if (value <= 8) return "Buena calidad";
  return "Calidad excelente";
}

export function scaleProgressPercent(
  value: number,
  min = SCALE_MIN,
  max = SCALE_MAX,
): number {
  return ((value - min) / (max - min)) * 100;
}
