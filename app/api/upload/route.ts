import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    if (!file) return NextResponse.json({ error: 'Aucun fichier' }, { status: 400 });

    const MIME_MAP: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/heic': 'jpg',
      'image/heif': 'jpg',
      'image/webp': 'jpg',
      'application/pdf': 'pdf',
    };
    const EXT_MAP: Record<string, string> = {
      jpg: 'jpg', jpeg: 'jpg', png: 'png',
      heic: 'jpg', heif: 'jpg', webp: 'jpg', pdf: 'pdf',
    };
    const rawExt = file.name.split('.').pop()?.toLowerCase() || '';
    const ext = MIME_MAP[file.type] ?? EXT_MAP[rawExt];
    if (!ext) {
      return NextResponse.json({ error: 'Format non supporté. Utilisez une image ou un PDF.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const filename = `${randomUUID()}.${ext}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');

    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, filename), buffer);

    return NextResponse.json({ url: `/uploads/${filename}` });
  } catch (err) {
    console.error('[POST /api/upload]', err);
    return NextResponse.json({ error: 'Upload échoué' }, { status: 500 });
  }
}
