import { NextResponse } from 'next/server';
import { getCurrentUserId } from '@/services/auth.service';
import { recordAttendanceSchema, bulkAttendanceSchema } from '@/schemas/attendance';
import {
  recordAttendance,
  bulkRecordAttendance,
  getSessionAttendance,
  getUserAttendanceHistory,
} from '@/services/attendance.service';

/**
 * GET /api/attendance?sessionId=UUID or /api/attendance (for current user)
 */
export async function GET(request: Request) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ success: false, error: 'No autenticado.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (sessionId) {
      const result = await getSessionAttendance(sessionId);
      if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 400 });
      }
      return NextResponse.json({ success: true, data: result.data });
    }

    // Default to user's history
    const result = await getUserAttendanceHistory(userId);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (err) {
    console.error('[API /attendance GET] Error:', err);
    return NextResponse.json({ success: false, error: 'Error interno del servidor.' }, { status: 500 });
  }
}

/**
 * POST /api/attendance
 * Accepts single attendance record or bulk records.
 */
export async function POST(request: Request) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ success: false, error: 'No autenticado.' }, { status: 401 });
    }

    const body = await request.json();

    // Check if bulk or single
    if (body.records && Array.isArray(body.records)) {
      const parsed = bulkAttendanceSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ success: false, errors: parsed.error.flatten().fieldErrors }, { status: 400 });
      }
      const result = await bulkRecordAttendance(userId, parsed.data);
      if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 400 });
      }
      return NextResponse.json({ success: true, data: result.data }, { status: 200 });
    }

    // Single attendance record
    const parsed = recordAttendanceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, errors: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const result = await recordAttendance(userId, parsed.data);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: result.data }, { status: 200 });
  } catch (err) {
    console.error('[API /attendance POST] Error:', err);
    return NextResponse.json({ success: false, error: 'Error interno del servidor.' }, { status: 500 });
  }
}
