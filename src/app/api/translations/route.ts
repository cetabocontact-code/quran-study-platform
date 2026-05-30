import { NextResponse } from 'next/server';
import { getAvailableTranslations } from '@/lib/quran-api';

export async function GET() {
  try {
    const translations = await getAvailableTranslations();
    return NextResponse.json({ translations });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
