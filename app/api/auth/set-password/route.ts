import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createHash } from 'crypto';
import { prisma } from '../../../../lib/prisma';

const SetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
});

// Simple SHA-256 hash (no bcrypt dependency needed for this use case)
function hashPassword(password: string): string {
  return createHash('sha256').update(password + process.env.PASSWORD_SALT ?? 'sedan-salt').digest('hex');
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token, password } = SetPasswordSchema.parse(body);

    const user = await prisma.user.findFirst({
      where: { inviteToken: token },
    });

    if (!user) {
      return NextResponse.json({ error: 'Lien invalide ou déjà utilisé.' }, { status: 400 });
    }

    if (user.inviteExpiry && user.inviteExpiry < new Date()) {
      return NextResponse.json({ error: 'Ce lien a expiré. Demandez un nouvel accès à l\'administrateur.' }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: hashPassword(password),
        inviteToken: null,
        inviteExpiry: null,
      },
    });

    return NextResponse.json({ ok: true, lastName: user.lastName, firstName: user.firstName });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0].message }, { status: 400 });
    }
    console.error('[POST /api/auth/set-password]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');
  if (!token) return NextResponse.json({ error: 'Token manquant' }, { status: 400 });

  const user = await prisma.user.findFirst({
    where: { inviteToken: token },
    select: { firstName: true, lastName: true, inviteExpiry: true },
  });

  if (!user) return NextResponse.json({ error: 'Lien invalide ou déjà utilisé.' }, { status: 400 });
  if (user.inviteExpiry && user.inviteExpiry < new Date()) {
    return NextResponse.json({ error: 'Ce lien a expiré.' }, { status: 400 });
  }

  return NextResponse.json({ firstName: user.firstName, lastName: user.lastName });
}
