import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '../../../../lib/prisma';
import { hashPassword } from '../../../../lib/auth';

const LoginSchema = z.union([
  z.object({ email: z.string().min(1), password: z.string().min(1) }),
  z.object({ userId: z.string().min(1), password: z.string().min(1) }),
]);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = LoginSchema.parse(body);

    let user;

    if ('email' in data) {
      // Admin login: find by email with ADMIN role
      user = await prisma.user.findFirst({
        where: { email: data.email, role: 'ADMIN', actif: true },
        select: { id: true, firstName: true, lastName: true, role: true, passwordHash: true },
      });
    } else {
      // Scout login: find by ID
      user = await prisma.user.findUnique({
        where: { id: data.userId },
        select: { id: true, firstName: true, lastName: true, role: true, passwordHash: true, actif: true },
      });
      if (user && !user.actif) user = null;
    }

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur introuvable.' }, { status: 401 });
    }

    if (!user.passwordHash) {
      return NextResponse.json({ error: 'Aucun mot de passe défini. Utilisez le lien d\'invitation reçu par email.' }, { status: 401 });
    }

    if (user.passwordHash !== hashPassword(data.password)) {
      return NextResponse.json({ error: 'Mot de passe incorrect.' }, { status: 401 });
    }

    return NextResponse.json({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role.toLowerCase() as 'admin' | 'scout',
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0].message }, { status: 400 });
    }
    console.error('[POST /api/auth/login]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
