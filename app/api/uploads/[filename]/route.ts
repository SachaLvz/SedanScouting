import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

export async function GET(_: Request, { params }: { params: Promise<{ filename: string }> }) {
  try {
    const { filename } = await params;
    // Sécurité : empêcher la traversée de répertoire
    const safe = path.basename(filename);
    const filePath = path.join(process.cwd(), 'public', 'uploads', safe);
    const buffer = await readFile(filePath);

    const ext = safe.split('.').pop()?.toLowerCase() || '';
    const contentType =
      ext === 'png' ? 'image/png' :
      ext === 'pdf' ? 'application/pdf' :
      'image/jpeg';

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Fichier introuvable' }, { status: 404 });
  }
}
