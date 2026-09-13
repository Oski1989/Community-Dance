import { describe, it, expect } from 'vitest';
import {
  createOrganizationSchema,
  updateOrganizationSchema,
  inviteMemberSchema,
  updateMemberRoleSchema,
  acceptInvitationSchema,
} from '@/schemas/organizations';
import type { Organization, OrganizationMember, OrganizationInvitation } from '@/types/database';

describe('Phase 3 - Organization & Multi-Tenant Validation Tests', () => {
  // ─── CREATE ORGANIZATION SCHEMA TESTS ────────────────────────

  it('should accept valid organization creation data', () => {
    const result = createOrganizationSchema.safeParse({
      name: 'Escuela de Baile Madrid',
      slug: 'baile-madrid',
      description: 'Escuela especializada en Salsa y Bachata.',
      contact_email: 'info@bailemadrid.com',
      contact_phone: '+34 912 345 678',
      logo_url: 'https://example.com/logo.png',
    });
    expect(result.success).toBe(true);
  });

  it('should reject organization creation with invalid slug (spaces or uppercase)', () => {
    const result = createOrganizationSchema.safeParse({
      name: 'Escuela Invalid',
      slug: 'Baile Madrid',
    });
    expect(result.success).toBe(false);
  });

  it('should reject organization creation with slug too short', () => {
    const result = createOrganizationSchema.safeParse({
      name: 'Escuela Short',
      slug: 'a',
    });
    expect(result.success).toBe(false);
  });

  // ─── INVITATION SCHEMA TESTS ─────────────────────────────────

  it('should accept valid member invitation', () => {
    const result = inviteMemberSchema.safeParse({
      email: 'teacher@plazadance.com',
      role: 'teacher',
    });
    expect(result.success).toBe(true);
  });

  it('should reject member invitation with invalid email', () => {
    const result = inviteMemberSchema.safeParse({
      email: 'not-an-email',
      role: 'student',
    });
    expect(result.success).toBe(false);
  });

  it('should reject member invitation with invalid role', () => {
    const result = inviteMemberSchema.safeParse({
      email: 'user@test.com',
      role: 'superadmin', // Invalid org role
    });
    expect(result.success).toBe(false);
  });

  // ─── MEMBER ROLE UPDATE SCHEMA TESTS ────────────────────────

  it('should accept valid role update', () => {
    const result = updateMemberRoleSchema.safeParse({
      role: 'admin',
      is_active: true,
    });
    expect(result.success).toBe(true);
  });

  // ─── ACCEPT INVITATION SCHEMA TESTS ─────────────────────────

  it('should accept valid token', () => {
    const result = acceptInvitationSchema.safeParse({
      token: 'a1b2c3d4e5f678901234567890abcdef',
    });
    expect(result.success).toBe(true);
  });

  it('should reject short invalid token', () => {
    const result = acceptInvitationSchema.safeParse({
      token: '123',
    });
    expect(result.success).toBe(false);
  });

  // ─── MULTI-TENANT ISOLATION TYPE INTEGRITY ───────────────

  it('should verify Organization & Member structure maintains data isolation keys', () => {
    const org: Organization = {
      id: 'org-uuid-1',
      name: 'Escuela A',
      slug: 'escuela-a',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const member: OrganizationMember = {
      id: 'member-uuid-1',
      organization_id: org.id,
      user_id: 'user-uuid-1',
      role: 'owner',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    expect(member.organization_id).toBe(org.id);
    expect(member.role).toBe('owner');
  });

  it('should verify OrganizationInvitation structure', () => {
    const invite: OrganizationInvitation = {
      id: 'invite-uuid',
      organization_id: 'org-uuid-1',
      email: 'student@dance.com',
      role: 'student',
      token: 'token1234567890',
      status: 'pending',
      invited_by: 'owner-uuid',
      expires_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    expect(invite.status).toBe('pending');
    expect(invite.role).toBe('student');
  });
});
