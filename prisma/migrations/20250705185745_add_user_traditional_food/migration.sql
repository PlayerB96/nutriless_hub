-- CreateTable
CREATE TABLE "UserTraditionalFood" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "foodId" INTEGER NOT NULL,
    "cantidad" DOUBLE PRECISION,
    "tipoMedida" INTEGER,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserTraditionalFood_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserTraditionalFood" ADD CONSTRAINT "UserTraditionalFood_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTraditionalFood" ADD CONSTRAINT "UserTraditionalFood_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "TraditionalFood"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
