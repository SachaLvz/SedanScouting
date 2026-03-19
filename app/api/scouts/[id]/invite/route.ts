import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { prisma } from '../../../../../lib/prisma';
import { sendInviteEmail } from '../../../../../lib/mailer';

/** Regénère un token d'invitation pour un utilisateur existant */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { sendEmail = true } = await req.json().catch(() => ({}));

    const inviteToken = randomBytes(32).toString('hex');
    const inviteExpiry = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48h

    const user = await prisma.user.update({
      where: { id },
      data: { inviteToken, inviteExpiry },
    });

    if (sendEmail && user.email) {
      try {
        await sendInviteEmail(user.email, user.firstName ?? user.lastName, inviteToken);
      } catch (mailErr) {
        console.error('[POST /api/scouts/:id/invite] Email send failed:', mailErr);
      }
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
    return NextResponse.json({ inviteLink: `${baseUrl}/set-password?token=${inviteToken}` });
  } catch (err) {
    console.error('[POST /api/scouts/:id/invite]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
