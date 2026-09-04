-- ==========================================
-- DANCEXP / APP MASTER - SUPABASE DATABASE SCHEMA & INITIAL DATA
-- Complete SQL script to set up tables, RLS, triggers, and seed data.
-- ==========================================

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------
-- 1. PROFILES TABLE (Linked to auth.users)
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'school', 'admin')),
  membership_status TEXT NOT NULL DEFAULT 'pending_approval' CHECK (membership_status IN ('active', 'inactive', 'pending_approval')),
  membership_start_date TIMESTAMP WITH TIME ZONE,
  membership_expiry_date TIMESTAMP WITH TIME ZONE,
  is_paying BOOLEAN DEFAULT TRUE,
  avatar_url TEXT,
  phone TEXT,
  gender TEXT,
  discipline_preference TEXT,
  dance_role TEXT CHECK (dance_role IN ('leader', 'follower', 'both')),
  marital_status TEXT CHECK (marital_status IN ('single', 'in_relationship', 'married', 'other')),
  schools_taught TEXT[],
  bio TEXT,
  social_instagram TEXT,
  social_youtube TEXT,
  social_tiktok TEXT,
  featured_video_url TEXT,
  enrolled_discipline_ids TEXT[],
  enrolled_disciplines_status JSONB DEFAULT '{}'::jsonb,
  enrolled_receipt_urls JSONB DEFAULT '{}'::jsonb,
  payment_receipt_url TEXT,
  payment_note TEXT,
  is_public_in_rankings BOOLEAN DEFAULT TRUE,
  is_public_in_technical_ranking BOOLEAN DEFAULT TRUE,
  is_public_in_rhythm_ranking BOOLEAN DEFAULT TRUE,
  is_public_in_streak_ranking BOOLEAN DEFAULT TRUE,
  xp INTEGER DEFAULT 0,
  rhythm_points INTEGER DEFAULT 0,
  victory_streak_weeks INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ------------------------------------------
-- 2. SCHOOLS TABLE
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS public.schools (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  venue_name TEXT,
  has_social_engine BOOLEAN DEFAULT TRUE,
  membership_fee_monthly NUMERIC DEFAULT 50,
  offered_discipline_ids TEXT[],
  active_event_qr JSONB,
  levels_count INTEGER DEFAULT 4,
  monthly_event_limit INTEGER DEFAULT 4,
  is_rankings_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ------------------------------------------
-- 3. DISCIPLINES / DANCE PROGRAMS TABLE
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS public.disciplines (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  style_tag TEXT,
  description TEXT,
  creator_teacher_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  shared_teacher_ids UUID[],
  target_audience TEXT,
  recommended_bpm TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ------------------------------------------
-- 4. LEVEL TREES & SYLLABUS TABLE
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS public.level_trees (
  id TEXT PRIMARY KEY,
  discipline_id TEXT REFERENCES public.disciplines(id) ON DELETE CASCADE,
  level_name TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  sections JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ------------------------------------------
-- 5. SUBMISSIONS TABLE (Video Homework)
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS public.submissions (
  id TEXT PRIMARY KEY,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  node_id TEXT NOT NULL,
  video_url TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  xp_awarded INTEGER DEFAULT 0,
  drawing_data JSONB,
  audio_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ------------------------------------------
-- 6. DANCE CLASSES TABLE
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS public.classes (
  id TEXT PRIMARY KEY,
  school_id TEXT REFERENCES public.schools(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  discipline TEXT NOT NULL,
  schedule TEXT NOT NULL,
  location TEXT NOT NULL,
  student_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ------------------------------------------
-- 7. QUESTS & MISSIONS TABLE
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS public.quests (
  id TEXT PRIMARY KEY,
  school_id TEXT REFERENCES public.schools(id) ON DELETE CASCADE,
  creator_teacher_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  creator_type TEXT DEFAULT 'school' CHECK (creator_type IN ('teacher', 'school')),
  discipline_id TEXT,
  title TEXT NOT NULL,
  description TEXT,
  reward_points INTEGER DEFAULT 50,
  reward_type TEXT DEFAULT 'rhythm_points',
  reward_text TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ------------------------------------------
-- 8. QUEST SUBMISSIONS TABLE
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS public.quest_submissions (
  id TEXT PRIMARY KEY,
  quest_id TEXT REFERENCES public.quests(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  quest_title TEXT NOT NULL,
  reward_points INTEGER DEFAULT 50,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ------------------------------------------
-- 9. REWARDS & REDEMPTIONS
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS public.rewards (
  id TEXT PRIMARY KEY,
  school_id TEXT REFERENCES public.schools(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  cost_points INTEGER NOT NULL,
  description TEXT,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.redemptions (
  id TEXT PRIMARY KEY,
  reward_id TEXT REFERENCES public.rewards(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  reward_title TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ------------------------------------------
-- 10. FLASH PROPS TABLE
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS public.flash_props (
  id TEXT PRIMARY KEY,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  xp INTEGER DEFAULT 50,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ------------------------------------------
-- 11. WEEKLY SOCIAL EVENTS TABLE
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS public.weekly_socials (
  id TEXT PRIMARY KEY,
  school_id TEXT REFERENCES public.schools(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  day_of_week TEXT NOT NULL,
  time TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT NOT NULL,
  banner_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Enable RLS and create permissive policies for public app functionality
-- ------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disciplines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.level_trees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quest_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flash_props ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_socials ENABLE ROW LEVEL SECURITY;

-- Allow public read access to essential data
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile or admin/teacher" ON public.profiles FOR ALL USING (true);

CREATE POLICY "Schools viewable by everyone" ON public.schools FOR ALL USING (true);
CREATE POLICY "Disciplines viewable by everyone" ON public.disciplines FOR ALL USING (true);
CREATE POLICY "Level trees viewable by everyone" ON public.level_trees FOR ALL USING (true);
CREATE POLICY "Submissions viewable by everyone" ON public.submissions FOR ALL USING (true);
CREATE POLICY "Classes viewable by everyone" ON public.classes FOR ALL USING (true);
CREATE POLICY "Quests viewable by everyone" ON public.quests FOR ALL USING (true);
CREATE POLICY "Quest submissions viewable by everyone" ON public.quest_submissions FOR ALL USING (true);
CREATE POLICY "Rewards viewable by everyone" ON public.rewards FOR ALL USING (true);
CREATE POLICY "Redemptions viewable by everyone" ON public.redemptions FOR ALL USING (true);
CREATE POLICY "Flash props viewable by everyone" ON public.flash_props FOR ALL USING (true);
CREATE POLICY "Weekly socials viewable by everyone" ON public.weekly_socials FOR ALL USING (true);

-- ------------------------------------------
-- AUTOMATIC PROFILE CREATION TRIGGER ON SIGNUP
-- ------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    full_name,
    email,
    role,
    membership_status,
    discipline_preference,
    dance_role,
    marital_status,
    gender,
    xp,
    rhythm_points,
    victory_streak_weeks
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    'pending_approval',
    COALESCE(NEW.raw_user_meta_data->>'discipline_preference', 'Salsa en Línea'),
    'leader',
    'single',
    'Masculino',
    0,
    0,
    0
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger execution on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------
-- SEED INITIAL SCHOOL DATA
-- ------------------------------------------
INSERT INTO public.schools (id, name, city, venue_name, has_social_engine, membership_fee_monthly)
VALUES ('school-1', 'Victorys Baile & Social Club', 'Palma de Mallorca', 'Discoteca Victorys Palma', true, 50)
ON CONFLICT (id) DO NOTHING;
