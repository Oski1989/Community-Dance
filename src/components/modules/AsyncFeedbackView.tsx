'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Submission } from '@/types/database';
import { SmartVideoPlayer } from './SmartVideoPlayer';
import confetti from 'canvas-confetti';
import { motion } from 'framer-motion';
import {
  Video,
  Play,
  Pause,
  RotateCcw,
  FastForward,
  Rewind,
  Mic,
  MicOff,
  CheckCircle,
  XCircle,
  Pencil,
  Trash2,
  Trophy,
  Zap,
  Volume2,
  Sparkles,
  Layers,
} from 'lucide-react';

export const AsyncFeedbackView: React.FC = () => {
  const { submissions, currentUser, gradeSubmission, submitVideo, studentRhythmPoints, levelTrees, disciplines } = useApp();

  const isStudent = currentUser.role === 'student';

  // Filter submissions if student
  const displayedSubmissions = isStudent
    ? submissions.filter((s) => s.student_id === currentUser.id)
    : submissions;

  const [selectedProgramFilter, setSelectedProgramFilter] = useState<string>('all');

  // Filter submissions by program / discipline
  const filteredSubmissions = displayedSubmissions.filter((sub) => {
    if (selectedProgramFilter === 'all') return true;
    const targetTree = levelTrees.find((lt) => lt.nodes.some((n) => n.title === sub.node_title || n.id === sub.node_id));
    return targetTree ? targetTree.discipline_id === selectedProgramFilter : true;
  });

  const [activeSubmission, setActiveSubmission] = useState<Submission | null>(
    filteredSubmissions.find((s) => s.status === 'pending') || filteredSubmissions[0] || null
  );

  // Helper to find discipline name for a submission
  const getDisciplineNameForSubmission = (sub: Submission) => {
    const targetTree = levelTrees.find((lt) => lt.nodes.some((n) => n.title === sub.node_title || n.id === sub.node_id));
    const targetDisc = disciplines.find((d) => d.id === targetTree?.discipline_id);
    return targetDisc?.name || 'Programa de Baile';
  };

  // Student upload state
  const [selectedNodeId, setSelectedNodeId] = useState<string>(
    levelTrees[0]?.nodes[0]?.id || 'node-101'
  );
  const [videoUrlInput, setVideoUrlInput] = useState<string>('');

  // Video & Canvas state
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [drawColor, setDrawColor] = useState<string>('#F43F5E'); // Neon Rose default
  const [isDrawing, setIsDrawing] = useState<boolean>(false);

  // Audio Recording state
  const [isRecordingAudio, setIsRecordingAudio] = useState<boolean>(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Conversion rate of Rhythm Points to Technical XP
  const [conversionRate, setConversionRate] = useState<number>(50);
  const [customXP, setCustomXP] = useState<number>(50);

  useEffect(() => {
    if (displayedSubmissions.length > 0 && !activeSubmission) {
      setActiveSubmission(displayedSubmissions[0]);
    }
  }, [displayedSubmissions]);

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoUrlInput.trim()) return;
    submitVideo(selectedNodeId, videoUrlInput.trim());
    setVideoUrlInput('');
  };

  // Handle Video Speed
  const changeSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  // Toggle Video Play/Pause
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Step Frame
  const stepFrame = (forward: boolean) => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
      videoRef.current.currentTime += forward ? 0.04 : -0.04;
    }
  };

  // Canvas Drawing Handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.strokeStyle = drawColor;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // Web Audio MediaRecorder
  const startAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
      };

      mediaRecorder.start();
      setIsRecordingAudio(true);
      setRecordingSeconds(0);

      // Auto stop at 10 seconds limit
      const timer = setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev >= 9) {
            clearInterval(timer);
            stopAudioRecording();
            return 10;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      // Fallback simulation if mic not granted in iframe
      setIsRecordingAudio(true);
      setRecordingSeconds(0);
      setTimeout(() => {
        setIsRecordingAudio(false);
        setAudioUrl('demo-audio-url');
      }, 3000);
    }
  };

  const stopAudioRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
    }
    setIsRecordingAudio(false);
  };

  // Submit Feedback & Grade
  const handleGrade = (status: 'approved' | 'rejected') => {
    if (!activeSubmission) return;

    // Calculate Rhythm Points conversion
    const rhythmUsed = Math.round((studentRhythmPoints * conversionRate) / 100);
    const xpBonus = Math.round(rhythmUsed * 0.2); // conversion bonus
    const finalXP = customXP + xpBonus;

    gradeSubmission(
      activeSubmission.id,
      status,
      finalXP,
      { canvasData: 'drawing-path-saved' },
      audioUrl || undefined,
      rhythmUsed
    );

    if (status === 'approved') {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#8B5CF6', '#F59E0B', '#10B981'],
      });
    }

    // Move to next pending submission
    const remaining = submissions.filter((s) => s.id !== activeSubmission.id && s.status === 'pending');
    if (remaining.length > 0) {
      setActiveSubmission(remaining[0]);
    }
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-900 border border-purple-500/20 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-bold mb-2">
            <Video className="w-4 h-4" /> {isStudent ? 'Mis Evaluaciones de Vídeo' : 'Inbox Zero del Profesor'}
          </div>
          <h2 className="text-2xl font-black text-white">
            {isStudent ? 'Enviar y Revisar Mis Vídeos' : 'Feedback Asíncrono de Vídeo'}
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            {isStudent
              ? 'Sube vídeos para que tu profesor corrija tu técnica. Revisa las notas de voz y trazados que te ha enviado.'
              : 'Reproducción en bucle, lienzo de dibujo HTML5 (eje, marco, tensión), audio de 10s y conversión de Puntos de Ritmo.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400">
            {isStudent ? 'Mis Envíos:' : 'Pendientes:'}
          </span>
          <span className="px-3 py-1 bg-purple-600/30 border border-purple-500/50 text-purple-200 rounded-xl text-xs font-extrabold">
            {displayedSubmissions.length} Vídeos
          </span>
        </div>
      </div>

      {/* Student Video Upload Form */}
      {isStudent && (
        <div className="p-6 bg-slate-900/90 border border-purple-500/30 rounded-3xl space-y-4 shadow-xl">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" /> Solicitar Corrección de Vídeo
          </h3>
          <form onSubmit={handleStudentSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-4 space-y-1">
              <label className="text-xs font-bold text-slate-400">Elemento Técnico:</label>
              <select
                value={selectedNodeId}
                onChange={(e) => setSelectedNodeId(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-semibold focus:border-purple-500 outline-none"
              >
                {levelTrees.flatMap((lt) =>
                  lt.nodes.map((n) => (
                    <option key={n.id} value={n.id}>
                      {lt.level_name} - {n.title}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="md:col-span-5 space-y-1">
              <label className="text-xs font-bold text-slate-400">Enlace de Vídeo (MP4 / Drive / TikTok / Instagram):</label>
              <input
                type="url"
                required
                placeholder="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
                value={videoUrlInput}
                onChange={(e) => setVideoUrlInput(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-semibold focus:border-purple-500 outline-none"
              />
            </div>

            <div className="md:col-span-3 flex items-end">
              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black shadow-glow-violet transition-all"
              >
                📤 Subir Vídeo y Pedir Corrección
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Submissions List */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
              {isStudent ? `Mis Vídeos (${filteredSubmissions.length})` : `Bandeja de Entradas (${filteredSubmissions.length})`}
            </h3>
          </div>

          {/* Program Filter Pills */}
          <div className="flex flex-wrap gap-1.5 pb-1">
            <button
              onClick={() => setSelectedProgramFilter('all')}
              className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all ${
                selectedProgramFilter === 'all'
                  ? 'bg-purple-600 text-white shadow-glow-violet'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              Todos ({displayedSubmissions.length})
            </button>
            {disciplines.map((d) => {
              const count = displayedSubmissions.filter((s) => getDisciplineNameForSubmission(s) === d.name).length;
              if (count === 0 && selectedProgramFilter !== d.id) return null;
              return (
                <button
                  key={d.id}
                  onClick={() => setSelectedProgramFilter(d.id)}
                  className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all ${
                    selectedProgramFilter === d.id
                      ? 'bg-purple-600 text-white shadow-glow-violet'
                      : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {d.name} ({count})
                </button>
              );
            })}
          </div>

          <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
            {filteredSubmissions.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 bg-slate-900/40 rounded-2xl border border-slate-800">
                No hay envíos pendientes para este programa.
              </div>
            ) : (
              filteredSubmissions.map((sub) => {
                const programName = getDisciplineNameForSubmission(sub);
                return (
                  <button
                    key={sub.id}
                    onClick={() => setActiveSubmission(sub)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all flex flex-col gap-2 ${
                      activeSubmission?.id === sub.id
                        ? 'bg-purple-950/40 border-purple-500 text-white shadow-glow-violet/30'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-sm text-white truncate">{sub.student_name}</span>
                      <span
                        className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full shrink-0 ${
                          sub.status === 'pending'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : sub.status === 'approved'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        }`}
                      >
                        {sub.status.toUpperCase()}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 inline-block mb-1">
                        📚 {programName}
                      </span>
                      <p className="text-xs text-slate-200 font-semibold">{sub.node_title}</p>
                    </div>

                    <span className="text-[10px] text-slate-400">
                      {new Date(sub.created_at || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Player + Controls */}
        <div className="lg:col-span-8 space-y-6">
          {activeSubmission ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-2xl">
              {/* Submission Details Bar */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-lg font-black text-white">{activeSubmission.student_name}</h3>
                  <p className="text-xs text-purple-400 font-bold">{activeSubmission.node_title}</p>
                </div>

                {/* Drawing Color Selector (Teacher only) */}
                {!isStudent && (
                  <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-2xl border border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Lienzo:</span>
                    {['#F43F5E', '#F59E0B', '#10B981', '#8B5CF6', '#38BDF8'].map((c) => (
                      <button
                        key={c}
                        onClick={() => setDrawColor(c)}
                        style={{ backgroundColor: c }}
                        className={`w-6 h-6 rounded-full transition-transform ${
                          drawColor === c ? 'scale-125 ring-2 ring-white' : 'opacity-70 hover:opacity-100'
                        }`}
                      />
                    ))}
                    <button
                      onClick={clearCanvas}
                      className="p-1 text-slate-400 hover:text-rose-400 transition-colors ml-1"
                      title="Limpiar Dibujo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Video Player + Canvas Overlay (Pure Stream Frame - No Local Storage) */}
              <div className="relative rounded-2xl overflow-hidden bg-black aspect-video border border-slate-800 shadow-2xl">
                <SmartVideoPlayer url={activeSubmission.video_url} className="w-full h-full" />

                {/* Canvas Overlay for Technical Drawings (Active only for Teacher) */}
                {!isStudent && (
                  <canvas
                    ref={canvasRef}
                    width={640}
                    height={360}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="absolute inset-0 w-full h-full cursor-crosshair z-10 touch-none"
                  />
                )}

                {/* Floating Canvas Indicator */}
                {!isStudent && (
                  <div className="absolute top-3 left-3 z-20 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/10 text-[10px] text-purple-300 font-bold flex items-center gap-1.5">
                    <Pencil className="w-3 h-3" /> Trazo Activo
                  </div>
                )}
              </div>

              {/* Video Player Controls (Frame-by-Frame, Speed 0.5x / 1.0x) */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
                <div className="flex items-center gap-2">
                  <button
                    onClick={togglePlay}
                    className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1 shadow-glow-violet"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    <span>{isPlaying ? 'Pausar' : 'Reproducir'}</span>
                  </button>

                  <button
                    onClick={() => stepFrame(false)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                    title="Fotograma Anterior (-0.04s)"
                  >
                    <Rewind className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => stepFrame(true)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                    title="Fotograma Siguiente (+0.04s)"
                  >
                    <FastForward className="w-4 h-4" />
                  </button>
                </div>

                {/* Playback Speed Selector */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400">Velocidad:</span>
                  {[0.5, 1.0].map((speed) => (
                    <button
                      key={speed}
                      onClick={() => changeSpeed(speed)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all ${
                        playbackSpeed === speed
                          ? 'bg-purple-600 text-white border-purple-500'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Audio Note: Teacher Record (Teacher) OR Student Audio Player (Student) */}
              {!isStudent ? (
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                      <Mic className="w-4 h-4 text-purple-400" />
                      <span>Grabador de Notas de Voz (10s Max)</span>
                    </div>
                    {recordingSeconds > 0 && (
                      <span className="text-xs font-bold text-rose-400 animate-pulse">
                        00:0{10 - recordingSeconds}s
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    {!isRecordingAudio ? (
                      <button
                        onClick={startAudioRecording}
                        className="px-4 py-2 rounded-xl bg-rose-600/30 border border-rose-500/50 hover:bg-rose-600 text-rose-200 font-bold text-xs flex items-center gap-2"
                      >
                        <Mic className="w-4 h-4" /> Record Voice Audio
                      </button>
                    ) : (
                      <button
                        onClick={stopAudioRecording}
                        className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs flex items-center gap-2 animate-pulse"
                      >
                        <MicOff className="w-4 h-4" /> Detener Grabación
                      </button>
                    )}

                    {audioUrl && (
                      <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
                        <Volume2 className="w-4 h-4 text-emerald-400" />
                        <audio src={audioUrl} controls className="h-7 w-48" />
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                activeSubmission.feedback_audio_url && (
                  <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/30 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-purple-300">
                      <Volume2 className="w-4 h-4 text-emerald-400" /> Nota de Voz del Profesor:
                    </div>
                    <audio src={activeSubmission.feedback_audio_url} controls className="w-full h-8" />
                  </div>
                )
              )}

              {/* Conversion Rate & Grading Buttons (Teacher only) */}
              {!isStudent ? (
                <>
                  <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                        <Zap className="w-4 h-4 text-emerald-400" /> Conversión de Puntos de Ritmo a XP Técnico
                      </span>
                      <span className="text-xs font-extrabold text-amber-400">{conversionRate}% Aplicado</span>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      {[25, 50, 75, 100].map((rate) => (
                        <button
                          key={rate}
                          onClick={() => setConversionRate(rate)}
                          className={`py-2 rounded-xl text-xs font-black border transition-all ${
                            conversionRate === rate
                              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-glow-gold'
                              : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-amber-500/50'
                          }`}
                        >
                          {rate}%
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                    <button
                      onClick={() => handleGrade('rejected')}
                      className="px-5 py-2.5 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-300 hover:bg-rose-900/60 font-bold text-xs flex items-center gap-2 transition-all"
                    >
                      <XCircle className="w-4 h-4" /> Solicitar Corrección
                    </button>

                    <button
                      onClick={() => handleGrade('approved')}
                      className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-950 font-black text-xs flex items-center gap-2 shadow-glow-emerald transition-all scale-105"
                    >
                      <CheckCircle className="w-4 h-4" /> Aprobar & Otorgar XP Técnico
                    </button>
                  </div>
                </>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Estado de Evaluación:</span>
                  <span className="font-extrabold text-purple-400">
                    {activeSubmission.status === 'approved'
                      ? `Aprobado (+${activeSubmission.xp_awarded} XP Otorgados por Profesor)`
                      : activeSubmission.status === 'rejected'
                      ? 'Correcciones Requeridas'
                      : 'Pendiente de Revisión por el Profesor'}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-3xl text-slate-400">
              No hay vídeos en la bandeja.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
