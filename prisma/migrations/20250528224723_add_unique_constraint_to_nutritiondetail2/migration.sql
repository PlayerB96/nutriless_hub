/*
  Warnings:

  - A unique constraint covering the columns `[foodId,nutrient]` on the table `NutritionDetail` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "NutritionDetail_foodId_nutrient_key" ON "NutritionDetail"("foodId", "nutrient");
