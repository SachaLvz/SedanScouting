import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../app/generated/prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createPrismaClient() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  return new PrismaClient({ adapter });
}

// Clear cached client if it's missing models (e.g. after schema changes in dev)
if (globalForPrisma.prisma && (!('player' in globalForPrisma.prisma) || !('match' in globalForPrisma.prisma) || !('shadowTeam' in globalForPrisma.prisma) || !('city' in globalForPrisma.prisma))) {
  (globalForPrisma as unknown as Record<string, unknown>).prisma = undefined;
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
