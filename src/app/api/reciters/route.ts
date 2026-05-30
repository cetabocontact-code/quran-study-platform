import { NextResponse } from 'next/server';
import { getReciters } from '@/lib/quran-api';

export async function GET() {
  try {
    const reciters = await getReciters();
    return NextResponse.json({ reciters });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
