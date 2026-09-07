import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      status: 'skipped',
      message: 'Supabase no está configurado aún con variables de entorno reales.',
    });
  }

  try {
    const results: Record<string, string> = {};

    // 1. Seed Main School
    const { error: schoolErr } = await supabase.from('schools').upsert({
      id: 'school-1',
      name: 'Victorys Baile & Social Club',
      city: 'Palma de Mallorca',
      venue_name: 'Discoteca Victorys Palma',
      has_social_engine: true,
      membership_fee_monthly: 50,
    });
    results['schools'] = schoolErr ? schoolErr.message : 'OK / Synced';

    // 2. Seed Initial Admin Profile
    const { error: adminErr } = await supabase.from('profiles').upsert({
      id: 'admin-super',
      full_name: 'SuperAdmin Master',
      email: 'admin@dance.com',
      role: 'admin',
      membership_status: 'active',
      phone: '+34 600 000 001',
    });
    results['admin_profile'] = adminErr ? adminErr.message : 'OK / Synced';

    return NextResponse.json({
      status: 'success',
      message: 'Base de datos verificada e inicializada correctamente.',
      timestamp: new Date().toISOString(),
      details: results,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        status: 'error',
        message: err?.message || 'Error en autoconfiguración de base de datos',
      },
      { status: 500 }
    );
  }
}
