export type Role = 'admin' | 'school' | 'teacher' | 'student';

export type MembershipStatus = 'active' | 'inactive' | 'pending_approval';

export type SubmissionStatus = 'pending' | 'approved' | 'rejected';

export type RhythmPointSource = 'social_checkin' | 'drill' | 'quest' | 'flash_prop' | 'conversion';

export type RedemptionStatus = 'claimed' | 'used';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: Role;
  membership_status: MembershipStatus;
  is_paying?: boolean;
  membership_start_date?: string;
  avatar_url?: string;
  phone?: string;
  discipline_preference?: string;
  enrolled_discipline_ids?: string[];
  enrolled_disciplines_status?: Record<string, 'active' | 'pending_approval' | 'inactive'>;
  enrolled_receipt_urls?: Record<string, string>;
  is_public_in_rankings?: boolean;
  is_public_in_technical_ranking?: boolean;
  is_public_in_rhythm_ranking?: boolean;
  is_public_in_streak_ranking?: boolean;
  payment_receipt_url?: string;
  payment_note?: string;
  created_at?: string;
  xp?: number;
  rhythm_points?: number;
  victory_streak_weeks?: number;

  // Student Dance & Social Match Profile Fields
  dance_role?: 'leader' | 'follower' | 'both';
  marital_status?: 'single' | 'in_relationship' | 'married' | 'other';
  gender?: string;
  favorite_style?: string;

  // Teacher Profile Fields
  bio?: string;
  schools_taught?: string[];
  social_instagram?: string;
  social_youtube?: string;
  social_tiktok?: string;
  video_links?: string[];
  featured_video_url?: string;
}

export interface DanceClass {
  id: string;
  school_id: string;
  teacher_id: string;
  name: string;
  discipline: string;
  schedule: string;
  location: string;
  student_count?: number;
}

export interface EventQR {
  id: string;
  title: string;
  code: string;
  points: number;
  valid_until: string;
  created_at: string;
}

export interface School {
  id: string;
  teacher_id: string;
  name: string;
  city: string;
  has_social_engine: boolean;
  venue_name?: string;
  is_rankings_public?: boolean;
  levels_count?: number;
  xp_per_level?: number;
  level_names?: string[];
  points_name?: string;
  membership_fee_monthly?: number;
  rhythm_conversion_rate?: number;
  monthly_event_limit?: number;
  offered_discipline_ids?: string[];
  active_event_qr?: EventQR;
  created_at?: string;
}

export interface Discipline {
  id: string;
  name: string;
  style_tag?: string;
  description?: string;
  target_audience?: string;
  recommended_bpm?: string;
  resource_links?: string[];
  creator_teacher_id?: string;
  is_shared?: boolean;
  shared_teacher_ids?: string[];
  pending_shared_teacher_ids?: string[];
  linked_school_ids?: string[];
}

export interface WeeklySocial {
  id: string;
  school_id: string;
  title: string;
  day_of_week: string;
  time: string;
  location: string;
  description: string;
  banner_url?: string;
  created_at?: string;
}

export interface Group {
  id: string;
  school_id: string;
  discipline_id: string;
  name: string;
  schedule_info?: string;
}

export interface LevelNode {
  id: string;
  title: string;
  description: string;
  required_xp: number;
  unlocked?: boolean;
  completed?: boolean;
  video_sample?: string;
}

export interface SyllabusSection {
  id: string;
  title: string;
  items: LevelNode[];
}

export interface LevelTree {
  id: string;
  school_id: string;
  discipline_id: string;
  level_name: string;
  level_order: number;
  sections?: SyllabusSection[];
  nodes: LevelNode[];
}

export interface Submission {
  id: string;
  student_id: string;
  node_id: string;
  video_url: string;
  status: SubmissionStatus;
  feedback?: string;
  grade?: number;
  feedback_audio_url?: string;
  drawing_data?: any;
  xp_awarded: number;
  created_at?: string;
  student_name?: string;
  node_title?: string;
}

export interface RhythmPointsLedger {
  id: string;
  student_id: string;
  school_id: string;
  amount: number;
  source: RhythmPointSource;
  venue_name?: string;
  created_at?: string;
}

export interface FlashProp {
  id: string;
  teacher_id: string;
  title: string;
  default_xp: number;
}

export interface Quest {
  id: string;
  school_id: string;
  discipline_id?: string;
  creator_type?: 'teacher' | 'school';
  title: string;
  description: string;
  reward_points: number;
  reward_type?: 'rhythm_points' | 'school_reward';
  reward_text?: string;
  valid_until?: string;
  badge_icon?: string;
  completed?: boolean;
  is_active?: boolean;
}

export interface QuestSubmission {
  id: string;
  quest_id: string;
  student_id: string;
  student_name: string;
  quest_title: string;
  reward_points: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface Reward {
  id: string;
  school_id: string;
  title: string;
  cost_points: number;
  badge_icon?: string;
}

export interface Redemption {
  id: string;
  reward_id: string;
  student_id: string;
  status: RedemptionStatus;
  created_at?: string;
  reward_title?: string;
  cost_points?: number;
}
