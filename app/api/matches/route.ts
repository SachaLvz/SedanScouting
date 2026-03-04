import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET() {
  try {
    const matches = await prisma.match.findMany({ orderBy: { date: 'asc' } });
    return NextResponse.json(matches);
  } catch (err) {
    console.error('[GET /api/matches]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.equipe1) return NextResponse.json({ error: "L'équipe 1 est obligatoire" }, { status: 400 });
    const match = await prisma.match.create({ data: body });
    return NextResponse.json(match, { status: 201 });
  } catch (err) {
    console.error('[POST /api/matches]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
