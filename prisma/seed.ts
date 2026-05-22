async function seedPatient() {
  // Busca un usuario existente para asociar el paciente
  const user = await prisma.user.findFirst();
  if (!user) {
    console.log("❌ No hay usuarios para asociar paciente");
    return;
  }
  await prisma.patient.upsert({
    where: { email: "paciente.prueba@mail.com" },
    update: {},
    create: {
      userId: user.id,
      name: "Paciente",
      lastName: "Prueba",
      gender: "M",
      birthDate: new Date("1990-01-01"),
      email: "paciente.prueba@mail.com",
      phone: "999999999",
      height: 170,
      weight: 70,
    },
  });
  console.log("✅ Paciente de prueba cargado.");
}
/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function seedAdmin() {
  const email = process.env.SEED_ADMIN_EMAIL ?? "admin@ejemplo.com";
  const plainPassword = process.env.SEED_ADMIN_PASSWORD;

  if (!plainPassword) {
    console.warn(
      "⚠️ SEED_ADMIN_PASSWORD no definido; se omite el usuario admin del seed.",
    );
    return;
  }

  if (plainPassword.length < 3) {
    console.warn(
      "⚠️ SEED_ADMIN_PASSWORD demasiado corta; se omite el usuario admin.",
    );
    return;
  }

  if (plainPassword.length < 12) {
    console.warn(
      "⚠️ Contraseña de seed corta (<12). Solo para desarrollo local.",
    );
  }

  const password = await bcrypt.hash(plainPassword, 12);

  await prisma.user.upsert({
    where: { email },
    update: { password },
    create: {
      name: "Lesly Allca Ruiz",
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
      difficulty: "Fácil",
      isPublic: true,
      detail: {
        create: {
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

async function seedTraditionalHouseholdMeasures() {
  const medidasBase = [
    { description: "taza", quantity: 1.0, weightGrams: 150 },
    { description: "taza", quantity: 0.5, weightGrams: 75 },
    { description: "unidad", quantity: 1.0, weightGrams: 130 },
    { description: "cucharada", quantity: 1.0, weightGrams: 10 },
  ];

  // Obtener todos los alimentos
  const allFoods = await prisma.traditionalFood.findMany({
    select: { id: true, name: true },
  });

  // Obtener todas las medidas existentes en una sola consulta
  const existingMeasures = await prisma.traditionalHouseholdMeasure.findMany({
    select: {
      foodId: true,
      description: true,
      quantity: true,
    },
  });

  // Crear un set con claves únicas existentes: `${foodId}-${description}-${quantity}`
  const existingSet = new Set(
    existingMeasures.map(
      (m: { foodId: number; description: string; quantity: number }) =>
        `${m.foodId}-${m.description}-${m.quantity}`
    )
  );

  // Construir las combinaciones nuevas a insertar
  const toInsert = [];

  for (const food of allFoods) {
    for (const medida of medidasBase) {
      const key = `${food.id}-${medida.description}-${medida.quantity}`;
      if (!existingSet.has(key)) {
        toInsert.push({
          foodId: food.id,
          description: medida.description,
          quantity: medida.quantity,
          weightGrams: medida.weightGrams,
        });
      }
    }
  }

  // Inserta en batch de a 100 (recomendado para Prisma/PostgreSQL)
  const chunkSize = 100;
  for (let i = 0; i < toInsert.length; i += chunkSize) {
    const chunk = toInsert.slice(i, i + chunkSize);
    await prisma.traditionalHouseholdMeasure.createMany({
      data: chunk,
      skipDuplicates: true, // redundante pero seguro
    });
  }

  console.log(`✅ Insertadas ${toInsert.length} medidas nuevas (si faltaban).`);
}
async function seedHouseholdMeasures() {
  // Medidas base que quieres insertar
  const medidasBase = [
    { description: "taza", quantity: 1.0, weightGrams: 150 },
    { description: "taza", quantity: 0.5, weightGrams: 75 },
    { description: "unidad", quantity: 1.0, weightGrams: 130 },
    { description: "cucharada", quantity: 1.0, weightGrams: 10 },
  ];

  // Obtener todos los alimentos existentes
  const allFoods = await prisma.food.findMany({ select: { id: true } });

  // Crear array de inserciones
  const toInsert = [];

  for (const food of allFoods) {
    for (const medida of medidasBase) {
      toInsert.push({
        foodId: food.id,
        description: medida.description,
        quantity: medida.quantity,
        weightGrams: medida.weightGrams,
      });
    }
  }

  // Inserción en batch (recomendado para Prisma/PostgreSQL)
  const chunkSize = 100;
  for (let i = 0; i < toInsert.length; i += chunkSize) {
    const chunk = toInsert.slice(i, i + chunkSize);
    await prisma.householdMeasure.createMany({
      data: chunk,
      skipDuplicates: true, // evita errores si ya existe
    });
  }

  console.log(`✅ Insertadas ${toInsert.length} medidas tradicionales.`);
}
async function main() {
  await seedAdmin();
  await seedPatient();
  // await seedCategorias();
  // await seedOptionalNutrients();
  // await seedRecipeWithDetail();
  // await seedHouseholdMeasures();
  // await seedTraditionalHouseholdMeasures();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
