import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    if (!file) return NextResponse.json({ error: 'Aucun fichier' }, { status: 400 });

    const rawExt = file.name.split('.').pop()?.toLowerCase() || '';
    const EXT_MAP: Record<string, string> = {
      jpg: 'jpg', jpeg: 'jpg', png: 'png',
      heic: 'jpg', heif: 'jpg', webp: 'jpg', pdf: 'pdf',
    };
    let ext: string;
    if (file.type === 'application/pdf' || rawExt === 'pdf') {
      ext = 'pdf';
    } else if (file.type.startsWith('image/')) {
      ext = file.type === 'image/png' ? 'png' : 'jpg';
    } else if (EXT_MAP[rawExt]) {
      ext = EXT_MAP[rawExt];
    } else {
      return NextResponse.json({ error: 'Format non supporté.' }, { status: 400 });
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
