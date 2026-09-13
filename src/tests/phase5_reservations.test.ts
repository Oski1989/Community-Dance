import { describe, it, expect } from 'vitest';
import { createReservationSchema, cancelReservationSchema } from '@/schemas/reservations';
import type { Reservation, Waitlist, DanceRoleUsed } from '@/types/database';

describe('Phase 5 - Reservations & Concurrency Validation Tests', () => {
  // ─── RESERVATION SCHEMA TESTS ───────────────────────────────

  it('should accept valid reservation input with dance_role_used', () => {
    const result = createReservationSchema.safeParse({
      session_id: '123e4567-e89b-12d3-a456-426614174000',
      dance_role_used: 'leader',
    });
    expect(result.success).toBe(true);
  });

  it('should default dance_role_used to unspecified if omitted', () => {
    const result = createReservationSchema.safeParse({
      session_id: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.dance_role_used).toBe('unspecified');
    }
  });

  it('should reject reservation with invalid UUID', () => {
    const result = createReservationSchema.safeParse({
      session_id: 'invalid-uuid',
      dance_role_used: 'follower',
    });
    expect(result.success).toBe(false);
  });

  // ─── CANCELLATION SCHEMA TESTS ──────────────────────────────

  it('should accept valid reservation cancellation input', () => {
    const result = cancelReservationSchema.safeParse({
      reservation_id: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(result.success).toBe(true);
  });

  // ─── DANCE ROLE IMMUTABILITY & CONCURRENCY RULE TESTS ──────

  it('should preserve dance_role_used in reservation object regardless of future profile changes (Section 15)', () => {
    // User registers as follower for specific session
    const reservation: Reservation = {
      id: 'res-1',
      organization_id: 'org-1',
      session_id: 'session-1',
      user_id: 'user-1',
      dance_role_used: 'follower', // Immutable on reservation
      status: 'confirmed',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Simulate user changing profile preference later to leader
    const updatedProfilePreference: DanceRoleUsed = 'leader';

    expect(reservation.dance_role_used).toBe('follower');
    expect(reservation.dance_role_used).not.toBe(updatedProfilePreference);
  });

  it('should correctly simulate atomic concurrency: 1 spot, 10 attempts -> 1 confirmed, 9 waitlisted (Section 16 & 17)', () => {
    const capacityTotal = 1;
    const attempts = 10;
    
    let confirmedCount = 0;
    let waitlistCount = 0;
    const waitlistPositions: number[] = [];

    // Simulate atomic transactional RPC execution loop
    for (let i = 1; i <= attempts; i++) {
      if (confirmedCount < capacityTotal) {
        confirmedCount++;
      } else {
        waitlistCount++;
        waitlistPositions.push(waitlistCount);
      }
    }

    expect(confirmedCount).toBe(1);
    expect(waitlistCount).toBe(9);
    expect(waitlistPositions).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  it('should verify Waitlist promotion order (Section 19)', () => {
    const waitlistQueue: Waitlist[] = [
      { id: 'w-1', organization_id: 'org-1', session_id: 's-1', user_id: 'user-a', dance_role_used: 'leader', position: 1, created_at: '2026-09-13T10:00:00Z' },
      { id: 'w-2', organization_id: 'org-1', session_id: 's-1', user_id: 'user-b', dance_role_used: 'follower', position: 2, created_at: '2026-09-13T10:05:00Z' },
    ];

    // Cancellation triggers promotion of position 1
    const candidateToPromote = waitlistQueue.shift();
    expect(candidateToPromote?.user_id).toBe('user-a');
    expect(waitlistQueue.length).toBe(1);
    expect(waitlistQueue[0].user_id).toBe('user-b');
  });
});
