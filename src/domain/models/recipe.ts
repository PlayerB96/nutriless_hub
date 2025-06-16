export interface RecipeDetail {
  ingredients: string[];
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
  imageUrl?: string;

  detail?: RecipeDetail | null; // ← nuevo campo
}
