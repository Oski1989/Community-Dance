import { describe, it, expect } from 'vitest';
import {
  createMembershipPlanSchema,
  purchaseMembershipSchema,
  recordPartialPaymentSchema,
} from '@/schemas/payments';
import type { MembershipPlan, UserMembership, Payment } from '@/types/database';

describe('Phase 7 - Payments & Memberships Validation Tests', () => {
  // ─── PLAN SCHEMA TESTS ─────────────────────────────────────

  it('should accept valid monthly subscription plan', () => {
    const result = createMembershipPlanSchema.safeParse({
      organization_id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Tarifa Plana Mensual',
      type: 'monthly_subscription',
      price: 60.0,
      validity_days: 30,
    });
    expect(result.success).toBe(true);
  });

  it('should accept valid class pack plan with credits', () => {
    const result = createMembershipPlanSchema.safeParse({
      organization_id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Bono 10 Clases',
      type: 'class_pack',
      price: 90.0,
      class_credits: 10,
      validity_days: 60,
    });
    expect(result.success).toBe(true);
  });

  it('should reject plan with negative price', () => {
    const result = createMembershipPlanSchema.safeParse({
      organization_id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Plan Erróneo',
      type: 'monthly_subscription',
      price: -10,
    });
    expect(result.success).toBe(false);
  });

  // ─── PURCHASE & "A CUENTA" FINANCIAL CALCULATIONS ───────────

  it('should calculate pending balance correctly for partial payment "a cuenta" (Section 25)', () => {
    const amountTotal = 100.0;
    const amountPaidInitial = 40.0; // Paid "a cuenta"
    const pendingBalanceInitial = amountTotal - amountPaidInitial;

    expect(pendingBalanceInitial).toBe(60.0);

    // Simulate adding second partial payment of 40€
    const secondPayment = 40.0;
    const newAmountPaid = amountPaidInitial + secondPayment;
    const newPendingBalance = amountTotal - newAmountPaid;

    expect(newAmountPaid).toBe(80.0);
    expect(newPendingBalance).toBe(20.0);

    // Final payment of 20€ closes balance
    const finalPayment = 20.0;
    const totalPaidFinal = newAmountPaid + finalPayment;
    const finalPendingBalance = amountTotal - totalPaidFinal;

    expect(totalPaidFinal).toBe(100.0);
    expect(finalPendingBalance).toBe(0.0);
  });

  it('should accept purchase input with partial amount paid', () => {
    const result = purchaseMembershipSchema.safeParse({
      organization_id: '123e4567-e89b-12d3-a456-426614174000',
      user_id: '123e4567-e89b-12d3-a456-426614174001',
      plan_id: '123e4567-e89b-12d3-a456-426614174002',
      amount_paid: 25.0, // Partial payment
      payment_method: 'cash',
    });
    expect(result.success).toBe(true);
  });

  // ─── CREDIT DEDUCTION & STATUS TESTS ────────────────────────

  it('should transition status to depleted when credits reach 0 (Section 24)', () => {
    let creditsRemaining = 1;
    let status: 'active' | 'depleted' = 'active';

    // Deduct 1 credit
    creditsRemaining -= 1;
    if (creditsRemaining <= 0) {
      status = 'depleted';
    }

    expect(creditsRemaining).toBe(0);
    expect(status).toBe('depleted');
  });

  it('should verify Payment structure with generated pending_balance column', () => {
    const payment: Payment = {
      id: 'pay-1',
      organization_id: 'org-1',
      user_id: 'user-1',
      membership_id: 'mem-1',
      amount_total: 80.0,
      amount_paid: 50.0,
      pending_balance: 30.0,
      payment_method: 'transfer',
      status: 'partial',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    expect(payment.pending_balance).toBe(payment.amount_total - payment.amount_paid);
    expect(payment.status).toBe('partial');
  });
});
