'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Trophy, Sparkles, Send, User, Check, Plus, X } from 'lucide-react';

import { INITIAL_PROFILES } from '@/lib/mockData';

interface FlashPropsModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const FlashPropsModal: React.FC<FlashPropsModalProps> = ({ isOpen = true, onClose }) => {
  const { flashProps, sendFlashProp } = useApp();

  const students = INITIAL_PROFILES.filter((p) => p.role === 'student');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [selectedPropTitle, setSelectedPropTitle] = useState<string>(flashProps[0]?.title || 'Eje Impecable');
  const [xpValue, setXpValue] = useState<number>(15);
  const [customText, setCustomText] = useState<string>('');
  const [isSent, setIsSent] = useState<boolean>(false);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const finalTitle = customText ? customText : selectedPropTitle;
    sendFlashProp(selectedStudentId, finalTitle, xpValue);

    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.5 },
      colors: ['#F59E0B', '#8B5CF6', '#10B981'],
    });

    setIsSent(true);
    setTimeout(() => {
      setIsSent(false);
      if (onClose) onClose();
    }, 1200);
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-yellow-950/60 via-slate-900 to-purple-950/60 border border-yellow-500/30 shadow-2xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/40 text-yellow-300 text-xs font-bold mb-2">
          <Zap className="w-4 h-4 fill-yellow-400" /> Reconocimiento Exprés 1-Tap
        </div>
        <h2 className="text-2xl font-black text-white">Flash Props en Pista</h2>
        <p className="text-xs text-slate-300 mt-1">
          Otorga reconocimientos instantáneos durante la clase o en el social de Victorys con asignación dinámica de XP.
        </p>
      </div>

      {/* Main Flash Prop Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 max-w-2xl mx-auto shadow-2xl">
        <form onSubmit={handleSend} className="space-y-6">
          {/* Step 1: Select Student */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              1. Selecciona Alumno en Pista:
            </label>
            <div className="grid grid-cols-3 gap-3">
              {students.map((student) => (
                <button
                  type="button"
                  key={student.id}
                  onClick={() => setSelectedStudentId(student.id)}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-2 ${
                    selectedStudentId === student.id
                      ? 'bg-purple-950/60 border-purple-500 text-white shadow-glow-violet'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <img
                    src={student.avatar_url}
                    alt={student.full_name}
                    className="w-10 h-10 rounded-full object-cover border border-white/20"
                  />
                  <span className="text-xs font-extrabold line-clamp-1">{student.full_name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Select Pre-configured Flash Prop Tag */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              2. Elige Elogio Técnico Rápido:
            </label>
            <div className="flex flex-wrap gap-2">
              {flashProps.map((prop) => (
                <button
                  type="button"
                  key={prop.id}
                  onClick={() => {
                    setSelectedPropTitle(prop.title);
                    setXpValue(prop.default_xp);
                    setCustomText('');
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                    selectedPropTitle === prop.title && !customText
                      ? 'bg-amber-500 text-slate-950 border-amber-400 font-extrabold shadow-glow-gold'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{prop.title}</span>
                  <span className="text-[10px] opacity-80">(+{prop.default_xp} XP)</span>
                </button>
              ))}
            </div>
          </div>

          {/* Step 3: Free-Text Custom Option ("Otros") */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              O Escribe Elogio Personalizado ("Otros"):
            </label>
            <input
              type="text"
              placeholder="Ej: Tremendo footwork en el solo..."
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Step 4: XP Adjuster */}
          <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-amber-300 block">Puntos XP Acreditados</span>
              <span className="text-[10px] text-slate-400">Asignación instantánea modificable</span>
            </div>

            <div className="flex items-center gap-2">
              {[10, 15, 20, 25, 50].map((val) => (
                <button
                  type="button"
                  key={val}
                  onClick={() => setXpValue(val)}
                  className={`w-8 h-8 rounded-xl font-black text-xs border transition-all ${
                    xpValue === val
                      ? 'bg-amber-400 text-slate-950 border-amber-300'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSent}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-slate-950 font-black text-sm shadow-glow-gold transition-all flex items-center justify-center gap-2 scale-105"
          >
            {isSent ? (
              <>
                <Check className="w-5 h-5" /> ¡Enviado con Éxito!
              </>
            ) : (
              <>
                <Send className="w-5 h-5" /> Otorgar Reconocimiento en Pista
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
