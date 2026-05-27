-- Delete existing rows that used base64 (dev data only)
DELETE FROM "PatientImage";

-- Drop old column and add new one
ALTER TABLE "PatientImage" DROP COLUMN "imageData";
ALTER TABLE "PatientImage" ADD COLUMN "imageKey" TEXT NOT NULL;
