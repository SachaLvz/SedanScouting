import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET() {
  try {
    const record = await prisma.shadowTeam.findUnique({ where: { id: 'main' } });
    if (!record) return NextResponse.json({ formation: '4-3-3', slots: {} });
    return NextResponse.json({ formation: record.formation, slots: record.slots });
  } catch (err) {
    console.error('[GET /api/shadow-team]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { formation, slots } = await req.json();
    await prisma.shadowTeam.upsert({
      where: { id: 'main' },
      update: { formation, slots },
      create: { id: 'main', formation, slots },
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[PUT /api/shadow-team]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
