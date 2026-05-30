import { NextResponse } from 'next/server';
import { getChapters } from '@/lib/quran-api';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const language = searchParams.get('language') ?? 'ar';

  try {
    const chapters = await getChapters(language);
    return NextResponse.json({ chapters });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
