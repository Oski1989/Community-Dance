const SUPABASE_URL = 'https://lplvscrlodpwmrtezfuh.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxwbHZzY3Jsb2Rwd21ydGV6ZnVoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODU1MDA1NCwiZXhwIjoyMTA0MTI2MDU0fQ.RD8cgDspwOUEtD8mctMdOU4oHIR4CsuVfTrASL15Ozg';

async function main() {
  const email = 'superadmin@plazadance.com';
  const password = 'PlazaDance2026!';
  const fullName = 'SuperAdmin Global';

  console.log('--- Configurando usuario SuperAdmin en Supabase ---');

  // 1. Check or create user via Admin API
  const createUserRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName, role: 'superadmin' },
    }),
  });

  const userData = await createUserRes.json();
  let userId = userData.id || userData.user?.id;

  if (!userId) {
    // If already registered, fetch users list
    const listRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      },
    });
    const listData = await listRes.json();
    const existing = (listData.users || []).find((u) => u.email === email);
    if (existing) {
      userId = existing.id;
      // Update password & confirm
      await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({
          password,
          email_confirm: true,
          user_metadata: { full_name: fullName, role: 'superadmin' },
        }),
      });
      console.log('Usuario existente actualizado.');
    }
  } else {
    console.log('Nuevo usuario SuperAdmin registrado.');
  }

  if (userId) {
    // Upsert profile in DB
    const profileRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Prefer': 'resolution=merge-duplicates',
      },
      body: JSON.stringify({
        id: userId,
        email,
        full_name: fullName,
        system_role: 'superadmin',
        updated_at: new Date().toISOString(),
      }),
    });
    console.log('Perfil actualizado en BD con status:', profileRes.status);
  }

  console.log('\n========================================');
  console.log('  👑 CREDENCIALES SUPERADMIN CONFIRMADAS');
  console.log('========================================');
  console.log('  Email:    ' + email);
  console.log('  Password: ' + password);
  console.log('  Rol:      superadmin');
  console.log('========================================\n');
}

main().catch(console.error);
