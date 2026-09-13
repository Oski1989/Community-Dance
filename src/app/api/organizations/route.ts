import { NextResponse } from 'next/server';
import { getCurrentUserId } from '@/services/auth.service';
import { createOrganizationSchema } from '@/schemas/organizations';
import { createOrganization, getUserOrganizations } from '@/services/organization.service';

/**
 * GET /api/organizations
 * List all organizations the user belongs to.
 */
export async function GET() {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json({ success: false, error: 'No autenticado.' }, { status: 401 });
    }

    const result = await getUserOrganizations(userId);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (err) {
    console.error('[API /organizations GET] Error:', err);
    return NextResponse.json({ success: false, error: 'Error interno del servidor.' }, { status: 500 });
  }
}

/**
 * POST /api/organizations
 * Create a new organization.
 */
export async function POST(request: Request) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json({ success: false, error: 'No autenticado.' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createOrganizationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const result = await createOrganization(userId, parsed.data);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: result.data }, { status: 201 });
  } catch (err) {
    console.error('[API /organizations POST] Error:', err);
    return NextResponse.json({ success: false, error: 'Error interno del servidor.' }, { status: 500 });
  }
}
