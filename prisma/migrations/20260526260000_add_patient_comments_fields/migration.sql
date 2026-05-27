-- AlterTable
ALTER TABLE "Patient" ADD COLUMN "address" TEXT;

-- AlterTable
ALTER TABLE "PatientDetail" ADD COLUMN "referralSource" TEXT;
ALTER TABLE "PatientDetail" ADD COLUMN "preAppointmentComment" TEXT;
