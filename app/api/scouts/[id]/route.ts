import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '../../../../lib/prisma';

const UpdateScoutSchema = z.object({
  lastName: z.string().min(1).max(100),
  role: z.enum(['admin', 'scout']),
});

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { lastName, role } = UpdateScoutSchema.parse(body);

    const user = await prisma.user.update({
      where: { id },
      data: { lastName, role: role === 'admin' ? 'ADMIN' : 'SCOUT' },
    });

    return NextResponse.json({ id: user.id, firstName: user.firstName, lastName: user.lastName, role: user.role.toLowerCase() });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0].message }, { status: 400 });
    }
    console.error('[PUT /api/scouts/[id]]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[DELETE /api/scouts/[id]]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
