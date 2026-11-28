import { supabase } from '@/lib/supabase/client';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  isPublic: boolean;
  discipline: string;
  danceRole?: string;
  instagram?: string;
  tiktok?: string;
  facebook?: string;
  youtube?: string;
  bio?: string;
  phone?: string;
  birthdate?: string;
  avatar?: string;
  avatarUrl?: string;
  password?: string;
}

export interface ProgramItem {
  id: string;
  name: string;
  discipline: string;
  level: string;
  description?: string;
  modulesCount: number;
  xpPoints: number;
  modules: Array<{ id: string; title: string; videoUrl: string }>;
}

export interface SessionItem {
  id: string;
  name: string;
  time: string;
  confirmed: number;
  capacity: number;
  leaders: number;
  followers: number;
  waitlist: number;
}

export interface QuestItem {
  id: string;
  title: string;
  program: string;
  points: number;
  status: 'in_progress' | 'submitted' | 'approved';
  teacher: string;
}

export interface CommunityPostItem {
  id: string;
  user: string;
  role: string;
  time: string;
  content: string;
  likes: number;
}

export interface SocialEventItem {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
  price: string;
  organizer: string;
  badge: string;
  capacity?: number;
}

const STORAGE_KEYS = {
  ORGANIZATION: 'comuny_db_organization',
  MEMBERS: 'comuny_db_members',
  PROGRAMS: 'comuny_db_programs',
  SESSIONS: 'comuny_db_sessions',
  QUESTS: 'comuny_db_quests',
  COMMUNITY_POSTS: 'comuny_db_community_posts',
  SOCIAL_EVENTS: 'comuny_db_social_events',
  NOTIFICATIONS: 'comuny_db_notifications',
  DELETED_MEMBERS: 'comuny_db_deleted_members',
  PENDING_WRITES: 'comuny_db_pending_writes',
};

// Default bootstrap superadmin account
const BOOTSTRAP_SUPERADMIN: UserProfile = {
  id: 'usr_superadmin_001',
  name: 'SuperAdmin Global',
  email: 'superadmin@comunydance.com',
  password: 'PlazaDance2026!',
  role: 'superadmin',
  status: 'Activo',
  isPublic: true,
  discipline: 'Dirección & SaaS',
  danceRole: 'both',
  avatar: '👑',
  bio: 'SuperAdministrador Global de Comuny Dance',
};

// Default seed accounts — one per privilege level
const SEED_ACCOUNTS: UserProfile[] = [
  {
    id: 'usr_owner_001',
    name: 'Director General',
    email: 'director@comunydance.com',
    password: 'Director2026!',
    role: 'owner',
    status: 'Activo',
    isPublic: true,
    discipline: 'Dirección & Gestión',
    danceRole: 'both',
    avatar: '🏛️',
    bio: 'Director general de plataforma y gestión',
  },
  {
    id: 'usr_admin_001',
    name: 'Administrador',
    email: 'admin@comunydance.com',
    password: 'Admin2026!',
    role: 'admin',
    status: 'Activo',
    isPublic: true,
    discipline: 'Administración',
    danceRole: 'both',
    avatar: '⚙️',
    bio: 'Administrador del sistema Comuny Dance',
  },
  {
    id: 'usr_teacher_001',
    name: 'Profesor',
    email: 'profesor@comunydance.com',
    password: 'Profesor2026!',
    role: 'teacher',
    status: 'Activo',
    isPublic: true,
    discipline: 'Salsa & Bachata',
    danceRole: 'leader',
    avatar: '🕺',
    bio: 'Profesor de ritmos latinos y formación',
  },
  {
    id: 'usr_reception_001',
    name: 'Recepción & Soporte',
    email: 'recepcion@comunydance.com',
    password: 'Recepcion2026!',
    role: 'reception',
    status: 'Activo',
    isPublic: true,
    discipline: 'Gestión & Recepción',
    danceRole: 'both',
    avatar: '📋',
    bio: 'Atención a la comunidad y soporte',
  },
  {
    id: 'usr_student_001',
    name: 'Bailarín / Alumno',
    email: 'alumno@comunydance.com',
    password: 'Alumno2026!',
    role: 'student',
    status: 'Activo',
    isPublic: true,
    discipline: 'Salsa & Bachata',
    danceRole: 'both',
    avatar: '💃',
    bio: 'Miembro de la comunidad Comuny Dance',
  },
];

// Default organization
const DEFAULT_ORGANIZATION = {
  id: '00000000-0000-0000-0000-000000000001',
  name: 'Comuny Dance',
  slug: 'comuny-dance',
  description: 'Plataforma Global y Comunidad de Baile',
};

// Circuit-breaker for network DNS resolution to avoid blocking on offline/paused Supabase projects
let isSupabaseOnline = true;
let lastCheckTime = 0;

function markSupabaseOffline() {
  isSupabaseOnline = false;
  lastCheckTime = Date.now();
}

function markSupabaseOnline() {
  isSupabaseOnline = true;
}

async function safeDbCall<T = any>(callFn: () => any, ms: number = 800): Promise<T | null> {
  // If recently marked offline, don't stall on Windows DNS getaddrinfo
  if (!isSupabaseOnline && Date.now() - lastCheckTime < 20000) {
    return null;
  }

  let timer: any;
  const timeoutPromise = new Promise<null>((resolve) => {
    timer = setTimeout(() => {
      markSupabaseOffline();
      resolve(null);
    }, ms);
  });

  try {
    const res = await Promise.race([Promise.resolve(callFn()), timeoutPromise]);
    clearTimeout(timer);
    if (res !== null) markSupabaseOnline();
    return res;
  } catch (err: any) {
    clearTimeout(timer);
    if (err?.code === 'ENOTFOUND' || err?.message?.includes('fetch failed')) {
      markSupabaseOffline();
    }
    return null;
  }
}

// ─── Pending Write Queue ─────────────────────────────────────────────────────
// When Supabase is offline, write operations are queued here and replayed on reconnect.
interface PendingWrite {
  id: string;
  table: string;
  op: 'upsert' | 'update' | 'delete';
  payload: any;
  filter?: { column: string; value: string };
  timestamp: number;
}

function queuePendingWrite(write: Omit<PendingWrite, 'id' | 'timestamp'>) {
  const pending = loadStorage<PendingWrite[]>(STORAGE_KEYS.PENDING_WRITES, []);
  pending.push({ ...write, id: `pw_${Date.now()}`, timestamp: Date.now() });
  saveStorage(STORAGE_KEYS.PENDING_WRITES, pending);
}

async function flushPendingWrites(): Promise<number> {
  const pending = loadStorage<PendingWrite[]>(STORAGE_KEYS.PENDING_WRITES, []);
  if (pending.length === 0) return 0;

  let synced = 0;
  const remaining: PendingWrite[] = [];

  for (const pw of pending) {
    let success = false;
    try {
      if (pw.op === 'upsert') {
        const res: any = await safeDbCall(() => supabase.from(pw.table).upsert(pw.payload), 3000);
        success = res !== null && !res.error;
      } else if (pw.op === 'update' && pw.filter) {
        const res: any = await safeDbCall(() =>
          supabase.from(pw.table).update(pw.payload).eq(pw.filter!.column, pw.filter!.value), 3000);
        success = res !== null && !res.error;
      } else if (pw.op === 'delete' && pw.filter) {
        const res: any = await safeDbCall(() =>
          supabase.from(pw.table).delete().eq(pw.filter!.column, pw.filter!.value), 3000);
        success = res !== null && !res.error;
      }
    } catch {
      // keep in queue
    }

    if (success) {
      synced++;
    } else {
      remaining.push(pw);
    }
  }

  saveStorage(STORAGE_KEYS.PENDING_WRITES, remaining);
  return synced;
}

// In-memory fallback if localStorage is unavailable
const memoryStorage = new Map<string, any>();

function loadStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') {
    return memoryStorage.has(key) ? memoryStorage.get(key) : defaultValue;
  }
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    return memoryStorage.has(key) ? memoryStorage.get(key) : defaultValue;
  }
}

function saveStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') {
    memoryStorage.set(key, value);
    return;
  }
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    memoryStorage.set(key, value);
  } catch (e) {
    memoryStorage.set(key, value);
  }
}

class DatabaseService {
  isCloudActive(): boolean {
    return isSupabaseOnline;
  }

  async checkCloudConnection(): Promise<boolean> {
    try {
      const res: any = await safeDbCall(() => supabase.from('organizations').select('id').limit(1), 700);
      return res !== null && !res.error;
    } catch {
      return false;
    }
  }

  /**
   * Flush all pending offline writes back to Supabase (call when cloud is re-detected online)
   */
  async syncPendingWrites(): Promise<number> {
    return flushPendingWrites();
  }

  /** How many pending writes are queued */
  getPendingWritesCount(): number {
    return loadStorage<any[]>(STORAGE_KEYS.PENDING_WRITES, []).length;
  }

  /**
   * Get or initialize the primary active organization
   */
  async getPrimaryOrganization(): Promise<{ id: string; name: string; slug: string }> {
    try {
      const res: any = await safeDbCall(() =>
        supabase.from('organizations').select('id, name, slug').limit(1)
      );

      if (res && !res.error && res.data && res.data.length > 0) {
        saveStorage(STORAGE_KEYS.ORGANIZATION, res.data[0]);
        return res.data[0];
      }

      // Try creating in Supabase if empty
      const createRes: any = await safeDbCall(() =>
        supabase.from('organizations').insert({
          name: DEFAULT_ORGANIZATION.name,
          slug: DEFAULT_ORGANIZATION.slug,
          description: DEFAULT_ORGANIZATION.description,
        }).select('id, name, slug').single()
      );

      if (createRes && !createRes.error && createRes.data) {
        saveStorage(STORAGE_KEYS.ORGANIZATION, createRes.data);
        return createRes.data;
      }
    } catch (err) {
      // Offline / network notice
    }

    return loadStorage(STORAGE_KEYS.ORGANIZATION, DEFAULT_ORGANIZATION);
  }

  /**
   * Fetch all registered members from DB (Profiles + Org Members)
   */
  async getMembers(): Promise<UserProfile[]> {
    let remoteMembers: UserProfile[] = [];

    try {
      const profRes: any = await safeDbCall(() => supabase.from('profiles').select('*'));
      const orgMemRes: any = await safeDbCall(() => supabase.from('organization_members').select('*'));
      const privRes: any = await safeDbCall(() => supabase.from('profile_private').select('*'));

      const dbProfiles = profRes?.data;
      const dbOrgMembers = orgMemRes?.data;
      const dbPrivateProfiles = privRes?.data;

      if (dbProfiles && dbProfiles.length > 0) {
        const orgMap = new Map<string, { role: string; is_active: boolean }>();
        if (dbOrgMembers) {
          dbOrgMembers.forEach((om: any) => {
            orgMap.set(om.user_id, { role: om.role, is_active: om.is_active });
          });
        }

        const privMap = new Map<string, string>();
        if (dbPrivateProfiles) {
          dbPrivateProfiles.forEach((pp: any) => {
            if (pp.user_id && pp.email) privMap.set(pp.user_id, pp.email);
          });
        }

        const validProfiles = dbProfiles.filter((p: any) => {
          const isMockName = ['Óscar Director', 'Laura Recepción', 'Elena Alumna', 'Roberto Fernández', 'Sofía Martínez'].includes(p.full_name);
          return !isMockName;
        });

        remoteMembers = validProfiles.map((p: any) => {
          const orgInfo = orgMap.get(p.id);
          let role = 'student';

          if (p.system_role === 'superadmin' || p.global_role === 'superadmin') {
            role = 'superadmin';
          } else if (orgInfo?.role) {
            role = orgInfo.role;
          }

          const email = p.email || privMap.get(p.id) || `${p.full_name?.toLowerCase().replace(/\s+/g, '') || 'usuario'}@comunydance.com`;
          const status = orgInfo?.is_active === false ? 'Inactivo' : 'Activo';

          return {
            id: p.id,
            name: p.full_name || 'Usuario',
            email,
            role,
            status,
            isPublic: p.show_in_rankings ?? true,
            discipline: p.discipline || (role === 'teacher' ? 'Profesor SBK' : 'Salsa & Bachata'),
            danceRole: p.dance_role || 'both',
            instagram: p.instagram || '',
            tiktok: p.tiktok || '',
            facebook: p.facebook || '',
            youtube: p.youtube || '',
            bio: p.bio || '',
            avatar: p.avatar || (role === 'superadmin' ? '👑' : role === 'teacher' ? '🕺' : role === 'reception' ? '👩‍💼' : '💃'),
            avatarUrl: p.avatar_url || '',
          };
        });
      }
    } catch (err) {
      // Offline / network notice
    }

    // Merge with persisted DB records
    const deletedIds = loadStorage<string[]>(STORAGE_KEYS.DELETED_MEMBERS, []);
    const defaultAccounts = [BOOTSTRAP_SUPERADMIN, ...SEED_ACCOUNTS].filter((m) => !deletedIds.includes(m.id));

    // Load local storage members, falling back to defaultAccounts if uninitialized
    const stored = loadStorage<UserProfile[] | null>(STORAGE_KEYS.MEMBERS, null);
    const localMembers: UserProfile[] = stored !== null ? stored : defaultAccounts;

    const map = new Map<string, UserProfile>();

    // 1. Local members (reflects all user edits, creations, and deletions)
    localMembers.forEach((m) => {
      if (!deletedIds.includes(m.id)) {
        map.set(m.id, m);
      }
    });

    // 2. Remote members from Supabase (if not deleted locally)
    remoteMembers.forEach((m) => {
      if (!deletedIds.includes(m.id)) {
        const existing = map.get(m.id);
        map.set(m.id, existing ? { ...m, ...existing } : m);
      }
    });

    const finalMembers = Array.from(map.values());
    saveStorage(STORAGE_KEYS.MEMBERS, finalMembers);
    return finalMembers;
  }

  /**
   * Create a user in the database (with all forms / roles)
   */
  async createMember(params: {
    name: string;
    email: string;
    password?: string;
    role: string;
    discipline?: string;
    danceRole?: string;
    phone?: string;
    bio?: string;
    avatar?: string;
  }): Promise<UserProfile> {
    const org = await this.getPrimaryOrganization();
    const cleanEmail = params.email.trim().toLowerCase();
    const cleanName = params.name.trim();
    const role = params.role || 'student';
    const isSuper = role === 'superadmin';

    let generatedId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // Try creating via Supabase Auth
    try {
      if (params.password) {
        const authData: any = await safeDbCall(() =>
          supabase.auth.signUp({
            email: cleanEmail,
            password: params.password!,
            options: {
              data: {
                full_name: cleanName,
                role: role,
              },
            },
          })
        );

        if (authData?.data?.user?.id) {
          generatedId = authData.data.user.id;
        }
      }

      // Upsert to profiles table
      await safeDbCall(() =>
        supabase.from('profiles').upsert({
          id: generatedId,
          email: cleanEmail,
          full_name: cleanName,
          system_role: isSuper ? 'superadmin' : 'user',
          global_role: isSuper ? 'superadmin' : 'user',
          dance_role: params.danceRole || 'both',
          bio: params.bio || '',
          phone: params.phone || '',
          show_in_rankings: true,
          updated_at: new Date().toISOString(),
        })
      );

      // Upsert to organization_members table
      await safeDbCall(() =>
        supabase.from('organization_members').upsert(
          {
            organization_id: org.id,
            user_id: generatedId,
            role: isSuper ? 'owner' : (role as any),
            is_active: true,
          },
          { onConflict: 'organization_id,user_id' }
        )
      );
    } catch (err) {
      // Offline / network notice
    }

    const newMember: UserProfile = {
      id: generatedId,
      name: cleanName,
      email: cleanEmail,
      password: params.password,
      role: role,
      status: 'Activo',
      isPublic: true,
      discipline: params.discipline || (role === 'teacher' ? 'Profesor SBK' : 'Salsa & Bachata'),
      danceRole: params.danceRole || 'both',
      bio: params.bio || '',
      phone: params.phone || '',
      avatar: params.avatar || (role === 'superadmin' ? '👑' : role === 'teacher' ? '🕺' : role === 'reception' ? '👩‍💼' : '💃'),
    };

    const currentList = await this.getMembers();
    const updatedList = [newMember, ...currentList.filter((m) => m.email !== cleanEmail)];
    saveStorage(STORAGE_KEYS.MEMBERS, updatedList);

    return newMember;
  }

  /**
   * Update full member profile in the database (name, email, role, status, password, phone, discipline, danceRole, bio, isPublic)
   */
  async updateMember(
    userId: string,
    updates: Partial<{
      name: string;
      email: string;
      role: string;
      status: string;
      password?: string;
      discipline?: string;
      danceRole?: string;
      phone?: string;
      bio?: string;
      isPublic?: boolean;
      avatarUrl?: string;
    }>
  ): Promise<UserProfile> {
    const org = await this.getPrimaryOrganization();
    const isSuper = updates.role === 'superadmin';

    // 1. Build the Supabase profiles payload
    const profilePayload: any = { id: userId, updated_at: new Date().toISOString() };
    if (updates.name !== undefined) profilePayload.full_name = updates.name;
    if (updates.bio !== undefined) profilePayload.bio = updates.bio;
    if (updates.phone !== undefined) profilePayload.phone = updates.phone;
    if (updates.danceRole !== undefined) profilePayload.dance_role = updates.danceRole;
    if (updates.discipline !== undefined) profilePayload.discipline = updates.discipline;
    if (updates.isPublic !== undefined) profilePayload.show_in_rankings = updates.isPublic;
    if (updates.avatarUrl !== undefined) profilePayload.avatar_url = updates.avatarUrl;
    if (updates.role !== undefined) {
      profilePayload.system_role = isSuper ? 'superadmin' : 'user';
      profilePayload.global_role = isSuper ? 'superadmin' : 'user';
    }

    // 2. Sync with Supabase if online; queue for later if offline
    const hasProfileChanges = Object.keys(profilePayload).length > 2; // more than id + updated_at
    if (hasProfileChanges) {
      const profileRes: any = await safeDbCall(() => supabase.from('profiles').upsert(profilePayload));
      if (profileRes === null) {
        // Offline — queue for later sync
        queuePendingWrite({ table: 'profiles', op: 'upsert', payload: profilePayload });
      }
    }

    if (updates.role !== undefined) {
      const orgPayload = {
        organization_id: org.id,
        user_id: userId,
        role: isSuper ? 'owner' : (updates.role as any),
        is_active: updates.status ? updates.status.includes('Activo') : true,
      };
      const orgRes: any = await safeDbCall(() =>
        supabase.from('organization_members').upsert(orgPayload, { onConflict: 'organization_id,user_id' })
      );
      if (orgRes === null) {
        queuePendingWrite({ table: 'organization_members', op: 'upsert', payload: orgPayload });
      }
    }

    // 3. Update local storage
    const current = await this.getMembers();
    let updatedMember: UserProfile | null = null;
    const updated = current.map((m) => {
      if (m.id === userId) {
        updatedMember = {
          ...m,
          ...updates,
          name: updates.name !== undefined && updates.name.trim() !== '' ? updates.name.trim() : m.name,
          email: updates.email !== undefined && updates.email.trim() !== '' ? updates.email.trim().toLowerCase() : m.email,
          role: updates.role !== undefined ? updates.role : m.role,
          status: updates.status !== undefined ? updates.status : m.status,
          discipline: updates.discipline !== undefined ? updates.discipline : m.discipline,
          danceRole: updates.danceRole !== undefined ? updates.danceRole : m.danceRole,
          phone: updates.phone !== undefined ? updates.phone : m.phone,
          bio: updates.bio !== undefined ? updates.bio : m.bio,
          isPublic: updates.isPublic !== undefined ? updates.isPublic : m.isPublic,
          avatarUrl: updates.avatarUrl !== undefined ? updates.avatarUrl : m.avatarUrl,
          password: updates.password && updates.password.trim() !== '' ? updates.password : m.password,
        };
        return updatedMember;
      }
      return m;
    });

    saveStorage(STORAGE_KEYS.MEMBERS, updated);
    if (!updatedMember) {
      throw new Error('Usuario no encontrado');
    }
    return updatedMember;
  }

  /**
   * Update member role in the database
   */
  async updateMemberRole(userId: string, newRole: string): Promise<void> {
    await this.updateMember(userId, { role: newRole });
  }

  /**
   * Toggle member active status in the database
   */
  async updateMemberStatus(userId: string, isActive: boolean): Promise<void> {
    await this.updateMember(userId, { status: isActive ? 'Activo' : 'Inactivo' });
  }

  /**
   * Delete member from the database (persisting deletion so it never resurrects)
   */
  async deleteMember(userId: string): Promise<void> {
    const orgRes: any = await safeDbCall(() => supabase.from('organization_members').delete().eq('user_id', userId));
    const profRes: any = await safeDbCall(() => supabase.from('profiles').delete().eq('id', userId));

    // If offline, queue both deletes for later sync
    if (orgRes === null) {
      queuePendingWrite({ table: 'organization_members', op: 'delete', payload: {}, filter: { column: 'user_id', value: userId } });
    }
    if (profRes === null) {
      queuePendingWrite({ table: 'profiles', op: 'delete', payload: {}, filter: { column: 'id', value: userId } });
    }

    // Persist deleted ID in DELETED_MEMBERS storage
    const deletedIds = loadStorage<string[]>(STORAGE_KEYS.DELETED_MEMBERS, []);
    if (!deletedIds.includes(userId)) {
      deletedIds.push(userId);
      saveStorage(STORAGE_KEYS.DELETED_MEMBERS, deletedIds);
    }

    const current = loadStorage<UserProfile[]>(STORAGE_KEYS.MEMBERS, []);
    const updated = current.filter((m) => m.id !== userId);
    saveStorage(STORAGE_KEYS.MEMBERS, updated);
  }

  /**
   * Send / record organization invitation in DB
   */
  async createInvitation(email: string, role: string): Promise<void> {
    const org = await this.getPrimaryOrganization();
    const token = `inv_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    try {
      await safeDbCall(() =>
        supabase.from('organization_invitations').insert({
          organization_id: org.id,
          email: email.trim().toLowerCase(),
          role: role as any,
          token,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        })
      );
    } catch (err) {
      // Offline / network notice
    }

    // Automatically register as invited member in DB
    await this.createMember({
      name: email.split('@')[0],
      email,
      role,
      discipline: 'Por Asignar',
    });
  }

  /**
   * Programs Management
   */
  async getPrograms(): Promise<ProgramItem[]> {
    try {
      const res: any = await safeDbCall(() => supabase.from('programs').select('*'));
      if (res && !res.error && res.data && res.data.length > 0) {
        const mapped: ProgramItem[] = res.data.map((p: any) => ({
          id: p.id,
          name: p.name,
          discipline: p.discipline || 'Salsa',
          level: 'Todos los Niveles',
          description: p.description || '',
          modulesCount: 1,
          xpPoints: 100,
          modules: [
            { id: `m_${p.id}_1`, title: 'Módulo 1: Fundamentos y Pasos', videoUrl: 'https://youtube.com' },
          ],
        }));
        saveStorage(STORAGE_KEYS.PROGRAMS, mapped);
        return mapped;
      }
    } catch (err) {
      // Offline / network notice
    }

    return loadStorage<ProgramItem[]>(STORAGE_KEYS.PROGRAMS, []);
  }

  async createProgram(params: { name: string; discipline: string; level: string; description?: string }): Promise<ProgramItem> {
    const org = await this.getPrimaryOrganization();
    let newId = `prog_${Date.now()}`;

    try {
      const res: any = await safeDbCall(() =>
        supabase
          .from('programs')
          .insert({
            organization_id: org.id,
            name: params.name,
            discipline: params.discipline,
            description: params.description || `Programa de ${params.discipline} nivel ${params.level}`,
          })
          .select()
          .single()
      );

      if (res && !res.error && res.data) {
        newId = res.data.id;
      }
    } catch (err) {
      // Offline / network notice
    }

    const newProg: ProgramItem = {
      id: newId,
      name: params.name,
      discipline: params.discipline,
      level: params.level,
      description: params.description || `Nivel ${params.level}`,
      modulesCount: 1,
      xpPoints: 100,
      modules: [
        { id: `mod_${Date.now()}`, title: 'Módulo 1: Fundamentos Básicos', videoUrl: 'https://youtube.com' },
      ],
    };

    const current = await this.getPrograms();
    const updated = [newProg, ...current];
    saveStorage(STORAGE_KEYS.PROGRAMS, updated);
    return newProg;
  }

  async updateProgram(program: ProgramItem): Promise<void> {
    try {
      await safeDbCall(() =>
        supabase
          .from('programs')
          .update({
            name: program.name,
            discipline: program.discipline,
            description: program.description,
          })
          .eq('id', program.id)
      );
    } catch (err) {
      // Offline / network notice
    }

    const current = loadStorage<ProgramItem[]>(STORAGE_KEYS.PROGRAMS, []);
    const updated = current.map((p) => (p.id === program.id ? program : p));
    saveStorage(STORAGE_KEYS.PROGRAMS, updated);
  }

  /**
   * Sessions & Attendance
   */
  async getSessions(): Promise<SessionItem[]> {
    try {
      const res: any = await safeDbCall(() => supabase.from('sessions').select('*'));
      if (res && !res.error && res.data && res.data.length > 0) {
        const mapped: SessionItem[] = res.data.map((s: any) => ({
          id: s.id,
          name: s.name,
          time: s.start_time ? new Date(s.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Horario programado',
          confirmed: 0,
          capacity: s.capacity_total || 20,
          leaders: 0,
          followers: 0,
          waitlist: 0,
        }));
        saveStorage(STORAGE_KEYS.SESSIONS, mapped);
        return mapped;
      }
    } catch (err) {
      // Offline / network notice
    }

    return loadStorage<SessionItem[]>(STORAGE_KEYS.SESSIONS, []);
  }

  async createSession(params: { name: string; time: string; capacity: number }): Promise<SessionItem> {
    const org = await this.getPrimaryOrganization();
    let newId = `sess_${Date.now()}`;

    try {
      const res: any = await safeDbCall(() =>
        supabase
          .from('sessions')
          .insert({
            organization_id: org.id,
            name: params.name,
            capacity_total: params.capacity,
          })
          .select()
          .single()
      );

      if (res && !res.error && res.data) {
        newId = res.data.id;
      }
    } catch (err) {
      // Offline / network notice
    }

    const newSession: SessionItem = {
      id: newId,
      name: params.name,
      time: params.time,
      confirmed: 0,
      capacity: params.capacity,
      leaders: 0,
      followers: 0,
      waitlist: 0,
    };

    const current = await this.getSessions();
    const updated = [newSession, ...current];
    saveStorage(STORAGE_KEYS.SESSIONS, updated);
    return newSession;
  }

  async reserveSession(sessionId: string, userId: string, danceRole: string = 'both'): Promise<{ success: boolean; isWaitlist: boolean; message: string }> {
    const org = await this.getPrimaryOrganization();
    const sessions = await this.getSessions();
    const target = sessions.find((s) => s.id === sessionId);

    if (!target) return { success: false, isWaitlist: false, message: 'Sesión no encontrada.' };

    const isFull = target.confirmed >= target.capacity;
    const isWaitlist = isFull;

    try {
      await safeDbCall(() =>
        supabase.from('reservations').insert({
          organization_id: org.id,
          session_id: sessionId,
          user_id: userId,
          dance_role_used: danceRole === 'leader' ? 'leader' : danceRole === 'follower' ? 'follower' : 'unspecified',
          status: isWaitlist ? 'waitlist' : 'confirmed',
        })
      );
    } catch (err) {
      // Offline / network notice
    }

    const updatedSessions = sessions.map((s) => {
      if (s.id !== sessionId) return s;
      return isWaitlist ? { ...s, waitlist: s.waitlist + 1 } : { ...s, confirmed: s.confirmed + 1 };
    });
    saveStorage(STORAGE_KEYS.SESSIONS, updatedSessions);

    return {
      success: true,
      isWaitlist,
      message: isWaitlist ? 'Añadido a lista de espera.' : 'Reserva confirmada en la base de datos.',
    };
  }

  /**
   * Quests & Challenges
   */
  async getQuests(): Promise<QuestItem[]> {
    try {
      const res: any = await safeDbCall(() => supabase.from('quests').select('*'));
      if (res && !res.error && res.data && res.data.length > 0) {
        const mapped: QuestItem[] = res.data.map((q: any) => ({
          id: q.id,
          title: q.title,
          program: 'General',
          points: q.points_reward || 20,
          status: 'submitted',
          teacher: 'Profesor',
        }));
        saveStorage(STORAGE_KEYS.QUESTS, mapped);
        return mapped;
      }
    } catch (err) {
      // Offline / network notice
    }

    return loadStorage<QuestItem[]>(STORAGE_KEYS.QUESTS, []);
  }

  async createQuest(params: { title: string; points: number; teacherName: string; teacherId?: string; program?: string }): Promise<QuestItem> {
    const org = await this.getPrimaryOrganization();
    let newId = `quest_${Date.now()}`;

    try {
      const res: any = await safeDbCall(() =>
        supabase
          .from('quests')
          .insert({
            organization_id: org.id,
            created_by_teacher_id: params.teacherId || org.id,
            title: params.title,
            points_reward: params.points,
          })
          .select()
          .single()
      );

      if (res && !res.error && res.data) newId = res.data.id;
    } catch (err) {
      // Offline / network notice
    }

    const newQuest: QuestItem = {
      id: newId,
      title: params.title,
      program: params.program || 'General',
      points: params.points,
      status: 'submitted',
      teacher: params.teacherName || 'Profesor',
    };

    const current = await this.getQuests();
    const updated = [newQuest, ...current];
    saveStorage(STORAGE_KEYS.QUESTS, updated);
    return newQuest;
  }

  async approveQuest(questId: string): Promise<void> {
    const current = loadStorage<QuestItem[]>(STORAGE_KEYS.QUESTS, []);
    const updated = current.map((q) => (q.id === questId ? { ...q, status: 'approved' as const } : q));
    saveStorage(STORAGE_KEYS.QUESTS, updated);
  }

  /**
   * Community Posts
   */
  async getCommunityPosts(): Promise<CommunityPostItem[]> {
    try {
      const res: any = await safeDbCall(() =>
        supabase.from('community_posts').select('*').order('created_at', { ascending: false })
      );
      if (res && !res.error && res.data && res.data.length > 0) {
        const mapped: CommunityPostItem[] = res.data.map((p: any) => ({
          id: p.id,
          user: 'Miembro de la Escuela',
          role: 'MIEMBRO',
          time: new Date(p.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          content: p.content,
          likes: p.likes_count || 0,
        }));
        saveStorage(STORAGE_KEYS.COMMUNITY_POSTS, mapped);
        return mapped;
      }
    } catch (err) {
      // Offline / network notice
    }

    return loadStorage<CommunityPostItem[]>(STORAGE_KEYS.COMMUNITY_POSTS, []);
  }

  async createCommunityPost(content: string, user: { name: string; role: string; id?: string }): Promise<CommunityPostItem> {
    const org = await this.getPrimaryOrganization();
    let newId = `post_${Date.now()}`;

    try {
      const res: any = await safeDbCall(() =>
        supabase
          .from('community_posts')
          .insert({
            organization_id: org.id,
            user_id: user.id || org.id,
            content,
          })
          .select()
          .single()
      );

      if (res && !res.error && res.data) newId = res.data.id;
    } catch (err) {
      // Offline / network notice
    }

    const newPost: CommunityPostItem = {
      id: newId,
      user: user.name,
      role: user.role.toUpperCase(),
      time: 'Justo ahora',
      content,
      likes: 0,
    };

    const current = await this.getCommunityPosts();
    const updated = [newPost, ...current];
    saveStorage(STORAGE_KEYS.COMMUNITY_POSTS, updated);
    return newPost;
  }

  /**
   * Social Events SBK
   */
  async getSocialEvents(): Promise<SocialEventItem[]> {
    try {
      const res: any = await safeDbCall(() => supabase.from('social_events').select('*'));
      if (res && !res.error && res.data && res.data.length > 0) {
        const mapped: SocialEventItem[] = res.data.map((e: any) => ({
          id: e.id,
          title: e.title,
          date: new Date(e.event_date).toLocaleString(),
          location: e.location,
          description: e.description || '',
          price: e.price ? `${e.price} €` : 'Entrada Libre',
          organizer: 'Comuny Dance',
          badge: 'Social SBK',
          capacity: e.capacity || 100,
        }));
        saveStorage(STORAGE_KEYS.SOCIAL_EVENTS, mapped);
        return mapped;
      }
    } catch (err) {
      // Offline / network notice
    }

    return loadStorage<SocialEventItem[]>(STORAGE_KEYS.SOCIAL_EVENTS, []);
  }

  async createSocialEvent(params: {
    title: string;
    date: string;
    location: string;
    description: string;
    price: string;
    organizer: string;
    badge: string;
    capacity?: number;
  }): Promise<SocialEventItem> {
    const org = await this.getPrimaryOrganization();
    let newId = `soc_${Date.now()}`;

    try {
      const res: any = await safeDbCall(() =>
        supabase
          .from('social_events')
          .insert({
            organization_id: org.id,
            title: params.title,
            description: params.description,
            location: params.location,
            event_date: new Date().toISOString(),
            capacity: params.capacity || 100,
          })
          .select()
          .single()
      );

      if (res && !res.error && res.data) newId = res.data.id;
    } catch (err) {
      // Offline / network notice
    }

    const newEvent: SocialEventItem = {
      id: newId,
      ...params,
    };

    const current = await this.getSocialEvents();
    const updated = [newEvent, ...current];
    saveStorage(STORAGE_KEYS.SOCIAL_EVENTS, updated);
    return newEvent;
  }
}

export const dbService = new DatabaseService();

