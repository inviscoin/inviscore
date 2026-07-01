import React, { useState, useEffect, useRef } from 'react';
import { useInvis, DICTIONARY } from '../context/InvisContext';
import { useTranslation } from '../hooks/useTranslation';
import { BlockType, DashboardBlock } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { MediaModule } from './MediaModule';
import { SocialModule } from './SocialModule';
import { GamesModule } from './GamesModule';
import { LibraryModule } from './LibraryModule';
import { MonitoringModule } from './MonitoringModule';
import { TodoModule } from './TodoModule';
import { OnboardingGuide } from './OnboardingGuide';
import { Pin, Minimize2, X, Sparkles, LayoutGrid, Clock, Battery, Coins, Info, ShieldCheck, Heart, Film, MessageSquare, Gamepad2, BookOpen, Server, ClipboardList, MonitorSmartphone } from 'lucide-react';

const blockMetaMap: Record<string, Record<string, { title: string, desc: string }>> = {
  'tasks': {
    'pt-BR': { title: 'Tarefas', desc: 'Hub de Tarefas' },
    'en-US': { title: 'Tasks', desc: 'Tasks Hub' },
    'es-ES': { title: 'Tareas', desc: 'Panel de Tareas' },
    'fr-FR': { title: 'Tâches', desc: 'Tableau de Bord' },
    'de-DE': { title: 'Aufgaben', desc: 'Betriebspanel' },
    'it-IT': { title: 'Attività', desc: 'Pannello Operativo' },
    'ja-JP': { title: 'タスク', desc: 'タスク管理パネル' },
    'zh-CN': { title: '任务', desc: '日常操作面板' },
    'ru-RU': { title: 'Задачи', desc: 'Рабочая Панель' },
    'ar-SA': { title: 'المهام', desc: 'لوحة التحكم' },
    'hi-IN': { title: 'कार्य', desc: 'परिचालन पैनल' },
    'ko-KR': { title: '작업', desc: '운영 제어 패널' },
  },
  'monitoring': {
    'pt-BR': { title: 'Monitoramento', desc: 'Infra CPU' },
    'en-US': { title: 'Monitoring', desc: 'CPU Infra' },
    'es-ES': { title: 'Monitoreo', desc: 'Infraestructura CPU' },
    'fr-FR': { title: 'Surveillance', desc: 'Infrastructure CPU' },
    'de-DE': { title: 'Überwachung', desc: 'CPU-Infrastruktur' },
    'it-IT': { title: 'Monitoraggio', desc: 'Infrastruttura CPU' },
    'ja-JP': { title: '監視', desc: 'CPUインフラ' },
    'zh-CN': { title: '监控', desc: 'CPU底层架构' },
    'ru-RU': { title: 'Мониторинг', desc: 'Инфраструктура ЦП' },
    'ar-SA': { title: 'المراقبة', desc: 'مراقبة المعالج' },
    'hi-IN': { title: 'निगरानी', desc: 'सीपीयू संरचना' },
    'ko-KR': { title: '모니터링', desc: 'CPU 인프라 모니터링' },
  },
  'media': {
    'pt-BR': { title: 'Mídia', desc: 'Hub de Mídias' },
    'en-US': { title: 'Media', desc: 'Media Hub' },
    'es-ES': { title: 'Medios', desc: 'Hub de Medios' },
    'fr-FR': { title: 'Média', desc: 'Hub de Médias' },
    'de-DE': { title: 'Medien', desc: 'Medien-Hub' },
    'it-IT': { title: 'Media', desc: 'Hub di Media' },
    'ja-JP': { title: 'メディア', desc: 'メディアハブ' },
    'zh-CN': { title: '媒体', desc: '影音娱乐中心' },
    'ru-RU': { title: 'Медиа', desc: 'Медиа-хаб' },
    'ar-SA': { title: 'الوسائط', desc: 'مركز الوسائط' },
    'hi-IN': { title: 'मीडिया', desc: 'मीडिया हब' },
    'ko-KR': { title: '미디어', desc: '미디어 스트리밍 허브' },
  },
  'social': {
    'pt-BR': { title: 'Social', desc: 'Hub de Contatos' },
    'en-US': { title: 'Social', desc: 'Connection Hub' },
    'es-ES': { title: 'Social', desc: 'Hub de Contactos' },
    'fr-FR': { title: 'Social', desc: 'Hub de Contacts' },
    'de-DE': { title: 'Soziales', desc: 'Kontakt-Hub' },
    'it-IT': { title: 'Sociale', desc: 'Hub di Contatti' },
    'ja-JP': { title: 'ソーシャル', desc: '連絡先ハブ' },
    'zh-CN': { title: '社交', desc: '全球聊天枢纽' },
    'ru-RU': { title: 'Социальные сети', desc: 'Панель контактов' },
    'ar-SA': { title: 'التواصل الاجتماعي', desc: 'مركز جهات الاتصال' },
    'hi-IN': { title: 'सामाजिक', desc: 'संपर्क हब' },
    'ko-KR': { title: '소셜', desc: '네트워크 연결 허브' },
  },
  'games': {
    'pt-BR': { title: 'Jogos', desc: 'Arena de Lazer' },
    'en-US': { title: 'Games', desc: 'Lazer Arena' },
    'es-ES': { title: 'Juegos', desc: 'Arena de Ocio' },
    'fr-FR': { title: 'Jeux', desc: 'Arène de Loisirs' },
    'de-DE': { title: 'Spiele', desc: 'Freizeitarena' },
    'it-IT': { title: 'Giochi', desc: 'Arena del Tempo Libero' },
    'ja-JP': { title: 'ゲーム', desc: 'レジャーアリーナ' },
    'zh-CN': { title: '游戏', desc: '游戏竞技中心' },
    'ru-RU': { title: 'Игры', desc: 'Арена досуга' },
    'ar-SA': { title: 'الألعاب', desc: 'ساحة الترفيه' },
    'hi-IN': { title: 'खेल', desc: 'अवकाश क्रीड़ा' },
    'ko-KR': { title: '게임', desc: '캐주얼 아케이드 게임' },
  },
  'library': {
    'pt-BR': { title: 'Biblioteca', desc: 'Estante Virtual' },
    'en-US': { title: 'Library', desc: 'Virtual Bookshelf' },
    'es-ES': { title: 'Biblioteca', desc: 'Estante Virtual' },
    'fr-FR': { title: 'Bibliothèque', desc: 'Étagère Virtuelle' },
    'de-DE': { title: 'Bibliothek', desc: 'Virtuelles Bücherregal' },
    'it-IT': { title: 'Biblioteca', desc: 'Scaffale Virtuale' },
    'ja-JP': { title: '図書館', desc: '仮想本棚' },
    'zh-CN': { title: '图书馆', desc: '云端数字书架' },
    'ru-RU': { title: 'Библиотека', desc: 'Виртуальная полка' },
    'ar-SA': { title: 'المكتبة', desc: 'الرف الافتراضي' },
    'hi-IN': { title: 'पुस्तकालय', desc: 'आभासी अलमारी' },
    'ko-KR': { title: '도서관', desc: '동기화 가상 책장' },
  }
};

const blockIcons: Record<string, React.ReactNode> = {
  tasks: <ClipboardList className="w-3.5 h-3.5 text-[#00c8ff]" />,
  monitoring: <Server className="w-3.5 h-3.5 text-[#00c8ff]" />,
  media: <Film className="w-3.5 h-3.5 text-[#00c8ff]" />,
  social: <MessageSquare className="w-3.5 h-3.5 text-[#00c8ff]" />,
  games: <Gamepad2 className="w-3.5 h-3.5 text-[#00c8ff]" />,
  library: <BookOpen className="w-3.5 h-3.5 text-[#00c8ff]" />,
};

const CircuitBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.4]" id="circuit_svg_background">
      <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" style={{ minHeight: '100%' }}>
        <defs>
          <radialGradient id="circuitGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00c8ff" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#050508" stopOpacity="0" />
          </radialGradient>
          
          <linearGradient id="goldTrace" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFD700" />
            <stop offset="100%" stopColor="#cf9f0a" />
          </linearGradient>
          <linearGradient id="blueTrace" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00f0ff" />
            <stop offset="100%" stopColor="#005f9e" />
          </linearGradient>
          <linearGradient id="redTrace" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff3b30" />
            <stop offset="100%" stopColor="#8b0000" />
          </linearGradient>
          <linearGradient id="purpleTrace" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#af52de" />
            <stop offset="100%" stopColor="#4c1e75" />
          </linearGradient>

          <filter id="neonGlowPulse" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Dynamic ambient central glow */}
        <circle cx="50%" cy="50%" r="280" fill="url(#circuitGlow)" className="animate-pulse" style={{ animationDuration: '4s' }} />

        {/* Synapse Connection Array (Neural Connections) */}
        {/* Connection rays */}
        <path d="M 15% 15% Q 25% 18% 30% 30% T 50% 50%" fill="none" stroke="url(#goldTrace)" strokeWidth="1.5" strokeOpacity="0.4" />
        <path d="M 85% 15% Q 75% 20% 70% 35% T 50% 50%" fill="none" stroke="url(#blueTrace)" strokeWidth="1.5" strokeOpacity="0.4" />
        <path d="M 15% 85% Q 28% 78% 35% 65% T 50% 50%" fill="none" stroke="url(#redTrace)" strokeWidth="1.5" strokeOpacity="0.4" />
        <path d="M 85% 85% Q 72% 80% 65% 60% T 50% 50%" fill="none" stroke="url(#purpleTrace)" strokeWidth="1.5" strokeOpacity="0.4" />

        <path d="M 30% 30% L 70% 35%" fill="none" stroke="url(#blueTrace)" strokeWidth="1" strokeDasharray="3 6" strokeOpacity="0.3" />
        <path d="M 35% 65% L 65% 60%" fill="none" stroke="url(#purpleTrace)" strokeWidth="1" strokeDasharray="3 6" strokeOpacity="0.3" />

        {/* Traveling electrical energy pulses */}
        <path d="M 15% 15% Q 25% 18% 30% 30% T 50% 50%" fill="none" stroke="#FFD700" strokeWidth="2.5" filter="url(#neonGlowPulse)" strokeDasharray="40 180" className="circuit-pulse-fast" />
        <path d="M 85% 15% Q 75% 20% 70% 35% T 50% 50%" fill="none" stroke="#00f0ff" strokeWidth="2.5" filter="url(#neonGlowPulse)" strokeDasharray="50 200" className="circuit-pulse-medium" />
        <path d="M 15% 85% Q 28% 78% 35% 65% T 50% 50%" fill="none" stroke="#ff3b30" strokeWidth="2.5" filter="url(#neonGlowPulse)" strokeDasharray="30 160" className="circuit-pulse-slow" />
        <path d="M 85% 85% Q 72% 80% 65% 60% T 50% 50%" fill="none" stroke="#af52de" strokeWidth="2.5" filter="url(#neonGlowPulse)" strokeDasharray="45 190" className="circuit-pulse-fast" />

        {/* Neuron synapse cell nucleuses */}
        <circle cx="15%" cy="15%" r="6" fill="#FFD700" filter="url(#neonGlowPulse)" className="animate-pulse" />
        <circle cx="85%" cy="15%" r="6" fill="#00f0ff" filter="url(#neonGlowPulse)" className="animate-pulse" />
        <circle cx="15%" cy="85%" r="6" fill="#ff3b30" filter="url(#neonGlowPulse)" className="animate-pulse" />
        <circle cx="85%" cy="85%" r="6" fill="#af52de" filter="url(#neonGlowPulse)" className="animate-pulse" />

        <circle cx="30%" cy="30%" r="4" fill="#FFD700" stroke="#000" strokeWidth="1" />
        <circle cx="70%" cy="35%" r="4" fill="#00f0ff" stroke="#000" strokeWidth="1" />
        <circle cx="35%" cy="65%" r="4" fill="#ff3b30" stroke="#000" strokeWidth="1" />
        <circle cx="65%" cy="60%" r="4" fill="#af52de" stroke="#000" strokeWidth="1" />

        <circle cx="50%" cy="50%" r="8" fill="#FFFFFF" filter="url(#neonGlowPulse)" className="animate-ping" style={{ animationDuration: '3s' }} />
        <circle cx="50%" cy="50%" r="6" fill="#00c8ff" />
      </svg>
    </div>
  );
};

const CAROUSEL_BANNERS = [
  { type: 'tasks', title: 'GERENCIADOR OPERACIONAL', desc: 'Edite, agende, marque tarefas e controle o progresso operacional', icon: '🎯' },
  { type: 'monitoring', title: 'DATACENTER & LOGGING', desc: 'Monitoramento Vercel & Supabase em Tempo Real', icon: '⚡' },
  { type: 'media', title: 'AURA CINEMA MULTIPLEX', desc: 'Assista filmes e clipes sincronizados em grupo', icon: '🎬' },
  { type: 'social', title: 'CHATS GLOBAIS COM BABEL', desc: 'Comunicação instantânea traduzida por IA', icon: '💬' },
  { type: 'games', title: 'ARCADES MOBILE-EXCLUSIVE', desc: 'Pilhas de turnos e vantagens de alta performance', icon: '🎮' },
  { type: 'library', title: 'BIBLIOTECA & ESCRITOR IA', desc: 'Criação de obras literárias sob demanda', icon: '📚' }
];

interface DashboardMasterProps {
  isLayoutOpen: boolean;
  onCloseLayout: () => void;
}

export const DashboardMaster: React.FC<DashboardMasterProps> = ({ 
  isLayoutOpen, 
  onCloseLayout 
}) => {
  const { 
    activeBlocks, addBlock, minimizeBlock, restoreBlock, closeBlock, togglePin, swapBlocks, 
    language, wallet, setWallet, systemStatus, triggerChronCleanup, currentUser 
  } = useInvis();

  const isFocusMode = currentUser?.focusModeActive === true;

  const { 
    isMediaPipMode, showPipModal, setShowPipModal, triggerMediaResume, isNavVisible,
    mediaIsPlaying
  } = useInvis();
  const visibleBlocks = activeBlocks.filter(b => !b.minimized);
  const minimizedBlocks = activeBlocks.filter(b => b.minimized);

  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [customSizings, setCustomSizings] = useState<Record<string, { w: number, h: number }>>(() => {
    try {
      const saved = localStorage.getItem('hubConfig_customSizings');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Expire after 7 days to prevent layout conflicts in future versions
        if (parsed._timestamp && Date.now() - parsed._timestamp < 7 * 24 * 60 * 60 * 1000) {
          const { _timestamp, ...rest } = parsed;
          return rest;
        }
      }
    } catch(e) {}
    return {};
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      // Aggressive immediate sub-pixel calculation using borderBoxSize if available
      for (let entry of entries) {
        const width = entry.borderBoxSize?.[0]?.inlineSize || entry.contentRect.width;
        const height = entry.borderBoxSize?.[0]?.blockSize || entry.contentRect.height;
        setContainerSize({ w: width, h: height });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Save to localStorage whenever it changes with timestamp
  useEffect(() => {
    const dataToSave = { ...customSizings, _timestamp: Date.now() };
    localStorage.setItem('hubConfig_customSizings', JSON.stringify(dataToSave));
  }, [customSizings]);

  // Clear custom sizing when a block is closed
  useEffect(() => {
    setCustomSizings(prev => {
      const next = { ...prev };
      let changed = false;
      Object.keys(next).forEach(id => {
        if (!activeBlocks.find(b => b.id === id)) {
          delete next[id];
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [activeBlocks]);

  // Set first block as selected by default if nothing is selected
  useEffect(() => {
    if (visibleBlocks.length > 0 && !selectedBlockId) {
      setSelectedBlockId(visibleBlocks[0].id);
    }
  }, [visibleBlocks, selectedBlockId]);

  const triggerHaptic = (ms = 20) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(ms);
    }
  };

  // Inactivity Screensaver overlay (2 minutes idle)
  const [isIdle, setIsIdle] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState('98%');
  const [currentTimeStr, setCurrentTimeStr] = useState('12:00:00');
  const [currentDateStr, setCurrentDateStr] = useState('Terça-feira, 19 de Maio');

  // Carousel touch control triggers
  const [lastTouchTime, setLastTouchTime] = useState<number>(0);
  const [isPausedByTouch, setIsPausedByTouch] = useState<boolean>(false);

  // Carousel slider state when no blocks open
  const [carouselIndex, setCarouselIndex] = useState(0);

  // Auto incremental mining tick while active to reward user
  useEffect(() => {
    const tick = setInterval(() => {
      setWallet(prev => ({
        ...prev,
        icGold: prev.icGold + 0.0000001250 // Real-time continuous mining increments
      }));
    }, 1000);

    return () => clearInterval(tick);
  }, []);

  const resizingBlockRef = useRef<string | null>(null);
  const resizeStartRef = useRef<{ w: number, h: number, x: number, y: number, cw: number, ch: number } | null>(null);

  const handleResizePointerDown = (e: React.PointerEvent, blockId: string) => {
    e.stopPropagation();
    if (!containerRef.current) return;
    const cw = containerRef.current.clientWidth;
    const ch = containerRef.current.clientHeight;
    
    resizingBlockRef.current = blockId;
    const existing = customSizings[blockId];
    // Default to width/height of the block's current rendered size via DOM
    const blockEl = e.currentTarget.closest('[data-blockid]') as HTMLElement;
    const startW = existing?.w || ((blockEl?.offsetWidth || cw)/cw)*100 || 50;
    const startH = existing?.h || ((blockEl?.offsetHeight || ch)/ch)*100 || 100;
    
    resizeStartRef.current = { w: startW, h: startH, x: e.clientX, y: e.clientY, cw, ch };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handleResizePointerMove = (e: React.PointerEvent) => {
    if (!resizingBlockRef.current || !resizeStartRef.current) return;
    const deltaX = e.clientX - resizeStartRef.current.x;
    const deltaY = e.clientY - resizeStartRef.current.y;
    
    const deltaWPercent = (deltaX / resizeStartRef.current.cw) * 100;
    const deltaHPercent = (deltaY / resizeStartRef.current.ch) * 100;

    let newW = Math.max(25, Math.min(100, resizeStartRef.current.w + deltaWPercent));
    let newH = Math.max(25, Math.min(100, resizeStartRef.current.h + deltaHPercent));

    setCustomSizings(prev => ({
      ...prev,
      [resizingBlockRef.current!]: { w: newW, h: newH }
    }));
  };

  const handleResizePointerUp = (e: React.PointerEvent) => {
    if (resizingBlockRef.current) {
      e.currentTarget.releasePointerCapture(e.pointerId);
      resizingBlockRef.current = null;
      resizeStartRef.current = null;
    }
  };

  const reorderStartRef = useRef<{ id: string, startY: number, idx: number } | null>(null);
  
  const handleHeaderPointerDown = (e: React.PointerEvent, id: string, idx: number) => {
    if (!isNavVisible) return; // Only allow reorder when nav is visible to prevent layout bugs
    reorderStartRef.current = { id, startY: e.clientY, idx };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handleHeaderPointerMove = (e: React.PointerEvent) => {
    if (!reorderStartRef.current) return;
    const deltaY = e.clientY - reorderStartRef.current.startY;
    const threshold = window.innerHeight * 0.05; // 5% of screen height

    if (Math.abs(deltaY) > threshold) {
       const direction = deltaY > 0 ? 1 : -1;
       const targetIdx = reorderStartRef.current.idx + direction;
       if (targetIdx >= 0 && targetIdx < visibleBlocks.length) {
          const targetBlock = visibleBlocks[targetIdx];
          swapBlocks(reorderStartRef.current.id, targetBlock.id);
          // reset start to require another 5% drag
          reorderStartRef.current.startY = e.clientY;
          reorderStartRef.current.idx = targetIdx;
          triggerHaptic(20);
       }
    }
  };

  const handleHeaderPointerUp = (e: React.PointerEvent) => {
    if (reorderStartRef.current) {
      e.currentTarget.releasePointerCapture(e.pointerId);
      reorderStartRef.current = null;
    }
  };

  // Lateral touch scrolling wrapper logic
  const scrollTrackerRef = useRef<{ active: boolean, startX: number, startScrollLeft: number, lastX: number }>({ active: false, startX: 0, startScrollLeft: 0, lastX: 0 });
  const handleDashboardTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const w = window.innerWidth;
    if (touch.clientX < w * 0.2 || touch.clientX > w * 0.8) {
       scrollTrackerRef.current = { active: true, startX: touch.clientX, startScrollLeft: containerRef.current?.scrollLeft || 0, lastX: touch.clientX };
    } else {
       scrollTrackerRef.current.active = false;
    }
  };
  const handleDashboardTouchMove = (e: React.TouchEvent) => {
    if (scrollTrackerRef.current.active && containerRef.current) {
        const touch = e.touches[0];
        const delta = scrollTrackerRef.current.startX - touch.clientX;
        containerRef.current.scrollLeft = scrollTrackerRef.current.startScrollLeft + delta;
    }
  };
  const handleDashboardTouchEnd = () => {
    scrollTrackerRef.current.active = false;
  };

  // Sync Clock ticks
  useEffect(() => {
    const clock = setInterval(() => {
      const now = new Date();
      setCurrentTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setCurrentDateStr(now.toLocaleDateString(language === 'pt-BR' ? 'pt-BR' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long' }));
    }, 1000);
    return () => clearInterval(clock);
  }, [language]);

  // Handle auto spin carousel over exactly 3 seconds
  useEffect(() => {
    let t: NodeJS.Timeout;
    if (visibleBlocks.length === 0 && !isPausedByTouch) {
      t = setInterval(() => {
        setCarouselIndex(prev => (prev + 1) % CAROUSEL_BANNERS.length);
      }, 3000);
    }
    return () => {
      if (t) clearInterval(t);
    };
  }, [visibleBlocks.length, isPausedByTouch]);

  // Handle auto-resume rotation after 5 seconds of touch inactivity
  useEffect(() => {
    if (isPausedByTouch) {
      const rec = setTimeout(() => {
        setIsPausedByTouch(false);
      }, 5000);
      return () => clearTimeout(rec);
    }
  }, [isPausedByTouch, lastTouchTime]);

  // Handle simulated battery level
  useEffect(() => {
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setBatteryLevel(`${Math.round(battery.level * 100)}%`);
        battery.addEventListener('levelchange', () => {
          setBatteryLevel(`${Math.round(battery.level * 100)}%`);
        });
      });
    }
  }, []);

  // Inactivity timeout sensor resetter (simulated 20s for easy testing / evaluation)
  useEffect(() => {
    let idleTimer: NodeJS.Timeout;
    const resetIdleTimer = () => {
      setIsIdle(false);
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        setIsIdle(true);
      }, 25000); // 25 seconds of absolute idleness triggers dynamic Película de Descanso
    };

    window.addEventListener('mousemove', resetIdleTimer);
    window.addEventListener('keydown', resetIdleTimer);
    window.addEventListener('touchstart', resetIdleTimer);

    resetIdleTimer();

    return () => {
      window.removeEventListener('mousemove', resetIdleTimer);
      window.removeEventListener('keydown', resetIdleTimer);
      window.removeEventListener('touchstart', resetIdleTimer);
      clearTimeout(idleTimer);
    };
  }, []);

  const renderActiveWidgetIndex = (type: BlockType) => {
    switch (type) {
      case 'media': return <MediaModule />;
      case 'social': return <SocialModule />;
      case 'games': return <GamesModule />;
      case 'library': return <LibraryModule />;
      case 'monitoring': return <MonitoringModule />;
      case 'tasks': return <TodoModule />;
      default: return null;
    }
  };

  const handleTabClickFromCarousel = (type: string) => {
    let name = type.toUpperCase();
    if (type === 'media') name = 'Mídia';
    if (type === 'social') name = 'Social';
    if (type === 'games') name = 'Games';
    if (type === 'library') name = 'Biblioteca';
    if (type === 'monitoring') name = 'Monitoramento';
    if (type === 'tasks') name = 'Tarefas';
    addBlock(type as any, name);
  };

  const handleCarouselTouch = () => {
    const now = Date.now();
    const diff = now - lastTouchTime;
    
    setIsPausedByTouch(true);
    setLastTouchTime(now);

    if (diff > 0 && diff < 400) {
      // Confirmed double tap / second click! Select section
      setIsPausedByTouch(false);
      handleTabClickFromCarousel(CAROUSEL_BANNERS[carouselIndex].type);
      if (navigator.vibrate) navigator.vibrate(30);
    } else {
      if (navigator.vibrate) navigator.vibrate(15);
    }
  };

  const { currentTexts } = useTranslation();

  return (
    <div className={`w-full flex-1 relative flex flex-col overflow-hidden ${isFocusMode ? 'bg-black' : 'bg-radial from-[#050508] to-[#040406]'}`}>
      
      {/* Background Matrix shader Overlay grid */}
      {!isFocusMode && <div className="absolute inset-0 opacity-10 pointer-events-none matrix-line-overlay" />}

      {/* SVG Circuit trace rays crossing through center of app */}
      {!isFocusMode && <CircuitBackground />}

      {/* Sleek minimized tasks dock - REMOVED PER REQUEST */}

      {/* Main rendering slot viewport */}
      <div className="w-full h-full flex-1 flex flex-col justify-start relative overflow-hidden">
        
        <AnimatePresence mode="wait">
          {visibleBlocks.length === 0 ? (
            /* EMPTY STATE: CAROUSEL DE CRISTAIS (BANNERS DE VIDRO) MATCHING PAGE 5 */
            <motion.div
              key="carousel"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full flex-1 flex flex-col items-center justify-center p-4 text-center select-none"
            >
              <div className="w-full max-w-lg flex flex-col items-center justify-center space-y-4">
                {/* Active scan status indicator pill */}
                <div className="text-[10px] font-mono text-cyan-400/60 uppercase tracking-widest bg-cyan-950/20 shadow-[0_0_15px_rgba(0,198,255,0.1)] border border-cyan-500/15 px-3.5 py-1 rounded-full">
                  {isPausedByTouch ? "⏸️ Carrossel Pausado" : "⚡ Toque para pausar | Toque duas vezes para acessar"}
                </div>

                {/* THE 380PX CAROUSEL TAPE */}
                <div 
                  className="w-full h-[380px] relative rounded-[32px] overflow-hidden cursor-pointer gpu-accelerated shadow-[0_0_60px_rgba(0,198,255,0.15)] border transition-all duration-300"
                  onClick={handleCarouselTouch}
                  style={{
                    background: 'linear-gradient(135deg, rgba(11, 14, 17, 0.7) 0%, rgba(5, 5, 8, 0.85) 100%)',
                    backdropFilter: 'blur(25px)',
                    WebkitBackdropFilter: 'blur(25px)',
                    borderColor: carouselIndex % 2 === 0 ? 'rgba(0, 200, 255, 0.25)' : 'rgba(138, 43, 226, 0.25)',
                    boxShadow: carouselIndex % 2 === 0 
                      ? '0 0 40px rgba(0, 200, 255, 0.1), inset 0 0 20px rgba(0, 200, 255, 0.05)' 
                      : '0 0 40px rgba(138, 43, 226, 0.1), inset 0 0 20px rgba(138, 43, 226, 0.05)'
                  }}
                >
                  {/* Subtle neon corner light paths */}
                  <div className="absolute top-0 left-0 w-32 h-[2px] bg-gradient-to-r from-cyan-400 to-transparent" />
                  <div className="absolute bottom-0 right-0 w-32 h-[2px] bg-gradient-to-l from-purple-500 to-transparent" />

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={carouselIndex}
                      initial={{ opacity: 0, scale: 0.95, y: 15 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -15 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 22 }}
                      className="absolute inset-0 flex flex-col justify-between p-8 w-full h-full text-center"
                    >
                      {/* Top Header Label */}
                      <div className="flex justify-between items-center text-left">
                        <span className="font-mono text-[9px] tracking-[0.25em] text-neutral-400 uppercase font-black">
                          SISTEMA MULTIPLEX HUB
                        </span>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[8.5px] font-mono uppercase">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                          <span>Status: Pronto</span>
                        </div>
                      </div>

                      {/* Center Graphic Icon Area */}
                      <div className="my-3 flex flex-col items-center justify-center relative flex-1">
                        {/* Orbiting Ring backplate */}
                        <div className="absolute w-36 h-36 rounded-full border border-dashed border-cyan-500/20 animate-[spin_30s_linear_infinite]" />
                        <div className="absolute w-44 h-44 rounded-full border border-double border-purple-500/10 animate-[spin_40s_linear_infinite_reverse]" />

                        {/* Huge Dopamine Icon */}
                        <motion.div 
                          animate={{ y: [-5, 5, -5] }}
                          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                          className="w-24 h-24 rounded-2xl flex items-center justify-center text-4xl relative z-10"
                          style={{
                            background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.01) 100%)',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.05)'
                          }}
                        >
                          <span className="filter drop-shadow-[0_0_15px_rgba(0,200,255,0.4)]">{CAROUSEL_BANNERS[carouselIndex].icon}</span>
                        </motion.div>
                      </div>

                      {/* Description Panel */}
                      <div className="space-y-2 relative z-20">
                        <span className="text-[10px] font-mono uppercase text-neutral-500 tracking-widest block font-bold">
                          #{CAROUSEL_BANNERS[carouselIndex].type.toUpperCase()}
                        </span>
                        <h4 
                          className="text-white text-lg font-black uppercase tracking-wider filter drop-shadow-[0_0_8px_rgba(255,255,255,0.1)]"
                          style={{
                            textShadow: '0 0 16px rgba(0, 200, 255, 0.25)'
                          }}
                        >
                          {CAROUSEL_BANNERS[carouselIndex].title}
                        </h4>
                        <p className="text-[11px] text-neutral-400 max-w-sm mx-auto leading-relaxed">
                          {CAROUSEL_BANNERS[carouselIndex].desc}
                        </p>
                      </div>

                      {/* Interactive Button */}
                      <div className="pt-4">
                        <span className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 text-black text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(0,200,255,0.35)] font-mono">
                          ACESSAR SESSÃO ⚡
                        </span>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Bullets indicator dot bar */}
                <div className="flex justify-center gap-2">
                  {CAROUSEL_BANNERS.map((_, idx) => (
                    <span 
                      key={idx} 
                      onClick={() => { setCarouselIndex(idx); setIsPausedByTouch(true); setLastTouchTime(Date.now()); }}
                      className={`w-1.5 h-1.5 rounded-full cursor-pointer transition-all ${
                        carouselIndex === idx ? 'bg-[#00c8ff] w-3.5' : 'bg-neutral-800'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Central hint prompt */}
              <motion.p 
                animate={{ opacity: [0.4, 0.9, 0.4] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-[9.5px] text-[#8a2be2] font-mono tracking-[0.25em] uppercase mt-12 whitespace-pre-line px-6 max-w-sm"
              >
                {currentTexts.hint}
              </motion.p>
            </motion.div>
          ) : (
            /* DYNAMIC MULTI-WIDGET VIEWPORT GRID BASED ON PAGE 16 */
            <motion.div
              ref={containerRef}
              key="active-grid"
              className="w-full flex-1 flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-white/10 bg-black/20 overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {visibleBlocks.map((block, idx) => {
                const isSelected = selectedBlockId === block.id;

                let blockClassNames = "overflow-hidden flex flex-col relative transition-[flex,opacity,background] duration-500 ease-in-out ";
                
                if (isFocusMode) {
                   blockClassNames += "bg-black/90 ";
                } else {
                   blockClassNames += "bg-black/40 ";
                }
                
                // Elegant structural sizing
                if (visibleBlocks.length === 1) {
                    blockClassNames += "flex-1 w-full ";
                } else {
                    blockClassNames += isSelected 
                        ? "flex-[3] opacity-100 z-10 shadow-[0_0_50px_rgba(0,0,0,0.5)] " 
                        : `flex-[1] cursor-pointer shrink-0 ${isFocusMode ? 'opacity-10 hover:opacity-30' : 'opacity-50 hover:opacity-80'} `;
                }

                return (
                  <motion.div
                    layout
                    key={block.id}
                    data-blockid={block.id}
                    onClick={() => { if (!isSelected) setSelectedBlockId(block.id); }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={blockClassNames}
                  >
                    {/* Block Controller Header bar */}
                    {isNavVisible && (
                      <div 
                        onPointerDown={(e) => handleHeaderPointerDown(e, block.id, idx)}
                        onPointerMove={handleHeaderPointerMove}
                        onPointerUp={handleHeaderPointerUp}
                        onPointerLeave={handleHeaderPointerUp}
                        className="w-full h-[38px] bg-[#00c8ff]/5 border-b border-white/5 px-4 flex justify-between items-center shrink-0 font-sans touch-none"
                      >
                        
                        {/* Left specs title */}
                        <div className="flex items-center gap-2 pointer-events-none">
                        {blockIcons[block.type] || <Sparkles className="w-3.5 h-3.5 text-[#00c8ff]" />}
                        <span className="font-sans font-black text-[11px] text-white uppercase tracking-wider select-none">
                          {blockMetaMap[block.type]?.[language]?.title || block.title}
                          {blockMetaMap[block.type]?.[language]?.desc && (
                            <span className="text-[#00c8ff]/90 font-mono font-bold text-[10px] lowercase normal-case ml-2">
                              — {blockMetaMap[block.type]?.[language]?.desc}
                            </span>
                          )}
                        </span>
                      </div>

                      {/* Right action handlers */}
                      <div className="flex gap-4 items-center">
                        {/* Pin frame */}
                        <button 
                          onClick={() => { togglePin(block.id); if (navigator.vibrate) navigator.vibrate(15); }}
                          className={`hover:scale-105 active:scale-95 transition-all outline-none focus:outline-none cursor-pointer ${
                            block.pinned ? 'text-[#00FF80] filter drop-shadow-[0_0_4px_#00FF80]' : 'text-neutral-500'
                          }`}
                          title={block.pinned ? 'Desafixar Bloco' : 'Fixar Bloco'}
                        >
                          <Pin className="w-3.5 h-3.5 transform rotate-45" />
                        </button>

                        {/* Minimize */}
                        <button 
                          onClick={() => minimizeBlock(block.id)}
                          className="text-neutral-500 hover:text-white hover:scale-105 transition-all cursor-pointer outline-none"
                          title="Minimizar para a Barra Inferior"
                        >
                          <Minimize2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Close */}
                        <button 
                          onClick={() => closeBlock(block.id)}
                          className="text-[#FF4D4D] hover:scale-105 hover:text-red-500 transition-all cursor-pointer outline-none font-bold"
                          title="Encerrar Sessão do Bloco"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                    )}

                    {/* Render corresponding dynamic content */}
                    <div className={`flex-1 overflow-hidden pointer-events-auto ${!isNavVisible && selectedBlockId !== block.id && visibleBlocks.length > 1 ? 'pointer-events-none' : ''}`}>
                      {renderActiveWidgetIndex(block.type)}
                    </div>

                    {/* Document Slider Element */}
                    {isNavVisible && idx < visibleBlocks.length - 1 && (
                      <div className="absolute bottom-0 left-0 w-full h-[6px] md:h-full md:w-[6px] md:right-0 md:left-auto flex items-center justify-center cursor-row-resize md:cursor-col-resize z-50 group hover:opacity-100 opacity-60 transition-opacity">
                         <div className="w-[80%] h-[2px] md:h-[80%] md:w-[2px] bg-white/20 rounded-full flex items-center justify-center group-hover:bg-[#00FF80] transition-colors relative">
                            {/* Pin / Bolinha tátil */}
                            <div className="w-3 h-3 md:w-3 md:h-3 rounded-full bg-[#00FF80] shadow-[0_0_8px_#00FF80] absolute" />
                         </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
              
              {/* PIP Selector Pseudo-Block */}
              {showPipModal && isNavVisible && (
                  <motion.div
                    layout
                    key="pip-selector-block"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 300, damping: 28 }}
                    className="w-full h-full overflow-hidden flex flex-col relative bg-zinc-900 border-l border-white/5 flex-[2]"
                  >
                    <div className="w-full h-[38px] bg-[#00c8ff]/5 border-b border-white/5 px-4 flex justify-between items-center shrink-0 font-sans">
                      <div className="flex items-center gap-2">
                        <MonitorSmartphone className="w-3.5 h-3.5 text-cyan-400" />
                        <span className="font-sans font-black text-[11px] text-white uppercase tracking-wider select-none">
                          Multi-Janelas
                        </span>
                      </div>
                      <button 
                         onClick={() => {
                           triggerHaptic(20);
                           setShowPipModal(false);
                           triggerMediaResume();
                         }}
                         className="text-white hover:text-red-500 cursor-pointer text-xs"
                      >
                         ✕
                      </button>
                    </div>

                    <div className="flex-1 overflow-auto flex items-center justify-center p-4 select-none">
                       <div className="w-full max-w-2xl flex flex-col gap-6 animate-fade-in pointer-events-auto">
                              <div className="text-center space-y-2">
                                <h3 className="text-white text-lg font-black font-mono tracking-widest uppercase">Multi-Janelas</h3>
                                <p className="text-zinc-400 text-xs font-mono">Escolha um aplicativo para dividir a tela. A reprodução será retomada automaticamente.</p>
                              </div>

                              <div className="grid grid-cols-3 gap-4">
                                <div 
                                  onClick={() => {
                                    triggerHaptic(20);
                                    if (!activeBlocks.find(b => b.type === 'games')) addBlock('games', 'Jogos', true);
                                    setShowPipModal(false);
                                    setTimeout(() => triggerMediaResume(), 300);
                                  }}
                                  className="flex flex-col items-center justify-center gap-3 p-4 rounded-2xl bg-zinc-800/50 border border-transparent hover:border-emerald-500/50 hover:bg-emerald-900/20 cursor-pointer transition-all hover:scale-105 active:scale-95"
                                >
                                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                    <span className="text-2xl">🎮</span>
                                  </div>
                                  <span className="text-emerald-400 font-bold font-mono text-[10px] tracking-widest uppercase">Jogos</span>
                                </div>

                                <div 
                                  onClick={() => {
                                    triggerHaptic(20);
                                    if (!activeBlocks.find(b => b.type === 'library')) addBlock('library', 'Biblioteca', true);
                                    setShowPipModal(false);
                                    setTimeout(() => triggerMediaResume(), 300);
                                  }}
                                  className="flex flex-col items-center justify-center gap-3 p-4 rounded-2xl bg-zinc-800/50 border border-transparent hover:border-amber-500/50 hover:bg-amber-900/20 cursor-pointer transition-all hover:scale-105 active:scale-95"
                                >
                                  <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center">
                                    <span className="text-2xl">📚</span>
                                  </div>
                                  <span className="text-amber-400 font-bold font-mono text-[10px] tracking-widest uppercase">Biblioteca</span>
                                </div>

                                <div 
                                  onClick={() => {
                                    triggerHaptic(20);
                                    if (!activeBlocks.find(b => b.type === 'social')) addBlock('social', 'Social', true);
                                    setShowPipModal(false);
                                    setTimeout(() => triggerMediaResume(), 300);
                                  }}
                                  className="flex flex-col items-center justify-center gap-3 p-4 rounded-2xl bg-zinc-800/50 border border-transparent hover:border-purple-500/50 hover:bg-purple-900/20 cursor-pointer transition-all hover:scale-105 active:scale-95"
                                >
                                  <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                                    <span className="text-2xl">💬</span>
                                  </div>
                                  <span className="text-purple-400 font-bold font-mono text-[10px] tracking-widest uppercase">Social</span>
                                </div>
                              </div>
                       </div>
                    </div>
                  </motion.div>
              )}

            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* MULTITAREFAS LAYOUT SELECTOR DRAWER DRAWER (PAGE 22) */}
      <AnimatePresence>
        {isLayoutOpen && (
          <div className="absolute inset-0 z-50 flex items-end justify-center bg-black/80 font-sans">
            {/* Backdrop Dismiss trigger */}
            <div 
              id="layout_drawer_backdrop"
              className="absolute inset-0 cursor-pointer"
              onClick={onCloseLayout}
            />

            <motion.div 
              id="layout_drawer_content"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full max-w-sm rounded-t-[32px] bg-[#0c0c12] border-t-2 border-[#D4AF37] p-6 text-left relative z-10 shadow-2xl glass-container flex flex-col"
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2 text-[#D4AF37]">
                  <LayoutGrid className="w-4 h-4 animate-bounce" />
                  <h3 className="font-mono text-xs tracking-[0.2em] uppercase font-black">
                    Dividir Sua Tela?
                  </h3>
                </div>
                <button onClick={onCloseLayout} className="text-neutral-400 hover:text-white cursor-pointer font-bold">✕</button>
              </div>

              {/* Layout options cards */}
              <div className="grid grid-cols-3 gap-3">
                {/* 1/3 layout option */}
                <button
                  onClick={() => { setWallet(prev => ({ ...prev, icGold: prev.icGold + 5 })); onCloseLayout(); }}
                  className="p-4 rounded-2xl border border-white/5 bg-black/25 hover:border-[#00c8ff] transition-all flex flex-col items-center text-center space-y-2 cursor-pointer focus:outline-none"
                  title="Dividir em 1/3 (Fração Solo)"
                >
                  <div className="aspect-[3/4] w-8 border border-neutral-700 rounded-md overflow-hidden flex flex-col p-1 gap-1">
                    <div className="w-full h-1/3 bg-cyan-400" />
                  </div>
                  <span className="text-[9px] font-mono font-bold text-neutral-400">1/3 UNIT</span>
                </button>

                {/* 2/3 layout option */}
                <button
                  onClick={() => { setWallet(prev => ({ ...prev, icGold: prev.icGold + 10 })); onCloseLayout(); }}
                  className="p-4 rounded-2xl border border-white/5 bg-black/25 hover:border-[#00c8ff] transition-all flex flex-col items-center text-center space-y-2 cursor-pointer focus:outline-none"
                  title="Dividir em 2/3 (Duo Fracionado)"
                >
                  <div className="aspect-[3/4] w-8 border border-neutral-700 rounded-md overflow-hidden flex flex-col p-1 gap-1">
                    <div className="w-full h-1/3 bg-cyan-400" />
                    <div className="w-full h-1/3 bg-[#8a2be2]" />
                  </div>
                  <span className="text-[9px] font-mono font-bold text-neutral-400">2/3 DUO</span>
                </button>

                {/* 3/3 preenchimento total */}
                <button
                  onClick={() => { setWallet(prev => ({ ...prev, icGold: prev.icGold + 25 })); onCloseLayout(); }}
                  className="p-4 rounded-2xl border border-[#00FF80]/20 bg-black/25 hover:border-[#00FF80] transition-all flex flex-col items-center text-center space-y-2 cursor-pointer focus:outline-none"
                  title="Preenchimento Total de Trilhas"
                >
                  <div className="aspect-[3/4] w-8 border border-neutral-700 rounded-md overflow-hidden flex flex-col p-1 gap-1">
                    <div className="w-full h-2 bg-[#00FF80]" />
                    <div className="w-full h-2 bg-[#00c8ff]" />
                    <div className="w-full h-2 bg-[#8a2be2]" />
                  </div>
                  <span className="text-[9px] font-mono font-bold text-neutral-400">3/3 TRIA</span>
                </button>
              </div>

              {/* Cron maintenance cleaner trigger options inside layout manager drawer */}
              <div className="mt-6 pt-4 border-t border-white/5 flex flex-col space-y-3">
                <p className="text-[9px] text-[#D4AF37] leading-tight uppercase select-none">Configurações Especiais de Higiene / ADM</p>
                <button
                  onClick={() => { 
                    setCustomSizings({}); 
                    localStorage.removeItem('hubConfig_customSizings');
                    onCloseLayout(); 
                  }}
                  className="w-full py-2.5 rounded-lg border border-cyan-500/20 bg-cyan-500/10 hover:bg-cyan-500 text-cyan-400 hover:text-black hover:scale-102 cursor-pointer font-bold text-[10px] tracking-wider transition-all uppercase"
                >
                  ↺ Restaurar Grid Padrão
                </button>
                <button
                  onClick={() => { triggerChronCleanup(); onCloseLayout(); }}
                  className="w-full py-2.5 rounded-lg border border-yellow-500/20 bg-yellow-500/10 hover:bg-yellow-500 text-yellow-500 hover:text-black hover:scale-102 cursor-pointer font-bold text-[10px] tracking-wider transition-all uppercase"
                >
                  ❄ Simular Higienização Quinzenal (Cron)
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELICADA INTERACTIVE SCREEN SAVER OVERLAY (PELÍCULA DE DESCANSO - PAGE 43/44) */}
      <AnimatePresence>
        {isIdle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex flex-col justify-around items-center bg-[#050508]/96 text-white text-center p-6 select-none"
            onClick={() => setIsIdle(false)}
            title="Dê um toque na tela para desbloquear o Screensaver"
          >
            {/* Clock Segment */}
            <div className="space-y-1">
              <h1 className="text-5xl md:text-7xl font-sans font-black tracking-widest text-[#00c8ff] uppercase drop-shadow-[0_0_20px_#00c8ff]">
                {currentTimeStr}
              </h1>
              <p className="text-sm font-light text-neutral-400 tracking-wider">
                {currentDateStr}
              </p>
            </div>

            {/* Battery Segment */}
            <div className="flex flex-col items-center space-y-1">
              <div className="flex items-center gap-2">
                <Battery className="w-5 h-5 text-neutral-400" />
                <span className="text-xs text-neutral-400 uppercase tracking-widest">Bateria Restante</span>
              </div>
              <h3 className="text-2xl font-black text-[#00FF80]">{batteryLevel}</h3>
            </div>

            {/* Earned Summary Indicator Box */}
            <div className="p-6 rounded-3xl border border-[#00FF80]/20 bg-black/40 max-w-sm w-full space-y-3 shadow-2xl">
              <div className="flex items-center gap-1.5 justify-center text-[#00FF80] text-xs font-mono font-medium">
                <Coins className="w-4 h-4 animate-bounce" />
                <span>GANHOS DE MINERAÇÃO EM STANDBY</span>
              </div>
              <p className="text-2xl font-black font-mono text-[#00FF80]">
                {wallet.icGold.toFixed(10)} <span className="text-xs font-normal text-neutral-400">ic</span>
              </p>
              <p className="text-[10px] text-rose-500 font-bold uppercase animate-pulse">Suas Atividades estão Pausadas em Segundo Plano</p>
              <div className="w-12 h-12 rounded-xl border border-white/10 mx-auto opacity-40 hover:opacity-100 transition-opacity flex items-center justify-center bg-neutral-900">
                🚀
              </div>
            </div>

            <span className="text-xs text-neutral-500 uppercase tracking-[0.2em] select-none blink-pulse">Toque para Retornar à Matriz</span>
          </motion.div>
        )}
      </AnimatePresence>
      <OnboardingGuide />
    </div>
  );
};
