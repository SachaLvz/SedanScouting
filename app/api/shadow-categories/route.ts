import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET(req: Request) {
  try {
    const ownerId = new URL(req.url).searchParams.get('ownerId') ?? 'main';
    const cats = await prisma.shadowCategory.findMany({
      where: { ownerId },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(cats);
  } catch (err) {
    console.error('[GET /api/shadow-categories]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { ownerId, name } = await req.json();
    const cat = await prisma.shadowCategory.create({
      data: { ownerId: ownerId ?? 'main', name: name ?? 'Nouvelle catégorie' },
    });
    return NextResponse.json(cat);
  } catch (err) {
    console.error('[POST /api/shadow-categories]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const id = new URL(req.url).searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID requis' }, { status: 400 });
    const { name } = await req.json();
    const cat = await prisma.shadowCategory.update({ where: { id }, data: { name } });
    return NextResponse.json(cat);
  } catch (err) {
    console.error('[PUT /api/shadow-categories]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const id = new URL(req.url).searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID requis' }, { status: 400 });
    // onDelete: SetNull → les shadow teams de cette catégorie passent à categoryId = null
    await prisma.shadowCategory.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[DELETE /api/shadow-categories]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
