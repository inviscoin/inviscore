import React, { useState } from 'react';
import { useInvis } from '../context/InvisContext';
import { motion, AnimatePresence } from 'motion/react';
import { X, Settings, Volume2, VolumeX, Shield, Trash2, Zap, AppWindow, Cpu, Key } from 'lucide-react';
import { YouTubeService } from '../lib/youtube';
import { JamendoService } from '../lib/jamendo';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { language, setWallet, showToast } = useInvis();
  const [hapticEnabled, setHapticEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lowPowerMode, setLowPowerMode] = useState(false);
  const [screenTimeout, setScreenTimeout] = useState('15');

  // Admin Keys Sync
  const [youtubeKey, setYoutubeKey] = useState('');
  const [jamendoKey, setJamendoKey] = useState('');

  if (!isOpen) return null;

  const handleResetData = () => {
    const confirmMsg = language === 'pt-BR'
      ? "⚠️ ATENÇÃO: Deseja redefinir os dados locais da plataforma? Isso limpará todas as tarefas e redefinirá o saldo."
      : "⚠️ WARNING: Do you want to reset all local platform data? This will clear all tasks and reset your balance.";
    
    if (window.confirm(confirmMsg)) {
      localStorage.clear();
      if (setWallet) {
        setWallet({
          icGold: 25000.000,
          icGoldHistory: [],
          invisPoints: 1200
        });
      }
      showToast(language === 'pt-BR' 
        ? "Plataforma reinicializada! Recarregue a página para aplicar totalmente." 
        : "Platform reset successfully! Reload page to apply fully.", 'success'
      );
      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 1500);
    }
  };

  const syncAdminKeys = () => {
    if (youtubeKey) YouTubeService.updateApiKey(youtubeKey);
    if (jamendoKey) JamendoService.updateClientId(jamendoKey);
    showToast(language === 'pt-BR' ? 'Chaves API sincronizadas em memória!' : 'API Keys synced in memory!', 'success');
  };

  const getLabel = (pt: string, en: string) => {
    return language === 'pt-BR' ? pt : en;
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-[8000] flex items-center justify-center bg-black/90 p-4 font-sans backdrop-blur-md cursor-pointer select-none"
    >
      <motion.div 
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 30 }}
        className="w-full max-w-sm rounded-[24px] bg-[#0b0e11] border border-cyan-500/20 text-white shadow-[0_0_45px_rgba(0,c8,ff,0.2)] flex flex-col overflow-hidden relative cursor-default"
      >
        {/* Glow accent */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-cyan-400 to-indigo-500" />

        {/* Header */}
        <header className="flex justify-between items-center p-4.5 border-b border-white/5 bg-black/10">
          <div className="flex items-center gap-2 text-[#00c8ff]">
            <Settings className="w-4 h-4 animate-spin-slow text-[#00c8ff]" />
            <h3 className="font-mono text-[11px] tracking-widest font-black uppercase text-white">
              {getLabel("Configurações do Node", "Node System Settings")}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/5 text-neutral-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </header>

        {/* Content body */}
        <div className="p-5 space-y-4 text-left">
          
          {/* Sounds Selector toggle */}
          <div className="p-3 rounded-xl bg-black/20 border border-white/5 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10.5px] font-bold text-white block">
                {getLabel("Efeitos Sonoros", "Audio Feedbacks")}
              </span>
              <span className="text-[8.5px] text-neutral-500 block">
                {getLabel("Ativa sintetizadores imersivos de clique e foco.", "Enables click sound synthesis.")}
              </span>
            </div>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`w-10 h-5.5 rounded-full relative transition-colors ${
                soundEnabled ? 'bg-cyan-500' : 'bg-neutral-850 border border-neutral-700/50'
              }`}
            >
              <span className={`absolute top-0.5 left-0.5 w-4.5 h-4.5 bg-white rounded-full transition-transform ${
                soundEnabled ? 'translate-x-4.5 bg-black' : 'translate-x-0'
              }`} />
            </button>
          </div>

          {/* Haptic feed toggle */}
          <div className="p-3 rounded-xl bg-black/20 border border-white/5 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10.5px] font-bold text-white block">
                {getLabel("Vibração & Háptica", "Haptic Feedbacks")}
              </span>
              <span className="text-[8.5px] text-neutral-500 block">
                {getLabel("Dispara mini pulsos físicos (celular).", "Triggers micro vibrates upon interaction.")}
              </span>
            </div>
            <button
              onClick={() => {
                setHapticEnabled(!hapticEnabled);
                if (!hapticEnabled && navigator.vibrate) navigator.vibrate(30);
              }}
              className={`w-10 h-5.5 rounded-full relative transition-colors ${
                hapticEnabled ? 'bg-cyan-500' : 'bg-neutral-855 border border-neutral-700/50'
              }`}
            >
              <span className={`absolute top-0.5 left-0.5 w-4.5 h-4.5 bg-white rounded-full transition-transform ${
                hapticEnabled ? 'translate-x-4.5 bg-black' : 'translate-x-0'
              }`} />
            </button>
          </div>

          {/* Low power mode toggle */}
          <div className="p-3 rounded-xl bg-black/20 border border-white/5 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10.5px] font-bold text-white block">
                {getLabel("Processador Seguro", "Secure Performance")}
              </span>
              <span className="text-[8.5px] text-neutral-500 block">
                {getLabel("Reduz taxa de pooling e salva energia.", "Saves energy on local visual polling.")}
              </span>
            </div>
            <button
              onClick={() => setLowPowerMode(!lowPowerMode)}
              className={`w-10 h-5.5 rounded-full relative transition-colors ${
                lowPowerMode ? 'bg-[#00FF80]' : 'bg-neutral-850 border border-neutral-700/50'
              }`}
            >
              <span className={`absolute top-0.5 left-0.5 w-4.5 h-4.5 bg-white rounded-full transition-transform ${
                lowPowerMode ? 'translate-x-4.5 bg-black' : 'translate-x-0'
              }`} />
            </button>
          </div>

          {/* Timeout input select */}
          <div className="p-3 rounded-xl bg-black/20 border border-white/5 flex flex-col gap-2">
            <span className="text-[10.5px] font-bold text-white block">
              {getLabel("Inatividade de Proteção", "Screensaver Timeout")}
            </span>
            <select
              value={screenTimeout}
              onChange={(e) => setScreenTimeout(e.target.value)}
              className="w-full text-[10.5px] bg-[#050608] border border-white/5 p-2 rounded-lg text-neutral-300 outline-none cursor-pointer"
            >
              <option value="5">{getLabel("5 minutos", "5 minutes")}</option>
              <option value="15">{getLabel("15 minutos", "15 minutes")}</option>
              <option value="30">{getLabel("30 minutos", "30 minutes")}</option>
              <option value="9999">{getLabel("Nunca Bloquear", "Never lock")}</option>
            </select>
          </div>

          {/* Admin Real-Time Setup */}
          <div className="p-3 rounded-xl bg-black/20 border border-[#00c8ff]/20 flex flex-col gap-3">
             <div className="flex items-center gap-1.5 text-[#00c8ff] mb-1">
                <Key className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Sync Real-Time Keys</span>
             </div>
             
             <input 
                type="text" 
                placeholder="YouTube API Key (VITE_YOUTUBE_API_KEY)" 
                value={youtubeKey}
                onChange={(e) => setYoutubeKey(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded p-2 text-[10px] text-white outline-none focus:border-[#00c8ff]"
             />
             <input 
                type="text" 
                placeholder="Jamendo Client ID (VITE_JAMENDO_CLIENT_ID)" 
                value={jamendoKey}
                onChange={(e) => setJamendoKey(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded p-2 text-[10px] text-white outline-none focus:border-[#00c8ff]"
             />
             
             <button
                type="button"
                onClick={syncAdminKeys}
                className="w-full mt-1 bg-[#00c8ff]/10 hover:bg-[#00c8ff]/30 border border-[#00c8ff]/30 text-[#00c8ff] py-1.5 rounded transition-all text-[10px] font-bold uppercase cursor-pointer"
             >
               Atualizar na Memória
             </button>
          </div>

          {/* Dangerous Storage reset area */}
          <button
            onClick={handleResetData}
            type="button"
            className="w-full py-2 border border-red-500/20 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-400 text-[10px] font-mono font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{getLabel("Apagar Dados Locais", "Wipe Cache Node")}</span>
          </button>
        </div>

        {/* Footer */}
        <footer className="p-4 border-t border-white/5 bg-black/25 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-1.5 border border-white/10 hover:border-cyan-400 text-neutral-400 hover:text-white rounded-lg text-[10px] font-mono font-bold uppercase transition-all tracking-wider cursor-pointer"
          >
            {getLabel("Ok", "Apply")}
          </button>
        </footer>
      </motion.div>
    </div>
  );
};
