import { NextResponse } from 'next/server';
import { getAvailableTafsirs } from '@/lib/quran-api';

export async function GET() {
  try {
    const tafsirs = await getAvailableTafsirs();
    return NextResponse.json({ tafsirs });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
