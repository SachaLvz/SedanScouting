import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '../../../../../lib/prisma';
import { hashPassword } from '../../../../../lib/auth';

const Schema = z.object({
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  requesterId: z.string().min(1),
});

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { password, requesterId } = Schema.parse(body);

    const target = await prisma.user.findUnique({ where: { id }, select: { role: true } });
    if (!target) return NextResponse.json({ error: 'Utilisateur introuvable.' }, { status: 404 });

    const requester = await prisma.user.findUnique({ where: { id: requesterId }, select: { role: true } });
    if (!requester) return NextResponse.json({ error: 'Requêteur introuvable.' }, { status: 403 });

    // Un admin ne peut pas changer le mot de passe d'un autre admin
    if (target.role === 'ADMIN' && id !== requesterId) {
      return NextResponse.json({ error: 'Impossible de modifier le mot de passe d\'un autre administrateur.' }, { status: 403 });
    }

    await prisma.user.update({
      where: { id },
      data: { passwordHash: hashPassword(password) },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0].message }, { status: 400 });
    }
    console.error('[PUT /api/scouts/:id/password]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
