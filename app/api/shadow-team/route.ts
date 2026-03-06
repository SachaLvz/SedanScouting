import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET(req: Request) {
  try {
    const id = new URL(req.url).searchParams.get('id') ?? 'main';
    const record = await prisma.shadowTeam.findUnique({ where: { id } });
    if (!record) return NextResponse.json({ formation: '4-3-3', slots: {} });
    return NextResponse.json({ formation: record.formation, slots: record.slots });
  } catch (err) {
    console.error('[GET /api/shadow-team]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const id = new URL(req.url).searchParams.get('id') ?? 'main';
    const { formation, slots } = await req.json();
    await prisma.shadowTeam.upsert({
      where: { id },
      update: { formation, slots },
      create: { id, formation, slots },
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[PUT /api/shadow-team]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
