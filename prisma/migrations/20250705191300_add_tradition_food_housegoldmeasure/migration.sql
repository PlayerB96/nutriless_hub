/*
  Warnings:

  - A unique constraint covering the columns `[foodId,description,quantity]` on the table `TraditionalHouseholdMeasure` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "TraditionalHouseholdMeasure_foodId_description_quantity_key" ON "TraditionalHouseholdMeasure"("foodId", "description", "quantity");
