import { describe, it, expect } from 'vitest';
import { EmailService, ConsoleEmailProvider, type IEmailProvider } from '@/services/email.service';
import { sanitizeAuditDetails } from '@/services/audit.service';
import type { AuditLog, UserNotification } from '@/types/database';

describe('Phase 9 - Notifications, Integrations & Audit Logging Tests', () => {
  // ─── EMAIL SERVICE ADAPTER PATTERN TESTS ─────────────────────

  it('should support swapping email provider adapters (Section 33)', async () => {
    let mockSent = false;

    class TestEmailAdapter implements IEmailProvider {
      async sendEmail() {
        mockSent = true;
        return { success: true, messageId: 'test_123' };
      }
    }

    const emailSvc = new EmailService(new ConsoleEmailProvider());
    emailSvc.setProvider(new TestEmailAdapter());

    const result = await emailSvc.sendEmail('user@example.com', 'Test Subject', '<p>Test</p>');

    expect(result.success).toBe(true);
    expect(result.messageId).toBe('test_123');
    expect(mockSent).toBe(true);
  });

  // ─── AUDIT LOG DATA SANITIZATION TESTS ──────────────────────

  it('should sanitize sensitive keys (passwords, cards, secrets, tokens) from audit logs (Section 40)', () => {
    const rawDetails = {
      action_type: 'USER_REGISTER',
      email: 'user@example.com',
      password: 'SuperSecretPassword123!',
      credit_card: '4532-1234-5678-9012',
      nested_data: {
        api_secret: 'secret_key_abc',
        public_id: 'pub_999',
      },
    };

    const clean = sanitizeAuditDetails(rawDetails);

    expect(clean.email).toBe('user@example.com');
    expect(clean.password).toBe('[REDACTED_SENSITIVE_DATA]');
    expect(clean.credit_card).toBe('[REDACTED_SENSITIVE_DATA]');

    const nested = clean.nested_data as Record<string, unknown>;
    expect(nested.public_id).toBe('pub_999');
    expect(nested.api_secret).toBe('[REDACTED_SENSITIVE_DATA]');
  });

  // ─── TYPE STRUCTURE INTEGRITY TESTS ─────────────────────────

  it('should verify AuditLog structure', () => {
    const log: AuditLog = {
      id: 'log-1',
      organization_id: 'org-1',
      user_id: 'user-1',
      action: 'RESERVATION_CREATED',
      resource: 'sessions/sess-1',
      details_json: { status: 'confirmed' },
      ip_address: '192.168.1.1',
      created_at: new Date().toISOString(),
    };

    expect(log.action).toBe('RESERVATION_CREATED');
    expect(log.ip_address).toBe('192.168.1.1');
  });

  it('should verify UserNotification structure', () => {
    const notification: UserNotification = {
      id: 'notif-1',
      user_id: 'user-1',
      title: '¡Clase mañana!',
      message: 'Recuerda tu clase de Bachata a las 19:00',
      type: 'info',
      is_read: false,
      created_at: new Date().toISOString(),
    };

    expect(notification.is_read).toBe(false);
    expect(notification.type).toBe('info');
  });
});
