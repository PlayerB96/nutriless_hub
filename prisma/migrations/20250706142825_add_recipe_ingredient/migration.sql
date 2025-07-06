/*
  Warnings:

  - You are about to drop the `_RecipeDetailToTraditionalFood` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_RecipeDetailToTraditionalFood" DROP CONSTRAINT "_RecipeDetailToTraditionalFood_A_fkey";

-- DropForeignKey
ALTER TABLE "_RecipeDetailToTraditionalFood" DROP CONSTRAINT "_RecipeDetailToTraditionalFood_B_fkey";

-- AlterTable
ALTER TABLE "RecipeDetail" ADD COLUMN     "traditionalFoodId" INTEGER;

-- DropTable
DROP TABLE "_RecipeDetailToTraditionalFood";

-- CreateTable
CREATE TABLE "RecipeIngredient" (
    "id" SERIAL NOT NULL,
    "recipeDetailId" INTEGER NOT NULL,
    "foodId" INTEGER NOT NULL,
    "medidaId" INTEGER NOT NULL,
    "cantidad" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "RecipeIngredient_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RecipeIngredient_recipeDetailId_foodId_key" ON "RecipeIngredient"("recipeDetailId", "foodId");

-- AddForeignKey
ALTER TABLE "RecipeDetail" ADD CONSTRAINT "RecipeDetail_traditionalFoodId_fkey" FOREIGN KEY ("traditionalFoodId") REFERENCES "TraditionalFood"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipeIngredient" ADD CONSTRAINT "RecipeIngredient_recipeDetailId_fkey" FOREIGN KEY ("recipeDetailId") REFERENCES "RecipeDetail"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipeIngredient" ADD CONSTRAINT "RecipeIngredient_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "TraditionalFood"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipeIngredient" ADD CONSTRAINT "RecipeIngredient_medidaId_fkey" FOREIGN KEY ("medidaId") REFERENCES "TraditionalHouseholdMeasure"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
