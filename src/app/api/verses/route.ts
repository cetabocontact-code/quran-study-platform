import { NextResponse } from 'next/server';

const QURAN_API = 'https://api.quran.com/api/v4';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const chapter = searchParams.get('chapter');
  const mushafPage = searchParams.get('mushaf_page');
  const words = searchParams.get('words') ?? 'true';
  const translations = searchParams.get('translations') ?? '20';
  const perPage = searchParams.get('per_page') ?? '50';
  const page = searchParams.get('page') ?? '1';

  if (!chapter && !mushafPage) {
    return NextResponse.json(
      { error: 'Query parameter "chapter" or "mushaf_page" is required' },
      { status: 400 }
    );
  }

  try {
    const params = new URLSearchParams({
      language: 'ar',
      words,
      translations,
      per_page: perPage,
      page,
      fields: 'text_uthmani',
      word_fields: 'text_uthmani,text_indopak',
    });

    // Use mushaf page endpoint when mushaf_page is specified, otherwise chapter
    const endpoint = mushafPage
      ? `${QURAN_API}/verses/by_page/${mushafPage}`
      : `${QURAN_API}/verses/by_chapter/${chapter}`;

    const res = await fetch(
      `${endpoint}?${params.toString()}`,
      { next: { revalidate: 86400 } }
    );

    if (!res.ok) {
      throw new Error(`Quran API returned ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch verses' },
      { status: 500 }
    );
  }
}

