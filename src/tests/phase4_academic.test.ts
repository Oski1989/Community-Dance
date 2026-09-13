import { describe, it, expect } from 'vitest';
import {
  createProgramSchema,
  createLevelSchema,
  createSublevelSchema,
  createGroupSchema,
  createSessionSchema,
} from '@/schemas/academic';
import type { Program, Group, Session } from '@/types/database';

describe('Phase 4 - Academic Structures Validation Tests', () => {
  // ─── PROGRAM SCHEMA TESTS ──────────────────────────────────

  it('should accept valid program data', () => {
    const result = createProgramSchema.safeParse({
      name: 'Bachata Sensual',
      description: 'Programa oficial de Bachata Sensual.',
    });
    expect(result.success).toBe(true);
  });

  it('should reject program without name', () => {
    const result = createProgramSchema.safeParse({
      name: '',
    });
    expect(result.success).toBe(false);
  });

  // ─── GROUP SCHEMA TESTS ────────────────────────────────────

  it('should accept valid group creation data', () => {
    const result = createGroupSchema.safeParse({
      organization_id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Bachata Básico - Martes 20:00',
      capacity_total: 20,
      capacity_leaders: 10,
      capacity_followers: 10,
    });
    expect(result.success).toBe(true);
  });

  it('should reject group creation if sum of leader/follower capacity exceeds total', () => {
    const result = createGroupSchema.safeParse({
      organization_id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Grupo Excedido',
      capacity_total: 10,
      capacity_leaders: 8,
      capacity_followers: 8, // Sum = 16 > 10
    });
    expect(result.success).toBe(false);
  });

  // ─── SESSION SCHEMA TESTS ──────────────────────────────────

  it('should accept valid future session creation data', () => {
    const futureStart = new Date(Date.now() + 86400000).toISOString(); // +1 day
    const futureEnd = new Date(Date.now() + 86400000 + 3600000).toISOString(); // +1 day +1 hour

    const result = createSessionSchema.safeParse({
      organization_id: '123e4567-e89b-12d3-a456-426614174000',
      group_id: '123e4567-e89b-12d3-a456-426614174001',
      start_time: futureStart,
      end_time: futureEnd,
      capacity_total: 20,
    });
    expect(result.success).toBe(true);
  });

  it('should REJECT session in the past (Section 14 requirement)', () => {
    const pastStart = new Date(Date.now() - 86400000).toISOString(); // -1 day
    const pastEnd = new Date(Date.now() - 86400000 + 3600000).toISOString();

    const result = createSessionSchema.safeParse({
      organization_id: '123e4567-e89b-12d3-a456-426614174000',
      group_id: '123e4567-e89b-12d3-a456-426614174001',
      start_time: pastStart,
      end_time: pastEnd,
      capacity_total: 20,
    });
    expect(result.success).toBe(false);
  });

  it('should REJECT session where end_time is before start_time', () => {
    const futureStart = new Date(Date.now() + 86400000).toISOString();
    const earlierEnd = new Date(Date.now() + 86400000 - 3600000).toISOString(); // 1 hr before start

    const result = createSessionSchema.safeParse({
      organization_id: '123e4567-e89b-12d3-a456-426614174000',
      group_id: '123e4567-e89b-12d3-a456-426614174001',
      start_time: futureStart,
      end_time: earlierEnd,
      capacity_total: 20,
    });
    expect(result.success).toBe(false);
  });

  // ─── TYPE INTEGRITY TESTS ──────────────────────────────────

  it('should verify Program -> Group -> Session hierarchy type structures', () => {
    const program: Program = {
      id: 'p-1',
      organization_id: 'org-1',
      name: 'Salsa Cubana',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const group: Group = {
      id: 'g-1',
      organization_id: 'org-1',
      name: 'Nivel 1 Jueves',
      capacity_total: 16,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const session: Session = {
      id: 's-1',
      organization_id: 'org-1',
      group_id: group.id,
      start_time: new Date().toISOString(),
      end_time: new Date().toISOString(),
      capacity_total: 16,
      status: 'scheduled',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    expect(session.group_id).toBe(group.id);
    expect(session.status).toBe('scheduled');
  });
});
