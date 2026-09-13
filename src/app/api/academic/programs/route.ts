import { NextResponse } from 'next/server';
import { getCurrentUserId } from '@/services/auth.service';
import { createProgramSchema } from '@/schemas/academic';
import { createProgram, getOrganizationPrograms } from '@/services/academic.service';

/**
 * GET /api/academic/programs?orgId=UUID
 */
export async function GET(request: Request) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ success: false, error: 'No autenticado.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get('orgId');

    if (!orgId) {
      return NextResponse.json({ success: false, error: 'orgId es requerido.' }, { status: 400 });
    }

    const result = await getOrganizationPrograms(orgId);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (err) {
    console.error('[API /academic/programs GET] Error:', err);
    return NextResponse.json({ success: false, error: 'Error interno del servidor.' }, { status: 500 });
  }
}

/**
 * POST /api/academic/programs
 */
export async function POST(request: Request) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ success: false, error: 'No autenticado.' }, { status: 401 });
    }

    const body = await request.json();
    const { orgId, ...programData } = body;

    if (!orgId) {
      return NextResponse.json({ success: false, error: 'orgId es requerido.' }, { status: 400 });
    }

    const parsed = createProgramSchema.safeParse(programData);
    if (!parsed.success) {
      return NextResponse.json({ success: false, errors: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const result = await createProgram(orgId, parsed.data);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: result.data }, { status: 201 });
  } catch (err) {
    console.error('[API /academic/programs POST] Error:', err);
    return NextResponse.json({ success: false, error: 'Error interno del servidor.' }, { status: 500 });
  }
}
