import { NextResponse } from 'next/server';
import { generateDriftVocal } from '@/lib/sunoClient';
import type { SongDNA } from '@/types';

interface RequestBody {
  dna: SongDNA;
  cycle: number;
  prevLyrics: string;
}

export async function POST(request: Request) {
  const apiKey = process.env.SUNO_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'SUNO_API_KEY is not configured' },
      { status: 500 }
    );
  }

  let body: RequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { dna, cycle, prevLyrics } = body;
  if (!dna || cycle === undefined) {
    return NextResponse.json(
      { error: 'Missing required fields: dna, cycle' },
      { status: 400 }
    );
  }

  try {
    const { audioUrl, lyrics } = await generateDriftVocal(dna, cycle, prevLyrics ?? '', apiKey);
    return NextResponse.json({ audioUrl, lyrics });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('generate-vocals: error', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
