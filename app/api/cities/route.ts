import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { VILLES } from '../../../components/admin/config';

export async function GET() {
  try {
    const cities = await prisma.city.findMany({ orderBy: { name: 'asc' } });
    if (cities.length === 0) {
      return NextResponse.json(VILLES);
    }
    return NextResponse.json(cities.map(c => c.name));
  } catch (err) {
    console.error('[GET /api/cities]', err);
    return NextResponse.json(VILLES);
  }
}

export async function POST(req: Request) {
  try {
    const { name } = await req.json();
    const cleanName = typeof name === 'string' ? name.trim() : '';
    if (!cleanName) return NextResponse.json({ error: 'Nom requis' }, { status: 400 });
    const created = await prisma.city.create({ data: { name: cleanName } });
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error('[POST /api/cities]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const id = new URL(req.url).searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID requis' }, { status: 400 });
    await prisma.city.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[DELETE /api/cities]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
