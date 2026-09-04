'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Lock, Send, CheckCircle2, Upload, FileText, Camera, Image as ImageIcon } from 'lucide-react';

export const InactiveUserBanner: React.FC = () => {
  const { currentUser, requestActivation } = useApp();
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [paymentNote, setPaymentNote] = useState<string>('');
  const [receiptUrl, setReceiptUrl] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);

  if (currentUser.role !== 'student' || currentUser.membership_status === 'active') {
    return null;
  }

  const isPending = currentUser.membership_status === 'pending_approval';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setReceiptUrl(url);
    }
  };

  const handleSubmitActivation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentNote.trim()) return;
    const finalUrl = receiptUrl || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&auto=format&fit=crop&q=80';
    requestActivation(paymentNote, finalUrl);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setIsOpenModal(false);
    }, 1500);
  };

  return (
    <>
      {/* Banner Sticky Bar */}
      <div className="mb-6 p-4 rounded-3xl bg-gradient-to-r from-amber-950/70 via-slate-900 to-rose-950/70 border border-amber-500/40 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 mt-0.5">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                {isPending ? 'Solicitud de Membresía en Revisión ⏳' : 'Modo Lectura - Membresía Inactiva 🔒'}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              {isPending
                ? 'El profesor está revisando tu comprobante de pago Bizum. Te notificaremos cuando tu cuenta sea activada.'
                : 'Puedes explorar los contenidos de la escuela, pero las funciones activas (subir clips de vídeo, pedir puntos y canjear bebidas) están limitadas.'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsOpenModal(true)}
          className="px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-glow-gold transition-all shrink-0 flex items-center justify-center gap-2"
        >
          {isPending ? 'Ver / Editar Comprobante' : '⚡ Solicitar Alta con Bizum'}
        </button>
      </div>

      {/* Reactivation Request Modal */}
      <AnimatePresence>
        {isOpenModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 relative"
            >
              <button
                onClick={() => setIsOpenModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                ✕
              </button>

              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <FileText className="w-5 h-5" />
                <span>Comprobante de Pago & Reactivación</span>
              </div>

              <div>
                <h3 className="text-lg font-black text-white">Solicitud de Alta para {currentUser.full_name}</h3>
                <p className="text-xs text-slate-300 mt-1">
                  Adjunta los datos o la referencia de tu Bizum o transferencia para que el profesor active tu cuenta.
                </p>
              </div>

              {submitted ? (
                <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto animate-bounce" />
                  <h4 className="font-extrabold text-sm text-white">¡Solicitud Enviada con Éxito!</h4>
                  <p className="text-xs text-emerald-300">
                    El profesor la revisará en su panel de administración.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmitActivation} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      Nota / Referencia de Pago Bizum:
                    </label>
                    <input
                      type="text"
                      required
                      value={paymentNote}
                      onChange={(e) => setPaymentNote(e.target.value)}
                      placeholder="ej: Bizum de 50€ este viernes. Ref: BZ-984021"
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-semibold focus:border-amber-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1.5">
                      Adjuntar Captura / Foto del Bizum:
                    </label>
                    
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      {/* Option 1: Take Photo with Camera */}
                      <label
                        htmlFor="camera-receipt-input"
                        className="p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-amber-500/60 text-slate-300 hover:text-white text-xs font-bold flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all text-center"
                      >
                        <Camera className="w-5 h-5 text-amber-400" />
                        <span>Tomar Foto (Cámara)</span>
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          onChange={handleFileChange}
                          className="hidden"
                          id="camera-receipt-input"
                        />
                      </label>

                      {/* Option 2: Choose File from Device */}
                      <label
                        htmlFor="file-receipt-input"
                        className="p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-amber-500/60 text-slate-300 hover:text-white text-xs font-bold flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all text-center"
                      >
                        <ImageIcon className="w-5 h-5 text-purple-400" />
                        <span>Buscar en Archivos</span>
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={handleFileChange}
                          className="hidden"
                          id="file-receipt-input"
                        />
                      </label>
                    </div>

                    {receiptUrl && (
                      <div className="relative rounded-2xl overflow-hidden max-h-36 border border-amber-500/40 bg-black">
                        <img src={receiptUrl} alt="Vista previa" className="w-full h-full object-cover" />
                        <span className="absolute bottom-2 right-2 bg-emerald-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full">
                          ✓ Foto Cargada
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsOpenModal(false)}
                      className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-glow-gold transition-all flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" /> Enviar al Profesor
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
