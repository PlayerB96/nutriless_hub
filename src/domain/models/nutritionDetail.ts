export type NutritionDetail = {
  id: number;
  nutrient: string;
  value: number | string; // permitir string "" para input vacío
  unit: string;
};
