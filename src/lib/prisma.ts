// src/lib/prisma.ts (o donde prefieras ponerlo)
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export { prisma };
