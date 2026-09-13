/**
 * Profile Service — CRUD operations for profiles and profile_private.
 * All operations are filtered by RLS policies.
 */

import { supabase } from '@/lib/supabase/client';
import type { Profile, ProfilePrivate } from '@/types/database';
import type { UpdateProfileInput, UpdateProfilePrivateInput } from '@/schemas/auth';

export type ProfileResult<T = null> = {
  success: boolean;
  data?: T;
  error?: string;
};

/**
 * Fetch the public profile of a user by ID.
 */
export async function getProfileById(userId: string): Promise<ProfileResult<Profile>> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !data) {
    return { success: false, error: 'Perfil no encontrado.' };
  }

  return { success: true, data: data as Profile };
}

/**
 * Fetch the private profile of the current user.
 * RLS ensures only the owner or superadmin can read this.
 */
export async function getPrivateProfile(userId: string): Promise<ProfileResult<ProfilePrivate>> {
  const { data, error } = await supabase
    .from('profile_private')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    return { success: false, error: 'Perfil privado no encontrado.' };
  }

  return { success: true, data: data as ProfilePrivate };
}

/**
 * Update the public profile of the current user.
 * RLS policy ensures `auth.uid() = id`.
 */
export async function updateProfile(
  userId: string,
  input: UpdateProfileInput
): Promise<ProfileResult<Profile>> {
  const updateData: Record<string, unknown> = {
    ...input,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    return { success: false, error: 'Error al actualizar el perfil.' };
  }

  return { success: true, data: data as Profile };
}

/**
 * Update the private profile of the current user.
 * RLS policy ensures `auth.uid() = user_id`.
 */
export async function updatePrivateProfile(
  userId: string,
  input: UpdateProfilePrivateInput
): Promise<ProfileResult<ProfilePrivate>> {
  const updateData: Record<string, unknown> = {
    ...input,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('profile_private')
    .update(updateData)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    return { success: false, error: 'Error al actualizar la configuración privada.' };
  }

  return { success: true, data: data as ProfilePrivate };
}

/**
 * Fetch a user's full profile (public + private combined).
 * Only works for the current authenticated user or superadmin.
 */
export async function getFullProfile(userId: string): Promise<ProfileResult<Profile & { private: ProfilePrivate }>> {
  const [profileResult, privateResult] = await Promise.all([
    getProfileById(userId),
    getPrivateProfile(userId),
  ]);

  if (!profileResult.success || !profileResult.data) {
    return { success: false, error: profileResult.error };
  }

  if (!privateResult.success || !privateResult.data) {
    return { success: false, error: privateResult.error };
  }

  return {
    success: true,
    data: {
      ...profileResult.data,
      private: privateResult.data,
    },
  };
}
