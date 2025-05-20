/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `CategoryFood` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "CategoryFood_name_key" ON "CategoryFood"("name");
