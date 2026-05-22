-- AlterTable
ALTER TABLE "PatientDetail" ADD COLUMN "dietaryConditions" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "PatientDetail" ADD COLUMN "hadPreviousDiet" BOOLEAN DEFAULT false;
