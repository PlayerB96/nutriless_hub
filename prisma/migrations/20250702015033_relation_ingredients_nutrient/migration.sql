/*
  Warnings:

  - You are about to drop the column `ingredients` on the `RecipeDetail` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "RecipeDetail" DROP COLUMN "ingredients";

-- AlterTable
ALTER TABLE "TraditionalNutrient" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "recipeDetailId" INTEGER;

-- AddForeignKey
ALTER TABLE "TraditionalNutrient" ADD CONSTRAINT "TraditionalNutrient_recipeDetailId_fkey" FOREIGN KEY ("recipeDetailId") REFERENCES "RecipeDetail"("id") ON DELETE SET NULL ON UPDATE CASCADE;
