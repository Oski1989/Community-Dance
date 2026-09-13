import { supabase } from '@/lib/supabase/client';
import type { MembershipPlan, UserMembership, Payment } from '@/types/database';
import type {
  CreateMembershipPlanInput,
  PurchaseMembershipInput,
  RecordPartialPaymentInput,
} from '@/schemas/payments';

export type PaymentResult<T = null> = {
  success: boolean;
  data?: T;
  error?: string;
};

// ─── PLANS ───────────────────────────────────────────────────

export async function createMembershipPlan(input: CreateMembershipPlanInput): Promise<PaymentResult<MembershipPlan>> {
  const { data, error } = await supabase
    .from('membership_plans')
    .insert({
      organization_id: input.organization_id,
      name: input.name,
      description: input.description ?? null,
      type: input.type,
      price: input.price,
      class_credits: input.class_credits ?? null,
      validity_days: input.validity_days,
    })
    .select()
    .single();

  if (error || !data) {
    return { success: false, error: 'Error al crear el plan de membresía.' };
  }

  return { success: true, data: data as MembershipPlan };
}

export async function getOrganizationPlans(orgId: string): Promise<PaymentResult<MembershipPlan[]>> {
  const { data, error } = await supabase
    .from('membership_plans')
    .select('*')
    .eq('organization_id', orgId)
    .eq('is_active', true);

  if (error) {
    return { success: false, error: 'Error al cargar los planes.' };
  }

  return { success: true, data: data as MembershipPlan[] };
}

// ─── MEMBERSHIPS & PURCHASES ──────────────────────────────────

export async function purchaseMembership(
  input: PurchaseMembershipInput
): Promise<PaymentResult<{ membership: UserMembership; payment: Payment }>> {
  // 1. Get Plan details
  const { data: plan, error: planError } = await supabase
    .from('membership_plans')
    .select('*')
    .eq('id', input.plan_id)
    .single();

  if (planError || !plan) {
    return { success: false, error: 'El plan no existe.' };
  }

  const startDate = new Date();
  const endDate = new Date(startDate.getTime() + plan.validity_days * 86400000);

  // 2. Create User Membership
  const { data: membership, error: memError } = await supabase
    .from('user_memberships')
    .insert({
      organization_id: input.organization_id,
      user_id: input.user_id,
      plan_id: input.plan_id,
      credits_remaining: plan.class_credits ?? null,
      status: 'active',
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
    })
    .select()
    .single();

  if (memError || !membership) {
    return { success: false, error: 'Error al asignar la membresía al usuario.' };
  }

  // 3. Create Payment (Supports Partial "A Cuenta" Payment)
  const amountTotal = plan.price;
  const amountPaid = Math.min(input.amount_paid, amountTotal);
  const paymentStatus = amountPaid >= amountTotal ? 'completed' : amountPaid > 0 ? 'partial' : 'pending';

  const { data: payment, error: payError } = await supabase
    .from('payments')
    .insert({
      organization_id: input.organization_id,
      user_id: input.user_id,
      membership_id: membership.id,
      amount_total: amountTotal,
      amount_paid: amountPaid,
      payment_method: input.payment_method,
      status: paymentStatus,
      notes: input.notes ?? null,
    })
    .select()
    .single();

  if (payError || !payment) {
    return { success: false, error: 'Membresía asignada, pero falló el registro del pago.' };
  }

  return {
    success: true,
    data: {
      membership: membership as UserMembership,
      payment: payment as Payment,
    },
  };
}

/**
 * Deduct 1 credit from a user membership via RPC.
 */
export async function useMembershipCredit(
  membershipId: string,
  userId: string
): Promise<PaymentResult<{ credits_remaining?: number | null }>> {
  const { data, error } = await supabase.rpc('use_membership_credit_atomic', {
    p_membership_id: membershipId,
    p_user_id: userId,
  });

  if (error) {
    return { success: false, error: error.message || 'Error al consumir el crédito.' };
  }

  if (!data || !data.success) {
    return { success: false, error: data?.error || 'No se pudo consumir el crédito.' };
  }

  return {
    success: true,
    data: { credits_remaining: data.credits_remaining },
  };
}

/**
 * Get all active memberships for a user.
 */
export async function getUserMemberships(userId: string): Promise<PaymentResult<UserMembership[]>> {
  const { data, error } = await supabase
    .from('user_memberships')
    .select('*, membership_plans(name, type)')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) {
    return { success: false, error: 'Error al obtener tus bonos y membresías.' };
  }

  return { success: true, data: data as UserMembership[] };
}

/**
 * Record additional payment "a cuenta" to close pending balance.
 */
export async function recordPartialPayment(
  input: RecordPartialPaymentInput
): Promise<PaymentResult<Payment>> {
  const { data: existing, error: findError } = await supabase
    .from('payments')
    .select('*')
    .eq('id', input.payment_id)
    .single();

  if (findError || !existing) {
    return { success: false, error: 'Registro de pago no encontrado.' };
  }

  const newAmountPaid = Number(existing.amount_paid) + input.amount_added;
  const amountTotal = Number(existing.amount_total);
  const newPaidClamped = Math.min(newAmountPaid, amountTotal);
  const newStatus = newPaidClamped >= amountTotal ? 'completed' : 'partial';

  const { data, error } = await supabase
    .from('payments')
    .update({
      amount_paid: newPaidClamped,
      status: newStatus,
      payment_method: input.payment_method,
      updated_at: new Date().toISOString(),
    })
    .eq('id', input.payment_id)
    .select()
    .single();

  if (error || !data) {
    return { success: false, error: 'Error al actualizar el pago parcial.' };
  }

  return { success: true, data: data as Payment };
}
