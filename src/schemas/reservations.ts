import { z } from 'zod';

export const createReservationSchema = z.object({
  session_id: z.string().uuid('ID de sesión no válido.'),
  dance_role_used: z.enum(['leader', 'follower', 'unspecified']).default('unspecified'),
});

export type CreateReservationInput = z.infer<typeof createReservationSchema>;

export const cancelReservationSchema = z.object({
  reservation_id: z.string().uuid('ID de reserva no válido.'),
});

export type CancelReservationInput = z.infer<typeof cancelReservationSchema>;
