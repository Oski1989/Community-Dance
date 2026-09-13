import { NextResponse } from 'next/server';
import { registerSchema } from '@/schemas/auth';
import { registerUser } from '@/services/auth.service';

/**
 * POST /api/auth/register
 * Registers a new user. Validates input with Zod.
 * The database trigger creates profile + profile_private automatically.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 1. Validate input with Zod
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      return NextResponse.json(
        { success: false, errors },
        { status: 400 }
      );
    }

    // 2. Register user via auth service
    const result = await registerUser(parsed.data);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: true, data: result.data },
      { status: 201 }
    );
  } catch (err) {
    // Never expose internal errors (section 40)
    console.error('[API /auth/register] Internal error:', err);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor.' },
      { status: 500 }
    );
  }
}
