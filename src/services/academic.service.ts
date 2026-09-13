import { supabase } from '@/lib/supabase/client';
import type { Program, Level, Sublevel, Group, Session } from '@/types/database';
import type {
  CreateProgramInput,
  CreateLevelInput,
  CreateSublevelInput,
  CreateGroupInput,
  CreateSessionInput,
} from '@/schemas/academic';

export type AcademicResult<T = null> = {
  success: boolean;
  data?: T;
  error?: string;
};

// ─── PROGRAMS ─────────────────────────────────────────────────

export async function createProgram(
  orgId: string,
  input: CreateProgramInput
): Promise<AcademicResult<Program>> {
  const { data, error } = await supabase
    .from('programs')
    .insert({
      organization_id: orgId,
      name: input.name,
      description: input.description ?? null,
    })
    .select()
    .single();

  if (error || !data) {
    return { success: false, error: 'Error al crear el programa de baile.' };
  }

  return { success: true, data: data as Program };
}

export async function getOrganizationPrograms(orgId: string): Promise<AcademicResult<Program[]>> {
  const { data, error } = await supabase
    .from('programs')
    .select('*')
    .eq('organization_id', orgId)
    .eq('is_active', true);

  if (error) {
    return { success: false, error: 'Error al obtener los programas.' };
  }

  return { success: true, data: data as Program[] };
}

// ─── LEVELS & SUBLEVELS ───────────────────────────────────────

export async function createLevel(input: CreateLevelInput): Promise<AcademicResult<Level>> {
  const { data, error } = await supabase
    .from('levels')
    .insert({
      program_id: input.program_id,
      name: input.name,
      order_index: input.order_index,
    })
    .select()
    .single();

  if (error || !data) {
    return { success: false, error: 'Error al crear el nivel.' };
  }

  return { success: true, data: data as Level };
}

export async function createSublevel(input: CreateSublevelInput): Promise<AcademicResult<Sublevel>> {
  const { data, error } = await supabase
    .from('sublevels')
    .insert({
      level_id: input.level_id,
      name: input.name,
      order_index: input.order_index,
    })
    .select()
    .single();

  if (error || !data) {
    return { success: false, error: 'Error al crear el subnivel.' };
  }

  return { success: true, data: data as Sublevel };
}

// ─── GROUPS ───────────────────────────────────────────────────

export async function createGroup(input: CreateGroupInput): Promise<AcademicResult<Group>> {
  const { data, error } = await supabase
    .from('groups')
    .insert({
      organization_id: input.organization_id,
      sublevel_id: input.sublevel_id ?? null,
      name: input.name,
      description: input.description ?? null,
      default_teacher_id: input.default_teacher_id ?? null,
      capacity_total: input.capacity_total,
      capacity_leaders: input.capacity_leaders ?? null,
      capacity_followers: input.capacity_followers ?? null,
    })
    .select()
    .single();

  if (error || !data) {
    return { success: false, error: 'Error al crear el grupo.' };
  }

  return { success: true, data: data as Group };
}

export async function getOrganizationGroups(orgId: string): Promise<AcademicResult<Group[]>> {
  const { data, error } = await supabase
    .from('groups')
    .select('*, profiles(full_name)')
    .eq('organization_id', orgId)
    .eq('is_active', true);

  if (error) {
    return { success: false, error: 'Error al cargar los grupos.' };
  }

  return { success: true, data: data as Group[] };
}

// ─── SESSIONS ─────────────────────────────────────────────────

export async function createSession(input: CreateSessionInput): Promise<AcademicResult<Session>> {
  // Validar fecha futura en backend (Sección 14)
  if (new Date(input.start_time) <= new Date()) {
    return { success: false, error: 'No se pueden programar sesiones en el pasado.' };
  }

  const { data, error } = await supabase
    .from('sessions')
    .insert({
      organization_id: input.organization_id,
      group_id: input.group_id,
      teacher_id: input.teacher_id ?? null,
      start_time: input.start_time,
      end_time: input.end_time,
      capacity_total: input.capacity_total,
      capacity_leaders: input.capacity_leaders ?? null,
      capacity_followers: input.capacity_followers ?? null,
      status: 'scheduled',
    })
    .select()
    .single();

  if (error || !data) {
    return { success: false, error: 'Error al crear la sesión de clase.' };
  }

  return { success: true, data: data as Session };
}

export async function getOrganizationSessions(
  orgId: string,
  groupId?: string
): Promise<AcademicResult<Session[]>> {
  let query = supabase
    .from('sessions')
    .select('*, groups(name), profiles(full_name)')
    .eq('organization_id', orgId)
    .order('start_time', { ascending: true });

  if (groupId) {
    query = query.eq('group_id', groupId);
  }

  const { data, error } = await query;

  if (error) {
    return { success: false, error: 'Error al obtener el calendario de sesiones.' };
  }

  return { success: true, data: data as Session[] };
}
