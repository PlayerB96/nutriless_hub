-- DropForeignKey
ALTER TABLE "RecipeIngredient" DROP CONSTRAINT "RecipeIngredient_foodId_fkey";

-- DropForeignKey
ALTER TABLE "RecipeIngredient" DROP CONSTRAINT "RecipeIngredient_medidaId_fkey";

-- DropForeignKey
ALTER TABLE "RecipeIngredient" DROP CONSTRAINT "RecipeIngredient_recipeDetailId_fkey";

-- DropForeignKey
ALTER TABLE "TraditionalHouseholdMeasure" DROP CONSTRAINT "TraditionalHouseholdMeasure_foodId_fkey";

-- DropForeignKey
ALTER TABLE "TraditionalNutrient" DROP CONSTRAINT "TraditionalNutrient_foodId_fkey";

-- AddForeignKey
ALTER TABLE "TraditionalNutrient" ADD CONSTRAINT "TraditionalNutrient_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "TraditionalFood"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TraditionalHouseholdMeasure" ADD CONSTRAINT "TraditionalHouseholdMeasure_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "TraditionalFood"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipeIngredient" ADD CONSTRAINT "RecipeIngredient_recipeDetailId_fkey" FOREIGN KEY ("recipeDetailId") REFERENCES "RecipeDetail"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipeIngredient" ADD CONSTRAINT "RecipeIngredient_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "TraditionalFood"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipeIngredient" ADD CONSTRAINT "RecipeIngredient_medidaId_fkey" FOREIGN KEY ("medidaId") REFERENCES "TraditionalHouseholdMeasure"("id") ON DELETE CASCADE ON UPDATE CASCADE;
