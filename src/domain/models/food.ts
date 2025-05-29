import { HouseholdMeasure } from "./householdMeasure";
import { NutritionDetail } from "./nutritionDetail";

export type Food = {
  id: number;
  name: string;
  category: string;
  createdAt: string;
  imageUrl?: string | null;
  nutritionDetails: NutritionDetail[];
  householdMeasures: HouseholdMeasure[];
  userId: number;
};
