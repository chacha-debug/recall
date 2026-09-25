// lib/llm/groq.ts
import 'server-only';
import Groq from 'groq-sdk';

if (!process.env.GROQ_API_KEY) {
  throw new Error('GROQ_API_KEY is not set');
}

export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Use a model available on the free tier
export const MODEL = 'openai/gpt-oss-120b';