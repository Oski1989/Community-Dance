/**
 * Decoupled Email Service Architecture (Section 33 & 34).
 * Allows changing provider (Resend, SendGrid, SMTP) without modifying business logic.
 */

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

export interface IEmailProvider {
  sendEmail(payload: EmailPayload): Promise<{ success: boolean; messageId?: string; error?: string }>;
}

/**
 * Mock / Console Adapter for Development and Testing
 */
export class ConsoleEmailProvider implements IEmailProvider {
  async sendEmail(payload: EmailPayload): Promise<{ success: boolean; messageId?: string }> {
    console.log(`[EmailProvider - Console/Fallback] Registration welcome email to ${payload.to} | Subject: ${payload.subject}`);
    return { success: true, messageId: `msg_${Date.now()}` };
  }
}

/**
 * Resend Email Provider (Free Tier Supported)
 */
export class ResendEmailProvider implements IEmailProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async sendEmail(payload: EmailPayload): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Plaza Dance <onboarding@resend.dev>',
          to: payload.to,
          subject: payload.subject,
          html: payload.html,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.warn('[Resend Provider] Failed:', errText);
        return { success: false, error: errText };
      }

      const data = await res.json();
      return { success: true, messageId: data.id };
    } catch (err: any) {
      console.warn('[Resend Provider] Exception:', err.message);
      return { success: false, error: err.message };
    }
  }
}

/**
 * Global Email Service Singleton with Injectable Provider
 */
export class EmailService {
  private provider: IEmailProvider;

  constructor(provider?: IEmailProvider) {
    const resendKey = process.env.RESEND_API_KEY || process.env.NEXT_PUBLIC_RESEND_API_KEY;
    if (resendKey) {
      this.provider = new ResendEmailProvider(resendKey);
    } else {
      this.provider = provider || new ConsoleEmailProvider();
    }
  }

  setProvider(newProvider: IEmailProvider) {
    this.provider = newProvider;
  }

  async sendEmail(to: string, subject: string, html: string) {
    return this.provider.sendEmail({ to, subject, html });
  }
}

export const emailService = new EmailService();

