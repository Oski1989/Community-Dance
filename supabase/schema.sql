-- ==========================================
-- DANCE XP - DATABASE DDL SCHEMA (SUPABASE)
-- ==========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles (Alumnos, Profesores y Administradores)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT CHECK (role IN ('admin', 'teacher', 'student')) DEFAULT 'student',
  membership_status TEXT CHECK (membership_status IN ('active', 'inactive', 'pending_approval')) DEFAULT 'inactive',
  avatar_url TEXT,
  phone TEXT,
  discipline_preference TEXT,
  payment_receipt_url TEXT,
  payment_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 2. Schools (Sedes gestionadas por profesores)
CREATE TABLE IF NOT EXISTS schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  has_social_engine BOOLEAN DEFAULT false, -- Feature Flag por Sede (ON/OFF)
  venue_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 3. Disciplines & Groups
CREATE TABLE IF NOT EXISTS disciplines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  discipline_id UUID REFERENCES disciplines(id),
  name TEXT NOT NULL,
  schedule_info TEXT
);

-- 4. Enrollments
CREATE TABLE IF NOT EXISTS enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  discipline_id UUID REFERENCES disciplines(id),
  current_level_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 5. Level Trees (Progresión Técnica)
CREATE TABLE IF NOT EXISTS level_trees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  discipline_id UUID REFERENCES disciplines(id),
  level_name TEXT NOT NULL,
  level_order INT NOT NULL,
  nodes JSONB NOT NULL
);

-- 6. Submissions (Revisión de Vídeos)
CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  node_id TEXT NOT NULL,
  video_url TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  feedback_audio_url TEXT,
  drawing_data JSONB,
  xp_awarded INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 7. Ledger de Puntos de Ritmo
CREATE TABLE IF NOT EXISTS rhythm_points_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  amount INT NOT NULL,
  source TEXT CHECK (source IN ('social_checkin', 'drill', 'quest', 'flash_prop', 'conversion')),
  venue_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 8. Flash Props
CREATE TABLE IF NOT EXISTS flash_props (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  default_xp INT DEFAULT 5
);

-- 9. Quests, Rewards & Redemptions (Social Engine)
CREATE TABLE IF NOT EXISTS quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  reward_points INT NOT NULL,
  valid_until TIMESTAMP WITH TIME ZONE,
  badge_icon TEXT
);

CREATE TABLE IF NOT EXISTS rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  cost_points INT NOT NULL
);

CREATE TABLE IF NOT EXISTS redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reward_id UUID REFERENCES rewards(id),
  student_id UUID REFERENCES profiles(id),
  status TEXT CHECK (status IN ('claimed', 'used')) DEFAULT 'claimed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- RLS Row Level Security Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE disciplines ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE level_trees ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE rhythm_points_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE flash_props ENABLE ROW LEVEL SECURITY;
ALTER TABLE quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE redemptions ENABLE ROW LEVEL SECURITY;

-- Public read access policies for app demo
CREATE POLICY "Public Read Access Profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Public Read Access Schools" ON schools FOR SELECT USING (true);
CREATE POLICY "Public Read Access Disciplines" ON disciplines FOR SELECT USING (true);
CREATE POLICY "Public Read Access Groups" ON groups FOR SELECT USING (true);
CREATE POLICY "Public Read Access Enrollments" ON enrollments FOR SELECT USING (true);
CREATE POLICY "Public Read Access Level Trees" ON level_trees FOR SELECT USING (true);
CREATE POLICY "Public Read Access Submissions" ON submissions FOR SELECT USING (true);
CREATE POLICY "Public Read Access Ledger" ON rhythm_points_ledger FOR SELECT USING (true);
CREATE POLICY "Public Read Access Flash Props" ON flash_props FOR SELECT USING (true);
CREATE POLICY "Public Read Access Quests" ON quests FOR SELECT USING (true);
CREATE POLICY "Public Read Access Rewards" ON rewards FOR SELECT USING (true);
CREATE POLICY "Public Read Access Redemptions" ON redemptions FOR SELECT USING (true);
