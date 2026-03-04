import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '../../../lib/prisma';

const CreateScoutSchema = z.object({
  nom: z.string().min(1, 'Le nom est obligatoire').max(100),
  role: z.enum(['admin', 'scout']),
});

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      where: { role: 'SCOUT' },
      orderBy: { nom: 'asc' },
    });
    return NextResponse.json(users.map(u => ({ id: u.id, nom: u.nom, role: 'scout' })));
  } catch (err) {
    console.error('[GET /api/scouts]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nom, role } = CreateScoutSchema.parse(body);

    const user = await prisma.user.create({
      data: {
        nom,
        role: role === 'admin' ? 'ADMIN' : 'SCOUT',
      },
    });

    return NextResponse.json({
      id: user.id,
      nom: user.nom,
      role: user.role.toLowerCase() as 'admin' | 'scout',
      color: '#' + Math.floor(Math.random() * 16777215).toString(16),
    }, { status: 201 });

  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0].message }, { status: 400 });
    }
    console.error('[POST /api/scouts]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
