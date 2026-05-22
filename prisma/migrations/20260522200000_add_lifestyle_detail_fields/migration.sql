-- AlterTable
ALTER TABLE "PatientDetail" ADD COLUMN "alcoholTypes" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "PatientDetail" ADD COLUMN "supplementTypes" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable (frecuencias como texto legible)
ALTER TABLE "PatientDetail" ALTER COLUMN "alcoholFrequency" TYPE TEXT USING (
  CASE
    WHEN "alcoholFrequency" IS NULL THEN NULL
    ELSE "alcoholFrequency"::TEXT
  END
);

ALTER TABLE "PatientDetail" ALTER COLUMN "tobaccoFrequency" TYPE TEXT USING (
  CASE
    WHEN "tobaccoFrequency" IS NULL THEN NULL
    ELSE "tobaccoFrequency"::TEXT
  END
);
