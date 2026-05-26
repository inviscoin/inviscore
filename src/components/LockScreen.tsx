import React, { useState, useEffect } from 'react';
import { useInvis, DICTIONARY } from '../context/InvisContext';
import { motion, AnimatePresence } from 'motion/react';
import { Globe, Fingerprint, Lock, Shield, Settings, Languages } from 'lucide-react';

const MESSAGES = [
  'Carregando sistema segurança...',
  'Sincronizando tradução Babel...',
  'Limpando área de trabalho...',
  'Aperfeiçoamento de fluidez GPU...',
  'Verificando integridade da Matriz...'
];

export const LockScreen: React.FC = () => {
  const { 
    setStage, language, setLanguage, isLangDrawerOpen, setLangDrawerOpen, 
    hasVisitedOnce, setVisitedOnce, systemStatus, setSystemStatus 
  } = useInvis();

  const [stageMode, setStageMode] = useState<'locked' | 'opening' | 'fingerprint'>('locked');
  const [loadingText, setLoadingText] = useState(MESSAGES[0]);
  const [progress, setProgress] = useState(0);

  // 12 languages list with beautiful flags
  const languagesList = [
    { code: 'pt-BR', name: 'Português', flag: '🇧🇷' },
    { code: 'en-US', name: 'English', flag: '🇺🇸' },
    { code: 'es-ES', name: 'Español', flag: '🇪🇸' },
    { code: 'fr-FR', name: 'Français', flag: '🇫🇷' },
    { code: 'de-DE', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'it-IT', name: 'Italiano', flag: '🇮🇹' },
    { code: 'ja-JP', name: '日本語', flag: '🇯🇵' },
    { code: 'zh-CN', name: '中文', flag: '🇨🇳' },
    { code: 'ru-RU', name: 'Русский', flag: '🇷🇺' },
    { code: 'ar-SA', name: 'العربية', flag: '🇸🇦' },
    { code: 'hi-IN', name: 'हिन्दी', flag: '🇮🇳' },
    { code: 'ko-KR', name: '한국어', flag: '🇰🇷' }
  ];

  useEffect(() => {
    // Audit logs entry
    setSystemStatus('Sincronizando');

    // Simulate key loading sequence
    let msgIdx = 0;
    const interval = setInterval(() => {
      setProgress(prev => {
        const next = prev + 20;
        if (next >= 100) {
          clearInterval(interval);
          
          if (hasVisitedOnce) {
             // Second access: automatically skip after animation (5s total + 1s delay)
             setTimeout(() => {
                 setStage('login');
             }, 500);
          } else {
             setStageMode('opening');
             setTimeout(() => {
               setStageMode('fingerprint');
               setSystemStatus('Aguardando Biometria');
             }, 1200);
          }
          return 100;
        }
        return next;
      });

      if (msgIdx < MESSAGES.length - 1) {
        msgIdx++;
        setLoadingText(MESSAGES[msgIdx]);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [hasVisitedOnce, setStage, setSystemStatus]);

  const handleAccess = () => {
    // Force language check on first visit (mock logic: if defaults to pt-BR it's okay)
    // The requirement says: "só ir para a tela de login após a seleção do idioma e o click no centro"
    // Since language defaults exist, the click on the fingerprint counts as final confirmation
    localStorage.setItem('invis_visited', 'true');
    setVisitedOnce(true);
    setStage('login');
  };

  const currentTexts = DICTIONARY[language];

  return (
    <div className="relative w-full h-screen overflow-hidden flex flex-col items-center justify-center bg-radial from-[#1a1a40] to-[#0b0e11] text-white">
      {/* Background Dinâmico - Tecido Balançando */}
      <div 
        className="absolute inset-0 opacity-15 pointer-events-none matrix-line-overlay"
        style={{
          width: '200%',
          height: '200%',
          animation: 'waveMove 20s infinite alternate ease-in-out'
        }}
      />

      {/* Vignette-pulse Overlay */}
      <div className="absolute inset-0 pointer-events-none vignette-pulse" />

      {/* Language Selector Indicator in lock stage */}
      <div className="absolute top-6 right-6 z-50">
        <button 
          id="btn_lang_toggle"
          onClick={() => setLangDrawerOpen(!isLangDrawerOpen)}
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-500/30 bg-black/40 hover:bg-black/80 transition-all text-sm outline-none cursor-pointer"
        >
          <Languages className="w-4 h-4 text-[#00c8ff]" />
          <span>{languagesList.find(l => l.code === language)?.flag}</span>
          <span className="hidden md:inline">{languagesList.find(l => l.code === language)?.name}</span>
        </button>
      </div>

      {/* Central Content */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="z-10 flex flex-col items-center justify-center text-center px-4"
      >
        {/* Realístic SVG Lock (Cadeado Matemático) */}
        <div className="relative w-48 h-48 md:w-56 md:h-56 mb-8 flex items-center justify-center">
          <svg viewBox="0 0 200 200" className="w-full h-full filter drop-shadow-[0_0_20px_rgba(0,200,255,0.4)] overflow-visible">
            <defs>
              <linearGradient id="metal-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1a1a40" />
                <stop offset="100%" stopColor="#0b0e11" />
              </linearGradient>
              <filter id="neon-glow">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Shackle (Arco do Cadeado) */}
            <motion.path 
              d="M60,80 V60 A40,40 0 0,1 140,60 V80"
              fill="none"
              stroke="#00c8ff"
              strokeWidth="4"
              filter="url(#neon-glow)"
              animate={{ 
                y: stageMode !== 'locked' ? -20 : 0,
                rotate: stageMode !== 'locked' ? 25 : 0
              }}
              transition={{ type: 'spring', stiffness: 120, damping: 10 }}
              className="origin-[70%_40%]"
            />

            {/* Body (Corpo do Cadeado) */}
            <rect 
              x="40" y="80" width="120" height="90" rx="15" 
              fill="url(#metal-grad)" 
              stroke="#00c8ff" 
              strokeWidth="2"
            />

            {/* Inner detailed details */}
            {stageMode === 'fingerprint' && (
              <motion.g 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="cursor-pointer"
                onClick={handleAccess}
              >
                <path d="M100,105 A15,15 0 0,1 115,120" stroke="#00FF80" fill="none" strokeWidth="2" strokeLinecap="round" />
                <path d="M90,102 A25,25 0 0,1 125,125" stroke="#00FF80" fill="none" strokeWidth="2" opacity="0.7" />
                <path d="M80,100 A35,35 0 0,1 135,130" stroke="#00c8ff" fill="none" strokeWidth="2" opacity="0.4" />
                <circle cx="100" cy="130" r="40" fill="transparent" />
              </motion.g>
            )}
          </svg>

          {/* Golden glow inside padlock when fingerprint ready */}
          {stageMode === 'fingerprint' && (
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <div className="w-24 h-24 rounded-full bg-cyan-500/10 filter blur-xl animate-pulse" />
            </motion.div>
          )}
        </div>

        {/* Display Status of matrix decryption */}
        <AnimatePresence mode="wait">
          {stageMode === 'locked' && (
            <motion.div
              key="loading-text"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <p className="font-mono text-sm tracking-[0.2em] text-[#00c8ff] uppercase">{loadingText}</p>
              <div className="w-64 h-1 bg-black/40 rounded-full overflow-hidden border border-cyan-500/20">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400"
                />
              </div>
              <p className="font-mono text-xs text-white/40">{progress}%</p>
            </motion.div>
          )}

          {stageMode === 'opening' && (
            <motion.p
              key="opening-text"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="font-mono text-xs tracking-wider text-[#00FF80] uppercase"
            >
              {currentTexts.welcome} - CHAVE ENCONTRADA
            </motion.p>
          )}

          {stageMode === 'fingerprint' && (
            <motion.div
              key="success-biometrics"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center space-y-6"
            >
              <p className="font-mono text-sm tracking-[0.2em] text-[#00FF80] uppercase animate-pulse">
                {currentTexts.digital_id}
              </p>

              {/* Bio Sensory interactive Fingerprint */}
              <motion.button
                id="btn_biometric_lock"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleAccess}
                className="relative w-20 h-20 rounded-full border-2 border-[#00FF80] flex items-center justify-center cursor-pointer overflow-hidden bg-black/40 hover:bg-black/70 transition-all shadow-[0_0_20px_rgba(0,255,128,0.2)] focus:outline-none"
              >
                {/* Fingerprint subtle shine */}
                <span className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 via-transparent to-emerald-500/20 animate-pulse" />
                <Fingerprint className="w-10 h-10 text-[#00FF80] filter drop-shadow-[0_0_8px_#00FF80]" />
              </motion.button>

              <span className="text-xs text-neutral-400 select-none tracking-widest uppercase blink-pulse">
                {currentTexts.toque_para_acessar}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Pista Molhada Neon Reflection Effect on footer */}
      <div 
        className="absolute bottom-0 w-full h-[15vh] pointer-events-none"
        style={{
          background: 'linear-gradient(to top, rgba(0, 200, 255, 0.15), transparent)',
          filter: 'blur(15px)'
        }}
      />
    </div>
  );
};
