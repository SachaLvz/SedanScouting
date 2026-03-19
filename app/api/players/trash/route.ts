import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

const TRASH_DAYS = 30;

export async function GET() {
  try {
    // Auto-purge des joueurs supprimés depuis plus de 30 jours
    const cutoff = new Date(Date.now() - TRASH_DAYS * 24 * 60 * 60 * 1000);
    await prisma.player.deleteMany({ where: { deletedAt: { lte: cutoff } } });

    const players = await prisma.player.findMany({
      where: { deletedAt: { not: null } },
      orderBy: { deletedAt: 'desc' },
    });
    return NextResponse.json(players);
  } catch (err) {
    console.error('[GET /api/players/trash]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

/** Vide définitivement toute la corbeille */
export async function DELETE() {
  try {
    await prisma.player.deleteMany({ where: { deletedAt: { not: null } } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[DELETE /api/players/trash]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
