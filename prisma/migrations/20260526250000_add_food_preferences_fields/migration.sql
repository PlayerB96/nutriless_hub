-- AlterTable
ALTER TABLE "PatientDetail" ADD COLUMN "preferredFoods" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "PatientDetail" ADD COLUMN "dislikedFoods" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "PatientDetail" ADD COLUMN "foodAllergies" TEXT[] DEFAULT ARRAY[]::TEXT[];
