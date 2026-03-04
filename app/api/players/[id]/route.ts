import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { updatedAt, ...data } = await req.json();
    const player = await prisma.player.update({ where: { id }, data });
    return NextResponse.json(player);
  } catch (err) {
    console.error('[PUT /api/players/:id]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.player.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[DELETE /api/players/:id]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
