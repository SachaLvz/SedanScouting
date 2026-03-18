import { createHash } from 'crypto';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../app/generated/prisma/client';

function hashPassword(password: string): string {
  return createHash('sha256').update(password + (process.env.PASSWORD_SALT ?? 'sedan-salt')).digest('hex');
}

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  const user = await prisma.user.upsert({
    where: { email: 'levenez.sacha@gmail.com' },
    update: {
      passwordHash: hashPassword('testtest'),
      role: 'ADMIN',
      actif: true,
    },
    create: {
      lastName: 'Levenez',
      firstName: 'Sacha',
      email: 'levenez.sacha@gmail.com',
      passwordHash: hashPassword('testtest'),
      role: 'ADMIN',
      actif: true,
    },
  });

  console.log('Admin créé :', user.email, '| role:', user.role);
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
