import React, { useState, useEffect } from 'react';
import { useInvis, DICTIONARY } from '../context/InvisContext';
import { LogOut, Globe, TrendingUp, Wallet, Menu, X, Shield, Cpu, RefreshCw, Zap, Award, Sparkles, Store, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SettingsModal } from './SettingsModal';
import { SupabaseService } from '../lib/supabase';

interface HeaderTopProps {
  onOpenWallet: () => void;
  onOpenShop: () => void;
  onOpenSearch: () => void;
  onOpenAccount: () => void;
}

export const HeaderTop: React.FC<HeaderTopProps> = ({ onOpenWallet, onOpenShop, onOpenSearch, onOpenAccount }) => {
  const { 
    wallet, currentUser, language, setLangDrawerOpen, setCurrentUser, setStage, systemStatus, setSelectedSupportPage, setWallet 
  } = useInvis();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Custom interactive glow aura theme
  const [glowTheme, setGlowTheme] = useState<'cyan' | 'emerald' | 'gold' | 'fuchsia'>(() => {
    return (localStorage.getItem('invis_glow_theme') as any) || 'cyan';
  });

  // Simulated node stats
  const [latency, setLatency] = useState(12);
  const [nodeSpeed, setNodeSpeed] = useState(42.5);

  useEffect(() => {
    const t = setInterval(() => {
      setLatency(prev => Math.max(8, Math.min(60, prev + (Math.random() > 0.5 ? 2 : -2))));
      setNodeSpeed(prev => Math.max(35, Math.min(50, prev + (Math.random() > 0.5 ? 0.3 : -0.3))));
    }, 4000);
    return () => clearInterval(t);
  }, []);

  const changeGlowTheme = (theme: 'cyan' | 'emerald' | 'gold' | 'fuchsia') => {
    setGlowTheme(theme);
    localStorage.setItem('invis_glow_theme', theme);
    // Vibrate trigger
    if (navigator.vibrate) navigator.vibrate([15, 10, 15]);
  };

  const handleLogout = async () => {
    if (window.confirm(language === 'pt-BR' 
      ? 'Tem certeza que deseja encerrar a sessão? O progresso da mineração ativa será temporariamente congelado.'
      : 'Are you sure you want to log out? Active mining progress will be temporarily frozen.')) {
      setIsDrawerOpen(false);
      try {
        await SupabaseService.signOut();
      } catch(e) {}
      setCurrentUser(null);
      setStage('locks');
    }
  };

  // Dopamine upgrade trigger
  const triggerUpgrade = (targetTier: 'VIP1') => {
    if (!currentUser) return;
    
    // Play dual haptic
    if (navigator.vibrate) navigator.vibrate([40, 30, 40]);
    
    setCurrentUser({
      ...currentUser,
      tier: targetTier
    });

    // Add bonus ic to simulate immediate gratification
    setWallet(prev => ({
      ...prev,
      icGold: prev.icGold + 25.0
    }));
  };

  // Helper dictionary lookup
  const currentTexts = DICTIONARY[language] || DICTIONARY['pt-BR'];

  const getThemeColorClass = () => {
    if (glowTheme === 'emerald') return 'text-[#00FF80]';
    if (glowTheme === 'gold') return 'text-[#D4AF37]';
    if (glowTheme === 'fuchsia') return 'text-[#FF00FF]';
    return 'text-[#00c8ff]';
  };

  const getThemeGlowStyle = () => {
    if (glowTheme === 'emerald') return { boxShadow: '0 0 15px rgba(0,255,128,0.45)' };
    if (glowTheme === 'gold') return { boxShadow: '0 0 15px rgba(212,175,55,0.45)' };
    if (glowTheme === 'fuchsia') return { boxShadow: '0 0 15px rgba(255,0,255,0.45)' };
    return { boxShadow: '0 0 15px rgba(0,200,255,0.45)' };
  };

  return (
    <>
      <header className="w-full h-[55px] bg-[#07090b]/80 border-b border-white/5 backdrop-blur-md px-3 sm:px-6 flex justify-between items-center z-[5000] sticky top-0 shrink-0">
        
        {/* Left Side Branding */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#00c8ff] to-cyan-700 p-[1px] flex items-center justify-center shadow-lg shadow-cyan-500/10">
            <div className="w-full h-full bg-[#0b0e11] rounded-xl flex items-center justify-center">
              <span className="font-mono text-xs font-black text-[#00c8ff] select-none tracking-widest">IN</span>
            </div>
          </div>
          <div className="text-left select-none">
            <h1 className="font-sans font-black text-xs sm:text-sm tracking-wide text-white leading-none">INVIS MULTITASK</h1>
            <p className="text-[8px] font-mono tracking-widest text-[#00c8ff] uppercase leading-none mt-1 sm:mt-1.5 font-bold">OPERATIONAL CLOUD NODE</p>
          </div>
        </div>

        {/* Right Side Direct Active Controllers */}
        <div className="flex items-center gap-2.5">
          
          {/* Connection status indicator */}
          <div 
            className="flex items-center gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-black/40 border border-emerald-500/10"
            title="Status de Conexão na Nuvem"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#00FF80] animate-pulse" />
            <span className="text-[8px] font-mono tracking-wide text-neutral-400 uppercase hidden sm:inline">{systemStatus}</span>
          </div>

          {/* AI Search Activator */}
          <button 
            id="hdr_search_ai_btn"
            onClick={onOpenSearch}
            className="p-1.5 sm:p-2 rounded-full border border-neutral-800 bg-neutral-900/30 hover:border-violet-400/50 transition-all cursor-pointer text-violet-400 flex items-center justify-center shadow-[0_0_8px_rgba(139,92,246,0.1)]"
            title="Mapeamento e Busca Inteligente Gemini"
          >
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-pulse text-violet-400" />
          </button>

          {/* Language Drawer Activator */}
          <button 
            id="hdr_globe_lang_btn"
            onClick={() => setLangDrawerOpen(true)}
            className="p-1.5 sm:p-2 rounded-full border border-neutral-800 bg-neutral-900/30 hover:border-cyan-400/40 transition-all cursor-pointer text-[#00c8ff]"
            title="Selecionar Idioma"
          >
            <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          {/* Shop Modal Activator */}
          <button 
            id="hdr_shop_btn"
            onClick={onOpenShop}
            className="p-1.5 sm:p-2 rounded-full border border-neutral-800 bg-neutral-900/30 hover:border-[#D4AF37]/50 transition-all cursor-pointer text-[#D4AF37]"
            title="Abrir Loja de Itens"
          >
            <Store className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#D4AF37]" />
          </button>

          {/* CORE HAMBURGER BUTTON */}
          <button 
            onClick={() => {
              setIsDrawerOpen(true);
              if (navigator.vibrate) navigator.vibrate(20);
            }}
            className="p-1.5 sm:p-2.5 rounded-full border border-neutral-800 bg-neutral-900/30 text-white cursor-pointer hover:bg-neutral-800 active:scale-90 transition-all font-bold text-xs flex items-center justify-center shadow-[0_0_10px_rgba(255,255,255,0.05)]"
            title="Status & Configurações"
          >
            <Menu className="w-4 h-4 text-cyan-400" />
          </button>
        </div>
      </header>

      {/* COMPREHENSIVE FLOATING SLIDE DRAWER BACKDROP */}
      <AnimatePresence>
        {isDrawerOpen && (
          <div className="fixed inset-0 z-[6000] flex justify-end font-sans">
            {/* Dark glass backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/75 backdrop-blur-sm"
              onClick={() => setIsDrawerOpen(false)}
            />

            {/* Core control drawer panel */}
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="relative w-full sm:w-[380px] h-full bg-[#0b0e12] border-l border-white/5 shadow-[-10px_0_30px_rgba(0,0,0,0.8)] z-10 flex flex-col justify-between overflow-hidden p-5"
            >
              {/* Spinning background logo vector */}
              <div 
                className="absolute -right-20 -top-20 w-80 h-80 opacity-5 border-4 border-dashed rounded-full pointer-events-none"
                style={{ animation: 'rotateCW 25s infinite linear', borderColor: 'currentColor' }}
              />

              {/* Drawer Content Area */}
              <div className="flex-1 overflow-y-auto pr-1 no-scrollbar space-y-6">
                
                {/* Header segment */}
                <div className="flex justify-between items-center pb-3 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <Sparkles className={`w-4 h-4 ${getThemeColorClass()}`} />
                    <h3 className="font-mono text-xs tracking-[0.2em] font-black uppercase text-neutral-400">
                      {(currentTexts as any).panel_title || 'PAINEL INVIS CORE'}
                    </h3>
                  </div>
                  <button 
                    onClick={() => setIsDrawerOpen(false)}
                    className="p-2 sm:p-2.5 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* 1. IDENTITY PROFILE CARD (MANTER O CARD QUE IDENTIFICA O USUARIO PRIMEIRO) */}
                <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-3 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-3">
                    <Award className={`w-6 h-6 animate-pulse ${getThemeColorClass()}`} />
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {/* Circle Avatar */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#00c8ff] to-[#00FF80] p-[2px] shadow-[0_0_15px_rgba(0,255,128,0.2)]">
                      <div className="w-full h-full rounded-full bg-neutral-900 flex items-center justify-center font-mono text-base font-black uppercase text-white">
                        {currentUser?.nickname?.substring(0, 2) || 'IN'}
                      </div>
                    </div>

                    <div className="text-left">
                      <h4 className="font-black text-sm tracking-wide text-white">
                        {currentUser?.fullName || 'Desenvolvedor INVIS'}
                      </h4>
                      <p className="font-mono text-xs text-neutral-400">
                        @{currentUser?.nickname || 'guest'}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/5 flex justify-between items-center text-xs">
                    <span className="text-neutral-500 font-mono">{(currentTexts as any).withdraw_bal || 'Balanço Sacável:'}</span>
                    <span className="font-sans font-black text-[#00FF80] drop-shadow-[0_0_8px_rgba(0,255,128,0.3)]">
                      {wallet.icGold.toFixed(5)} ic
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-neutral-500 font-mono">{(currentTexts as any).tech_level || 'Nível Tecnológico:'}</span>
                    <span className="px-2 py-0.5 rounded bg-cyan-950/40 text-[#00c8ff] border border-cyan-500/20 font-mono text-[9px] font-bold">
                      {currentUser?.tier || 'FREE'}
                    </span>
                  </div>
                </div>

                {/* 2. ACESSO RÁPIDO (SEGUNDO SEGMENTO) */}
                <div className="space-y-2 text-left pt-1">
                  <p className="text-[10px] uppercase tracking-widest font-mono text-neutral-500 font-bold">Acesso Rápido</p>
                  
                  <div className="flex flex-col gap-1.5">
                    <button 
                      onClick={() => { setIsDrawerOpen(false); onOpenAccount(); }}
                      className="w-full text-left py-2 px-3 hover:bg-neutral-900 rounded-xl text-neutral-400 hover:text-[#00c8ff] transition-all text-sm font-semibold border border-transparent hover:border-cyan-500/10 cursor-pointer flex items-center gap-2"
                    >
                      <Shield className="w-4 h-4" /> Minha Conta
                    </button>
                    <button 
                      onClick={() => {
                        setIsSettingsOpen(true);
                      }}
                      className="w-full text-left py-2 px-3 hover:bg-neutral-900 rounded-xl text-neutral-400 hover:text-[#00c8ff] transition-all text-sm font-semibold border border-transparent hover:border-cyan-500/10 cursor-pointer flex items-center gap-2"
                    >
                      <Cpu className="w-4 h-4" /> Configurações
                    </button>
                    <button onClick={() => { setIsDrawerOpen(false); onOpenWallet(); }} className="w-full text-left py-2 px-3 hover:bg-neutral-900 rounded-xl text-neutral-400 hover:text-[#00c8ff] transition-all text-sm font-semibold border border-transparent hover:border-cyan-500/10 cursor-pointer flex items-center gap-2">
                      <Wallet className="w-4 h-4" /> Carteira
                    </button>
                    <button onClick={() => { setIsDrawerOpen(false); onOpenShop(); }} className="w-full text-left py-2 px-3 hover:bg-neutral-900 rounded-xl text-neutral-400 hover:text-[#00c8ff] transition-all text-sm font-semibold border border-transparent hover:border-cyan-500/10 cursor-pointer flex items-center gap-2">
                      <Store className="w-4 h-4" /> Loja de itens
                    </button>
                    <button onClick={() => { alert('Central descrita em conformidade. Dúvidas contate suporte@invis.io!'); }} className="w-full text-left py-2 px-3 hover:bg-neutral-900 rounded-xl text-neutral-400 hover:text-[#00c8ff] transition-all text-sm font-semibold border border-transparent hover:border-cyan-500/10 cursor-pointer flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4" /> Suporte/FAQ
                    </button>
                    <button onClick={() => { alert(language === 'pt-BR' ? 'Link de convite copiado para a área de transferência!' : 'Invite link copied to clipboard!'); }} className="w-full text-left py-2 px-3 hover:bg-neutral-900 rounded-xl text-[#00FF80] hover:bg-[#00FF80]/10 transition-all text-sm font-bold border border-transparent hover:border-[#00FF80]/20 cursor-pointer flex items-center gap-2">
                      <Award className="w-4 h-4" /> Convidar amigos
                    </button>
                  </div>
                </div>

                {/* 3. DEVICE CHROMATIC AURA (TERCEIRO SEGMENTO) */}
                <div className="space-y-4 text-left pt-2 border-t border-white/5">
                  <div className="space-y-2">
                    <p className="text-[10px] uppercase tracking-widest font-mono text-neutral-500 font-bold">{(currentTexts as any).aura_title || 'Aura Cromática do Dispositivo'}</p>
                    <div className="grid grid-cols-4 gap-2">
                      <button 
                        onClick={() => changeGlowTheme('cyan')}
                        className={`py-2 rounded-xl border text-[9px] font-mono font-bold tracking-wide transition-all uppercase cursor-pointer ${
                          glowTheme === 'cyan' ? 'bg-[#00c8ff]/10 border-[#00c8ff] text-[#00c8ff]' : 'bg-black/25 border-white/5 text-neutral-400 hover:text-white'
                        }`}
                      >
                        Cyan
                      </button>
                      <button 
                        onClick={() => changeGlowTheme('emerald')}
                        className={`py-2 rounded-xl border text-[9px] font-mono font-bold tracking-wide transition-all uppercase cursor-pointer ${
                          glowTheme === 'emerald' ? 'bg-[#00FF80]/10 border-[#00FF80] text-[#00FF80]' : 'bg-black/25 border-white/5 text-neutral-400 hover:text-white'
                        }`}
                      >
                        Emerald
                      </button>
                      <button 
                        onClick={() => changeGlowTheme('gold')}
                        className={`py-2 rounded-xl border text-[9px] font-mono font-bold tracking-wide transition-all uppercase cursor-pointer ${
                          glowTheme === 'gold' ? 'bg-[#D4AF37]/10 border-[#D4AF37] text-[#D4AF37]' : 'bg-black/25 border-white/5 text-neutral-400 hover:text-white'
                        }`}
                      >
                        Aura Gold
                      </button>
                      <button 
                        onClick={() => changeGlowTheme('fuchsia')}
                        className={`py-2 rounded-xl border text-[9px] font-mono font-bold tracking-wide transition-all uppercase cursor-pointer ${
                          glowTheme === 'fuchsia' ? 'bg-[#FF00FF]/10 border-[#FF00FF] text-[#FF00FF]' : 'bg-black/25 border-white/5 text-neutral-400 hover:text-white'
                        }`}
                      >
                        Fuchsia
                      </button>
                    </div>
                  </div>

                  {/* HIGH FIDELITY METRICS TELEMETRY (Integrated within the aura frame to keep layout tidy) */}
                  <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-3 font-mono text-left select-none">
                    <div className="flex items-center gap-2 text-emerald-400">
                      <Cpu className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-bold tracking-wider text-emerald-400">MÉTRICAS DE CONEXÃO DA MATRIZ</span>
                    </div>

                    <div className="text-[11px] space-y-1.5 text-neutral-400">
                      <div className="flex justify-between">
                        <span>Nó Principal:</span>
                        <span className="text-white">INVIS-LATAM-CLUSTER-X8</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Latência Global:</span>
                        <span className={latency < 25 ? 'text-[#00FF80] font-bold' : 'text-yellow-400'}>
                          {latency} ms
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Poder de Cômputo:</span>
                        <span className="text-cyan-400 font-bold">{nodeSpeed.toFixed(2)} TH/s</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Multiplicador de Diff:</span>
                        <span className="text-[#D4AF37] font-bold">1.2x (Sincrono)</span>
                      </div>
                    </div>

                    {/* Visual dynamic lines graph */}
                    <div className="h-6 w-full bg-black/60 rounded border border-white/5 overflow-hidden flex items-end">
                      {Array.from({ length: 28 }).map((_, i) => {
                        const randHeight = Math.max(10, Math.min(95, 30 + (i % 5) * 15 + Math.random() * 20));
                        return (
                          <div 
                            key={i} 
                            className="flex-1 bg-cyan-400/25 border-t border-cyan-400"
                            style={{ 
                              height: `${randHeight}%`, 
                              backgroundColor: glowTheme === 'emerald' ? 'rgba(0,255,128,0.25)' : glowTheme === 'gold' ? 'rgba(212,175,55,0.25)' : glowTheme === 'fuchsia' ? 'rgba(255,0,255,0.25)' : 'rgba(0,200,255,0.25)',
                              borderColor: glowTheme === 'emerald' ? '#00FF80' : glowTheme === 'gold' ? '#D4AF37' : glowTheme === 'fuchsia' ? '#FF00FF' : '#00c8ff'
                            }} 
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* 4. CONFORMIDADE LEGAL & LGPD (QUARTO SEGMENTO) */}
                <div className="space-y-2 text-left pt-2 border-t border-white/5">
                  <p className="text-[10px] uppercase tracking-widest font-mono text-neutral-500 font-bold">Conformidade Legal & LGPD</p>
                  
                  <div className="flex flex-col gap-1.5 font-sans">
                    <button 
                      onClick={() => {
                        setSelectedSupportPage('privacidade');
                        setIsDrawerOpen(false);
                      }}
                      className="w-full text-left py-2 px-3 hover:bg-neutral-900 rounded-xl text-neutral-400 hover:text-[#00c8ff] transition-all text-xs border border-transparent hover:border-cyan-500/10 cursor-pointer"
                    >
                      🛡️ Política de Privacidade (LGPD)
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedSupportPage('termos');
                        setIsDrawerOpen(false);
                      }}
                      className="w-full text-left py-2 px-3 hover:bg-neutral-900 rounded-xl text-neutral-400 hover:text-[#00c8ff] transition-all text-xs border border-transparent hover:border-cyan-500/10 cursor-pointer"
                    >
                      📄 Termos de Utilização
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedSupportPage('exclusao');
                        setIsDrawerOpen(false);
                      }}
                      className="w-full text-left py-2 px-3 hover:bg-neutral-900 rounded-xl text-neutral-400 hover:text-red-400 transition-all text-xs border border-transparent hover:border-red-500/10 cursor-pointer"
                    >
                      🗑️ Excluir Todos Meus Dados Pessoais
                    </button>
                  </div>
                </div>

                {/* PRODUCTIVITY CONTRACTS UPGRADE SECTION (Hides completely if user tier is VIP1/VIP2/ADM, and VIP2 card deleted) */}
                {currentUser?.tier === 'FREE' && (
                  <div className="space-y-2 text-left pt-2 border-t border-white/5">
                    <p className="text-[10px] uppercase tracking-widest font-mono text-neutral-500 font-bold">
                      Contratos de Produtividade (Upgrades)
                    </p>
                    
                    {/* VIP1 Upgrade Card Only */}
                    <div className="p-3.5 rounded-2xl bg-black/40 border border-[#00c8ff]/20 space-y-2 hover:border-[#00c8ff]/40 transition-all select-none font-sans">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1.5 text-[#00c8ff]">
                          <Zap className="w-3.5 h-3.5 animate-bounce" />
                          <span className="font-mono text-xs font-black uppercase">Plano Master VIP 1</span>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-neutral-400">R$ 15,00/mês</span>
                      </div>
                      <p className="text-[10.5px] text-neutral-400 leading-relaxed font-sans">
                        Amplifica o multiplicador de mineração em <strong className="text-white">+2.5x</strong>. Abre downloads ilimitados na Biblioteca.
                      </p>
                      <button 
                        onClick={() => triggerUpgrade('VIP1')}
                        className="w-full py-2 bg-[#00c8ff] hover:bg-cyan-400 active:scale-[0.98] transition-all text-black font-black uppercase text-[10px] tracking-wider rounded-xl cursor-pointer select-none"
                      >
                        ATIVAR VIP 1 (Ganhe 25.0 ic agora)
                      </button>
                    </div>
                  </div>
                )}

              </div>

              {/* Drawer persistent Footer */}
              <div className="mt-4 pt-4 border-t border-white/5 space-y-3 shrink-0">
                <button
                  onClick={handleLogout}
                  className="w-full py-3.5 rounded-xl border border-red-500/30 bg-red-950/20 text-red-400 font-black tracking-widest uppercase hover:bg-red-500 hover:text-white hover:scale-[1.02] cursor-pointer transition-all text-xs flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{(currentTexts as any).end_session || 'ENCERRAR SESSÃO'}</span>
                </button>

                <p className="text-[8px] font-mono tracking-wider text-center text-neutral-600 uppercase">
                  INVIS SYSTEM CORE SECURE NODE v1.0.42
                </p>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Renders SettingsModal triggered by Quick Settings */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </>
  );
};
