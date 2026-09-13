import { supabase } from '@/lib/supabase/client';
import type { Attendance } from '@/types/database';
import type { RecordAttendanceInput, BulkAttendanceInput } from '@/schemas/attendance';

export type AttendanceResult<T = null> = {
  success: boolean;
  data?: T;
  error?: string;
};

/**
 * Record or update attendance for a single user in a session via RPC.
 */
export async function recordAttendance(
  recordedByUserId: string,
  input: RecordAttendanceInput
): Promise<AttendanceResult<{ attendance_id: string; status: string }>> {
  const { data, error } = await supabase.rpc('record_attendance_atomic', {
    p_session_id: input.session_id,
    p_user_id: input.user_id,
    p_status: input.status,
    p_recorded_by: recordedByUserId,
    p_notes: input.notes ?? null,
  });

  if (error) {
    return { success: false, error: error.message || 'Error al registrar la asistencia.' };
  }

  if (!data || !data.success) {
    return { success: false, error: data?.error || 'No se pudo guardar la asistencia.' };
  }

  return {
    success: true,
    data: {
      attendance_id: data.attendance_id,
      status: data.status,
    },
  };
}

/**
 * Bulk record attendance for an entire class.
 */
export async function bulkRecordAttendance(
  recordedByUserId: string,
  input: BulkAttendanceInput
): Promise<AttendanceResult<{ updatedCount: number }>> {
  let updatedCount = 0;

  for (const record of input.records) {
    const result = await recordAttendance(recordedByUserId, {
      session_id: input.session_id,
      user_id: record.user_id,
      status: record.status,
      notes: record.notes,
    });

    if (result.success) {
      updatedCount++;
    }
  }

  return { success: true, data: { updatedCount } };
}

/**
 * Get all attendance records for a session (for teacher/reception panel).
 */
export async function getSessionAttendance(sessionId: string): Promise<AttendanceResult<Attendance[]>> {
  const { data, error } = await supabase
    .from('attendances')
    .select('*, profiles(full_name, nickname, avatar_url)')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });

  if (error) {
    return { success: false, error: 'Error al consultar el listado de asistencia.' };
  }

  return { success: true, data: data as Attendance[] };
}

/**
 * Get attendance history for a specific user.
 */
export async function getUserAttendanceHistory(userId: string): Promise<AttendanceResult<Attendance[]>> {
  const { data, error } = await supabase
    .from('attendances')
    .select('*, sessions(start_time, end_time, groups(name))')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    return { success: false, error: 'Error al consultar el historial de asistencia.' };
  }

  return { success: true, data: data as Attendance[] };
}
