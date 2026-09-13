import { NextResponse } from 'next/server';
import { getCurrentUserId } from '@/services/auth.service';
import { getFullProfile, updateProfile, updatePrivateProfile } from '@/services/profile.service';
import { updateProfileSchema, updateProfilePrivateSchema } from '@/schemas/auth';

/**
 * GET /api/profile
 * Returns the full profile (public + private) of the current authenticated user.
 */
export async function GET() {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'No autenticado.' },
        { status: 401 }
      );
    }

    const result = await getFullProfile(userId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (err) {
    console.error('[API /profile GET] Internal error:', err);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor.' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/profile
 * Updates the public and/or private profile of the current authenticated user.
 * Accepts { public: {...}, private: {...} }
 */
export async function PATCH(request: Request) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'No autenticado.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const results: Record<string, unknown> = {};

    // Update public profile if provided
    if (body.public) {
      const parsed = updateProfileSchema.safeParse(body.public);
      if (!parsed.success) {
        return NextResponse.json(
          { success: false, errors: parsed.error.flatten().fieldErrors },
          { status: 400 }
        );
      }
      const profileResult = await updateProfile(userId, parsed.data);
      if (!profileResult.success) {
        return NextResponse.json(
          { success: false, error: profileResult.error },
          { status: 400 }
        );
      }
      results.profile = profileResult.data;
    }

    // Update private profile if provided
    if (body.private) {
      const parsed = updateProfilePrivateSchema.safeParse(body.private);
      if (!parsed.success) {
        return NextResponse.json(
          { success: false, errors: parsed.error.flatten().fieldErrors },
          { status: 400 }
        );
      }
      const privateResult = await updatePrivateProfile(userId, parsed.data);
      if (!privateResult.success) {
        return NextResponse.json(
          { success: false, error: privateResult.error },
          { status: 400 }
        );
      }
      results.private = privateResult.data;
    }

    return NextResponse.json({ success: true, data: results });
  } catch (err) {
    console.error('[API /profile PATCH] Internal error:', err);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor.' },
      { status: 500 }
    );
  }
}
