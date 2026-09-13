import { z } from 'zod';

export const createProgramSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre del programa debe tener al menos 2 caracteres.')
    .max(100, 'El nombre no puede superar los 100 caracteres.')
    .trim(),
  description: z.string().max(500, 'La descripción no puede superar los 500 caracteres.').optional(),
});

export type CreateProgramInput = z.infer<typeof createProgramSchema>;

export const createLevelSchema = z.object({
  program_id: z.string().uuid('ID de programa no válido.'),
  name: z.string().min(1, 'El nombre del nivel es obligatorio.').trim(),
  order_index: z.number().int().min(0).default(0),
});

export type CreateLevelInput = z.infer<typeof createLevelSchema>;

export const createSublevelSchema = z.object({
  level_id: z.string().uuid('ID de nivel no válido.'),
  name: z.string().min(1, 'El nombre del subnivel es obligatorio.').trim(),
  order_index: z.number().int().min(0).default(0),
});

export type CreateSublevelInput = z.infer<typeof createSublevelSchema>;

export const createGroupSchema = z.object({
  organization_id: z.string().uuid('ID de organización no válido.'),
  sublevel_id: z.string().uuid('ID de subnivel no válido.').optional().nullable(),
  name: z
    .string()
    .min(2, 'El nombre del grupo debe tener al menos 2 caracteres.')
    .max(100, 'El nombre no puede superar los 100 caracteres.')
    .trim(),
  description: z.string().max(500).optional(),
  default_teacher_id: z.string().uuid('ID de profesor no válido.').optional().nullable(),
  capacity_total: z.number().int().positive('El aforo total debe ser un número entero mayor que 0.'),
  capacity_leaders: z.number().int().min(0).optional().nullable(),
  capacity_followers: z.number().int().min(0).optional().nullable(),
}).refine(
  (data) => {
    if (data.capacity_leaders !== undefined && data.capacity_leaders !== null &&
        data.capacity_followers !== undefined && data.capacity_followers !== null) {
      return (data.capacity_leaders + data.capacity_followers) <= data.capacity_total;
    }
    return true;
  },
  {
    message: 'La suma del cupo de leaders y followers no puede superar el aforo total.',
    path: ['capacity_total'],
  }
);

export type CreateGroupInput = z.infer<typeof createGroupSchema>;

export const createSessionSchema = z.object({
  organization_id: z.string().uuid('ID de organización no válido.'),
  group_id: z.string().uuid('ID de grupo no válido.'),
  teacher_id: z.string().uuid('ID de profesor no válido.').optional().nullable(),
  start_time: z.string().datetime({ message: 'Formato de fecha de inicio no válido (ISO/timestamptz).' }),
  end_time: z.string().datetime({ message: 'Formato de fecha de fin no válido (ISO/timestamptz).' }),
  capacity_total: z.number().int().positive('El aforo total debe ser un número mayor que 0.'),
  capacity_leaders: z.number().int().min(0).optional().nullable(),
  capacity_followers: z.number().int().min(0).optional().nullable(),
}).refine(
  (data) => new Date(data.end_time) > new Date(data.start_time),
  {
    message: 'La hora de fin debe ser posterior a la hora de inicio.',
    path: ['end_time'],
  }
).refine(
  (data) => new Date(data.start_time) > new Date(),
  {
    message: 'No se pueden crear sesiones en el pasado.',
    path: ['start_time'],
  }
);

export type CreateSessionInput = z.infer<typeof createSessionSchema>;
