const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://lplvscrlodpwmrtezfuh.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxwbHZzY3Jsb2Rwd21ydGV6ZnVoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODU1MDA1NCwiZXhwIjoyMTA0MTI2MDU0fQ.RD8cgDspwOUEtD8mctMdOU4oHIR4CsuVfTrASL15Ozg';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function createSuperAdmin() {
  const email = 'superadmin@plazadance.com';
  const password = 'PlazaDance2026!';
  const fullName = 'SuperAdmin Global';

  console.log('--- Creando cuenta SuperAdmin en Supabase Auth ---');
  
  const { data: userData, error: userError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      role: 'superadmin',
    },
  });

  if (userError) {
    if (userError.message.includes('already been registered')) {
      console.log('El email ya existe. Actualizando...');
      const { data: users } = await supabase.auth.admin.listUsers();
      const existingUser = users?.users?.find(u => u.email === email);
      if (existingUser) {
        await supabase.auth.admin.updateUserById(existingUser.id, {
          password,
          email_confirm: true,
          user_metadata: { full_name: fullName, role: 'superadmin' },
        });
        await supabase.from('profiles').upsert({
          id: existingUser.id, full_name: fullName, role: 'superadmin', email,
        }, { onConflict: 'id' });
        console.log('OK actualizado. ID:', existingUser.id);
      }
    } else {
      console.error('ERROR:', userError.message);
    }
  } else {
    const userId = userData.user.id;
    console.log('Usuario creado. ID:', userId);
    await supabase.from('profiles').upsert({
      id: userId, full_name: fullName, role: 'superadmin', email,
    }, { onConflict: 'id' });
  }

  console.log('');
  console.log('========================================');
  console.log('  SUPERADMIN CREDENTIALS');
  console.log('========================================');
  console.log('  Email:    ' + email);
  console.log('  Password: ' + password);
  console.log('  Role:     superadmin');
  console.log('========================================');
}

createSuperAdmin().catch(console.error);
