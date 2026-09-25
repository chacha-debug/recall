import 'server-only';
import { z } from 'zod';
import { groq, MODEL } from './groq';

const flashcardSchema = z.object({
  front: z.string().min(1).max(500),
  back: z.string().min(1).max(1000),
});

const responseSchema = z.object({
  cards: z.array(flashcardSchema).min(1).max(30),
});

export type GeneratedCard = z.infer<typeof flashcardSchema>;

const SYSTEM_PROMPT = `You are a study assistant that generates high-quality flashcards from source text.

Rules:
- Output ONLY valid JSON matching the schema below. No markdown fences, no commentary.
- Generate between 5 and 20 cards depending on the depth of the source text.
- Each card must be self-contained: the "front" should make sense without the source text.
- "front" = a question, term, or prompt (max 500 chars).
- "back" = a concise answer or definition (max 1000 chars).
- Avoid trivial or duplicate cards.
- Never invent facts not present in the source text.

Schema:
{
  "cards": [
    { "front": "string", "back": "string" }
  ]
}`;

export async function generateFlashcards(sourceText: string): Promise<GeneratedCard[]> {
  const trimmed = sourceText.trim();
  if (trimmed.length < 50) {
    throw new Error('SOURCE_TOO_SHORT');
  }
  if (trimmed.length > 20000) {
    throw new Error('SOURCE_TOO_LONG');
  }

  const completion = await groq.chat.completions.create({
    model: MODEL,
    temperature: 0.3,
    max_tokens: 4000,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Generate flashcards from the following source text:\n\n"""\n${trimmed}\n"""`,
      },
    ],
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) {
    throw new Error('LLM_EMPTY_RESPONSE');
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('LLM_INVALID_JSON');
  }

  const validated = responseSchema.safeParse(parsed);
  if (!validated.success) {
    throw new Error('LLM_SCHEMA_MISMATCH');
  }

  return validated.data.cards;
}