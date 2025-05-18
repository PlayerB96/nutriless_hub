-- DropForeignKey
ALTER TABLE "Food" DROP CONSTRAINT "Food_userId_fkey";

-- CreateTable
CREATE TABLE "UserFood" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "foodId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserFood_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserFood" ADD CONSTRAINT "UserFood_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserFood" ADD CONSTRAINT "UserFood_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "Food"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
