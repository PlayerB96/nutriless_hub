/*
  Warnings:

  - You are about to drop the column `nutrient` on the `TraditionalFood` table. All the data in the column will be lost.
  - You are about to drop the column `unit` on the `TraditionalFood` table. All the data in the column will be lost.
  - You are about to drop the column `value` on the `TraditionalFood` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "TraditionalFood" DROP COLUMN "nutrient",
DROP COLUMN "unit",
DROP COLUMN "value";

-- CreateTable
CREATE TABLE "TraditionalNutrient" (
    "id" SERIAL NOT NULL,
    "foodId" INTEGER NOT NULL,
    "nutrient" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,

    CONSTRAINT "TraditionalNutrient_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TraditionalNutrient" ADD CONSTRAINT "TraditionalNutrient_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "TraditionalFood"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
