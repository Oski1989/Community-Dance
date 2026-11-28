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
};

// Default bootstrap superadmin account
const BOOTSTRAP_SUPERADMIN: UserProfile = {
  id: 'usr_superadmin_001',
  name: 'SuperAdmin Global',
  email: 'superadmin@plazadance.com',
  password: 'PlazaDance2026!',
  role: 'superadmin',
  status: 'Activo',
  isPublic: true,
  discipline: 'Dirección & SaaS',
  danceRole: 'both',
  avatar: '👑',
  bio: 'SuperAdministrador Global de Plaza Dance SaaS',
};

// Default seed accounts — one per privilege level (never deleted by resetAndCreateDefaultUsers)
const SEED_ACCOUNTS: UserProfile[] = [
  {
    id: 'usr_owner_001',
    name: 'Director Plaza Dance',
    email: 'director@plazadance.com',
    password: 'Director2026!',
    role: 'owner',
    status: 'Activo',
    isPublic: true,
    discipline: 'Dirección',
    danceRole: 'both',
    avatar: '🏛️',
    bio: 'Director principal de la escuela',
  },
  {
    id: 'usr_admin_001',
    name: 'Administrador Plaza Dance',
    email: 'admin@plazadance.com',
    password: 'Admin2026!',
    role: 'admin',
    status: 'Activo',
    isPublic: true,
    discipline: 'Administración',
    danceRole: 'both',
    avatar: '⚙️',
    bio: 'Administrador de la escuela',
  },
  {
    id: 'usr_teacher_001',
    name: 'Profesor Plaza Dance',
    email: 'profesor@plazadance.com',
    password: 'Profesor2026!',
    role: 'teacher',
    status: 'Activo',
    isPublic: true,
    discipline: 'Salsa & Bachata',
    danceRole: 'leader',
    avatar: '🕺',
    bio: 'Profesor de Salsa y Bachata',
  },
  {
    id: 'usr_reception_001',
    name: 'Recepción Plaza Dance',
    email: 'recepcion@plazadance.com',
    password: 'Recepcion2026!',
    role: 'reception',
    status: 'Activo',
    isPublic: true,
    discipline: 'Administración',
    danceRole: 'both',
    avatar: '📋',
    bio: 'Personal de recepción',
  },
  {
    id: 'usr_student_001',
    name: 'Alumno Plaza Dance',
    email: 'alumno@plazadance.com',
    password: 'Alumno2026!',
    role: 'student',
    status: 'Activo',
    isPublic: true,
    discipline: 'Salsa & Bachata',
    danceRole: 'both',
    avatar: '💃',
    bio: 'Alumno de la escuela de baile',
  },
];

// Default organization
const DEFAULT_ORGANIZATION = {
  id: '00000000-0000-0000-0000-000000000001',
  name: 'Plaza Dance',
  slug: 'plaza-dance',
  description: 'Escuela de Baile y Gestión SBK',
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

        remoteMembers = dbProfiles.map((p: any) => {
          const orgInfo = orgMap.get(p.id);
          let role = 'student';

          if (p.system_role === 'superadmin' || p.global_role === 'superadmin') {
            role = 'superadmin';
          } else if (orgInfo?.role) {
            role = orgInfo.role;
          }

          const email = p.email || privMap.get(p.id) || `${p.full_name?.toLowerCase().replace(/\s+/g, '') || 'usuario'}@plazadance.com`;
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

    // Merge with persisted DB records (always include seed accounts + superadmin as baseline)
    const defaultAccounts = [BOOTSTRAP_SUPERADMIN, ...SEED_ACCOUNTS];
    const localMembers = loadStorage<UserProfile[]>(STORAGE_KEYS.MEMBERS, defaultAccounts);
    const map = new Map<string, UserProfile>();

    // Seed accounts always present (can be overridden by stored version if role was changed)
    defaultAccounts.forEach((m) => map.set(m.id, m));
    localMembers.forEach((m) => map.set(m.id, m));
    remoteMembers.forEach((m) => map.set(m.id, m));

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
   * Update member role in the database
   */
  async updateMemberRole(userId: string, newRole: string): Promise<void> {
    const org = await this.getPrimaryOrganization();
    const isSuper = newRole === 'superadmin';

    try {
      await safeDbCall(() =>
        supabase.from('profiles').upsert({
          id: userId,
          system_role: isSuper ? 'superadmin' : 'user',
          global_role: isSuper ? 'superadmin' : 'user',
          updated_at: new Date().toISOString(),
        })
      );

      await safeDbCall(() =>
        supabase.from('organization_members').upsert(
          {
            organization_id: org.id,
            user_id: userId,
            role: isSuper ? 'owner' : (newRole as any),
            is_active: true,
          },
          { onConflict: 'organization_id,user_id' }
        )
      );
    } catch (err) {
      // Offline / network notice
    }

    const current = await this.getMembers();
    const updated = current.map((m) => (m.id === userId ? { ...m, role: newRole } : m));
    saveStorage(STORAGE_KEYS.MEMBERS, updated);
  }

  /**
   * Toggle member active status in the database
   */
  async updateMemberStatus(userId: string, isActive: boolean): Promise<void> {
    const org = await this.getPrimaryOrganization();
    const statusText = isActive ? 'Activo' : 'Inactivo';

    try {
      await safeDbCall(() =>
        supabase
          .from('organization_members')
          .update({ is_active: isActive })
          .match({ organization_id: org.id, user_id: userId })
      );
    } catch (err) {
      // Offline / network notice
    }

    const current = await this.getMembers();
    const updated = current.map((m) => (m.id === userId ? { ...m, status: statusText } : m));
    saveStorage(STORAGE_KEYS.MEMBERS, updated);
  }

  /**
   * Delete member from the database
   */
  async deleteMember(userId: string): Promise<void> {
    try {
      await safeDbCall(() => supabase.from('organization_members').delete().eq('user_id', userId));
      await safeDbCall(() => supabase.from('profiles').delete().eq('id', userId));
    } catch (err) {
      // Offline / network notice
    }

    const current = await this.getMembers();
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
          organizer: 'Escuela Plaza Dance',
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

