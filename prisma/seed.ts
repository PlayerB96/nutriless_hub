// prisma/seed.ts (o seed.js)
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // Crear usuario admin si no existe
  const adminEmail = "admin@example.com";
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: "Admin",
      email: adminEmail,
      password: "hashed_password_aqui", // recuerda hashear la contraseña
    },
  });
  console.log("Seed data cargada!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
