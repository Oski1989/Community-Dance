import { supabase } from '@/lib/supabase/client';
import type { AuditLog } from '@/types/database';

const SENSITIVE_KEYS = ['password', 'credit_card', 'card_number', 'cvv', 'secret', 'token', 'authorization'];

/**
 * Recursively sanitize details payload to remove passwords and payment secrets (Section 40).
 */
export function sanitizeAuditDetails(details: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(details)) {
    if (SENSITIVE_KEYS.some((s) => key.toLowerCase().includes(s))) {
      sanitized[key] = '[REDACTED_SENSITIVE_DATA]';
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      sanitized[key] = sanitizeAuditDetails(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Log a security or business audit event atomically via RPC.
 */
export async function logAuditEvent(
  orgId: string | null,
  userId: string | null,
  action: string,
  resource: string,
  details: Record<string, unknown> = {},
  ipAddress?: string | null
): Promise<{ success: boolean; logId?: string; error?: string }> {
  const cleanDetails = sanitizeAuditDetails(details);

  const { data, error } = await supabase.rpc('log_audit_event_atomic', {
    p_org_id: orgId,
    p_user_id: userId,
    p_action: action,
    p_resource: resource,
    p_details: cleanDetails,
    p_ip: ipAddress ?? null,
  });

  if (error) {
    console.error('[AuditService] Error logging audit event:', error);
    return { success: false, error: error.message };
  }

  return { success: true, logId: data };
}

/**
 * Get organization audit logs (for Owners/Superadmins).
 */
export async function getOrganizationAuditLogs(orgId: string): Promise<{ success: boolean; data?: AuditLog[]; error?: string }> {
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*, profiles(full_name, email)')
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    return { success: false, error: 'Error al obtener los registros de auditoría.' };
  }

  return { success: true, data: data as AuditLog[] };
}
