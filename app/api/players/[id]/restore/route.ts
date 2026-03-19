import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';

export async function PUT(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.player.update({ where: { id }, data: { deletedAt: null } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[PUT /api/players/:id/restore]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
