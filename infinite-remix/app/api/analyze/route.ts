// Stub — returns hardcoded Fascinated DNA for Phase 1/2 development.
// Phase 1: replace with real Demucs + feature extraction pipeline.

import { NextResponse } from 'next/server';
import { FASCINATED_DNA } from '@/lib/dna';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  console.log('analyze: returning hardcoded DNA for Phase 1 dev', {
    url: body?.url,
    file: body?.file,
  });
  return NextResponse.json(FASCINATED_DNA);
}
