'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Zap, Trophy, Info, X } from 'lucide-react';

export const NotificationToasts: React.FC = () => {
  const { notifications, removeNotification } = useApp();

  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {notifications.map((n) => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, x: 50 }}
            className={`pointer-events-auto p-4 rounded-xl backdrop-blur-xl border shadow-xl flex items-start gap-3 ${
              n.type === 'xp'
                ? 'bg-amber-950/80 border-amber-500/40 text-amber-100 shadow-glow-gold'
                : n.type === 'rhythm'
                ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-100 shadow-glow-emerald'
                : n.type === 'badge'
                ? 'bg-purple-950/80 border-purple-500/40 text-purple-100 shadow-glow-violet'
                : 'bg-slate-900/90 border-slate-700/50 text-slate-200'
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {n.type === 'xp' && <Trophy className="w-5 h-5 text-amber-400 animate-bounce" />}
              {n.type === 'rhythm' && <Zap className="w-5 h-5 text-emerald-400 animate-pulse" />}
              {n.type === 'badge' && <CheckCircle2 className="w-5 h-5 text-purple-400" />}
              {n.type === 'info' && <Info className="w-5 h-5 text-cyan-400" />}
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-sm leading-tight">{n.title}</h4>
              <p className="text-xs text-slate-300 mt-1 leading-snug">{n.message}</p>
            </div>

            <button
              onClick={() => removeNotification(n.id)}
              className="text-slate-400 hover:text-white transition-colors p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
