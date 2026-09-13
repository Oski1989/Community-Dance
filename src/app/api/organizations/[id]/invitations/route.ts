import { NextResponse } from 'next/server';
import { getCurrentUserId } from '@/services/auth.service';
import { inviteMemberSchema } from '@/schemas/organizations';
import { createInvitation } from '@/services/organization.service';

/**
 * POST /api/organizations/[id]/invitations
 * Create an invitation for a new member.
 */
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json({ success: false, error: 'No autenticado.' }, { status: 401 });
    }

    const orgId = params.id;
    const body = await request.json();
    const parsed = inviteMemberSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const result = await createInvitation(userId, orgId, parsed.data);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: result.data }, { status: 201 });
  } catch (err) {
    console.error('[API /organizations/[id]/invitations POST] Error:', err);
    return NextResponse.json({ success: false, error: 'Error interno del servidor.' }, { status: 500 });
  }
}
