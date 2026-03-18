import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 25),
  secure: false,
  ignoreTLS: true,
  tls: {
    rejectUnauthorized: false,
  },
  auth: process.env.SMTP_USER
    ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    : undefined,
});

export async function sendInviteEmail(to: string, firstName: string, token: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const link = `${baseUrl}/set-password?token=${token}`;

  await transporter.sendMail({
    from: process.env.SMTP_FROM ?? process.env.SMTP_USER,
    to,
    subject: 'Invitation — Créez votre mot de passe Mbarodi FC',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#f8fafc;border-radius:12px">
        <h2 style="color:#1e3a5f;margin-bottom:8px">Bonjour ${firstName},</h2>
        <p style="color:#475569;font-size:15px;line-height:1.6">
          Vous avez été invité(e) à rejoindre la plateforme <strong>Mbarodi FC</strong>.
        </p>
        <p style="color:#475569;font-size:15px;line-height:1.6">
          Cliquez sur le bouton ci-dessous pour créer votre mot de passe. Ce lien est valable <strong>48h</strong>.
        </p>
        <a href="${link}" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#2563eb;color:#fff;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px">
          Créer mon mot de passe
        </a>
        <p style="margin-top:24px;font-size:12px;color:#94a3b8">
          Si vous n'êtes pas à l'origine de cette invitation, ignorez cet email.
        </p>
      </div>
    `,
  });
}
