-- CreateTable
CREATE TABLE "PatientImage" (
    "id" SERIAL NOT NULL,
    "patientId" INTEGER NOT NULL,
    "title" TEXT NOT NULL DEFAULT '',
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "imageData" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PatientImage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PatientImage" ADD CONSTRAINT "PatientImage_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;
