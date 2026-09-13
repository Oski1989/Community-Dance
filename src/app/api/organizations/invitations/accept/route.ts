import { NextResponse } from 'next/server';
import { getCurrentUserId } from '@/services/auth.service';
import { acceptInvitationSchema } from '@/schemas/organizations';
import { acceptInvitation } from '@/services/organization.service';

/**
 * POST /api/organizations/invitations/accept
 * Accept an organization invitation using its token.
 */
export async function POST(request: Request) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json({ success: false, error: 'No autenticado.' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = acceptInvitationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const result = await acceptInvitation(userId, parsed.data.token);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (err) {
    console.error('[API /organizations/invitations/accept POST] Error:', err);
    return NextResponse.json({ success: false, error: 'Error interno del servidor.' }, { status: 500 });
  }
}
