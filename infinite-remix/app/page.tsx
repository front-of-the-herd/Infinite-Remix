'use client';

import { useState } from 'react';
import SeedInput from '@/components/SeedInput';
import Player from '@/components/Player';
import AnimatedTitle from '@/components/AnimatedTitle';
import type { SongDNA } from '@/types';

export default function Home() {
  const [dna, setDna] = useState<SongDNA | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [finalSong, setFinalSong] = useState<string | undefined>(undefined);

  async function handleGenerate(url: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      if (!res.ok) throw new Error(`analyze failed: ${res.status}`);
      const data: SongDNA = await res.json();
      setDna(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  if (dna) {
    return <Player dna={dna} />;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-lg space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="flex flex-col items-center text-4xl sm:text-5xl font-bold tracking-tight leading-tight gap-2 sm:gap-3">
            <span>It's</span>
            <AnimatedTitle onComplete={setFinalSong} />
            <span>all the way down</span>
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Feed it a song. It remixes forever — never loops, always evolving.
          </p>
        </div>

        <SeedInput onGenerate={handleGenerate} loading={loading} value={finalSong} />

        {error && (
          <p className="text-center text-red-400 text-sm border border-red-900 rounded-lg px-4 py-3">
            {error}
          </p>
        )}
      </div>
    </main>
  );
}
