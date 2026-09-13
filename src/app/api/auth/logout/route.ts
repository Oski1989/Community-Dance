import { NextResponse } from 'next/server';
import { logoutUser } from '@/services/auth.service';

/**
 * POST /api/auth/logout
 * Signs out the current user.
 */
export async function POST() {
  try {
    const result = await logoutUser();

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error('[API /auth/logout] Internal error:', err);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor.' },
      { status: 500 }
    );
  }
}
