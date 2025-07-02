/*
  Warnings:

  - You are about to drop the column `recipeDetailId` on the `TraditionalNutrient` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "TraditionalNutrient" DROP CONSTRAINT "TraditionalNutrient_recipeDetailId_fkey";

-- AlterTable
ALTER TABLE "TraditionalNutrient" DROP COLUMN "recipeDetailId";

-- CreateTable
CREATE TABLE "_RecipeIngredients" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_RecipeIngredients_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_RecipeIngredients_B_index" ON "_RecipeIngredients"("B");

-- AddForeignKey
ALTER TABLE "_RecipeIngredients" ADD CONSTRAINT "_RecipeIngredients_A_fkey" FOREIGN KEY ("A") REFERENCES "RecipeDetail"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RecipeIngredients" ADD CONSTRAINT "_RecipeIngredients_B_fkey" FOREIGN KEY ("B") REFERENCES "TraditionalNutrient"("id") ON DELETE CASCADE ON UPDATE CASCADE;
