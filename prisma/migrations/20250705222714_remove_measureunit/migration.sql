/*
  Warnings:

  - You are about to drop the column `measureUnitId` on the `TraditionalHouseholdMeasure` table. All the data in the column will be lost.
  - You are about to drop the `MeasureUnit` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "TraditionalHouseholdMeasure" DROP CONSTRAINT "TraditionalHouseholdMeasure_measureUnitId_fkey";

-- AlterTable
ALTER TABLE "TraditionalHouseholdMeasure" DROP COLUMN "measureUnitId";

-- DropTable
DROP TABLE "MeasureUnit";
