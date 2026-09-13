import { describe, it, expect } from 'vitest';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { registerSchema, loginSchema, updateProfileSchema, updateProfilePrivateSchema, forgotPasswordSchema, resetPasswordSchema } from '@/schemas/auth';
import type { GlobalRole, OrgRole, DanceRolePreference, TermsVersion, UserTermsAcceptance } from '@/types/database';

describe('Phase 1 - Database Foundation Tests', () => {
  it('should validate roles hierarchy and values', () => {
    const validGlobalRoles: GlobalRole[] = ['user', 'superadmin'];
    const validOrgRoles: OrgRole[] = ['owner', 'admin', 'teacher', 'reception', 'student'];
    const validDanceRoles: DanceRolePreference[] = ['leader', 'follower', 'both', 'unspecified'];

    expect(validGlobalRoles).toContain('superadmin');
    expect(validOrgRoles).toContain('owner');
    expect(validOrgRoles).toContain('admin');
    expect(validDanceRoles).toContain('leader');
  });

  it('should handle Supabase client configuration check gracefully', () => {
    const isConfigured = isSupabaseConfigured();
    expect(typeof isConfigured).toBe('boolean');
  });
});

describe('Phase 2 - Auth & Profile Validation Tests', () => {
  // ─── REGISTER SCHEMA TESTS ─────────────────────────────────

  it('should reject registration without email', () => {
    const result = registerSchema.safeParse({
      email: '',
      password: 'Password123!',
      confirmPassword: 'Password123!',
      full_name: 'Test User',
      accept_terms: true,
    });
    expect(result.success).toBe(false);
  });

  it('should reject registration with short password', () => {
    const result = registerSchema.safeParse({
      email: 'test@test.com',
      password: '123',
      confirmPassword: '123',
      full_name: 'Test User',
      accept_terms: true,
    });
    expect(result.success).toBe(false);
  });

  it('should reject registration with mismatched passwords', () => {
    const result = registerSchema.safeParse({
      email: 'test@test.com',
      password: 'Password123!',
      confirmPassword: 'DifferentPass!',
      full_name: 'Test User',
      accept_terms: true,
    });
    expect(result.success).toBe(false);
  });

  it('should reject registration without accepting terms', () => {
    const result = registerSchema.safeParse({
      email: 'test@test.com',
      password: 'Password123!',
      confirmPassword: 'Password123!',
      full_name: 'Test User',
      accept_terms: false,
    });
    expect(result.success).toBe(false);
  });

  it('should accept valid registration data', () => {
    const result = registerSchema.safeParse({
      email: 'valid@plazadance.com',
      password: 'SecurePass1!',
      confirmPassword: 'SecurePass1!',
      full_name: 'María García',
      accept_terms: true,
    });
    expect(result.success).toBe(true);
  });

  it('should reject registration with name too short', () => {
    const result = registerSchema.safeParse({
      email: 'test@test.com',
      password: 'Password123!',
      confirmPassword: 'Password123!',
      full_name: 'A',
      accept_terms: true,
    });
    expect(result.success).toBe(false);
  });

  // ─── LOGIN SCHEMA TESTS ────────────────────────────────────

  it('should reject login without password', () => {
    const result = loginSchema.safeParse({
      email: 'test@test.com',
      password: '',
    });
    expect(result.success).toBe(false);
  });

  it('should accept valid login data', () => {
    const result = loginSchema.safeParse({
      email: 'valid@plazadance.com',
      password: 'Password123!',
    });
    expect(result.success).toBe(true);
  });

  // ─── PROFILE UPDATE SCHEMA TESTS ───────────────────────────

  it('should accept valid profile update', () => {
    const result = updateProfileSchema.safeParse({
      full_name: 'Nuevo Nombre',
      nickname: 'dancer123',
      bio: 'Me encanta bailar salsa.',
    });
    expect(result.success).toBe(true);
  });

  it('should reject profile update with invalid avatar URL', () => {
    const result = updateProfileSchema.safeParse({
      avatar_url: 'not-a-url',
    });
    expect(result.success).toBe(false);
  });

  // ─── PRIVATE PROFILE UPDATE SCHEMA TESTS ───────────────────

  it('should accept valid private profile update', () => {
    const result = updateProfilePrivateSchema.safeParse({
      phone: '+34 612 345 678',
      dance_role_preference: 'leader',
    });
    expect(result.success).toBe(true);
  });

  it('should reject invalid dance role preference', () => {
    const result = updateProfilePrivateSchema.safeParse({
      dance_role_preference: 'invalid_role',
    });
    expect(result.success).toBe(false);
  });

  // ─── PASSWORD RECOVERY SCHEMA TESTS ─────────────────────────

  it('should accept valid forgot password email', () => {
    const result = forgotPasswordSchema.safeParse({
      email: 'recover@plazadance.com',
    });
    expect(result.success).toBe(true);
  });

  it('should reject reset password with mismatched passwords', () => {
    const result = resetPasswordSchema.safeParse({
      password: 'NewSecure1!',
      confirmPassword: 'Different1!',
    });
    expect(result.success).toBe(false);
  });

  it('should accept valid password reset', () => {
    const result = resetPasswordSchema.safeParse({
      password: 'NewSecure1!',
      confirmPassword: 'NewSecure1!',
    });
    expect(result.success).toBe(true);
  });

  // ─── TYPE SAFETY TESTS ─────────────────────────────────────

  it('should validate TermsVersion interface structure', () => {
    const terms: TermsVersion = {
      id: 'test-id',
      version: 'v1.0',
      title: 'Términos y Condiciones',
      content: 'Legal text here...',
      published_at: new Date().toISOString(),
      is_current: true,
      created_at: new Date().toISOString(),
    };
    expect(terms.version).toBe('v1.0');
    expect(terms.is_current).toBe(true);
  });

  it('should validate UserTermsAcceptance interface structure', () => {
    const acceptance: UserTermsAcceptance = {
      id: 'acceptance-id',
      user_id: 'user-uuid',
      terms_version_id: 'terms-uuid',
      accepted_at: new Date().toISOString(),
      ip_address: '192.168.1.1',
      user_agent: 'Mozilla/5.0',
    };
    expect(acceptance.user_id).toBe('user-uuid');
    expect(acceptance.ip_address).toBe('192.168.1.1');
  });
});
