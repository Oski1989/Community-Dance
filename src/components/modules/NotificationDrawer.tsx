'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check, Award, Flame, Zap, Info, ShieldCheck } from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const { notifications, clearNotifications } = useApp();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm">
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="w-full max-w-md bg-[#0B0F17] border-l border-slate-800/80 h-full p-6 flex flex-col justify-between shadow-2xl space-y-4"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-white text-base">Notificaciones DanceXP</h3>
                  <p className="text-[11px] text-slate-400">Historial de alertas y acreditaciones de XP</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {notifications.length === 0 ? (
                <div className="py-12 text-center text-slate-500 space-y-2">
                  <Bell className="w-8 h-8 mx-auto text-slate-700" />
                  <p className="text-xs font-bold">No tienes notificaciones pendientes.</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-3.5 rounded-2xl border flex items-start gap-3 transition-all ${
                      n.read
                        ? 'bg-slate-950/60 border-slate-900 text-slate-400'
                        : 'bg-slate-900 border-purple-500/30 text-white shadow-lg'
                    }`}
                  >
                    <div
                      className={`p-2 rounded-xl text-xs font-bold mt-0.5 ${
                        n.type === 'xp'
                          ? 'bg-purple-500/20 text-purple-300'
                          : n.type === 'rhythm'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : n.type === 'badge'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {n.type === 'xp' ? (
                        <Award className="w-4 h-4" />
                      ) : n.type === 'rhythm' ? (
                        <Flame className="w-4 h-4" />
                      ) : n.type === 'badge' ? (
                        <Zap className="w-4 h-4" />
                      ) : (
                        <Info className="w-4 h-4" />
                      )}
                    </div>

                    <div className="flex-1 space-y-0.5">
                      <h4 className="font-extrabold text-xs text-white">{n.title}</h4>
                      <p className="text-[11px] text-slate-300 leading-snug">{n.message}</p>
                      <span className="text-[9px] text-slate-500 block pt-1">
                        {n.created_at ? new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Hace un momento'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Drawer Footer */}
            {notifications.length > 0 && (
              <div className="border-t border-slate-800 pt-4">
                <button
                  onClick={clearNotifications}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold text-xs transition-all flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4 text-emerald-400" /> Marcar Todo como Leído
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
