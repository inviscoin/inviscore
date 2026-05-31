import React, { useState } from 'react';
import { useInvis } from '../context/InvisContext';
import { motion } from 'motion/react';
import { X, Sparkles } from 'lucide-react';

export const MediaHubSelectorOverlay: React.FC = () => {
  const { 
    isMediaHubSelectorOpen, 
    setMediaHubSelectorOpen, 
    addBlock, 
    setMediaSubTab 
  } = useInvis();

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!isMediaHubSelectorOpen) return null;

  // Sound & Vibe Feedback
  const triggerHaptic = (ms = 20) => {
    if (navigator.vibrate) {
      navigator.vibrate(ms);
    }
  };

  const handleCardSelect = (tab: 'videotube' | 'movies' | 'music') => {
    triggerHaptic(45);
    setMediaSubTab(tab);
    addBlock('media', 'Mídia', true);
    setMediaHubSelectorOpen(false);
  };

  return (
    <div 
      id="media_hub_selector_overlay"
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#040406]/90 backdrop-blur-md px-4 select-none font-sans overflow-y-auto transform-gpu will-change-transform"
    >
      {/* Background Ambience Lines */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none overflow-hidden">
        <svg className="w-full h-full stroke-[#00c8ff]" strokeWidth="0.5" fill="none">
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Top Status Header */}
      <div className="w-full max-w-[340px] flex justify-between items-center mb-6 relative z-10 px-1 opacity-80">
        <div className="flex flex-col text-left">
          <span className="text-[7.5px] font-mono text-[#00c8ff] uppercase tracking-[0.25em] font-black animate-pulse flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#00c8ff] animate-spin" style={{ animationDuration: '4s' }} />
            SATELLITE DOWNLINK ACTIVE
          </span>
          <h2 className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest font-black">
            Navegação Tátil Core
          </h2>
        </div>
        
        {/* Neon style close button */}
        <button 
          onClick={() => { triggerHaptic(15); setMediaHubSelectorOpen(false); }}
          className="w-8 h-8 rounded-full bg-white/5 hover:bg-rose-500/10 border border-white/10 hover:border-rose-500/40 text-zinc-400 hover:text-rose-400 flex items-center justify-center transition-all duration-300 cursor-pointer shadow-lg active:scale-90"
          title="Fechar Menu"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* THREE EXTREMELY HIGH END PREMIUM VERTICAL CARDS (No Names, 100% Intuitive Visual Language) */}
      <div className="flex flex-col items-center gap-5 w-full max-w-[350px] relative z-10 pb-10">

        {/* ==========================================
            CARD 1: VIDEOTUBE (RED NEON / PLATINUM CONTROLS)
            ========================================== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          onMouseEnter={() => { setHoveredIndex(0); triggerHaptic(8); }}
          onMouseLeave={() => setHoveredIndex(null)}
          onClick={() => handleCardSelect('videotube')}
          className={`relative w-full h-[125px] rounded-[28px] border bg-gradient-to-br from-white/[0.04] to-white/[0.08] backdrop-blur-sm transition-transform transition-opacity duration-300 cursor-pointer flex items-center overflow-hidden p-1 transform-gpu will-change-transform ${
            hoveredIndex === 0 
              ? 'border-red-500/70 shadow-[0_0_30px_rgba(239,68,68,0.45)] scale-[1.03]' 
              : hoveredIndex !== null
                ? 'border-white/5 opacity-30 scale-[0.98]'
                : 'border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)]'
          }`}
        >
          {/* Cyberpunk Circuit-pattern Background overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-red-950/15 via-black/40 to-black/90 pointer-events-none" />
          
          {/* Leftside color block accent */}
          <div className="w-[6px] h-3/5 rounded-full bg-red-500 absolute left-2 top-1/2 -translate-y-1/2 opacity-70" />

          {/* Premium detail graphics context */}
          <div className="flex-1 flex items-center justify-between px-6 pl-8">
            
            {/* LEFT: Abstract detailed telemetry markings to look hyper-premium */}
            <div className="flex flex-col text-left space-y-1 font-mono pointer-events-none">
              <span className="text-[14px] font-black tracking-widest text-[#eceff4]/90 filter drop-shadow-[0_0_2px_black] uppercase font-sans">
                STREAMING CHANNEL
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                <span className="text-[7.5px] text-red-400 font-extrabold tracking-wider">VIDEOTUBE SATELLITE FEED</span>
              </div>
              <span className="text-[6.5px] text-zinc-500 tracking-tight block">
                APERTURE_C2 // FPS: 60.0 // PROTOCOL: RTSP_SECURE
              </span>
            </div>

            {/* RIGHT: THE INCREDIBLY BEAUTIFUL VIDEOTUBE SVG ICON */}
            <div className="w-24 h-24 relative flex items-center justify-center">
              {/* Pulsating background radar ring */}
              <div className={`absolute w-20 h-20 rounded-full border border-red-500/25 transition-transform duration-1000 ${hoveredIndex === 0 ? 'scale-110 animate-ping' : 'scale-90 opacity-60'}`} />
              
              {/* Interactive Vector SVG structure */}
              <svg className="w-20 h-20 drop-shadow-[0_4px_12px_rgba(0,0,0,0.85)]" viewBox="0 0 100 100" fill="none">
                {/* Embedded dynamic frequency grid */}
                <defs>
                  <linearGradient id="rubyGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ef4444" />
                    <stop offset="100%" stopColor="#991b1b" />
                  </linearGradient>
                  <linearGradient id="goldFiligree" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#D4AF37" />
                    <stop offset="100%" stopColor="#FFF" stopOpacity="0.4" />
                  </linearGradient>
                </defs>

                {/* Outer delicate lock ring */}
                <circle cx="50" cy="50" r="42" stroke="url(#goldFiligree)" strokeWidth="0.75" strokeDasharray="3 4" opacity="0.6" className="animate-[spin_45s_linear_infinite]" />
                
                {/* Glowing Ruby Plate Base */}
                <path d="M 28 34 C 28 30, 30 28, 34 28 L 66 28 C 70 28, 72 30, 72 34 L 72 66 C 72 70, 70 72, 66 72 L 34 72 C 30 72, 28 70, 28 66 Z" 
                  fill="url(#rubyGlow)" 
                  stroke="rgba(255,255,255,0.25)" 
                  strokeWidth="1.2" 
                />

                {/* Layered Golden chassis ring */}
                <rect x="25" y="25" width="50" height="50" rx="10" stroke="#ffd700" strokeWidth="0.8" opacity="0.5" />

                {/* Vector Aperture laser guidelines */}
                <path d="M 50 15 L 50 25 M 50 75 L 50 85 M 15 50 L 25 50 M 75 50 L 85 50" stroke="#f43f5e" strokeWidth="1" opacity="0.4" />

                {/* Dynamic playback cursor with a perfect nested ring */}
                <circle cx="50" cy="50" r="14" fill="#111" stroke="#ffd700" strokeWidth="1" />
                
                {/* Embedded play triangle icon */}
                <path d="M 47 43 L 57 50 L 47 57 Z" fill="#ffd700" stroke="#fff" strokeWidth="0.5" />
              </svg>
            </div>

          </div>
        </motion.div>


        {/* ==========================================
            CARD 2: SYNTH MUSIC (PURPLE NEON / WAVEFORM PCB)
            ========================================== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          onMouseEnter={() => { setHoveredIndex(1); triggerHaptic(8); }}
          onMouseLeave={() => setHoveredIndex(null)}
          onClick={() => handleCardSelect('music')}
          className={`relative w-full h-[125px] rounded-[28px] border bg-gradient-to-br from-white/[0.04] to-white/[0.08] backdrop-blur-sm transition-transform transition-opacity duration-300 cursor-pointer flex items-center overflow-hidden p-1 transform-gpu will-change-transform ${
            hoveredIndex === 1 
              ? 'border-purple-500/70 shadow-[0_0_30px_rgba(168,85,247,0.45)] scale-[1.03]' 
              : hoveredIndex !== null
                ? 'border-white/5 opacity-30 scale-[0.98]'
                : 'border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)]'
          }`}
        >
          {/* Cyberpunk Circuit-pattern Background overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-950/15 via-black/40 to-black/90 pointer-events-none" />
          
          {/* Leftside color block accent */}
          <div className="w-[6px] h-3/5 rounded-full bg-purple-500 absolute left-2 top-1/2 -translate-y-1/2 opacity-70" />

          {/* Premium detail graphics context */}
          <div className="flex-1 flex items-center justify-between px-6 pl-8">
            
            {/* LEFT: Abstract detailed telemetry markings to look hyper-premium */}
            <div className="flex flex-col text-left space-y-1 font-mono pointer-events-none">
              <span className="text-[14px] font-black tracking-widest text-[#eceff4]/90 filter drop-shadow-[0_0_2px_black] uppercase font-sans">
                AUDIO SYNTH STATION
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                <span className="text-[7.5px] text-purple-400 font-extrabold tracking-wider">HOLOGRAPHIC MUSIC DECK</span>
              </div>
              <span className="text-[6.5px] text-zinc-500 tracking-tight block">
                BINAURAL_HIFI // STEREO 192KHZ // SYNCHRONIZED
              </span>
            </div>

            {/* RIGHT: THE INCREDIBLY BEAUTIFUL SYNTH MUSIC SVG ICON */}
            <div className="w-24 h-24 relative flex items-center justify-center">
              {/* Pulsating background radar ring */}
              <div className={`absolute w-20 h-20 rounded-full border border-purple-500/25 transition-transform duration-1000 ${hoveredIndex === 1 ? 'scale-110 animate-ping' : 'scale-90 opacity-60'}`} />
              
              {/* Interactive Vector SVG structure */}
              <svg className="w-20 h-20 drop-shadow-[0_4px_12px_rgba(0,0,0,0.85)]" viewBox="0 0 100 100" fill="none">
                <defs>
                  <linearGradient id="vinylShine" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#1e1834" />
                    <stop offset="50%" stopColor="#a855f7" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#080511" />
                  </linearGradient>
                  <linearGradient id="deckAcc" x1="100%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#ffd700" />
                    <stop offset="100%" stopColor="#e879f9" />
                  </linearGradient>
                </defs>

                {/* Outer planetary track ring */}
                <circle cx="50" cy="50" r="44" stroke="url(#deckAcc)" strokeWidth="0.5" strokeDasharray="1 5" opacity="0.7" />

                {/* The heavy carbon vinyl deck core */}
                <circle cx="45" cy="50" r="32" fill="url(#vinylShine)" stroke="#6b21a8" strokeWidth="1.2" />
                
                {/* Grooves on vinyl */}
                <circle cx="45" cy="50" r="24" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
                <circle cx="45" cy="50" r="18" stroke="rgba(255,255,255,0.12)" strokeWidth="0.4" />
                <circle cx="45" cy="50" r="12" stroke="rgba(255,255,255,0.06)" strokeWidth="0.4" />

                {/* Brass stylus arm targeting vinyl center (glowing design) */}
                <path d="M 85 25 L 72 38 L 56 38 L 53 48" stroke="#ffd700" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="85" cy="25" r="4" fill="#a855f7" stroke="#ffd700" strokeWidth="1" />
                <rect x="51" y="47" width="4" height="3" rx="0.5" fill="#ffd700" transform="rotate(20, 52, 48)" />

                {/* Audio vector signal display at bottom */}
                <path d="M 15 80 Q 25 70, 35 80 T 55 80 T 75 80" stroke="#ffd700" strokeWidth="1.2" opacity="0.65" />
                <circle cx="45" cy="50" r="3" fill="#ffd700" />
              </svg>
            </div>

          </div>
        </motion.div>


        {/* ==========================================
            CARD 3: MOVIES HUD (CYAN-EMERALD NEON / KINETIC FOCUS APERTURE)
            ========================================== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          onMouseEnter={() => { setHoveredIndex(2); triggerHaptic(8); }}
          onMouseLeave={() => setHoveredIndex(null)}
          onClick={() => handleCardSelect('movies')}
          className={`relative w-full h-[125px] rounded-[28px] border bg-gradient-to-br from-white/[0.04] to-white/[0.08] backdrop-blur-sm transition-transform transition-opacity duration-300 cursor-pointer flex items-center overflow-hidden p-1 transform-gpu will-change-transform ${
            hoveredIndex === 2 
              ? 'border-cyan-400/80 shadow-[0_0_30px_rgba(6,182,212,0.45)] scale-[1.03]' 
              : hoveredIndex !== null
                ? 'border-white/5 opacity-30 scale-[0.98]'
                : 'border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)]'
          }`}
        >
          {/* Cyberpunk Circuit-pattern Background overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-950/15 via-black/40 to-black/90 pointer-events-none" />
          
          {/* Leftside color block accent */}
          <div className="w-[6px] h-3/5 rounded-full bg-cyan-400 absolute left-2 top-1/2 -translate-y-1/2 opacity-70" />

          {/* Premium detail graphics context */}
          <div className="flex-1 flex items-center justify-between px-6 pl-8">
            
            {/* LEFT: Abstract detailed telemetry markings to look hyper-premium */}
            <div className="flex flex-col text-left space-y-1 font-mono pointer-events-none">
              <span className="text-[14px] font-black tracking-widest text-[#eceff4]/90 filter drop-shadow-[0_0_2px_black] uppercase font-sans">
                CINEMA MULTIPLEX HUD
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" />
                <span className="text-[7.5px] text-cyan-400 font-extrabold tracking-wider">ULTRA-PREMIUM MOVIES PORTAL</span>
              </div>
              <span className="text-[6.5px] text-zinc-500 tracking-tight block">
                RESOL_4K_HDR // BITRATE: ABR_HYBR // ENCRYPTION: ACTIVE
              </span>
            </div>

            {/* RIGHT: THE INCREDIBLY BEAUTIFUL MOVIES COR PORTAL SVG ICON */}
            <div className="w-24 h-24 relative flex items-center justify-center">
              {/* Pulsating background radar ring */}
              <div className={`absolute w-20 h-20 rounded-full border border-cyan-400/25 transition-transform duration-1000 ${hoveredIndex === 2 ? 'scale-110 animate-ping' : 'scale-90 opacity-60'}`} />
              
              {/* Interactive Vector SVG structure */}
              <svg className="w-20 h-20 drop-shadow-[0_4px_12px_rgba(0,0,0,0.85)]" viewBox="0 0 100 100" fill="none">
                <defs>
                  <linearGradient id="cinematicLens" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#083344" />
                    <stop offset="50%" stopColor="#0891b2" />
                    <stop offset="100%" stopColor="#000" />
                  </linearGradient>
                  <linearGradient id="lensAccent" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#ffd700" />
                    <stop offset="100%" stopColor="#22d3ee" />
                  </linearGradient>
                </defs>

                {/* Laser focal coordinates */}
                <path d="M 12 12 Q 22 10, 12 25" stroke="#06b6d4" strokeWidth="0.8" opacity="0.5" />
                <path d="M 88 88 Q 78 90, 88 75" stroke="#06b6d4" strokeWidth="0.8" opacity="0.5" />

                {/* Projector gear wireframes */}
                <circle cx="36" cy="36" r="16" stroke="rgba(6,182,212,0.15)" strokeWidth="1" strokeDasharray="2 3" />
                <circle cx="64" cy="64" r="16" stroke="rgba(6,182,212,0.15)" strokeWidth="1" strokeDasharray="2 3" />

                {/* Holographic Projection Cone */}
                <polygon points="50,45 85,25 85,65" fill="rgba(34,211,238,0.06)" stroke="rgba(34,211,238,0.2)" strokeWidth="0.5" />
                <line x1="50" y1="45" x2="85" y2="25" stroke="#22d3ee" strokeWidth="0.75" strokeDasharray="2 4" opacity="0.6" />
                <line x1="50" y1="45" x2="85" y2="65" stroke="#22d3ee" strokeWidth="0.75" strokeDasharray="2 4" opacity="0.6" />

                {/* Heavy mechanical cinematic optic housing */}
                <circle cx="42" cy="45" r="20" fill="url(#cinematicLens)" stroke="url(#lensAccent)" strokeWidth="1.5" />
                
                {/* Lenses refraction lines */}
                <ellipse cx="42" cy="45" rx="14" ry="7" stroke="rgba(255,255,255,0.2)" strokeWidth="1" transform="rotate(-30, 42, 45)" />
                <circle cx="42" cy="45" r="10" stroke="rgba(255,255,255,0.15)" strokeWidth="0.75" />
                <circle cx="42" cy="45" r="5" fill="#22d3ee" stroke="#fff" strokeWidth="0.5" />
                
                {/* Precision focusing pins */}
                <line x1="22" y1="45" x2="62" y2="45" stroke="#ffd700" strokeWidth="0.5" opacity="0.4" />
                <line x1="42" y1="25" x2="42" y2="65" stroke="#ffd700" strokeWidth="0.5" opacity="0.4" />
              </svg>
            </div>

          </div>
        </motion.div>

      </div>
    </div>
  );
};
