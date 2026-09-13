import { z } from 'zod';

// ─── AUTH SCHEMAS ─────────────────────────────────────────────

export const registerSchema = z.object({
  email: z
    .string()
    .email('Introduce un email válido.')
    .max(255, 'Email demasiado largo.'),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres.')
    .max(72, 'La contraseña no puede superar los 72 caracteres.'),
  confirmPassword: z.string(),
  full_name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres.')
    .max(100, 'El nombre no puede superar los 100 caracteres.')
    .trim(),
  accept_terms: z
    .boolean()
    .refine((val) => val === true, {
      message: 'Debes aceptar los términos y condiciones.',
    }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden.',
  path: ['confirmPassword'],
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z
    .string()
    .email('Introduce un email válido.'),
  password: z
    .string()
    .min(1, 'Introduce tu contraseña.'),
});

export type LoginInput = z.infer<typeof loginSchema>;

// ─── PROFILE SCHEMAS ──────────────────────────────────────────

export const updateProfileSchema = z.object({
  full_name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres.')
    .max(100, 'El nombre no puede superar los 100 caracteres.')
    .trim()
    .optional(),
  nickname: z
    .string()
    .max(50, 'El nickname no puede superar los 50 caracteres.')
    .trim()
    .nullable()
    .optional(),
  bio: z
    .string()
    .max(500, 'La biografía no puede superar los 500 caracteres.')
    .trim()
    .nullable()
    .optional(),
  avatar_url: z
    .string()
    .url('URL de avatar no válida.')
    .nullable()
    .optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const updateProfilePrivateSchema = z.object({
  phone: z
    .string()
    .max(20, 'El teléfono no puede superar los 20 caracteres.')
    .nullable()
    .optional(),
  dance_role_preference: z
    .enum(['leader', 'follower', 'both', 'unspecified'])
    .optional(),
});

export type UpdateProfilePrivateInput = z.infer<typeof updateProfilePrivateSchema>;

// ─── PASSWORD RECOVERY ────────────────────────────────────────

export const forgotPasswordSchema = z.object({
  email: z.string().email('Introduce un email válido.'),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres.')
    .max(72, 'La contraseña no puede superar los 72 caracteres.'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden.',
  path: ['confirmPassword'],
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
