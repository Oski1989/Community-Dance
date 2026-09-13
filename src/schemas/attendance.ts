import { z } from 'zod';

export const recordAttendanceSchema = z.object({
  session_id: z.string().uuid('ID de sesión no válido.'),
  user_id: z.string().uuid('ID de usuario no válido.'),
  status: z.enum(['pending', 'attended', 'absent', 'excused']),
  notes: z.string().max(300, 'Las notas no pueden superar los 300 caracteres.').optional().nullable(),
});

export type RecordAttendanceInput = z.infer<typeof recordAttendanceSchema>;

export const bulkAttendanceSchema = z.object({
  session_id: z.string().uuid('ID de sesión no válido.'),
  records: z.array(
    z.object({
      user_id: z.string().uuid('ID de usuario no válido.'),
      status: z.enum(['pending', 'attended', 'absent', 'excused']),
      notes: z.string().optional().nullable(),
    })
  ).min(1, 'Debe incluir al menos un registro de asistencia.'),
});

export type BulkAttendanceInput = z.infer<typeof bulkAttendanceSchema>;

export const qrCheckInSchema = z.object({
  session_id: z.string().uuid('ID de sesión no válido.'),
  user_id: z.string().uuid('ID de usuario no válido.'),
  token: z.string().min(1, 'Token de QR no válido.'),
});

export type QrCheckInInput = z.infer<typeof qrCheckInSchema>;
