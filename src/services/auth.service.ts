/**
 * Auth Service — Encapsulates all Supabase Auth operations.
 * Never called directly from components; used by Server Actions / Route Handlers.
 */

import { supabase } from '@/lib/supabase/client';
import type { RegisterInput, LoginInput } from '@/schemas/auth';

export type AuthResult<T = null> = {
  success: boolean;
  data?: T;
  error?: string;
};

/**
 * Register a new user via Supabase Auth.
 * The profile & profile_private rows are created automatically
 * by the database trigger `handle_new_user()`.
 */
export async function registerUser(input: RegisterInput): Promise<AuthResult<{ userId: string }>> {
  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: {
        full_name: input.full_name,
        // SECURITY: Never pass role or admin status through metadata.
        // The trigger ignores it and always assigns 'user'.
      },
    },
  });

  if (error) {
    // Map common Supabase errors to user-friendly messages
    if (error.message.includes('already registered')) {
      return { success: false, error: 'Este email ya está registrado.' };
    }
    return { success: false, error: error.message };
  }

  if (!data.user) {
    return { success: false, error: 'No se pudo crear el usuario.' };
  }

  return { success: true, data: { userId: data.user.id } };
}

/**
 * Login with email and password.
 */
export async function loginUser(input: LoginInput): Promise<AuthResult<{ userId: string }>> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  });

  if (error) {
    return { success: false, error: 'Email o contraseña incorrectos.' };
  }

  if (!data.user) {
    return { success: false, error: 'No se pudo iniciar sesión.' };
  }

  return { success: true, data: { userId: data.user.id } };
}

/**
 * Logout the current user.
 */
export async function logoutUser(): Promise<AuthResult> {
  const { error } = await supabase.auth.signOut();

  if (error) {
    return { success: false, error: 'Error al cerrar sesión.' };
  }

  return { success: true };
}

/**
 * Send a password recovery email.
 */
export async function sendPasswordRecovery(email: string): Promise<AuthResult> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/reset-password`,
  });

  if (error) {
    return { success: false, error: 'Error al enviar el email de recuperación.' };
  }

  return { success: true };
}

/**
 * Update the user's password (requires active session from recovery link).
 */
export async function updatePassword(newPassword: string): Promise<AuthResult> {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    return { success: false, error: 'Error al actualizar la contraseña.' };
  }

  return { success: true };
}

/**
 * Get the current authenticated user session.
 */
export async function getCurrentSession() {
  const { data: { session }, error } = await supabase.auth.getSession();

  if (error || !session) {
    return null;
  }

  return session;
}

/**
 * Get the current authenticated user's ID.
 */
export async function getCurrentUserId(): Promise<string | null> {
  const session = await getCurrentSession();
  return session?.user?.id ?? null;
}
