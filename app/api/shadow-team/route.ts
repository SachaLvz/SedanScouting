import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    const ownerId = url.searchParams.get('ownerId');

    if (id) {
      const record = await prisma.shadowTeam.findUnique({ where: { id } });
      if (!record) return NextResponse.json({ formation: '4-3-3', slots: {} });
      return NextResponse.json(record);
    }

    const records = await prisma.shadowTeam.findMany({
      where: { ownerId: ownerId ?? 'main' },
      orderBy: { updatedAt: 'asc' },
    });
    return NextResponse.json(records);
  } catch (err) {
    console.error('[GET /api/shadow-team]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { ownerId, name, formation, categoryId } = await req.json();
    const record = await prisma.shadowTeam.create({
      data: {
        ownerId: ownerId ?? 'main',
        name: name ?? 'Shadow Team',
        formation: formation ?? '4-3-3',
        slots: {},
        ...(categoryId !== undefined ? { categoryId } : {}),
      },
    });
    return NextResponse.json(record);
  } catch (err) {
    console.error('[POST /api/shadow-team]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const id = new URL(req.url).searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID requis' }, { status: 400 });
    const body = await req.json();
    const updateData: Record<string, unknown> = {};
    if (body.formation !== undefined) updateData.formation = body.formation;
    if (body.slots !== undefined) updateData.slots = body.slots;
    if (body.name !== undefined) updateData.name = body.name;
    if (body.categoryId !== undefined) updateData.categoryId = body.categoryId;
    await prisma.shadowTeam.upsert({
      where: { id },
      update: updateData,
      create: { id, formation: '4-3-3', slots: {}, ...updateData },
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[PUT /api/shadow-team]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const id = new URL(req.url).searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID requis' }, { status: 400 });
    await prisma.shadowTeam.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[DELETE /api/shadow-team]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
