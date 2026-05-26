import React, { useState } from 'react';
import { useInvis } from '../context/InvisContext';
import { BlockType } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { PlaySquare, Users, Gamepad2, BookOpen, Sparkles, HelpCircle, LayoutGrid } from 'lucide-react';

interface FooterFootProps {
  onOpenRoleta: () => void;
  onOpenLayoutManager: () => void;
}

export const FooterFoot: React.FC<FooterFootProps> = ({ 
  onOpenRoleta, 
  onOpenLayoutManager 
}) => {
  const { activeBlocks, addBlock, minimizeBlock, restoreBlock, setSystemStatus, setMediaHubSelectorOpen } = useInvis();

  const [isFooterHidden, setIsFooterHidden] = useState(false);
  const lastScrollTopRef = React.useRef<{ [key: string]: number }>({});
  const lastTouchY = React.useRef<number | null>(null);

  // Robust single-click vs double-click discriminator
  const clickTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const lastClickTimeRef = React.useRef<number>(0);

  // Manage dynamic scroll triggers
  React.useEffect(() => {
    // 1. Capture scroll event on any scrolling elements (capture: true)
    const handleCaptureScroll = (e: Event) => {
      const target = e.target as HTMLElement;
      if (!target || typeof target.scrollTop === 'undefined') return;
      
      const targetId = target.id || target.className || 'scroller';
      const lastScrollTop = lastScrollTopRef.current[targetId] || 0;
      const currentScrollTop = target.scrollTop;
      
      // Filter out small jitters
      if (Math.abs(currentScrollTop - lastScrollTop) > 8) {
        if (currentScrollTop > lastScrollTop && currentScrollTop > 40) {
          // Scrolling down -> Hide
          setIsFooterHidden(true);
        } else if (currentScrollTop < lastScrollTop) {
          // Scrolling up -> Show
          setIsFooterHidden(false);
        }
        lastScrollTopRef.current[targetId] = currentScrollTop;
      }
    };

    // 2. Wheel trigger for desktop mouse/trackpads
    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > 5) {
        if (e.deltaY > 0) {
          setIsFooterHidden(true);
        } else {
          setIsFooterHidden(false);
        }
      }
    };

    // 3. Touch drag handler for mobile/swipe devices
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches && e.touches[0]) {
        lastTouchY.current = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (lastTouchY.current === null || !e.touches || !e.touches[0]) return;
      
      const currentY = e.touches[0].clientY;
      const diffY = currentY - lastTouchY.current; // positive clientY diff means dragging down (scrolling up)
      
      if (Math.abs(diffY) > 10) {
        if (diffY < 0) {
          // Dragging up / Scrolling down -> Hide
          setIsFooterHidden(true);
        } else {
          // Dragging down / Scrolling up -> Show
          setIsFooterHidden(false);
        }
        lastTouchY.current = currentY;
      }
    };

    const handleTouchEnd = () => {
      lastTouchY.current = null;
    };

    window.addEventListener('scroll', handleCaptureScroll, { capture: true, passive: true });
    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleCaptureScroll, { capture: true });
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  // Show footer instantly when active blocks change or navigation switches (user "sair da tela")
  React.useEffect(() => {
    setIsFooterHidden(false);
  }, [activeBlocks.length]);

  // Clear timeout on unmount
  React.useEffect(() => {
    return () => {
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }
    };
  }, []);

  // Helper inside click haptics vibration
  const triggerHaptic = () => {
    if (navigator.vibrate) {
      navigator.vibrate(20);
    }
  };

  const handleCoinClick = (e: React.MouseEvent) => {
    e.preventDefault();
    triggerHaptic();

    const currentTime = Date.now();
    const elapsedTime = currentTime - lastClickTimeRef.current;

    if (elapsedTime > 0 && elapsedTime < 350) {
      // Verified double-click!
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
        clickTimeoutRef.current = null;
      }
      lastClickTimeRef.current = 0; // reset
      onOpenLayoutManager();
    } else {
      lastClickTimeRef.current = currentTime;
      clickTimeoutRef.current = setTimeout(() => {
        clickTimeoutRef.current = null;
        onOpenRoleta();
      }, 350);
    }
  };

  const handleTabClick = (type: BlockType, name: string) => {
    triggerHaptic();
    setIsFooterHidden(false); // Make sure footer stays up on navigation selection
    if (type === 'media') {
      const isMediaActive = activeBlocks.some(b => b.type === 'media');
      if (isMediaActive) {
        const mediaBlock = activeBlocks.find(b => b.type === 'media');
        if (mediaBlock?.minimized) {
          // Restore minimized block
          activeBlocks.forEach(b => {
            if (b.type === 'media' && b.minimized) {
              restoreBlock(b.id);
            }
          });
        }
        setSystemStatus('Foco no Hub de Mídia Ativo');
        return;
      }
      setMediaHubSelectorOpen(true);
      return;
    }
    const exists = activeBlocks.some(b => b.type === type);
    if (!exists) {
      addBlock(type, name);
    } else {
      // Toggle minimize or focus
      setSystemStatus(`${name} Focado`);
    }
  };

  const isTabActive = (type: BlockType) => {
    return activeBlocks.some(b => b.type === type);
  };

  return (
    <nav 
      className={`fixed bottom-0 left-0 w-full h-[60px] z-[1001] flex justify-center gap-4 sm:gap-8 items-start bg-transparent transition-all duration-500 ease-in-out ${
        isFooterHidden 
          ? 'translate-y-full opacity-0 pointer-events-none' 
          : 'translate-y-0 opacity-100'
      }`}
    >
      {/* Background shape: Leather oval cutout with Metal Glow Border */}
      <div className="absolute bottom-0 w-full h-full pointer-events-none z-[-1] overflow-visible">
        <svg 
          className="absolute bottom-0 left-0 w-full h-[120px] pointer-events-none drop-shadow-[0_-5px_15px_rgba(0,0,0,0.8)]" 
          viewBox="0 0 1000 100" 
          preserveAspectRatio="none"
        >
          {/* Leather fill: dark greyish extremely deep blue/black */}
          <path 
            d="M0,50 Q500,85 1000,50 L1000,100 L0,100 Z" 
            fill="url(#leatherGrad)" 
            stroke="url(#metalGlow)"
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
          />
          {/* Outer glow aura for the metal border */}
          <path 
            d="M0,50 Q500,85 1000,50" 
            fill="none" 
            stroke="url(#metalGlowFade)"
            strokeWidth="5"
            opacity="0.5"
            filter="blur(4px)"
            vectorEffect="non-scaling-stroke"
          />
          {/* Leather subtle texture overlay */}
          <path 
            d="M0,50 Q500,85 1000,50 L1000,100 L0,100 Z" 
            fill="url(#leatherNoise)" 
            opacity="0.3"
            style={{ mixBlendMode: 'overlay' } as any}
          />
          <defs>
            <linearGradient id="leatherGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0a0c11" />
              <stop offset="100%" stopColor="#040508" />
            </linearGradient>
            <linearGradient id="metalGlow" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="rgba(180, 200, 255, 0.1)" />
              <stop offset="20%" stopColor="rgba(110, 150, 255, 0.8)" />
              <stop offset="50%" stopColor="rgba(255, 255, 255, 0.4)" />
              <stop offset="80%" stopColor="rgba(110, 150, 255, 0.8)" />
              <stop offset="100%" stopColor="rgba(180, 200, 255, 0.1)" />
            </linearGradient>
            <linearGradient id="metalGlowFade" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="rgba(100,200,255,0.0)" />
              <stop offset="50%" stopColor="rgba(100,200,255,0.6)" />
              <stop offset="100%" stopColor="rgba(100,200,255,0.0)" />
            </linearGradient>
            <pattern id="leatherNoise" width="2" height="2" patternUnits="userSpaceOnUse">
               <rect width="2" height="2" fill="#fff" fillOpacity="0.02" />
               <path d="M0,1 L1,0" stroke="#000" strokeWidth="0.5" strokeOpacity="0.1" />
            </pattern>
          </defs>
        </svg>
        {/* Soft edge fade at the absolute top boundary visually outside SVG */}
        <div className="absolute top-[-30px] left-0 w-full h-[30px] bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
      </div>
      
      {/* Left Radial anchors: Mídia / Social (pulled up 50% visually) */}
      <div className="flex gap-4 sm:gap-6 items-center z-10 -mt-[25px]">
        {/* MÍDIA BUTTON */}
        <button
          id="btn_tab_media"
          onClick={() => handleTabClick('media', 'Mídia')}
          className={`relative w-[50px] h-[50px] rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer active:scale-90 ${
            isTabActive('media') 
              ? '-translate-y-2 bg-[#00c8ff]/15 border-2 border-[#00c8ff] text-[#00c8ff] shadow-[0_0_20px_rgba(0,200,255,0.45)]' 
              : 'bg-[#0f131a] border border-white/5 text-neutral-400 hover:text-neutral-200 hover:border-[#00c8ff]/30 shadow-[inset_0_2px_10px_rgba(255,255,255,0.05),0_5px_15px_rgba(0,0,0,0.5)] icon-shine-effect'
          }`}
          title="Mídia (Filmes, Vídeos)"
        >
          {isTabActive('media') && (
            <span className="absolute inset-0 rounded-full border border-dashed border-[#00c8ff]/40 animate-[spin_8s_linear_infinite]" />
          )}
          <PlaySquare className={`w-5 h-5 transition-transform duration-300 ${isTabActive('media') ? 'scale-110 drop-shadow-[0_0_5px_currentColor]' : ''}`} />
          {isTabActive('media') && (
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#00c8ff] border-2 border-[#0d0d12] flex items-center justify-center">
              <span className="w-1 h-1 rounded-full bg-white animate-ping" />
            </span>
          )}
        </button>

        {/* SOCIAL BUTTON */}
        <button
          id="btn_tab_social"
          onClick={() => handleTabClick('social', 'Social')}
          className={`relative w-[50px] h-[50px] rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer active:scale-90 ${
            isTabActive('social') 
              ? '-translate-y-2 bg-[#FF00FF]/15 border-2 border-[#FF00FF] text-[#FF00FF] shadow-[0_0_20px_rgba(255,0,255,0.45)]' 
              : 'bg-[#0f131a] border border-white/5 text-neutral-400 hover:text-neutral-200 hover:border-[#FF00FF]/30 shadow-[inset_0_2px_10px_rgba(255,255,255,0.05),0_5px_15px_rgba(0,0,0,0.5)] icon-shine-effect'
          }`}
          title="Social (Chat, Reels, Fórum)"
        >
          {isTabActive('social') && (
            <span className="absolute inset-[-2px] rounded-full border border-double border-[#FF00FF]/30 animate-pulse" />
          )}
          <Users className={`w-5 h-5 transition-transform duration-300 ${isTabActive('social') ? 'scale-110 drop-shadow-[0_0_5px_currentColor]' : ''}`} />
          {isTabActive('social') && (
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#FF00FF] border-2 border-[#0d0d12] flex items-center justify-center">
              <span className="w-1 h-1 rounded-full bg-white animate-pulse" />
            </span>
          )}
        </button>
      </div>

      {/* Moeda Central Ic Slot with pulse effects */}
      <div className="relative w-[72px] h-[72px] flex flex-col items-center justify-center select-none shrink-0 z-10 transition-transform -mt-[36px] parent-coin">
        
        {/* Swiping Indicator Dot */}
        <div 
          onClick={() => { triggerHaptic(); onOpenLayoutManager(); }}
          className="absolute -top-3 w-10 h-1 bg-[#D4AF37] rounded-full opacity-60 cursor-pointer hover:opacity-100 hover:scale-x-110 transition-all flex items-center justify-center"
          title="Clique para gerenciar o layout de divisões (Multitarefas)"
        >
          <div className="w-2 h-2 rounded-full bg-yellow-400 absolute animate-ping pointer-events-none" />
        </div>

        {/* The beautiful center coin: 80% out, 20% in the trough */}
        <button
          id="cmd_coin_central"
          onClick={handleCoinClick}
          className="w-[68px] h-[68px] rounded-full flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-tr from-[#D4AF37] to-[#FFD700] border-[3px] border-[#0a0c11] text-[#5C4033] shadow-[0_10px_20px_rgba(0,0,0,0.8),inset_0_2px_5px_rgba(255,255,255,0.6)] hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer focus:outline-none ring-2 ring-[#D4AF37]/50 ring-offset-2 ring-offset-transparent"
          title="Clique: Roleta da Sorte | Duplo Clique: Gerenciar Multitarefas"
        >
          {/* Inner rotating shiny glare */}
          <div 
            className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] rotate-45 pointer-events-none"
            style={{
              background: 'linear-gradient(45deg, transparent, rgba(255,255,255,0.5), transparent)',
              animation: 'shine 3s infinite'
            }}
          />
          <span className="font-sans font-black text-2xl leading-none tracking-tight drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]">Ic</span>
          <span className="text-[7.5px] font-black uppercase tracking-widest font-mono leading-none mt-0.5">INVIS</span>
        </button>
      </div>

      {/* Right Radial anchors: Jogos / Biblioteca */}
      <div className="flex gap-4 sm:gap-6 items-center z-10 -mt-[25px]">
        {/* JOGOS BUTTON */}
        <button
          id="btn_tab_games"
          onClick={() => handleTabClick('games', 'Jogos')}
          className={`relative w-[50px] h-[50px] rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer active:scale-90 ${
            isTabActive('games') 
              ? '-translate-y-2 bg-[#00FF80]/15 border-2 border-[#00FF80] text-[#00FF80] shadow-[0_0_20px_rgba(0,255,128,0.45)]' 
              : 'bg-[#0f131a] border border-white/5 text-neutral-400 hover:text-neutral-200 hover:border-[#00FF80]/30 shadow-[inset_0_2px_10px_rgba(255,255,255,0.05),0_5px_15px_rgba(0,0,0,0.5)] icon-shine-effect'
          }`}
          title="Jogos (Retro Hub)"
        >
          {isTabActive('games') && (
            <span className="absolute inset-1 rounded-full border border-dashed border-[#00FF80]/30 animate-[spin_12s_linear_infinite]" />
          )}
          <Gamepad2 className={`w-5 h-5 transition-transform duration-300 ${isTabActive('games') ? 'scale-110 drop-shadow-[0_0_5px_currentColor]' : ''}`} />
          {isTabActive('games') && (
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#00FF80] border-2 border-[#0d0d12] flex items-center justify-center">
              <span className="w-1 h-1 rounded-full bg-white animate-ping" />
            </span>
          )}
        </button>

        {/* BIBLIOTECA BUTTON */}
        <button
          id="btn_tab_library"
          onClick={() => handleTabClick('library', 'Biblioteca')}
          className={`relative w-[50px] h-[50px] rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer active:scale-90 ${
            isTabActive('library') 
              ? '-translate-y-2 bg-[#D4AF37]/15 border-2 border-[#D4AF37] text-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.45)]' 
              : 'bg-[#0f131a] border border-white/5 text-neutral-400 hover:text-neutral-200 hover:border-[#D4AF37]/30 shadow-[inset_0_2px_10px_rgba(255,255,255,0.05),0_5px_15px_rgba(0,0,0,0.5)] icon-shine-effect'
          }`}
          title="Biblioteca (Livros, Leitura, Escritor Fantasma)"
        >
          {isTabActive('library') && (
            <span className="absolute inset-[-1px] rounded-full border border-spacing-1 border-[#D4AF37]/25 animate-pulse" />
          )}
          <BookOpen className={`w-5 h-5 transition-transform duration-300 ${isTabActive('library') ? 'scale-110 drop-shadow-[0_0_5px_currentColor]' : ''}`} />
          {isTabActive('library') && (
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#D4AF37] border-2 border-[#0d0d12] flex items-center justify-center">
              <span className="w-1 h-1 rounded-full bg-white animate-pulse" />
            </span>
          )}
        </button>
      </div>
    </nav>
  );
};
