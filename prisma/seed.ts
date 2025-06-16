/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function seedAdmin() {
  const email = "player.b.1996@gmail.com";
  const password = await bcrypt.hash("123", 10);

  await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      name: "Bryan Rafael Andia",
      email,
      password,
    },
  });

  console.log("✅ Usuario admin cargado.");
}

async function seedCategorias() {
  const categorias = [
    "Alimentos Infantiles",
    "Alimentos preparados",
    "Aperitivos",
    "Bebidas",
    "Carnes y derivados",
    "Cereales de desayuno",
    "Comida de restaurante",
    "Comida para bebés",
    "Comida rápida",
    "Comidas, entradas y acompañamiento",
    "Cordero,ternero y productos de caza",
    "Dulces",
    "Embutidos y fiambres",
    "Especies y hierbas",
    "Frutas y derivados",
    "Frutas y jugos",
    "Granos de cereales y pastas",
    "Grasas y aceites",
    "Huevos y derivados",
    "Legumbres",
    "Leguminosas y derivados",
    "Lácteos y huevos",
    "Misceláneos",
    "Nueces y semillas",
    "Pescados y mariscos",
    "Productos avícolas",
    "Productos azucarados",
    "Productos de cerdo",
    "Productos horneados",
    "Sopas y salsas",
    "Suplementos",
    "Tubérculos, raíces y derivados",
    "Vegetales",
    "Verduras, hortalizas y derivados",
    "Alimentos en Conserva",
    "Bebidas vegetales",
  ];

  for (const name of categorias) {
    await prisma.categoryFood.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  console.log("✅ Categorías cargadas.");
}

async function seedOptionalNutrients() {
  const nutrients = [
    "gramos",
    "calorias",
    "proteinas",
    "carbohidratos",
    "grasas",
    "Calcium",
    "Vitamin A",
    "Iron",
    "Magnesium",
    "Grasas Totales(gr)",
    "Grasas Saturadas(gr)",
    "Grasas Trans(gr)",
    "Colesterol(gr)",
    "Colesterol(mg)",
    "Azúcares(gr)",
    "Sodio(mg)",
  ];

  for (const name of nutrients) {
    await prisma.optionalNutrient.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  console.log("✅ Nutrientes opcionales cargados.");
}

async function seedRecipeWithDetail() {
  const recipe = await prisma.recipe.create({
    data: {
      name: "Arroz Blanco Clásico",
      tags: ["Desayuno"],
      userId: 1, // ID del usuario autenticado
      portions: 4,
      prepTime: 10,
      cookTime: 15,
      difficulty: "facil",
      isPublic: true,
      detail: {
        create: {
          ingredients: ["1 taza de arroz", "2 tazas de agua", "Sal al gusto"],
          instructions: [
            "Lava el arroz bajo agua fría.",
            "Hierve las 2 tazas de agua.",
            "Agrega el arroz y la sal.",
            "Reduce el fuego y cocina por 15 minutos.",
            "Apaga y deja reposar 5 minutos antes de servir.",
          ],
        },
      },
    },
    include: {
      detail: true,
    },
  });

  console.log("✅ Receta creada con ID:", recipe.id);
  console.log("📝 Detalle de receta:", recipe.detail);
}

async function main() {
  // await seedAdmin();
  // await seedCategorias();
  // await seedOptionalNutrients();
  await seedRecipeWithDetail();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
