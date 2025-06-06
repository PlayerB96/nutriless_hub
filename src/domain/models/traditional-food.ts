export type TraditionalNutrient = {
  id: number;
  nutrient: string; // Ej: "Vitamina C", "Zinc"
  value: number; // Ej: 12.5
  unit: string; // Ej: "mg", "g", "kcal"
};

export type TraditionalFood = {
  id: number;
  name: string; // Ej: "Papa", "Camote"
  category: string; // Ej: "Tubérculo"
  origin?: string | null;
  imageUrl?: string | null;
  createdAt: string; // ISO format (lo puedes convertir a Date si necesitas)
  nutrients: TraditionalNutrient[];
};
