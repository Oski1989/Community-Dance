'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Upload, CheckCircle, Clock, Send, ShieldAlert, CreditCard } from 'lucide-react';

export const InactiveStudentBanner: React.FC = () => {
  const { currentUser, requestActivation } = useApp();
  const [showModal, setShowModal] = useState<boolean>(false);
  const [paymentNote, setPaymentNote] = useState<string>('');
  const [receiptUrl, setReceiptUrl] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  // If user is ACTIVE or is Teacher/Admin, do not show banner
  if (currentUser.role !== 'student' || currentUser.membership_status === 'active') {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentNote) return;

    requestActivation(
      paymentNote,
      receiptUrl || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&auto=format&fit=crop&q=80'
    );
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setShowModal(false);
    }, 1500);
  };

  return (
    <>
      {/* Top Banner Notice */}
      <div className="bg-gradient-to-r from-amber-950 via-rose-950/80 to-amber-950 border-b border-amber-500/40 px-4 py-3 text-amber-100 shadow-xl">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 animate-pulse" />
            <div>
              <span className="font-extrabold text-amber-300">
                {currentUser.membership_status === 'pending_approval'
                  ? ' Módulo Limitado: Solicitud de Membresía en Revisión'
                  : ' Estado Inactivo: Membresía no Activada'}
              </span>
              <p className="text-[11px] text-amber-200/80">
                {currentUser.membership_status === 'pending_approval'
                  ? 'Tu comprobante de pago está siendo revisado por el Profesor. Acceso en modo lectura.'
                  : 'Puedes consultar tu historial anterior, pero las entregas de vídeo y canjes en barra están inactivos.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="shrink-0 px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-glow-gold transition-all flex items-center gap-1.5"
          >
            <CreditCard className="w-4 h-4" />
            <span>
              {currentUser.membership_status === 'pending_approval'
                ? 'Ver Solicitud Enviada'
                : 'Solicitar Activación / Adjuntar Bizum'}
            </span>
          </button>
        </div>
      </div>

      {/* Activation Request Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 relative"
            >
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <CreditCard className="w-5 h-5" />
                <span>Solicitar Activación de Membresía</span>
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-black text-white">Comprobante de Pago o Bizum</h3>
                <p className="text-xs text-slate-300">
                  Realiza el Bizum/pago de tu mensualidad e introduce la referencia o sube la captura para que el Profesor confirme tu alta.
                </p>
              </div>

              {currentUser.membership_status === 'pending_approval' && (
                <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-amber-200 text-xs space-y-1">
                  <span className="font-bold flex items-center gap-1">
                    <Clock className="w-4 h-4 text-amber-400 animate-spin" /> Solicitud Actual en Proceso
                  </span>
                  <p className="text-[11px] text-slate-300">Nota enviada: "{currentUser.payment_note}"</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 block">
                    Referencia Bizum / Nota del Pago (*):
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Bizum 30€ realizado hoy. Ref: BZ-849102"
                    value={paymentNote}
                    onChange={(e) => setPaymentNote(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 block">
                    Adjuntar Captura de Recibo / Bizum:
                  </label>
                  <div className="border-2 border-dashed border-slate-800 rounded-2xl p-4 text-center hover:border-amber-500 transition-colors bg-slate-950/50">
                    <Upload className="w-6 h-6 text-amber-400 mx-auto mb-1" />
                    <p className="text-xs text-slate-400">Seleccionar imagen de recibo o comprobante</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setReceiptUrl(URL.createObjectURL(e.target.files[0]));
                        }
                      }}
                      className="hidden"
                      id="receipt-input"
                    />
                    <label
                      htmlFor="receipt-input"
                      className="mt-2 inline-block px-3 py-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold rounded-xl cursor-pointer"
                    >
                      Subir Imagen
                    </label>
                  </div>
                </div>

                {receiptUrl && (
                  <div className="rounded-xl overflow-hidden max-h-32 border border-slate-800">
                    <img src={receiptUrl} alt="Comprobante" className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
                  >
                    Cerrar
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-glow-gold transition-all flex items-center gap-1.5"
                  >
                    {isSubmitted ? (
                      <>
                        <CheckCircle className="w-4 h-4" /> Solicitud Enviada
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" /> Enviar para Revisión
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
