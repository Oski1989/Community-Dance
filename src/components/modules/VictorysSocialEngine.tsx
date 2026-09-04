'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Quest, Reward, Redemption } from '@/types/database';
import QRCode from 'qrcode';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Flame,
  QrCode,
  PartyPopper,
  CheckCircle,
  Clock,
  Zap,
  Gift,
  ShieldCheck,
  Navigation,
  X,
  Smartphone,
} from 'lucide-react';
import { InactiveUserBanner } from '@/components/modules/InactiveUserBanner';

export const VictorysSocialEngine: React.FC = () => {
  const {
    currentSchool,
    performCheckIn,
    victoryStreakWeeks,
    quests,
    questSubmissions,
    requestQuestPoints,
    rewards,
    redeemReward,
    redemptions,
    markRedemptionUsed,
    studentRhythmPoints,
    currentUser,
    addNotification,
  } = useApp();

  const isInactive = currentUser.role === 'student' && currentUser.membership_status !== 'active';

  // GPS state
  const [gpsLoading, setGpsLoading] = useState<boolean>(false);
  const [gpsMessage, setGpsMessage] = useState<string>('');

  // Active Redemption Modal state
  const [activeRedemption, setActiveRedemption] = useState<Redemption | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [countdown, setCountdown] = useState<number>(60);

  // Generate QR Code when Redemption is active
  useEffect(() => {
    if (activeRedemption) {
      const qrPayload = JSON.stringify({
        redemptionId: activeRedemption.id,
        rewardTitle: activeRedemption.reward_title,
        timestamp: Date.now(),
      });
      QRCode.toDataURL(qrPayload, { margin: 1, width: 220 })
        .then((url) => setQrCodeDataUrl(url))
        .catch(console.error);

      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [activeRedemption]);

  // Handle GPS Check-In
  const handleGPSCheckIn = () => {
    if (isInactive) {
      addNotification('Membresía Inactiva 🔒', 'No puedes registrar check-in si tu cuenta está inactiva.', 'info');
      return;
    }

    setGpsLoading(true);
    setGpsMessage('Obteniendo coordenadas GPS en Palma de Mallorca...');

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGpsLoading(false);
          const result = performCheckIn({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setGpsMessage(result.message);
          confetti({
            particleCount: 70,
            spread: 60,
            origin: { y: 0.6 },
            colors: ['#10B981', '#F59E0B', '#8B5CF6'],
          });
        },
        () => {
          // Fallback simulation
          setGpsLoading(false);
          const result = performCheckIn();
          setGpsMessage(result.message);
          confetti({
            particleCount: 70,
            spread: 60,
            origin: { y: 0.6 },
            colors: ['#10B981', '#F59E0B', '#8B5CF6'],
          });
        },
        { timeout: 5000 }
      );
    } else {
      setGpsLoading(false);
      const result = performCheckIn();
      setGpsMessage(result.message);
    }
  };

  const handleRedeem = (rewardId: string) => {
    if (isInactive) {
      addNotification('Membresía Inactiva 🔒', 'Activa tu cuota para poder canjear consumiciones.', 'info');
      return;
    }
    const red = redeemReward(rewardId);
    if (red) {
      setActiveRedemption(red);
    }
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Inactive User Banner */}
      <InactiveUserBanner />

      {/* Social Engine Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-purple-950/60 border border-emerald-500/30 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold mb-2">
              <PartyPopper className="w-4 h-4" /> Victorys Social Engine (Palma)
            </div>
            <h2 className="text-2xl font-black text-white">Fidelización & Eventos en Vivo</h2>
            <p className="text-xs text-slate-300 mt-1 max-w-lg">
              Valida tu entrada por GPS en Victorys, mantén la racha semanal y canjea consumiciones en barra.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-950/70 p-3 rounded-2xl border border-slate-800">
            <Flame className="w-8 h-8 text-orange-500 fill-orange-500 animate-bounce" />
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Fuego en Victorys</span>
              <span className="text-lg font-black text-orange-400">{victoryStreakWeeks} Semanas Seguidas 🔥</span>
            </div>
          </div>
        </div>
      </div>

      {/* Module 4 Components Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: GPS Check-in & Rachas */}
        <div className="lg:col-span-5 space-y-6">
          {/* Event QR Code Scanner / Manual Code Input */}
          <EventQRScannerCard />

          {/* Streaks (Fuego en Victorys) */}
          <div className="bg-gradient-to-tr from-orange-950/40 via-slate-900 to-amber-950/30 border border-orange-500/30 rounded-3xl p-6 space-y-3 shadow-2xl">
            <div className="flex items-center gap-2 text-orange-400 font-bold text-sm">
              <Flame className="w-5 h-5 fill-orange-500 animate-pulse" />
              <span>Multiplicador por Racha Consecutiva</span>
            </div>
            <p className="text-xs text-slate-300">
              Llevas <strong className="text-orange-400">{victoryStreakWeeks} semanas consecutivas</strong> asistiendo. Tu multiplicador de Puntos de Ritmo es de <strong>+50%</strong>.
            </p>

            <div className="w-full bg-slate-950 rounded-full h-3 border border-slate-800 overflow-hidden">
              <div
                className="bg-gradient-to-r from-orange-500 to-amber-400 h-full transition-all duration-500 shadow-glow-gold"
                style={{ width: `${Math.min(100, (victoryStreakWeeks / 8) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Social Quests & Redemption Wallet */}
        <div className="lg:col-span-7 space-y-6">
          {/* Social Quests */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-400" /> Social Quests & Desafíos
              </h3>
              <span className="text-xs text-slate-400">Puntos de Ritmo Ganados</span>
            </div>

            <div className="space-y-3">
              {quests.map((quest) => {
                const sub = questSubmissions.find(
                  (qs) => qs.quest_id === quest.id && qs.student_id === currentUser.id
                );
                const isPending = sub?.status === 'pending';
                const isApproved = sub?.status === 'approved' || quest.completed;

                return (
                  <div
                    key={quest.id}
                    className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      isApproved
                        ? 'bg-slate-950/60 border-emerald-500/30 opacity-80'
                        : isPending
                        ? 'bg-amber-950/20 border-amber-500/40'
                        : 'bg-slate-950 border-purple-500/30 hover:border-purple-500/60'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{quest.badge_icon || '🎯'}</span>
                      <div>
                        <h4 className="font-bold text-sm text-white">{quest.title}</h4>
                        <p className="text-xs text-slate-300 mt-0.5">{quest.description}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (isInactive) {
                          addNotification('Acción Bloqueada 🔒', 'Como alumno inactivo no puedes solicitar puntos. Solicita tu alta enviando el Bizum.', 'info');
                          return;
                        }
                        requestQuestPoints(quest.id);
                      }}
                      disabled={isApproved || isPending}
                      className={`shrink-0 px-3.5 py-1.5 rounded-xl font-black text-xs transition-all ${
                        isInactive
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                          : isApproved
                          ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-500/30'
                          : isPending
                          ? 'bg-amber-950/60 text-amber-300 border border-amber-500/40'
                          : 'bg-purple-600 hover:bg-purple-500 text-white shadow-glow-violet'
                      }`}
                    >
                      {isInactive
                        ? 'Inactivo 🔒'
                        : isApproved
                        ? 'Aprobado ✅'
                        : isPending
                        ? 'Pendiente Profe 📩'
                        : `Solicitar +${quest.reward_points} Pts`}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Billetera de Canje (Bar Drink Redemption Wallet) */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                <Gift className="w-5 h-5 text-emerald-400" /> Billetera de Canje en Barra Victorys
              </h3>
              <span className="text-xs font-bold text-emerald-400">
                Saldo: {studentRhythmPoints} Puntos
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {rewards.map((reward) => (
                <div
                  key={reward.id}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-emerald-500/40 transition-all flex flex-col justify-between gap-3"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{reward.badge_icon || '🍹'}</span>
                    <div>
                      <h4 className="font-bold text-xs text-white leading-snug">{reward.title}</h4>
                      <span className="text-xs font-bold text-emerald-400">{reward.cost_points} Puntos</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRedeem(reward.id)}
                    disabled={studentRhythmPoints < reward.cost_points}
                    className={`w-full py-2 rounded-xl text-xs font-extrabold transition-all ${
                      studentRhythmPoints >= reward.cost_points
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-slate-950 shadow-glow-emerald'
                        : 'bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed'
                    }`}
                  >
                    {studentRhythmPoints >= reward.cost_points ? 'Canjear Puntos' : 'Puntos Insuficientes'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic 60s Countdown QR Modal for Bartender Validation */}
      <AnimatePresence>
        {activeRedemption && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center space-y-4 relative"
            >
              <button
                onClick={() => setActiveRedemption(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-xs">
                <ShieldCheck className="w-4 h-4" /> QR Dinámico para Camarero
              </div>

              <div>
                <h3 className="text-lg font-black text-white">{activeRedemption.reward_title}</h3>
                <p className="text-xs text-slate-400 mt-0.5">Muestra este código al encargado en la barra de Victorys</p>
              </div>

              {/* QR Image */}
              <div className="p-4 bg-white rounded-2xl inline-block shadow-2xl border-4 border-emerald-500/40">
                {qrCodeDataUrl && <img src={qrCodeDataUrl} alt="Redemption QR Code" className="w-48 h-48 mx-auto" />}
              </div>

              {/* 60s Countdown Timer */}
              <div className="flex items-center justify-center gap-2 text-xs font-bold text-amber-400 bg-amber-950/40 p-2 rounded-xl border border-amber-500/30">
                <Clock className="w-4 h-4 animate-spin" />
                <span>Expira en: {countdown}s</span>
              </div>

              <button
                onClick={() => {
                  if (activeRedemption) {
                    markRedemptionUsed(activeRedemption.id);
                    setActiveRedemption(null);
                  }
                }}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
              >
                Simular Confirmación por Camarero
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const EventQRScannerCard: React.FC = () => {
  const { currentSchool, scanEventQR } = useApp();

  const [inputCode, setInputCode] = useState<string>('');
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);

  const handleScanSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputCode.trim()) return;
    const res = scanEventQR(inputCode);
    setScanResult(res);
    if (res.success) {
      setInputCode('');
      setIsCameraActive(false);
    }
  };

  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      // Simulate reading QR code from camera photo or file
      const simulatedCode = currentSchool.active_event_qr?.code || 'VICTORYS-NEON-2026';
      setInputCode(simulatedCode);
      const res = scanEventQR(simulatedCode);
      setScanResult(res);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl relative overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <QrCode className="w-5 h-5 text-emerald-400" />
          <h3 className="font-extrabold text-white text-base">Escanear QR de Fiesta Victorys</h3>
        </div>
        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
          QR Oficial Local
        </span>
      </div>

      <p className="text-xs text-slate-300">
        Apunta tu cámara al cartel de la fiesta en <strong className="text-white">{currentSchool.venue_name || 'Victorys Palma'}</strong> o escribe el código token.
      </p>

      {/* Camera Native Reader / File Upload + Manual Input */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          {/* Native Camera Capture Button */}
          <label
            htmlFor="qr-camera-capture"
            className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 hover:border-emerald-400 text-emerald-300 hover:text-white font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-glow-emerald/20"
          >
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span>Escanear con Cámara</span>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleCameraCapture}
              className="hidden"
              id="qr-camera-capture"
            />
          </label>

          {/* Upload QR Image from Gallery */}
          <label
            htmlFor="qr-gallery-input"
            className="p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-purple-500/40 text-slate-300 hover:text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <QrCode className="w-4 h-4 text-purple-400" />
            <span>Subir Imagen QR</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleCameraCapture}
              className="hidden"
              id="qr-gallery-input"
            />
          </label>
        </div>

        {/* Manual Code Input Form */}
        <form onSubmit={handleScanSubmit} className="flex gap-2">
          <input
            type="text"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            placeholder="O escribe el código (ej: VICTORYS-NEON-2026)"
            className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 font-mono text-xs font-bold uppercase focus:border-emerald-500 outline-none"
          />
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs shadow-glow-emerald transition-all"
          >
            Validar
          </button>
        </form>
      </div>

      {scanResult && (
        <div
          className={`p-3 rounded-xl border text-xs font-bold text-center ${
            scanResult.success
              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
          }`}
        >
          {scanResult.message}
        </div>
      )}
    </div>
  );
};
