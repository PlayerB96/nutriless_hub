export const PATIENT_GOAL_VALUES = [
  "ganar_masa_muscular",
  "perder_peso",
  "mas_energia",
  "mejorar_habitos_alimenticios",
  "ganar_musculo_perder_grasa",
] as const;

export type PatientGoalValue = (typeof PATIENT_GOAL_VALUES)[number];

export const PATIENT_GOAL_OPTIONS: { value: PatientGoalValue; label: string }[] =
  [
    { value: "ganar_masa_muscular", label: "Ganar masa muscular" },
    { value: "perder_peso", label: "Perder peso" },
    { value: "mas_energia", label: "Tener más energía" },
    {
      value: "mejorar_habitos_alimenticios",
      label: "Mejorar hábitos alimenticios",
    },
    {
      value: "ganar_musculo_perder_grasa",
      label: "Ganar músculo y perder grasa",
    },
  ];

export function isValidPatientGoal(
  value: string | null | undefined,
): value is PatientGoalValue {
  if (!value) return false;
  return (PATIENT_GOAL_VALUES as readonly string[]).includes(value);
}
