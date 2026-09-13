import { z } from 'zod';

export const createOrganizationSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre de la organización debe tener al menos 2 caracteres.')
    .max(100, 'El nombre no puede superar los 100 caracteres.')
    .trim(),
  slug: z
    .string()
    .min(2, 'El slug debe tener al menos 2 caracteres.')
    .max(50, 'El slug no puede superar los 50 caracteres.')
    .regex(/^[a-z0-9-]+$/, 'El slug solo puede contener letras minúsculas, números y guiones.')
    .trim(),
  description: z
    .string()
    .max(500, 'La descripción no puede superar los 500 caracteres.')
    .trim()
    .optional(),
  contact_email: z.string().email('Email de contacto no válido.').optional(),
  contact_phone: z.string().max(20, 'Teléfono demasiado largo.').optional(),
  logo_url: z.string().url('URL del logo no válida.').optional(),
});

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;

export const updateOrganizationSchema = createOrganizationSchema.partial().omit({ slug: true });

export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;

export const inviteMemberSchema = z.object({
  email: z.string().email('Introduce un email válido.'),
  role: z.enum(['owner', 'admin', 'teacher', 'reception', 'student']),
});

export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;

export const updateMemberRoleSchema = z.object({
  role: z.enum(['owner', 'admin', 'teacher', 'reception', 'student']),
  is_active: z.boolean().optional(),
});

export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>;

export const acceptInvitationSchema = z.object({
  token: z.string().min(10, 'Token de invitación no válido.'),
});

export type AcceptInvitationInput = z.infer<typeof acceptInvitationSchema>;
