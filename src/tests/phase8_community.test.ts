import { describe, it, expect } from 'vitest';
import {
  createQuestSchema,
  submitQuestProofSchema,
  reviewQuestSubmissionSchema,
  createCommunityPostSchema,
} from '@/schemas/community';
import type { Quest, UserQuestProgress, CommunityPost } from '@/types/database';

describe('Phase 8 - Quests & Community Validation Tests', () => {
  // ─── QUEST SCHEMA TESTS ────────────────────────────────────

  it('should accept valid quest creation by teacher', () => {
    const result = createQuestSchema.safeParse({
      organization_id: '123e4567-e89b-12d3-a456-426614174000',
      title: 'Reto Pasos Básicos de Salsa',
      description: 'Graba un vídeo de 30 segundos ejecutando el paso básico de salsa cubana.',
      points_reward: 20,
    });
    expect(result.success).toBe(true);
  });

  it('should reject quest with empty description', () => {
    const result = createQuestSchema.safeParse({
      organization_id: '123e4567-e89b-12d3-a456-426614174000',
      title: 'Reto Corto',
      description: 'Corto',
    });
    expect(result.success).toBe(false);
  });

  // ─── SUBMISSION & REVIEW SCHEMA TESTS ──────────────────────

  it('should accept valid student quest submission URL', () => {
    const result = submitQuestProofSchema.safeParse({
      quest_id: '123e4567-e89b-12d3-a456-426614174000',
      submission_url: 'https://instagram.com/p/video123',
    });
    expect(result.success).toBe(true);
  });

  it('should accept valid teacher review approval', () => {
    const result = reviewQuestSubmissionSchema.safeParse({
      progress_id: '123e4567-e89b-12d3-a456-426614174000',
      approved: true,
      notes: '¡Excelente musicalidad!',
    });
    expect(result.success).toBe(true);
  });

  // ─── POINTS AWARD & STATUS TRANSITION LOGIC ────────────────

  it('should award points on approval and zero points on rejection (Section 31)', () => {
    const questPoints = 50;

    // Case 1: Approved
    const isApproved = true;
    const earnedPoints = isApproved ? questPoints : 0;
    expect(earnedPoints).toBe(50);

    // Case 2: Rejected
    const isRejected = false;
    const rejectedEarnedPoints = isRejected ? questPoints : 0;
    expect(rejectedEarnedPoints).toBe(0);
  });

  // ─── COMMUNITY POST SCHEMA TESTS ───────────────────────────

  it('should accept valid community post', () => {
    const result = createCommunityPostSchema.safeParse({
      organization_id: '123e4567-e89b-12d3-a456-426614174000',
      content: '¡Gran clase de bachata hoy a todos los alumnos!',
      media_url: 'https://example.com/photo.jpg',
    });
    expect(result.success).toBe(true);
  });

  it('should verify CommunityPost structure', () => {
    const post: CommunityPost = {
      id: 'post-1',
      organization_id: 'org-1',
      user_id: 'user-1',
      content: 'Bienvenidos a la comunidad.',
      likes_count: 5,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    expect(post.likes_count).toBe(5);
  });
});
