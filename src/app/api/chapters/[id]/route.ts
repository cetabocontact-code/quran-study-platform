import { NextResponse } from 'next/server';
import { getChapter } from '@/lib/quran-api';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const chapterId = Number(id);

  if (!chapterId || chapterId < 1 || chapterId > 114) {
    return NextResponse.json(
      { error: 'Invalid chapter id — must be 1-114' },
      { status: 400 },
    );
  }

  try {
    const chapter = await getChapter(chapterId);
    return NextResponse.json({ chapter });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
