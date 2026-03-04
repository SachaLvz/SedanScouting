import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { updatedAt, ...data } = await req.json();
    const match = await prisma.match.update({ where: { id }, data });
    return NextResponse.json(match);
  } catch (err) {
    console.error('[PUT /api/matches/:id]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.match.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[DELETE /api/matches/:id]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
  