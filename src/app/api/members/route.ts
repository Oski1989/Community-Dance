import { NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase/server';

interface ProfileMeta {
  bio?: string;
  danceRole?: string;
  discipline?: string;
  isPublic?: boolean;
  instagram?: string;
  tiktok?: string;
  facebook?: string;
  youtube?: string;
  password?: string;
}

function parseMeta(nickname: string | null | undefined): ProfileMeta {
  if (!nickname) return {};
  try {
    if (nickname.startsWith('{') && nickname.endsWith('}')) {
      return JSON.parse(nickname);
    }
  } catch {
    // Not JSON, plain nickname
  }
  return {};
}

function stringifyMeta(existingNickname: string | null | undefined, newMeta: Partial<ProfileMeta>): string {
  const current = parseMeta(existingNickname);
  const merged = { ...current, ...newMeta };
  return JSON.stringify(merged);
}

/**
 * GET /api/members
 * Returns all members from Supabase (profiles + organization_members)
 * Bypasses RLS to ensure accurate multi-device sync
 */
export async function GET() {
  try {
    const supabase = createAdminSupabaseClient();

    const [profilesRes, orgMembersRes, orgsRes] = await Promise.all([
      supabase.from('profiles').select('*'),
      supabase.from('organization_members').select('*'),
      supabase.from('organizations').select('id, name').limit(1),
    ]);

    if (profilesRes.error) {
      return NextResponse.json({ success: false, error: profilesRes.error.message }, { status: 500 });
    }

    const orgMap = new Map<string, string>();
    if (orgMembersRes.data) {
      orgMembersRes.data.forEach((om: any) => {
        orgMap.set(om.user_id, om.role);
      });
    }

    const members = (profilesRes.data || []).map((p: any) => {
      const meta = parseMeta(p.nickname);
      const orgRole = orgMap.get(p.id);

      let role = 'student';
      if (p.system_role === 'superadmin') {
        role = 'superadmin';
      } else if (orgRole) {
        role = orgRole;
      }

      return {
        id: p.id,
        name: p.full_name || 'Usuario',
        email: p.email || `${(p.full_name || 'usuario').toLowerCase().replace(/\s+/g, '')}@comunydance.com`,
        role,
        status: 'Activo',
        isPublic: meta.isPublic ?? true,
        discipline: meta.discipline || (role === 'teacher' ? 'Profesor SBK' : 'Salsa & Bachata'),
        danceRole: meta.danceRole || 'both',
        instagram: meta.instagram || '',
        tiktok: meta.tiktok || '',
        facebook: meta.facebook || '',
        youtube: meta.youtube || '',
        bio: meta.bio || '',
        avatar: role === 'superadmin' ? '👑' : role === 'teacher' ? '🕺' : role === 'reception' ? '👩‍💼' : '💃',
        avatarUrl: p.avatar_url || '',
        password: meta.password || undefined,
      };
    });

    return NextResponse.json({ success: true, members, organization: orgsRes.data?.[0] || null });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

/**
 * POST /api/members
 * Creates a new member in Supabase (profiles + organization_members)
 */
export async function POST(request: Request) {
  try {
    const supabase = createAdminSupabaseClient();
    const body = await request.json();
    const { name, email, password, role = 'student', discipline, danceRole = 'both', phone, bio } = body;

    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanName = (name || '').trim();
    const isSuper = role === 'superadmin';

    // 1. Get primary organization
    const orgRes = await supabase.from('organizations').select('id').limit(1);
    const orgId = orgRes.data?.[0]?.id || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

    // 2. Generate standard UUID
    const userId = crypto.randomUUID();

    // 3. Store extra metadata in nickname column (JSON encoded)
    const meta: ProfileMeta = {
      bio: bio || '',
      danceRole: danceRole || 'both',
      discipline: discipline || (role === 'teacher' ? 'Profesor SBK' : 'Salsa & Bachata'),
      isPublic: true,
      password: password || undefined,
    };

    // 4. Insert into profiles
    const profileInsert = {
      id: userId,
      email: cleanEmail,
      full_name: cleanName,
      phone: phone || null,
      system_role: isSuper ? 'superadmin' : 'user',
      nickname: JSON.stringify(meta),
      updated_at: new Date().toISOString(),
    };

    const { error: pError } = await supabase.from('profiles').insert(profileInsert);
    if (pError) {
      return NextResponse.json({ success: false, error: pError.message }, { status: 400 });
    }

    // 5. Insert into organization_members
    const orgMemberInsert = {
      organization_id: orgId,
      user_id: userId,
      role: isSuper ? 'owner' : (role as any),
    };

    const { error: omError } = await supabase.from('organization_members').insert(orgMemberInsert);
    if (omError) {
      console.warn('organization_members insert note:', omError);
    }

    const created = {
      id: userId,
      name: cleanName,
      email: cleanEmail,
      role,
      status: 'Activo',
      isPublic: true,
      discipline: meta.discipline,
      danceRole: meta.danceRole,
      bio: meta.bio,
      phone: phone || '',
      avatar: role === 'superadmin' ? '👑' : role === 'teacher' ? '🕺' : role === 'reception' ? '👩‍💼' : '💃',
      password,
    };

    return NextResponse.json({ success: true, member: created });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

/**
 * PATCH /api/members
 * Updates member details and role in Supabase
 */
export async function PATCH(request: Request) {
  try {
    const supabase = createAdminSupabaseClient();
    const body = await request.json();
    const { userId, updates } = body;

    if (!userId) {
      return NextResponse.json({ success: false, error: 'userId is required' }, { status: 400 });
    }

    const isSuper = updates.role === 'superadmin';

    // 1. Fetch existing profile to preserve metadata
    const { data: existingProf } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();

    const existingMeta = parseMeta(existingProf?.nickname);
    const updatedMeta: ProfileMeta = {
      ...existingMeta,
      ...(updates.bio !== undefined ? { bio: updates.bio } : {}),
      ...(updates.danceRole !== undefined ? { danceRole: updates.danceRole } : {}),
      ...(updates.discipline !== undefined ? { discipline: updates.discipline } : {}),
      ...(updates.isPublic !== undefined ? { isPublic: updates.isPublic } : {}),
      ...(updates.instagram !== undefined ? { instagram: updates.instagram } : {}),
      ...(updates.tiktok !== undefined ? { tiktok: updates.tiktok } : {}),
      ...(updates.facebook !== undefined ? { facebook: updates.facebook } : {}),
      ...(updates.youtube !== undefined ? { youtube: updates.youtube } : {}),
      ...(updates.password !== undefined ? { password: updates.password } : {}),
    };

    // 2. Build profile update payload (only columns that exist in DB)
    const profileUpdate: Record<string, any> = {
      updated_at: new Date().toISOString(),
      nickname: JSON.stringify(updatedMeta),
    };

    if (updates.name !== undefined) profileUpdate.full_name = updates.name;
    if (updates.phone !== undefined) profileUpdate.phone = updates.phone;
    if (updates.avatarUrl !== undefined) profileUpdate.avatar_url = updates.avatarUrl;
    if (updates.role !== undefined) {
      profileUpdate.system_role = isSuper ? 'superadmin' : 'user';
    }

    await supabase.from('profiles').update(profileUpdate).eq('id', userId);

    // 3. Update organization_members if role changed
    if (updates.role !== undefined) {
      const orgRole = isSuper ? 'owner' : updates.role;
      // Check if row exists in organization_members
      const { data: existingOM } = await supabase
        .from('organization_members')
        .select('id, organization_id')
        .eq('user_id', userId)
        .maybeSingle();

      if (existingOM) {
        await supabase
          .from('organization_members')
          .update({ role: orgRole })
          .eq('user_id', userId);
      } else {
        const { data: orgs } = await supabase.from('organizations').select('id').limit(1);
        const orgId = orgs?.[0]?.id || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
        await supabase.from('organization_members').insert({
          organization_id: orgId,
          user_id: userId,
          role: orgRole,
        });
      }
    }

    return NextResponse.json({ success: true, updated: updates });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

/**
 * DELETE /api/members
 * Permanently deletes a member from Supabase (organization_members + profiles)
 */
export async function DELETE(request: Request) {
  try {
    const supabase = createAdminSupabaseClient();
    const url = new URL(request.url);
    let userId = url.searchParams.get('userId');

    if (!userId) {
      try {
        const body = await request.json();
        userId = body.userId;
      } catch {
        // no body
      }
    }

    if (!userId) {
      return NextResponse.json({ success: false, error: 'userId is required' }, { status: 400 });
    }

    // 1. Delete from organization_members
    await supabase.from('organization_members').delete().eq('user_id', userId);

    // 2. Delete from profiles
    await supabase.from('profiles').delete().eq('id', userId);

    return NextResponse.json({ success: true, deleted: userId });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
