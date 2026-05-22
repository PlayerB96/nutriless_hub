-- AlterTable
ALTER TABLE "PatientDetail" ADD COLUMN "familyPathologicalHistory" TEXT[] DEFAULT ARRAY[]::TEXT[];
