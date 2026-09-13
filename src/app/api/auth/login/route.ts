import { NextResponse } from 'next/server';
import { loginSchema } from '@/schemas/auth';
import { loginUser } from '@/services/auth.service';

/**
 * POST /api/auth/login
 * Authenticates a user with email and password.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 1. Validate input with Zod
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      return NextResponse.json(
        { success: false, errors },
        { status: 400 }
      );
    }

    // 2. Authenticate via auth service
    const result = await loginUser(parsed.data);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: true, data: result.data },
      { status: 200 }
    );
  } catch (err) {
    console.error('[API /auth/login] Internal error:', err);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor.' },
      { status: 500 }
    );
  }
}
