// Standalone Node.js server that connects to Lyria RealTime and streams PCM audio
// Run with: node lyria-server.mjs
// Listens on port 3001

import { createServer } from 'http';
import { GoogleGenAI } from '@google/genai';
import { readFileSync } from 'fs';

// Load env from .env.local
const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8')
    .split('\n')
    .filter(l => l.includes('='))
    .map(l => l.split('=').map(s => s.trim()))
);

const API_KEY = env.GEMINI_API_KEY;
if (!API_KEY) { console.error('GEMINI_API_KEY not found in .env.local'); process.exit(1); }

const server = createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': 'http://localhost:3000',
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    res.end();
    return;
  }

  if (req.method !== 'POST' || req.url !== '/lyria') {
    res.writeHead(404);
    res.end();
    return;
  }

  // Parse request body
  const body = await new Promise((resolve) => {
    let data = '';
    req.on('data', chunk => data += chunk);
    req.on('end', () => resolve(JSON.parse(data)));
  });

  const { prompts = [], bpm = 118 } = body;

  console.log('Lyria: connecting, bpm:', bpm, 'prompts:', prompts.map(p => p.text));

  // Set up streaming response
  res.writeHead(200, {
    'Content-Type': 'application/octet-stream',
    'Access-Control-Allow-Origin': 'http://localhost:3000',
    'Transfer-Encoding': 'chunked',
  });

  try {
    const ai = new GoogleGenAI({
      apiKey: API_KEY,
      httpOptions: { apiVersion: 'v1alpha' },
    });

    const session = await ai.live.music.connect({
      model: 'models/lyria-realtime-exp',
      callbacks: {
        onmessage: (message) => {
          if (message.serverContent?.audioChunks) {
            for (const chunk of message.serverContent.audioChunks) {
              const buf = Buffer.from(chunk.data, 'base64');
              res.write(buf);
            }
          }
        },
        onerror: (err) => {
          console.error('Lyria session error:', err);
          res.end();
        },
        onclose: () => {
          console.log('Lyria session closed');
          res.end();
        },
      },
    });

    await session.setWeightedPrompts({
      weightedPrompts: prompts.length > 0 ? prompts : [
        { text: 'hi-nrg freestyle 80s dance synthesizer upbeat', weight: 1.0 },
      ],
    });

    await session.setMusicGenerationConfig({
      musicGenerationConfig: { bpm, density: 0.7, brightness: 0.6 },
    });

    await session.play();

    // Keep session alive until client disconnects
    req.on('close', () => {
      console.log('Client disconnected, stopping Lyria');
      session.stop();
    });

  } catch (err) {
    console.error('Lyria error:', err);
    res.end();
  }
});

server.listen(3001, () => {
  console.log('Lyria proxy server listening on http://localhost:3001');
});
