import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createUser } from '@/lib/auth/config';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid email or password. Password must be at least 8 characters.' },
        { status: 400 }
      );
    }

    const user = await createUser(parsed.data.email, parsed.data.password);

    return NextResponse.json(
      { id: user.id, email: user.email },
      { status: 201 }
    );
  } catch (err) {
    if (err instanceof Error && err.message === 'EMAIL_TAKEN') {
      return NextResponse.json(
        { error: 'An account with this email already exists.' },
        { status: 409 }
      );
    }
    console.error('Register error:', err);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}