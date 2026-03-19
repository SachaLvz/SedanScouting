import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET() {
  try {
    const players = await prisma.player.findMany({ where: { deletedAt: null }, orderBy: { createdAt: 'asc' } });
    return NextResponse.json(players);
  } catch (err) {
    console.error('[GET /api/players]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.lastName) return NextResponse.json({ error: 'Le nom est obligatoire' }, { status: 400 });
    const player = await prisma.player.create({ data: body });
    return NextResponse.json(player, { status: 201 });
  } catch (err) {
    console.error('[POST /api/players]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
