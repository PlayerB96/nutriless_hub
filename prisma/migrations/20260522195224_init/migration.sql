-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" SERIAL NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Food" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,
    "imageUrl" TEXT,

    CONSTRAINT "Food_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserFood" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "foodId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserFood_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NutritionDetail" (
    "id" SERIAL NOT NULL,
    "foodId" INTEGER NOT NULL,
    "nutrient" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,

    CONSTRAINT "NutritionDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HouseholdMeasure" (
    "id" SERIAL NOT NULL,
    "foodId" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "weightGrams" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "HouseholdMeasure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CategoryFood" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "CategoryFood_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OptionalNutrient" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OptionalNutrient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recipe" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "tags" TEXT[],
    "portions" INTEGER NOT NULL,
    "prepTime" INTEGER NOT NULL,
    "cookTime" INTEGER,
    "difficulty" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "image" TEXT,
    "userId" INTEGER,

    CONSTRAINT "Recipe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecipeDetail" (
    "id" SERIAL NOT NULL,
    "recipeId" INTEGER NOT NULL,
    "instructions" TEXT[],
    "traditionalFoodId" INTEGER,

    CONSTRAINT "RecipeDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TraditionalFood" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "origin" TEXT,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TraditionalFood_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TraditionalNutrient" (
    "id" SERIAL NOT NULL,
    "foodId" INTEGER NOT NULL,
    "nutrient" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TraditionalNutrient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TraditionalHouseholdMeasure" (
    "id" SERIAL NOT NULL,
    "foodId" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "weightGrams" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "TraditionalHouseholdMeasure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecipeIngredient" (
    "id" SERIAL NOT NULL,
    "recipeDetailId" INTEGER NOT NULL,
    "foodId" INTEGER NOT NULL,
    "medidaId" INTEGER NOT NULL,
    "cantidad" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "RecipeIngredient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Patient" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3) NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "height" DOUBLE PRECISION,
    "weight" DOUBLE PRECISION,
    "maritalStatus" TEXT,
    "occupation" TEXT,
    "photo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Patient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatientDetail" (
    "id" SERIAL NOT NULL,
    "patientId" INTEGER NOT NULL,
    "goal" TEXT,
    "goalComment" TEXT,
    "motivation" INTEGER,
    "activityLevel" TEXT,
    "alcoholFrequency" INTEGER,
    "alcoholUse" BOOLEAN DEFAULT false,
    "coffeeFrequency" INTEGER,
    "coffeeUse" BOOLEAN DEFAULT false,
    "sleepHours" DOUBLE PRECISION,
    "sleepQuality" INTEGER,
    "stressLevel" TEXT,
    "stressReason" TEXT,
    "supplementsFrequency" INTEGER,
    "supplementsUse" BOOLEAN DEFAULT false,
    "tobaccoFrequency" INTEGER,
    "tobaccoUse" BOOLEAN DEFAULT false,
    "dietType" TEXT,
    "glutenIntolerant" BOOLEAN DEFAULT false,
    "lactoseIntolerant" BOOLEAN DEFAULT false,
    "mealsPerDay" INTEGER,
    "waterLitersPerDay" DOUBLE PRECISION,
    "currentConditions" TEXT[],
    "healthComments" TEXT,
    "intestinalCondition" TEXT,
    "medications" TEXT[],
    "pathologicalHistory" TEXT[],

    CONSTRAINT "PatientDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FoodFrequency" (
    "id" SERIAL NOT NULL,
    "patientDetailId" INTEGER NOT NULL,
    "foodGroup" TEXT NOT NULL,
    "timesPerWeek" INTEGER,

    CONSTRAINT "FoodFrequency_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "NutritionDetail_foodId_nutrient_key" ON "NutritionDetail"("foodId", "nutrient");

-- CreateIndex
CREATE UNIQUE INDEX "CategoryFood_name_key" ON "CategoryFood"("name");

-- CreateIndex
CREATE UNIQUE INDEX "OptionalNutrient_name_key" ON "OptionalNutrient"("name");

-- CreateIndex
CREATE UNIQUE INDEX "RecipeDetail_recipeId_key" ON "RecipeDetail"("recipeId");

-- CreateIndex
CREATE UNIQUE INDEX "TraditionalHouseholdMeasure_foodId_description_quantity_key" ON "TraditionalHouseholdMeasure"("foodId", "description", "quantity");

-- CreateIndex
CREATE UNIQUE INDEX "RecipeIngredient_recipeDetailId_foodId_key" ON "RecipeIngredient"("recipeDetailId", "foodId");

-- CreateIndex
CREATE UNIQUE INDEX "Patient_email_key" ON "Patient"("email");

-- CreateIndex
CREATE UNIQUE INDEX "PatientDetail_patientId_key" ON "PatientDetail"("patientId");

-- CreateIndex
CREATE UNIQUE INDEX "FoodFrequency_patientDetailId_foodGroup_key" ON "FoodFrequency"("patientDetailId", "foodGroup");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserFood" ADD CONSTRAINT "UserFood_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserFood" ADD CONSTRAINT "UserFood_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "Food"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NutritionDetail" ADD CONSTRAINT "NutritionDetail_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "Food"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HouseholdMeasure" ADD CONSTRAINT "HouseholdMeasure_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "Food"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recipe" ADD CONSTRAINT "Recipe_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipeDetail" ADD CONSTRAINT "RecipeDetail_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipeDetail" ADD CONSTRAINT "RecipeDetail_traditionalFoodId_fkey" FOREIGN KEY ("traditionalFoodId") REFERENCES "TraditionalFood"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TraditionalNutrient" ADD CONSTRAINT "TraditionalNutrient_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "TraditionalFood"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TraditionalHouseholdMeasure" ADD CONSTRAINT "TraditionalHouseholdMeasure_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "TraditionalFood"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipeIngredient" ADD CONSTRAINT "RecipeIngredient_recipeDetailId_fkey" FOREIGN KEY ("recipeDetailId") REFERENCES "RecipeDetail"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipeIngredient" ADD CONSTRAINT "RecipeIngredient_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "TraditionalFood"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipeIngredient" ADD CONSTRAINT "RecipeIngredient_medidaId_fkey" FOREIGN KEY ("medidaId") REFERENCES "TraditionalHouseholdMeasure"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Patient" ADD CONSTRAINT "Patient_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientDetail" ADD CONSTRAINT "PatientDetail_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FoodFrequency" ADD CONSTRAINT "FoodFrequency_patientDetailId_fkey" FOREIGN KEY ("patientDetailId") REFERENCES "PatientDetail"("id") ON DELETE CASCADE ON UPDATE CASCADE;
