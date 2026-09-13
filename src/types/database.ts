export type GlobalRole = 'user' | 'superadmin';

export type OrgRole = 'owner' | 'admin' | 'teacher' | 'reception' | 'student';

export type DanceRolePreference = 'leader' | 'follower' | 'both' | 'unspecified';

export interface Profile {
  id: string;
  full_name: string;
  nickname?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  global_role: GlobalRole;
  created_at: string;
  updated_at: string;
}

export interface ProfilePrivate {
  user_id: string;
  email: string;
  phone?: string | null;
  dance_role_preference: DanceRolePreference;
  created_at: string;
  updated_at: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url?: string | null;
  description?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  branding_json?: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: OrgRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ─── TERMS & CONDITIONS (Phase 2) ────────────────────────────

export interface TermsVersion {
  id: string;
  version: string;
  title: string;
  content: string;
  published_at: string;
  is_current: boolean;
  created_at: string;
}

export interface UserTermsAcceptance {
  id: string;
  user_id: string;
  terms_version_id: string;
  accepted_at: string;
  ip_address?: string | null;
  user_agent?: string | null;
}

// ─── INVITATIONS (Phase 3) ───────────────────────────────────

export type InvitationStatus = 'pending' | 'accepted' | 'expired' | 'cancelled';

export interface OrganizationInvitation {
  id: string;
  organization_id: string;
  email: string;
  role: OrgRole;
  token: string;
  status: InvitationStatus;
  invited_by: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

// ─── ACADEMIC STRUCTURE (Phase 4) ────────────────────────────

export type SessionStatus = 'scheduled' | 'cancelled' | 'completed';

export interface Program {
  id: string;
  organization_id: string;
  name: string;
  description?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Level {
  id: string;
  program_id: string;
  name: string;
  order_index: number;
  created_at: string;
}

export interface Sublevel {
  id: string;
  level_id: string;
  name: string;
  order_index: number;
  created_at: string;
}

export interface Group {
  id: string;
  organization_id: string;
  sublevel_id?: string | null;
  name: string;
  description?: string | null;
  default_teacher_id?: string | null;
  capacity_total: number;
  capacity_leaders?: number | null;
  capacity_followers?: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Session {
  id: string;
  organization_id: string;
  group_id: string;
  teacher_id?: string | null;
  start_time: string;
  end_time: string;
  capacity_total: number;
  capacity_leaders?: number | null;
  capacity_followers?: number | null;
  status: SessionStatus;
  created_at: string;
  updated_at: string;
}

// ─── RESERVATIONS & WAITLISTS (Phase 5) ──────────────────────

export type ReservationStatus = 'confirmed' | 'waitlist' | 'cancelled';
export type DanceRoleUsed = 'leader' | 'follower' | 'unspecified';

export interface Reservation {
  id: string;
  organization_id: string;
  session_id: string;
  user_id: string;
  dance_role_used: DanceRoleUsed;
  status: ReservationStatus;
  created_at: string;
  updated_at: string;
}

export interface Waitlist {
  id: string;
  organization_id: string;
  session_id: string;
  user_id: string;
  dance_role_used: DanceRoleUsed;
  position: number;
  created_at: string;
}

// ─── ATTENDANCE & CHECK-IN (Phase 6) ─────────────────────────

export type AttendanceStatus = 'pending' | 'attended' | 'absent' | 'excused';

export interface Attendance {
  id: string;
  organization_id: string;
  session_id: string;
  user_id: string;
  reservation_id?: string | null;
  status: AttendanceStatus;
  checked_in_at?: string | null;
  checked_in_by?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

// ─── PAYMENTS & MEMBERSHIPS (Phase 7) ────────────────────────

export type MembershipType = 'monthly_subscription' | 'class_pack' | 'drop_in';
export type MembershipStatus = 'active' | 'expired' | 'depleted' | 'cancelled';
export type PaymentMethod = 'cash' | 'card' | 'transfer' | 'stripe';
export type PaymentStatus = 'completed' | 'partial' | 'pending' | 'refunded';

export interface MembershipPlan {
  id: string;
  organization_id: string;
  name: string;
  description?: string | null;
  type: MembershipType;
  price: number;
  class_credits?: number | null;
  validity_days: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserMembership {
  id: string;
  organization_id: string;
  user_id: string;
  plan_id: string;
  credits_remaining?: number | null;
  status: MembershipStatus;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  organization_id: string;
  user_id: string;
  membership_id?: string | null;
  amount_total: number;
  amount_paid: number;
  pending_balance: number;
  payment_method: PaymentMethod;
  status: PaymentStatus;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

// ─── QUESTS & COMMUNITY (Phase 8) ────────────────────────────

export type QuestSubmissionStatus = 'in_progress' | 'submitted' | 'approved' | 'rejected';

export interface Quest {
  id: string;
  organization_id: string;
  program_id?: string | null;
  created_by_teacher_id: string;
  title: string;
  description: string;
  points_reward: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserQuestProgress {
  id: string;
  organization_id: string;
  quest_id: string;
  user_id: string;
  status: QuestSubmissionStatus;
  submission_url?: string | null;
  reviewed_by?: string | null;
  points_earned: number;
  reviewer_notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CommunityPost {
  id: string;
  organization_id: string;
  user_id: string;
  content: string;
  media_url?: string | null;
  likes_count: number;
  created_at: string;
  updated_at: string;
}

// ─── AUDIT & NOTIFICATIONS (Phase 9) ─────────────────────────

export interface AuditLog {
  id: string;
  organization_id?: string | null;
  user_id?: string | null;
  action: string;
  resource: string;
  details_json?: Record<string, unknown> | null;
  ip_address?: string | null;
  created_at: string;
}

export interface UserNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type?: string | null;
  is_read: boolean;
  created_at: string;
}
