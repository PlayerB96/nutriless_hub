export type TraditionalNutrient = {
  id: number;
  nutrient: string; // Ej: "Vitamina C", "Zinc"
  value: number; // Ej: 12.5
  unit: string; // Ej: "mg", "g", "kcal"
};

export type TraditionalFood = {
  id: number;
  name: string;
  category: string;
  origin?: string | null;
  imageUrl?: string | null;
  createdAt: string;
  nutrients: TraditionalNutrient[];

  cantidad?: number;
  tipoMedida?: number;

  // 🆕 Relación opcional para medidas caseras reales
  householdMeasures?: {
    id: number;
    description: string; // Ej: "1 taza"
    quantity: number; // Ej: 0.5, 1, etc.
    weightGrams: number; // Ej: 120
  }[];
};

export type IngredientInput = {
  id: number;
  tipoMedida: number;
  cantidad: number;
};
