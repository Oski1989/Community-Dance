import { supabase } from '@/lib/supabase/client';
import type { Reservation, Waitlist } from '@/types/database';
import type { CreateReservationInput } from '@/schemas/reservations';

export type ReservationResult<T = null> = {
  success: boolean;
  data?: T;
  error?: string;
};

/**
 * Make an atomic reservation for a session using the PostgreSQL RPC `reserve_session_atomic`.
 * Prevents oversales, handles waitlists, and enforces idempotency.
 */
export async function reserveSession(
  userId: string,
  input: CreateReservationInput
): Promise<ReservationResult<{ status: 'confirmed' | 'waitlist'; reservation_id: string; position?: number }>> {
  const { data, error } = await supabase.rpc('reserve_session_atomic', {
    p_session_id: input.session_id,
    p_user_id: userId,
    p_dance_role: input.dance_role_used ?? 'unspecified',
  });

  if (error) {
    return { success: false, error: error.message || 'Error al procesar la reserva.' };
  }

  if (!data || !data.success) {
    return { success: false, error: data?.error || 'No se pudo completar la reserva.' };
  }

  return {
    success: true,
    data: {
      status: data.status,
      reservation_id: data.reservation_id,
      position: data.position,
    },
  };
}

/**
 * Cancel an atomic reservation using `cancel_reservation_atomic` RPC.
 * Automatically promotes the next candidate in the waitlist if applicable.
 */
export async function cancelReservation(
  userId: string,
  reservationId: string
): Promise<ReservationResult<{ promoted_user_id?: string | null }>> {
  const { data, error } = await supabase.rpc('cancel_reservation_atomic', {
    p_reservation_id: reservationId,
    p_user_id: userId,
  });

  if (error) {
    return { success: false, error: error.message || 'Error al cancelar la reserva.' };
  }

  if (!data || !data.success) {
    return { success: false, error: data?.error || 'No se pudo cancelar la reserva.' };
  }

  return {
    success: true,
    data: {
      promoted_user_id: data.promoted_user_id ?? null,
    },
  };
}

/**
 * Get all active reservations for a user.
 */
export async function getUserReservations(userId: string): Promise<ReservationResult<Reservation[]>> {
  const { data, error } = await supabase
    .from('reservations')
    .select('*, sessions(start_time, end_time, groups(name))')
    .eq('user_id', userId)
    .neq('status', 'cancelled')
    .order('created_at', { ascending: false });

  if (error) {
    return { success: false, error: 'Error al obtener tus reservas.' };
  }

  return { success: true, data: data as Reservation[] };
}

/**
 * Get all reservations for a specific session (for teachers & admins).
 */
export async function getSessionReservations(sessionId: string): Promise<ReservationResult<Reservation[]>> {
  const { data, error } = await supabase
    .from('reservations')
    .select('*, profiles(full_name, nickname, avatar_url)')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });

  if (error) {
    return { success: false, error: 'Error al obtener los asistentes a la clase.' };
  }

  return { success: true, data: data as Reservation[] };
}
