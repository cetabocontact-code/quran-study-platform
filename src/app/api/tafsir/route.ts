import { NextResponse } from 'next/server';
import { getTafsirByAyah } from '@/lib/quran-api';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tafsirId = searchParams.get('id');
  const verseKey = searchParams.get('verse');

  if (!tafsirId || !verseKey) {
    return NextResponse.json(
      { error: 'Both "id" (tafsir resource id) and "verse" (e.g. 1:1) are required' },
      { status: 400 },
    );
  }

  try {
    const data = await getTafsirByAyah(Number(tafsirId), verseKey);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
