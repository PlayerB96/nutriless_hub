import { TraditionalFood } from "./traditional-food";

export interface RecipeDetail {
  id: number;
  recipeId: number;
  ingredients: TraditionalFood[]; // ✅ antes: string[]
  instructions: string[];
}
export interface Recipe {
  id: number;
  name: string;
  tags: string[];
  portions: number;
  prepTime: number;
  cookTime?: number | null;
  difficulty: string;
  isPublic: boolean;
  createdAt: string; // o Date
  image?: string;

  detail?: RecipeDetail | null; // ← nuevo campo
}
