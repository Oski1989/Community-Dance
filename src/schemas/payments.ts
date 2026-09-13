import { z } from 'zod';

export const createMembershipPlanSchema = z.object({
  organization_id: z.string().uuid('ID de organización no válido.'),
  name: z
    .string()
    .min(2, 'El nombre del plan debe tener al menos 2 caracteres.')
    .max(100, 'El nombre no puede superar los 100 caracteres.')
    .trim(),
  description: z.string().max(500).optional().nullable(),
  type: z.enum(['monthly_subscription', 'class_pack', 'drop_in']),
  price: z.number().positive('El precio debe ser un número positivo mayor que 0.'),
  class_credits: z.number().int().positive('Los créditos deben ser un entero positivo.').optional().nullable(),
  validity_days: z.number().int().positive('Los días de validez deben ser mayor que 0.').default(30),
});

export type CreateMembershipPlanInput = z.infer<typeof createMembershipPlanSchema>;

export const purchaseMembershipSchema = z.object({
  organization_id: z.string().uuid('ID de organización no válido.'),
  user_id: z.string().uuid('ID de usuario no válido.'),
  plan_id: z.string().uuid('ID de plan no válido.'),
  amount_paid: z.number().min(0, 'El importe pagado no puede ser negativo.'),
  payment_method: z.enum(['cash', 'card', 'transfer', 'stripe']).default('cash'),
  notes: z.string().optional().nullable(),
});

export type PurchaseMembershipInput = z.infer<typeof purchaseMembershipSchema>;

export const recordPartialPaymentSchema = z.object({
  payment_id: z.string().uuid('ID de pago no válido.'),
  amount_added: z.number().positive('El importe a añadir debe ser un número positivo.'),
  payment_method: z.enum(['cash', 'card', 'transfer', 'stripe']).default('cash'),
});

export type RecordPartialPaymentInput = z.infer<typeof recordPartialPaymentSchema>;
