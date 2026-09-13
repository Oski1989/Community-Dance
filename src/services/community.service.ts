import { supabase } from '@/lib/supabase/client';
import type { Quest, UserQuestProgress, CommunityPost } from '@/types/database';
import type {
  CreateQuestInput,
  SubmitQuestProofInput,
  ReviewQuestSubmissionInput,
  CreateCommunityPostInput,
} from '@/schemas/community';

export type CommunityResult<T = null> = {
  success: boolean;
  data?: T;
  error?: string;
};

// ─── QUESTS ───────────────────────────────────────────────────

export async function createQuest(
  teacherId: string,
  input: CreateQuestInput
): Promise<CommunityResult<Quest>> {
  const { data, error } = await supabase
    .from('quests')
    .insert({
      organization_id: input.organization_id,
      program_id: input.program_id ?? null,
      created_by_teacher_id: teacherId,
      title: input.title,
      description: input.description,
      points_reward: input.points_reward,
    })
    .select()
    .single();

  if (error || !data) {
    return { success: false, error: 'Error al crear el reto.' };
  }

  return { success: true, data: data as Quest };
}

export async function getOrganizationQuests(orgId: string): Promise<CommunityResult<Quest[]>> {
  const { data, error } = await supabase
    .from('quests')
    .select('*, programs(name), profiles(full_name)')
    .eq('organization_id', orgId)
    .eq('is_active', true);

  if (error) {
    return { success: false, error: 'Error al obtener los retos de la escuela.' };
  }

  return { success: true, data: data as Quest[] };
}

export async function submitQuestProof(
  userId: string,
  input: SubmitQuestProofInput
): Promise<CommunityResult<{ progress_id: string }>> {
  const { data, error } = await supabase.rpc('submit_quest_proof_atomic', {
    p_quest_id: input.quest_id,
    p_user_id: userId,
    p_submission_url: input.submission_url,
  });

  if (error) {
    return { success: false, error: error.message || 'Error al enviar la entrega.' };
  }

  if (!data || !data.success) {
    return { success: false, error: data?.error || 'No se pudo registrar la entrega.' };
  }

  return { success: true, data: { progress_id: data.progress_id } };
}

export async function reviewQuestSubmission(
  reviewerId: string,
  input: ReviewQuestSubmissionInput
): Promise<CommunityResult<{ status: string; points_earned: number }>> {
  const { data, error } = await supabase.rpc('review_quest_submission_atomic', {
    p_progress_id: input.progress_id,
    p_reviewer_id: reviewerId,
    p_approved: input.approved,
    p_notes: input.notes ?? null,
  });

  if (error) {
    return { success: false, error: error.message || 'Error al revisar la entrega.' };
  }

  if (!data || !data.success) {
    return { success: false, error: data?.error || 'No se pudo guardar la revisión.' };
  }

  return {
    success: true,
    data: {
      status: data.status,
      points_earned: data.points_earned,
    },
  };
}

// ─── COMMUNITY FEED ───────────────────────────────────────────

export async function createCommunityPost(
  userId: string,
  input: CreateCommunityPostInput
): Promise<CommunityResult<CommunityPost>> {
  const { data, error } = await supabase
    .from('community_posts')
    .insert({
      organization_id: input.organization_id,
      user_id: userId,
      content: input.content,
      media_url: input.media_url ?? null,
    })
    .select()
    .single();

  if (error || !data) {
    return { success: false, error: 'Error al publicar en el muro de la comunidad.' };
  }

  return { success: true, data: data as CommunityPost };
}

export async function getCommunityFeed(orgId: string): Promise<CommunityResult<CommunityPost[]>> {
  const { data, error } = await supabase
    .from('community_posts')
    .select('*, profiles(full_name, nickname, avatar_url)')
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false });

  if (error) {
    return { success: false, error: 'Error al cargar las publicaciones de la comunidad.' };
  }

  return { success: true, data: data as CommunityPost[] };
}
