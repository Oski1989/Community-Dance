import { describe, it, expect } from 'vitest';
import { recordAttendanceSchema, bulkAttendanceSchema, qrCheckInSchema } from '@/schemas/attendance';
import type { Attendance, AttendanceStatus } from '@/types/database';

describe('Phase 6 - Attendance & Check-In Validation Tests', () => {
  // ─── RECORD ATTENDANCE SCHEMA TESTS ─────────────────────────

  it('should accept valid attendance status recording', () => {
    const result = recordAttendanceSchema.safeParse({
      session_id: '123e4567-e89b-12d3-a456-426614174000',
      user_id: '123e4567-e89b-12d3-a456-426614174001',
      status: 'attended',
      notes: 'Llegó a tiempo.',
    });
    expect(result.success).toBe(true);
  });

  it('should reject invalid attendance status value', () => {
    const result = recordAttendanceSchema.safeParse({
      session_id: '123e4567-e89b-12d3-a456-426614174000',
      user_id: '123e4567-e89b-12d3-a456-426614174001',
      status: 'present_invalid',
    });
    expect(result.success).toBe(false);
  });

  // ─── BULK ATTENDANCE SCHEMA TESTS ───────────────────────────

  it('should accept valid bulk attendance batch input', () => {
    const result = bulkAttendanceSchema.safeParse({
      session_id: '123e4567-e89b-12d3-a456-426614174000',
      records: [
        { user_id: '123e4567-e89b-12d3-a456-426614174001', status: 'attended' },
        { user_id: '123e4567-e89b-12d3-a456-426614174002', status: 'absent' },
        { user_id: '123e4567-e89b-12d3-a456-426614174003', status: 'excused', notes: 'Aviso previo por lesión.' },
      ],
    });
    expect(result.success).toBe(true);
  });

  it('should reject bulk attendance with empty records list', () => {
    const result = bulkAttendanceSchema.safeParse({
      session_id: '123e4567-e89b-12d3-a456-426614174000',
      records: [],
    });
    expect(result.success).toBe(false);
  });

  // ─── QR CHECK-IN SCHEMA TESTS ───────────────────────────────

  it('should accept valid QR check-in token input', () => {
    const result = qrCheckInSchema.safeParse({
      session_id: '123e4567-e89b-12d3-a456-426614174000',
      user_id: '123e4567-e89b-12d3-a456-426614174001',
      token: 'qr_token_abc123xyz789',
    });
    expect(result.success).toBe(true);
  });

  // ─── TYPE INTEGRITY AND AUDIT LOG TESTS ─────────────────────

  it('should verify Attendance structure with check-in timestamp and staff auditor', () => {
    const validStatuses: AttendanceStatus[] = ['pending', 'attended', 'absent', 'excused'];
    expect(validStatuses).toContain('attended');
    expect(validStatuses).toContain('excused');

    const attendanceRecord: Attendance = {
      id: 'att-1',
      organization_id: 'org-1',
      session_id: 'sess-1',
      user_id: 'user-student-1',
      reservation_id: 'res-1',
      status: 'attended',
      checked_in_at: new Date().toISOString(),
      checked_in_by: 'user-teacher-1',
      notes: 'Asistencia vía QR',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    expect(attendanceRecord.status).toBe('attended');
    expect(attendanceRecord.checked_in_by).toBe('user-teacher-1');
  });
});
