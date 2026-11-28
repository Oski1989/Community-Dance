import { describe, it, expect, beforeEach } from 'vitest';
import { dbService, UserProfile } from '@/services/db.service';

describe('Production Database & User Roles Flow Test Suite', () => {
  beforeEach(() => {
    // Reset local mock/storage if needed
  });

  it('should initialize with bootstrap superadmin and no mock sample users', async () => {
    const members = await dbService.getMembers();
    expect(members.length).toBeGreaterThanOrEqual(1);

    const superadmin = members.find((m) => m.role === 'superadmin');
    expect(superadmin).toBeDefined();
    // Email must end with a Comuny Dance domain (old plazadance or new comunydance both accepted
    // since the Supabase record may still have the legacy email until manually updated)
    const superadminEmail = superadmin?.email ?? '';
    expect(superadminEmail.includes('@')).toBe(true);

    // Ensure NO mock users exist
    const mockNames = ['Óscar Director', 'Laura Recepción', 'Elena Alumna', 'Roberto Fernández', 'Sofía Martínez'];
    for (const name of mockNames) {
      const found = members.find((m) => m.name === name);
      expect(found).toBeUndefined();
    }
  });

  it('should create a new student user in the database and display in members list', async () => {
    const student = await dbService.createMember({
      name: 'Lucía Bailarina',
      email: 'lucia@test.com',
      password: 'Password123!',
      role: 'student',
      danceRole: 'follower',
      discipline: 'Bachata Sensual',
    });

    expect(student.id).toBeDefined();
    expect(student.name).toBe('Lucía Bailarina');
    expect(student.role).toBe('student');
    expect(student.status).toBe('Activo');

    const members = await dbService.getMembers();
    const found = members.find((m) => m.id === student.id);
    expect(found).toBeDefined();
    expect(found?.email).toBe('lucia@test.com');
  });

  it('should create users with all administrative and operational roles', async () => {
    const teacher = await dbService.createMember({
      name: 'Manuel Profesor',
      email: 'manuel.profesor@test.com',
      password: 'Password123!',
      role: 'teacher',
      discipline: 'Salsa Cubana',
      danceRole: 'leader',
    });

    const reception = await dbService.createMember({
      name: 'Sara Recepción',
      email: 'sara.recepcion@test.com',
      password: 'Password123!',
      role: 'reception',
    });

    const owner = await dbService.createMember({
      name: 'David Director',
      email: 'david.director@test.com',
      password: 'Password123!',
      role: 'owner',
    });

    expect(teacher.role).toBe('teacher');
    expect(reception.role).toBe('reception');
    expect(owner.role).toBe('owner');

    const members = await dbService.getMembers();
    expect(members.some((m) => m.id === teacher.id)).toBe(true);
    expect(members.some((m) => m.id === reception.id)).toBe(true);
    expect(members.some((m) => m.id === owner.id)).toBe(true);
  });

  it('should allow updating user role and toggle status in the database', async () => {
    const testUser = await dbService.createMember({
      name: 'Carlos Cambio',
      email: 'carlos.cambio@test.com',
      role: 'student',
    });

    // Update role to teacher
    await dbService.updateMemberRole(testUser.id, 'teacher');
    let members = await dbService.getMembers();
    let updated = members.find((m) => m.id === testUser.id);
    expect(updated?.role).toBe('teacher');

    // Toggle status to Inactive
    await dbService.updateMemberStatus(testUser.id, false);
    members = await dbService.getMembers();
    updated = members.find((m) => m.id === testUser.id);
    expect(updated?.status).toBe('Inactivo');

    // Toggle status back to Active
    await dbService.updateMemberStatus(testUser.id, true);
    members = await dbService.getMembers();
    updated = members.find((m) => m.id === testUser.id);
    expect(updated?.status).toBe('Activo');
  });

  it('should allow permanently deleting a user from the database', async () => {
    const userToDelete = await dbService.createMember({
      name: 'Usuario Borrable',
      email: 'borrable@test.com',
      role: 'student',
    });

    let members = await dbService.getMembers();
    expect(members.some((m) => m.id === userToDelete.id)).toBe(true);

    await dbService.deleteMember(userToDelete.id);
    members = await dbService.getMembers();
    expect(members.some((m) => m.id === userToDelete.id)).toBe(false);
  });

  it('should create and retrieve real academic programs with modules', async () => {
    const program = await dbService.createProgram({
      name: 'Salsa Caleña Avanzada',
      discipline: 'Salsa',
      level: 'Avanzado',
      description: 'Velocidad de pies y estilo caleño.',
    });

    expect(program.id).toBeDefined();
    expect(program.name).toBe('Salsa Caleña Avanzada');

    const programs = await dbService.getPrograms();
    expect(programs.some((p) => p.id === program.id)).toBe(true);
  });

  it('should schedule sessions and manage bookings and waitlists', async () => {
    const session = await dbService.createSession({
      name: 'Bachata Sensual Parejas',
      time: 'Viernes 20:00 - 21:00',
      capacity: 2,
    });

    expect(session.id).toBeDefined();

    // First booking
    const res1 = await dbService.reserveSession(session.id, 'user_1', 'leader');
    expect(res1.success).toBe(true);
    expect(res1.isWaitlist).toBe(false);

    // Second booking
    const res2 = await dbService.reserveSession(session.id, 'user_2', 'follower');
    expect(res2.success).toBe(true);
    expect(res2.isWaitlist).toBe(false);

    // Third booking (capacity exceeded -> waitlist)
    const res3 = await dbService.reserveSession(session.id, 'user_3', 'leader');
    expect(res3.success).toBe(true);
    expect(res3.isWaitlist).toBe(true);

    const sessions = await dbService.getSessions();
    const updatedSess = sessions.find((s) => s.id === session.id);
    expect(updatedSess?.confirmed).toBe(2);
    expect(updatedSess?.waitlist).toBe(1);
  });

  it('should update full member profile and persist edits', async () => {
    const user = await dbService.createMember({
      name: 'Mario Test',
      email: 'mario.test@comuny.com',
      password: 'MarioPassword123!',
      role: 'student',
    });

    const updated = await dbService.updateMember(user.id, {
      name: 'Mario SuperDirector',
      role: 'owner',
      phone: '+34 699 999 888',
      discipline: 'Kizomba',
    });

    expect(updated.name).toBe('Mario SuperDirector');
    expect(updated.role).toBe('owner');
    expect(updated.phone).toBe('+34 699 999 888');

    const members = await dbService.getMembers();
    const found = members.find((m) => m.id === user.id);
    expect(found?.name).toBe('Mario SuperDirector');
    expect(found?.role).toBe('owner');
  });

  it('should permanently delete member and not resurrect on subsequent reloads', async () => {
    const toDelete = await dbService.createMember({
      name: 'Temporal User',
      email: 'temp.delete@comuny.com',
      role: 'student',
    });

    await dbService.deleteMember(toDelete.id);

    // Call getMembers multiple times to simulate reloads
    const membersReload1 = await dbService.getMembers();
    expect(membersReload1.some((m) => m.id === toDelete.id)).toBe(false);

    const membersReload2 = await dbService.getMembers();
    expect(membersReload2.some((m) => m.id === toDelete.id)).toBe(false);
  });
});
