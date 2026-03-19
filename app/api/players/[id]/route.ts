import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const player = await prisma.player.findUnique({ where: { id } });
    if (!player) return NextResponse.json({ error: 'Introuvable' }, { status: 404 });
    return NextResponse.json(player);
  } catch (err) {
    console.error('[GET /api/players/:id]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

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

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const permanent = new URL(req.url).searchParams.get('permanent') === 'true';
    if (permanent) {
      await prisma.player.delete({ where: { id } });
    } else {
      await prisma.player.update({ where: { id }, data: { deletedAt: new Date() } });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[DELETE /api/players/:id]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
