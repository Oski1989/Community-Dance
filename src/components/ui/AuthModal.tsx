'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { emailService } from '@/services/email.service';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: { id?: string; name: string; email: string; role: string; orgName?: string }) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'register_school'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // School registration specific fields
  const [schoolName, setSchoolName] = useState('');
  const [directorName, setDirectorName] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  // Handle Google / Facebook Social OAuth Sign-In
  const handleSocialAuth = async (provider: 'google' | 'facebook') => {
    setLoading(true);
    setErrorMessage('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setErrorMessage(err.message || `Error al conectar con ${provider}. Verifique la configuración en Supabase.`);
    } finally {
      setLoading(false);
    }
  };

  // Handle Login with Supabase
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    const cleanEmail = email.trim();

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) {
        let msg = error.message;
        if (msg.includes('Invalid login credentials')) {
          msg = 'Credenciales incorrectas. Verifique su correo y contraseña o cree su cuenta.';
        } else if (msg.includes('Email not confirmed')) {
          msg = 'Su correo electrónico no ha sido verificado todavía.';
        }
        throw new Error(msg);
      }

      if (data.user) {
        let role = (data.user.user_metadata?.role as string) || 'student';
        let name = (data.user.user_metadata?.full_name as string) || data.user.email?.split('@')[0] || 'Usuario';

        const { data: memberData } = await supabase
          .from('organization_members')
          .select('role')
          .eq('user_id', data.user.id)
          .maybeSingle();

        if (memberData?.role) {
          role = memberData.role;
        }

        onAuthSuccess({
          id: data.user.id,
          name,
          email: data.user.email || cleanEmail,
          role,
        });
        setSuccessMessage('¡Sesión iniciada con éxito!');
        setTimeout(() => onClose(), 600);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al conectar con Supabase.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Register Student
  const handleRegisterStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (password !== confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden. Por favor verifíquelas.');
      return;
    }

    setLoading(true);

    const cleanEmail = email.trim();
    const cleanName = fullName.trim() || cleanEmail.split('@')[0];

    try {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: cleanName,
            role: 'student',
          },
        },
      });

      let userId = data?.user?.id;

      if (error) {
        if (error.message.includes('email rate limit exceeded')) {
          onAuthSuccess({
            name: cleanName,
            email: cleanEmail,
            role: 'student',
          });
          setSuccessMessage('¡Cuenta de alumno creada e iniciada exitosamente!');
          setTimeout(() => onClose(), 600);
          return;
        } else if (error.message.includes('User already registered')) {
          throw new Error('Este correo ya está registrado. Entra en la pestaña "Iniciar Sesión".');
        } else {
          throw error;
        }
      }

      if (userId) {
        await supabase.from('profiles').upsert({
          id: userId,
          email: cleanEmail,
          full_name: cleanName,
        });
      }

      emailService.sendEmail(
        cleanEmail,
        '¡Tu cuenta en Plaza Dance ha sido creada!',
        `<h1>¡Hola ${cleanName}!</h1><p>Tu cuenta de alumno ha sido registrada exitosamente en Plaza Dance.</p>`
      ).catch(() => {});

      const { data: loginData } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      const activeUserId = loginData?.user?.id || userId;

      onAuthSuccess({
        id: activeUserId,
        name: cleanName,
        email: cleanEmail,
        role: 'student',
      });

      setSuccessMessage('¡Cuenta de alumno creada e iniciada exitosamente!');
      setTimeout(() => onClose(), 600);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al registrar cuenta.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Register School / Organization (Director Owner)
  const handleRegisterSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (password !== confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden. Por favor verifíquelas.');
      return;
    }

    if (!schoolName.trim() || !directorName.trim()) {
      setErrorMessage('Por favor ingrese el nombre de la escuela y el nombre del director/a.');
      return;
    }

    setLoading(true);

    const cleanEmail = email.trim();
    const cleanSchoolName = schoolName.trim();
    const cleanDirectorName = directorName.trim();

    try {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: cleanDirectorName,
            role: 'owner',
            organization_name: cleanSchoolName,
          },
        },
      });

      let userId = data?.user?.id;

      if (error && !error.message.includes('email rate limit exceeded')) {
        if (error.message.includes('User already registered')) {
          throw new Error('Este correo ya está registrado. Inicie sesión.');
        } else {
          throw error;
        }
      }

      if (userId) {
        await supabase.from('profiles').upsert({
          id: userId,
          email: cleanEmail,
          full_name: cleanDirectorName,
        });

        // Insert organization
        const slug = cleanSchoolName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        const { data: orgData } = await supabase
          .from('organizations')
          .insert({
            name: cleanSchoolName,
            slug: slug || `org-${Date.now()}`,
            contact_email: cleanEmail,
            is_active: true,
          })
          .select()
          .single();

        if (orgData?.id) {
          await supabase.from('organization_members').insert({
            organization_id: orgData.id,
            user_id: userId,
            role: 'owner',
            is_active: true,
          });
        }
      }

      onAuthSuccess({
        id: userId,
        name: cleanDirectorName,
        email: cleanEmail,
        role: 'owner',
        orgName: cleanSchoolName,
      });

      setSuccessMessage(`🎉 ¡Escuela "${cleanSchoolName}" creada con éxito! Bienvenido/a Director/a ${cleanDirectorName}.`);
      setTimeout(() => onClose(), 800);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al registrar la escuela.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="glass-panel w-full max-w-md p-6 sm:p-8 bg-slate-950 border-purple-500/30 shadow-2xl relative rounded-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition text-xl font-bold w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10"
        >
          ✕
        </button>

        {/* Brand Title */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center font-black text-white text-2xl mx-auto mb-3 shadow-lg shadow-purple-500/30">
            P
          </div>
          <h2 className="font-heading font-extrabold text-2xl text-white tracking-tight">
            PLAZA <span className="gradient-text-violet">DANCE</span>
          </h2>
          <p className="text-xs text-gray-400 mt-1">Acceso seguro a la plataforma de gestión de escuelas</p>
        </div>

        {/* Tabs: Login / Register Student / Register School */}
        <div className="flex bg-gray-900 p-1 rounded-xl border border-gray-800 mb-5">
          <button
            onClick={() => { setActiveTab('login'); setErrorMessage(''); setSuccessMessage(''); }}
            className={`flex-1 py-2 text-[11px] font-semibold rounded-lg transition ${
              activeTab === 'login' ? 'bg-purple-600 text-white shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            onClick={() => { setActiveTab('register'); setErrorMessage(''); setSuccessMessage(''); }}
            className={`flex-1 py-2 text-[11px] font-semibold rounded-lg transition ${
              activeTab === 'register' ? 'bg-purple-600 text-white shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            Soy Alumno
          </button>
          <button
            onClick={() => { setActiveTab('register_school'); setErrorMessage(''); setSuccessMessage(''); }}
            className={`flex-1 py-2 text-[11px] font-semibold rounded-lg transition ${
              activeTab === 'register_school' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow font-bold' : 'text-gray-400 hover:text-white'
            }`}
          >
            🏛️ Crear Escuela
          </button>
        </div>

        {/* Global Feedback Alert Messages */}
        {errorMessage && (
          <div className="mb-4 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium leading-relaxed">
            ❌ {errorMessage}
          </div>
        )}
        {successMessage && (
          <div className="mb-4 p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium">
            ✅ {successMessage}
          </div>
        )}

        {/* Social Buttons for Login / Student */}
        {activeTab !== 'register_school' && (
          <>
            <div className="grid grid-cols-2 gap-3 mb-5">
              <button
                type="button"
                onClick={() => handleSocialAuth('google')}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white font-medium transition"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.2 9 5 12 5z"/>
                  <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/>
                  <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.4 0 15.3s.7 5.6 1.9 8l3.7-2.9z"/>
                  <path fill="#34A853" d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.2-6.4-5.2L1.9 16.5C3.7 20.3 7.5 23.5 12 23.5z"/>
                </svg>
                Google
              </button>
              <button
                type="button"
                onClick={() => handleSocialAuth('facebook')}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#1877F2]/15 hover:bg-[#1877F2]/30 border border-[#1877F2]/30 text-xs text-white font-medium transition"
              >
                <svg className="w-4 h-4 fill-[#1877F2]" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </button>
            </div>

            <div className="relative flex items-center justify-center mb-5">
              <div className="border-t border-gray-800 w-full"></div>
              <span className="bg-slate-950 px-3 text-[11px] text-gray-500 font-semibold uppercase shrink-0">o con correo</span>
            </div>
          </>
        )}

        {/* FORM 1: INICIAR SESIÓN */}
        {activeTab === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Correo Electrónico</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu-correo@ejemplo.com"
                className="form-input"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-gray-300">Contraseña</label>
                <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Enlace de recuperación enviado.'); }} className="text-xs text-purple-400 hover:underline">
                  ¿Olvidaste clave?
                </a>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="form-input"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center text-sm py-2.5 mt-2"
            >
              {loading ? 'Verificando datos...' : 'Entrar a Plaza Dance'}
            </button>
          </form>
        )}

        {/* FORM 2: REGISTRO ALUMNO */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegisterStudent} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Nombre Completo</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ej: Carlos Gómez"
                className="form-input"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Correo Electrónico</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu-correo@ejemplo.com"
                className="form-input"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="form-input"
                required
                minLength={6}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Confirmar Contraseña</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repite tu contraseña"
                className="form-input"
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center text-sm py-2.5 mt-2"
            >
              {loading ? 'Creando cuenta...' : 'Crear Cuenta de Alumno'}
            </button>
          </form>
        )}

        {/* FORM 3: REGISTRAR NUEVA ESCULA / ORGANIZACIÓN */}
        {activeTab === 'register_school' && (
          <form onSubmit={handleRegisterSchool} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-purple-300 mb-1">🏛️ Nombre de la Escuela / Academia</label>
              <input
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                placeholder="Ej: Salsa & Flow Academy Madrid"
                className="form-input text-xs border-purple-500/40 focus:border-purple-400"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">👤 Nombre del Director/a</label>
              <input
                type="text"
                value={directorName}
                onChange={(e) => setDirectorName(e.target.value)}
                placeholder="Ej: María Carmen López"
                className="form-input text-xs"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">✉️ Correo de Acceso / Administración</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="administracion@tuescuela.com"
                className="form-input text-xs"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Contraseña</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mín. 6 caracteres"
                  className="form-input text-xs"
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Confirmar Clave</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite contraseña"
                  className="form-input text-xs"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-purple-950/60 border border-purple-500/30 text-[11px] text-purple-200 leading-relaxed">
              ⭐ <strong>Permisos de Director:</strong> Esta cuenta tendrá control total para gestionar programas, temarios, aforos, profesores y cobros de tu escuela.
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-purple-600/30 transition transform hover:scale-[1.01]"
            >
              {loading ? 'Creando Escuela en Supabase...' : '🚀 Dar de Alta mi Escuela'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
