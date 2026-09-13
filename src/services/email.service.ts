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
    console.log(`[EmailProvider] Sending to ${payload.to} | Subject: ${payload.subject}`);
    return { success: true, messageId: `msg_${Date.now()}` };
  }
}

/**
 * Global Email Service Singleton with Injectable Provider
 */
export class EmailService {
  private provider: IEmailProvider;

  constructor(provider?: IEmailProvider) {
    this.provider = provider || new ConsoleEmailProvider();
  }

  setProvider(newProvider: IEmailProvider) {
    this.provider = newProvider;
  }

  async sendEmail(to: string, subject: string, html: string) {
    return this.provider.sendEmail({ to, subject, html });
  }
}

export const emailService = new EmailService();
