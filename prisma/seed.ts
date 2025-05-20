import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = "player.b.1996@gmail.com";

  const hashedPassword = await bcrypt.hash("123", 10); // contrasena real

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: "Bryan Rafael Andia",
      email: adminEmail,
      password: hashedPassword, // ahora sí está hasheada
    },
  });

  console.log("Seed data usuario cargada!");

  // Lista de categorías que quieres asegurar existan
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
  ];

  for (const nombre of categorias) {
    await prisma.categoryFood.upsert({
      where: { name: nombre },
      update: {}, // no hace nada si ya existe
      create: { name: nombre },
    });
  }

  console.log("Seed data categorias cargada!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
