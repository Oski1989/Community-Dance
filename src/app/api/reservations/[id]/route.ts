import { NextResponse } from 'next/server';
import { getCurrentUserId } from '@/services/auth.service';
import { cancelReservation } from '@/services/reservation.service';

/**
 * DELETE /api/reservations/[id]
 * Cancel a reservation atomically and promote next waitlist candidate.
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ success: false, error: 'No autenticado.' }, { status: 401 });
    }

    const reservationId = params.id;
    const result = await cancelReservation(userId, reservationId);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (err) {
    console.error('[API /reservations/[id] DELETE] Error:', err);
    return NextResponse.json({ success: false, error: 'Error interno del servidor.' }, { status: 500 });
  }
}
