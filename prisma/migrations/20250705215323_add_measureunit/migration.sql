-- AlterTable
ALTER TABLE "TraditionalHouseholdMeasure" ADD COLUMN     "measureUnitId" INTEGER;

-- CreateTable
CREATE TABLE "MeasureUnit" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "abbreviation" TEXT NOT NULL,
    "weightGrams" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "MeasureUnit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MeasureUnit_name_key" ON "MeasureUnit"("name");

-- AddForeignKey
ALTER TABLE "TraditionalHouseholdMeasure" ADD CONSTRAINT "TraditionalHouseholdMeasure_measureUnitId_fkey" FOREIGN KEY ("measureUnitId") REFERENCES "MeasureUnit"("id") ON DELETE SET NULL ON UPDATE CASCADE;
