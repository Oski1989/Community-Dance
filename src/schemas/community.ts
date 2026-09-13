import { z } from 'zod';

export const createQuestSchema = z.object({
  organization_id: z.string().uuid('ID de organización no válido.'),
  program_id: z.string().uuid('ID de programa no válido.').optional().nullable(),
  title: z
    .string()
    .min(3, 'El título del reto debe tener al menos 3 caracteres.')
    .max(100, 'El título no puede superar los 100 caracteres.')
    .trim(),
  description: z
    .string()
    .min(10, 'La descripción debe tener al menos 10 caracteres.')
    .max(1000, 'La descripción no puede superar los 1000 caracteres.')
    .trim(),
  points_reward: z.number().int().positive('Los puntos de recompensa deben ser un entero positivo.').default(10),
});

export type CreateQuestInput = z.infer<typeof createQuestSchema>;

export const submitQuestProofSchema = z.object({
  quest_id: z.string().uuid('ID de reto no válido.'),
  submission_url: z.string().url('Introduce una URL de prueba válida (ej. vídeo, Instagram, Drive).'),
});

export type SubmitQuestProofInput = z.infer<typeof submitQuestProofSchema>;

export const reviewQuestSubmissionSchema = z.object({
  progress_id: z.string().uuid('ID de progreso no válido.'),
  approved: z.boolean(),
  notes: z.string().max(500, 'Las notas no pueden superar 500 caracteres.').optional().nullable(),
});

export type ReviewQuestSubmissionInput = z.infer<typeof reviewQuestSubmissionSchema>;

export const createCommunityPostSchema = z.object({
  organization_id: z.string().uuid('ID de organización no válido.'),
  content: z
    .string()
    .min(1, 'El mensaje no puede estar vacío.')
    .max(1000, 'El mensaje no puede superar 1000 caracteres.')
    .trim(),
  media_url: z.string().url('URL de archivo multimedia no válida.').optional().nullable(),
});

export type CreateCommunityPostInput = z.infer<typeof createCommunityPostSchema>;
