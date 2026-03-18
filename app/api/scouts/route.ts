import { NextResponse } from 'next/server';
import { z } from 'zod';
import { randomBytes } from 'crypto';
import { prisma } from '../../../lib/prisma';
import { sendInviteEmail } from '../../../lib/mailer';

const CreateScoutSchema = z.object({
  firstName: z.string().min(1, 'Le prénom est obligatoire').max(100),
  lastName: z.string().min(1, 'Le nom est obligatoire').max(100),
  email: z.string().email('Email invalide'),
  role: z.enum(['admin', 'scout']),
});

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { lastName: 'asc' },
    });
    return NextResponse.json(users.map(u => ({ id: u.id, firstName: u.firstName, lastName: u.lastName, email: u.email, role: u.role.toLowerCase() })));
  } catch (err) {
    console.error('[GET /api/scouts]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { firstName, lastName, email, role } = CreateScoutSchema.parse(body);

    const inviteToken = randomBytes(32).toString('hex');
    const inviteExpiry = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48h

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        role: role === 'admin' ? 'ADMIN' : 'SCOUT',
        inviteToken,
        inviteExpiry,
      },
    });

    try {
      await sendInviteEmail(email, firstName, inviteToken);
    } catch (mailErr) {
      console.error('[POST /api/scouts] Email send failed:', mailErr);
    }

    return NextResponse.json({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role.toLowerCase() as 'admin' | 'scout',
      color: '#' + Math.floor(Math.random() * 16777215).toString(16),
    }, { status: 201 });

  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0].message }, { status: 400 });
    }
    console.error('[POST /api/scouts]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
