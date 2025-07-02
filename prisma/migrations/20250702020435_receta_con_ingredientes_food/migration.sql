/*
  Warnings:

  - You are about to drop the `_RecipeIngredients` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_RecipeIngredients" DROP CONSTRAINT "_RecipeIngredients_A_fkey";

-- DropForeignKey
ALTER TABLE "_RecipeIngredients" DROP CONSTRAINT "_RecipeIngredients_B_fkey";

-- DropTable
DROP TABLE "_RecipeIngredients";

-- CreateTable
CREATE TABLE "_RecipeDetailToTraditionalFood" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_RecipeDetailToTraditionalFood_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_RecipeDetailToTraditionalFood_B_index" ON "_RecipeDetailToTraditionalFood"("B");

-- AddForeignKey
ALTER TABLE "_RecipeDetailToTraditionalFood" ADD CONSTRAINT "_RecipeDetailToTraditionalFood_A_fkey" FOREIGN KEY ("A") REFERENCES "RecipeDetail"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RecipeDetailToTraditionalFood" ADD CONSTRAINT "_RecipeDetailToTraditionalFood_B_fkey" FOREIGN KEY ("B") REFERENCES "TraditionalFood"("id") ON DELETE CASCADE ON UPDATE CASCADE;
