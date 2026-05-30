import { NextRequest, NextResponse } from 'next/server';
import { getChapterRecitation } from '@/lib/quran-api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const reciterId = searchParams.get('reciter');
    const chapterId = searchParams.get('chapter');

    if (!reciterId || !chapterId) {
      return NextResponse.json(
        { error: 'Missing required parameters: reciter and chapter' },
        { status: 400 }
      );
    }

    const data = await getChapterRecitation(Number(reciterId), Number(chapterId));
    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
