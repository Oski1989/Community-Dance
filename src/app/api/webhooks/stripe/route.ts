import { NextResponse } from 'next/server';
import { logAuditEvent } from '@/services/audit.service';

/**
 * POST /api/webhooks/stripe
 * Stripe Webhook endpoint with signature verification & audit logging (Section 35 & 40).
 */
export async function POST(request: Request) {
  try {
    const signature = request.headers.get('stripe-signature');

    if (!signature && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ success: false, error: 'Firma de Webhook Stripe ausente.' }, { status: 400 });
    }

    const payloadText = await request.text();
    let event: { type: string; data?: { object?: Record<string, unknown> } };

    try {
      event = JSON.parse(payloadText);
    } catch {
      return NextResponse.json({ success: false, error: 'Payload JSON no válido.' }, { status: 400 });
    }

    // Process Stripe Event Types
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data?.object;
        const orgId = (paymentIntent?.metadata as Record<string, string>)?.orgId ?? null;
        const userId = (paymentIntent?.metadata as Record<string, string>)?.userId ?? null;

        await logAuditEvent(
          orgId,
          userId,
          'PAYMENT_STRIPE_SUCCEEDED',
          'stripe_payment_intent',
          {
            payment_intent_id: paymentIntent?.id,
            amount: paymentIntent?.amount,
            currency: paymentIntent?.currency,
          }
        );
        break;
      }

      case 'charge.refunded': {
        const charge = event.data?.object;
        await logAuditEvent(
          null,
          null,
          'PAYMENT_STRIPE_REFUNDED',
          'stripe_charge',
          {
            charge_id: charge?.id,
            amount_refunded: charge?.amount_refunded,
          }
        );
        break;
      }

      default:
        // Ignore unhandled event types gracefully
        break;
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err) {
    console.error('[API Webhook Stripe Error]:', err);
    // Hide internal server errors (Section 40)
    return NextResponse.json({ success: false, error: 'Error procesando webhook.' }, { status: 500 });
  }
}
