import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

try {
  await prisma.$connect();
  const user = await prisma.user.findFirst({
    select: { id: true, email: true },
  });
  console.log("✅ Conexión OK.", user ? `Usuario: ${user.email}` : "Sin usuarios.");
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error("❌ No se pudo conectar:", message.split("\n")[0]);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
