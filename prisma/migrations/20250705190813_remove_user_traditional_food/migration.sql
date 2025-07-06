/*
  Warnings:

  - You are about to drop the `UserTraditionalFood` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserTraditionalFood" DROP CONSTRAINT "UserTraditionalFood_foodId_fkey";

-- DropForeignKey
ALTER TABLE "UserTraditionalFood" DROP CONSTRAINT "UserTraditionalFood_userId_fkey";

-- DropTable
DROP TABLE "UserTraditionalFood";

-- CreateTable
CREATE TABLE "TraditionalHouseholdMeasure" (
    "id" SERIAL NOT NULL,
    "foodId" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "weightGrams" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "TraditionalHouseholdMeasure_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TraditionalHouseholdMeasure" ADD CONSTRAINT "TraditionalHouseholdMeasure_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "TraditionalFood"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
