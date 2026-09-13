import { supabase } from '@/lib/supabase/client';
import type { Organization, OrganizationMember, OrganizationInvitation } from '@/types/database';
import type {
  CreateOrganizationInput,
  UpdateOrganizationInput,
  InviteMemberInput,
  UpdateMemberRoleInput,
} from '@/schemas/organizations';

export type OrgResult<T = null> = {
  success: boolean;
  data?: T;
  error?: string;
};

/**
 * Create a new organization and assign the creator as 'owner'.
 */
export async function createOrganization(
  userId: string,
  input: CreateOrganizationInput
): Promise<OrgResult<{ organization: Organization; membership: OrganizationMember }>> {
  // 1. Check if slug is already taken
  const { data: existing } = await supabase
    .from('organizations')
    .select('id')
    .eq('slug', input.slug)
    .single();

  if (existing) {
    return { success: false, error: 'Ya existe una escuela con ese slug/identificador.' };
  }

  // 2. Create organization
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .insert({
      name: input.name,
      slug: input.slug,
      description: input.description ?? null,
      contact_email: input.contact_email ?? null,
      contact_phone: input.contact_phone ?? null,
      logo_url: input.logo_url ?? null,
    })
    .select()
    .single();

  if (orgError || !org) {
    return { success: false, error: 'Error al crear la organización.' };
  }

  // 3. Add creator as 'owner'
  const { data: member, error: memberError } = await supabase
    .from('organization_members')
    .insert({
      organization_id: org.id,
      user_id: userId,
      role: 'owner',
      is_active: true,
    })
    .select()
    .single();

  if (memberError || !member) {
    return { success: false, error: 'Organización creada, pero falló la asignación de rol.' };
  }

  return {
    success: true,
    data: {
      organization: org as Organization,
      membership: member as OrganizationMember,
    },
  };
}

/**
 * Get all organizations where the user is an active member.
 */
export async function getUserOrganizations(userId: string): Promise<OrgResult<Organization[]>> {
  const { data, error } = await supabase
    .from('organization_members')
    .select('organization_id, role, organizations(*)')
    .eq('user_id', userId)
    .eq('is_active', true);

  if (error) {
    return { success: false, error: 'Error al obtener tus escuelas.' };
  }

  const orgs = (data || [])
    .map((item) => item.organizations)
    .filter(Boolean) as unknown as Organization[];

  return { success: true, data: orgs };
}

/**
 * Get organization by ID or Slug.
 */
export async function getOrganizationBySlug(slug: string): Promise<OrgResult<Organization>> {
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !data) {
    return { success: false, error: 'Escuela no encontrada.' };
  }

  return { success: true, data: data as Organization };
}

/**
 * Update organization settings (Owners/Admins).
 */
export async function updateOrganization(
  orgId: string,
  input: UpdateOrganizationInput
): Promise<OrgResult<Organization>> {
  const { data, error } = await supabase
    .from('organizations')
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    })
    .eq('id', orgId)
    .select()
    .single();

  if (error || !data) {
    return { success: false, error: 'Error al actualizar la escuela.' };
  }

  return { success: true, data: data as Organization };
}

/**
 * List all members of an organization.
 */
export async function getOrganizationMembers(orgId: string): Promise<OrgResult<OrganizationMember[]>> {
  const { data, error } = await supabase
    .from('organization_members')
    .select('*, profiles(full_name, nickname, avatar_url)')
    .eq('organization_id', orgId);

  if (error) {
    return { success: false, error: 'Error al cargar los miembros.' };
  }

  return { success: true, data: data as OrganizationMember[] };
}

/**
 * Update a member's role or status within an organization.
 */
export async function updateMemberRole(
  memberId: string,
  input: UpdateMemberRoleInput
): Promise<OrgResult<OrganizationMember>> {
  const { data, error } = await supabase
    .from('organization_members')
    .update({
      role: input.role,
      is_active: input.is_active ?? true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', memberId)
    .select()
    .single();

  if (error || !data) {
    return { success: false, error: 'Error al cambiar el rol del miembro.' };
  }

  return { success: true, data: data as OrganizationMember };
}

/**
 * Create a new member invitation.
 */
export async function createInvitation(
  userId: string,
  orgId: string,
  input: InviteMemberInput
): Promise<OrgResult<OrganizationInvitation>> {
  const { data, error } = await supabase
    .from('organization_invitations')
    .insert({
      organization_id: orgId,
      email: input.email.toLowerCase(),
      role: input.role,
      invited_by: userId,
    })
    .select()
    .single();

  if (error || !data) {
    return { success: false, error: 'Error al crear la invitación.' };
  }

  return { success: true, data: data as OrganizationInvitation };
}

/**
 * Accept an invitation via security definer RPC function.
 */
export async function acceptInvitation(
  userId: string,
  token: string
): Promise<OrgResult<{ accepted: boolean }>> {
  const { data, error } = await supabase.rpc('accept_org_invitation', {
    p_token: token,
    p_user_id: userId,
  });

  if (error) {
    return { success: false, error: error.message || 'Error al aceptar la invitación.' };
  }

  return { success: true, data: { accepted: Boolean(data) } };
}
