import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lplvscrlodpwmrtezfuh.supabase.co';
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxwbHZzY3Jsb2Rwd21ydGV6ZnVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg1NTAwNTQsImV4cCI6MjEwNDEyNjA1NH0._dR1wrasFXzL8ckGikMmEd8AaB3fzgKZROyMfp5ITlo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export function isSupabaseConfigured(): boolean {
  return (
    typeof supabaseUrl === 'string' &&
    supabaseUrl.startsWith('https://') &&
    typeof supabaseAnonKey === 'string' &&
    supabaseAnonKey.length > 10
  );
}
