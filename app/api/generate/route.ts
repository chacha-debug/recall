import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth/config';
import { generateFlashcards } from '@/lib/llm/generate-cards';

const bodySchema = z.object({
  text: z.string().min(50).max(20000),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Text must be between 50 and 20,000 characters.' },
      { status: 400 }
    );
  }

  try {
    const cards = await generateFlashcards(parsed.data.text);
    return NextResponse.json({ cards });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'UNKNOWN';

    const errorMap: Record<string, { status: number; message: string }> = {
      SOURCE_TOO_SHORT: { status: 400, message: 'Text is too short.' },
      SOURCE_TOO_LONG: { status: 400, message: 'Text is too long.' },
      LLM_EMPTY_RESPONSE: { status: 502, message: 'AI returned nothing. Try again.' },
      LLM_INVALID_JSON: { status: 502, message: 'AI returned invalid data. Try again.' },
      LLM_SCHEMA_MISMATCH: { status: 502, message: 'AI returned unexpected data. Try again.' },
    };

    const mapped = errorMap[message] ?? {
      status: 500,
      message: 'Something went wrong generating cards.',
    };

    if (mapped.status >= 500) {
      console.error('Generate error:', err);
    }

    return NextResponse.json({ error: mapped.message }, { status: mapped.status });
  }
}