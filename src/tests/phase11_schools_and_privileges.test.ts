import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Zod Validation Schema for Student Profile & Privacy
const StudentProfileSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  bio: z.string().optional(),
  danceRole: z.enum(['leader', 'follower', 'both', 'unspecified']),
  instagram: z.string().optional(),
  tiktok: z.string().optional(),
  showInRankings: z.boolean().default(true),
});

// Helper for Role Navigation Permissions
function getRoleAllowedActions(role: 'guest' | 'student' | 'teacher' | 'owner' | 'superadmin') {
  return {
    canNavigateWithoutSidebar: role === 'guest',
    canCreateQuest: role === 'teacher' || role === 'owner' || role === 'superadmin',
    canCreateProgram: role === 'teacher' || role === 'owner' || role === 'superadmin',
    canManageSaas: role === 'superadmin',
    canEditProfile: role !== 'guest',
  };
}

// Social Check-in Streak Calculator
function calculateSocialStreakReward(totalCheckins: number) {
  const isRewardUnlocked = totalCheckins > 0 && totalCheckins % 4 === 0;
  const remainingForNextReward = 4 - (totalCheckins % 4);
  return {
    totalCheckins,
    isRewardUnlocked,
    remainingForNextReward: remainingForNextReward === 4 ? 0 : remainingForNextReward,
  };
}

describe('Phase 11: Schools, Social Streaks & Privileges Architecture', () => {
  it('should validate student profile data and privacy settings correctly', () => {
    const validProfile = {
      name: 'Carlos Gómez',
      bio: 'Bailarín de Bachata y Salsa',
      danceRole: 'leader',
      instagram: '@carlos_dance',
      showInRankings: false,
    };

    const parsed = StudentProfileSchema.parse(validProfile);
    expect(parsed.name).toBe('Carlos Gómez');
    expect(parsed.danceRole).toBe('leader');
    expect(parsed.showInRankings).toBe(false);
  });

  it('should enforce strict role-based permission boundaries', () => {
    const guestPermissions = getRoleAllowedActions('guest');
    expect(guestPermissions.canNavigateWithoutSidebar).toBe(true);
    expect(guestPermissions.canCreateQuest).toBe(false);
    expect(guestPermissions.canCreateProgram).toBe(false);

    const studentPermissions = getRoleAllowedActions('student');
    expect(studentPermissions.canNavigateWithoutSidebar).toBe(false);
    expect(studentPermissions.canCreateQuest).toBe(false);
    expect(studentPermissions.canCreateProgram).toBe(false);
    expect(studentPermissions.canEditProfile).toBe(true);

    const teacherPermissions = getRoleAllowedActions('teacher');
    expect(teacherPermissions.canCreateQuest).toBe(true);
    expect(teacherPermissions.canCreateProgram).toBe(true);

    const superAdminPermissions = getRoleAllowedActions('superadmin');
    expect(superAdminPermissions.canManageSaas).toBe(true);
  });

  it('should calculate social streak check-in rewards correctly (4 check-ins = free entry)', () => {
    const streak3 = calculateSocialStreakReward(3);
    expect(streak3.isRewardUnlocked).toBe(false);
    expect(streak3.remainingForNextReward).toBe(1);

    const streak4 = calculateSocialStreakReward(4);
    expect(streak4.isRewardUnlocked).toBe(true);
    expect(streak4.remainingForNextReward).toBe(0);

    const streak8 = calculateSocialStreakReward(8);
    expect(streak8.isRewardUnlocked).toBe(true);
  });
});
