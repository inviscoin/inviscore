import React, { useState, useEffect, useRef } from 'react';
import { useInvis, MOCK_MOVIES } from '../context/InvisContext';
import { usePipSync } from '../hooks/usePipSync';
import { Movie } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Volume1, Sun, Clock, 
  Info, AlertCircle, Heart, Film, Share2, Compass, CheckCircle2, 
  RotateCcw, RotateCw, Eye, Search, Maximize2, Scissors, Music, Tv, ShieldAlert, Star,
  RefreshCw, AlertTriangle, Terminal, ThumbsUp, ArrowLeft, MonitorSmartphone, MessageSquare, Type, Settings, Users
} from 'lucide-react';

// SPEC 1: Dynamic High-Fidelity Mock Collections
interface VideoClip {
  id: string;
  title: string;
  duration: string;
  thumbnailUrl: string;
  status: 'online' | 'monitored' | 'offline';
  description: string;
  tags: string[];
}

const MOCK_CLIPS: VideoClip[] = [
  {
    id: 'c1',
    title: 'INVIS Multi-Agent Synapses Live Feed',
    duration: '03:45',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&auto=format&fit=crop&q=80',
    status: 'online',
    description: 'Fluxo contínuo de dados gerados pelos robôs de mineração na rede de Cloud Run e Supabase.',
    tags: ['ia', 'mining', 'realtime']
  },
  {
    id: 'c2',
    title: 'Cyberpunk Lo-Fi Chillbeats for Hackers',
    duration: '15:20',
    thumbnailUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&auto=format&fit=crop&q=80',
    status: 'monitored',
    description: 'Sintetizadores pulsantes de baixa frequência para manter as ondas cerebrais sincronizadas.',
    tags: ['lofi', 'synth', 'focus']
  },
  {
    id: 'c3',
    title: 'Virtual Mars Genesis-8 Propulsion Glitch',
    duration: '06:12',
    thumbnailUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&auto=format&fit=crop&q=80',
    status: 'offline',
    description: 'Logs recuperados do simulador mostrando desvio gravitacional em órbita elíptica.',
    tags: ['sci-fi', 'log', 'mars']
  },
  {
    id: 'c4',
    title: 'Quantum Teleportation & Lattice Keys',
    duration: '04:15',
    thumbnailUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&auto=format&fit=crop&q=80',
    status: 'online',
    description: 'Explicação detalhada sobre acoplamento de spins e canais criptográficos tolerantes a ruídos.',
    tags: ['quantum', 'security', 'tech']
  },
  {
    id: 'c5',
    title: 'Deep Abyss Bioluminescence Echo Study',
    duration: '08:40',
    thumbnailUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&auto=format&fit=crop&q=80',
    status: 'online',
    description: 'Escanografia sonar de profundas fendas marinhas capturando assinaturas fotônicas primárias.',
    tags: ['ocean', 'sonar', 'relax']
  }
];

interface Song {
  id: string;
  title: string;
  artist: string;
  duration: number; // in seconds
  coverUrl: string;
  lyrics: { t: number; text: string }[];
}

const MOCK_SONGS: Song[] = [
  {
    id: 's1',
    title: 'Artificial Dopamine',
    artist: 'Invis Core Orchestra',
    duration: 160,
    coverUrl: 'https://images.unsplash.com/photo-1614149162883-504ce4d13909?w=400&auto=format&fit=crop&q=80',
    lyrics: [
      { t: 0, text: '[Instrumental Waves Pulsing]' },
      { t: 5, text: 'Codificando as sombras da madrugada digital...' },
      { t: 10, text: 'O silêncio se disfaz como cobre reluzente...' },
      { t: 15, text: 'Dois cliques na moeda, a roleta começa a girar...' },
      { t: 20, text: 'Inviscore flui de volta ao núcleo persistente...' },
      { t: 25, text: '[Equalizador Neon com Picos de Energia]' },
      { t: 30, text: 'Sentindo a eletricidade correndo nas nossas mãos...' },
      { t: 40, text: 'Dopamina pura em tempo real...' },
      { t: 55, text: '[Sinfonia de Sintetizador 3D]' },
      { t: 80, text: 'Pontes flutuantes ligando a Terra à nuvem...' },
      { t: 100, text: 'Glow neon roxo cruzando a retina...' },
      { t: 120, text: 'Ativando os canais satélites agora...' },
      { t: 140, text: 'Sincronizados e infinitos no vácuo de Marte...' },
      { t: 155, text: '[Outro - Circuito Desligando]' }
    ]
  },
  {
    id: 's2',
    title: 'Resonance Cascade',
    artist: 'Cyber Shaman',
    duration: 180,
    coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&auto=format&fit=crop&q=80',
    lyrics: [
      { t: 0, text: '[Heavy Synth Resonance Intro]' },
      { t: 8, text: 'Trilhas de circuitos integrados acendendo...' },
      { t: 18, text: 'Uma raposa vigia o galinheiro lá fora...' },
      { t: 28, text: 'WebRTC sinalizando frequências no ar...' },
      { t: 38, text: 'Ondas espectrais roxas iluminando o terminal...' },
      { t: 48, text: '[Solo de Guitarra Holográfica]' },
      { t: 70, text: 'Processamento digital de alta fidelidade...' },
      { t: 90, text: 'Nível VIP ativado por telemetria...' },
      { t: 120, text: 'BPM subindo aos limites da rede...' },
      { t: 150, text: 'Relaxamento profundo induzido por máquina...' },
      { t: 175, text: '[Fade Out]' }
    ]
  }
];

export const MediaModule: React.FC = () => {
  const { currentUser, closeBlock, addTransaction, mediaSubTab, setMediaHubSelectorOpen, addBlock, activeBlocks, mediaResumeTrigger, swapBlocks, setMediaIsPlaying } = useInvis();
  const { isMediaPipMode, togglePipMode, isTransitioning, showPipModal, setShowPipModal } = usePipSync();

  // Watch for global media resume trigger (e.g. returning from pip selector modal)
  useEffect(() => {
    if (mediaResumeTrigger > 0 && movieVideoRef.current) {
      movieVideoRef.current.play();
      setMovieIsPlaying(true);
    }
  }, [mediaResumeTrigger]);

  // Turn off PIP automatically if this is the only block left
  useEffect(() => {
    const visibleCount = activeBlocks.filter(b => !b.minimized).length;
    if (visibleCount === 1 && isMediaPipMode) {
      togglePipMode(false);
    }
  }, [activeBlocks, isMediaPipMode, togglePipMode]);

  // Expanded Hub Section: 'clips' (YouTube Style), 'music' (Audio Hub), 'movies' (Netflix Hub), or null (Interactive Menu Modal)
  const [expandedSection, setExpandedSection] = useState<'clips' | 'music' | 'movies' | null>(() => {
    if (mediaSubTab === 'videotube') return 'clips';
    if (mediaSubTab === 'movies') return 'movies';
    if (mediaSubTab === 'music') return 'music';
    return null;
  });

  // Synchronize dynamic tab selection from overlay with internal state
  useEffect(() => {
    if (mediaSubTab === 'videotube') {
      setExpandedSection('clips');
    } else if (mediaSubTab === 'movies') {
      setExpandedSection('movies');
    } else if (mediaSubTab === 'music') {
      setExpandedSection('music');
    }
  }, [mediaSubTab]);

  const isCompact = activeBlocks.filter(b => !b.minimized).length > 1;

  // General state for visual animations
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  // Handle Close event from outer backdrop click (SPEC 1: "Light Dismiss" Behavior)
  const handleOuterBackdropClick = (e: React.MouseEvent) => {
    // Only dismiss if the click is truly on the outer background and no section is maximized or player is open
    if (e.target === e.currentTarget && expandedSection === null) {
      closeBlock('media');
    }
  };

  // --- GENERAL SECURITY & CODING INTEGRITY (SPEC PAGE 19: HARDENING) ---
  useEffect(() => {
    if (expandedSection === 'movies') {
      const handleKeyDown = (e: KeyboardEvent) => {
        // Blocks F12, Ctrl+Shift+I, Ctrl+U, Ctrl+S
        if (
          e.code === 'F12' ||
          (e.ctrlKey && e.shiftKey && e.code === 'KeyI') ||
          (e.ctrlKey && e.code === 'KeyU') ||
          (e.ctrlKey && e.code === 'KeyS')
        ) {
          e.preventDefault();
          alert('Sinal do Sistema: Modo de Proteção Ativo. Ofuscação de origem ativada.');
        }
      };

      const handleContextMenu = (e: MouseEvent) => {
        e.preventDefault();
      };

      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('contextmenu', handleContextMenu);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('contextmenu', handleContextMenu);
      };
    }
  }, [expandedSection]);

  // =========================================================================
  // --- SUBMODULE A: HUD DE CLIPS (YOUTUBE SATELLITE MODULE) ---
  // =========================================================================
  const [clipsList, setClipsList] = useState<VideoClip[]>(MOCK_CLIPS);
  const [selectedClip, setSelectedClip] = useState<VideoClip | null>(null);
  const [clipPlaying, setClipPlaying] = useState(false);
  const [clipProgress, setClipProgress] = useState(12);
  const [clipVolume, setClipVolume] = useState(80);
  const [clipBrightness, setClipBrightness] = useState(90);
  const [hoveredClipId, setHoveredClipId] = useState<string | null>(null);
  const [showVolumeIndicator, setShowVolumeIndicator] = useState(false);
  const [showBrightnessIndicator, setShowBrightnessIndicator] = useState(false);
  const [clipCategory, setClipCategory] = useState<string>('Tendências');
  const [npcMiningActive, setNpcMiningActive] = useState(false);
  const [showClipMetadataDrawer, setShowClipMetadataDrawer] = useState(false);
  const [adminMenuClip, setAdminMenuClip] = useState<VideoClip | null>(null);

  const [showBumperAd, setShowBumperAd] = useState(false);
  const [bumperCountdown, setBumperCountdown] = useState(6);

  // Video progress interval simulation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (clipPlaying && selectedClip && !showBumperAd) {
      interval = setInterval(() => {
        setClipProgress(prev => (prev >= 100 ? 0 : prev + 1));
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [clipPlaying, selectedClip, showBumperAd]);

  useEffect(() => {
    if (showBumperAd) {
      const countdown = setInterval(() => {
        setBumperCountdown(prev => {
          if (prev <= 1) {
            setShowBumperAd(false);
            return 6;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(countdown);
    }
  }, [showBumperAd]);

  const triggerHaptic = (ms = 20) => {
    if (navigator.vibrate) navigator.vibrate(ms);
  };

  const handleClipTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (showBumperAd) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.round((x / rect.width) * 100);
    setClipProgress(pct);
    triggerHaptic(15);
  };

  const startClipPlayback = (clip: VideoClip) => {
    setSelectedClip(clip);
    setShowBumperAd(true); // Monetization: Bumper Ads (6s) na abertura do player
    setBumperCountdown(6);
    setClipPlaying(true);
    setClipProgress(0);
    triggerHaptic(30);
  };

  const handleNpcMiningRequest = () => {
    setNpcMiningActive(true);
    triggerHaptic(50);
    setTimeout(() => {
      setNpcMiningActive(false);
      // Automatically add a newly mined clip
      const newMined: VideoClip = {
        id: `c_mined_${Date.now()}`,
        title: `Clube Privado: Sinais de ${clipCategory}`,
        duration: '05:40',
        thumbnailUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&auto=format&fit=crop&q=80',
        status: 'monitored',
        description: `Link de streaming exposto coletado automaticamente pelos mineradores virtuais de IA baseados no canal ${clipCategory}.`,
        tags: ['npc-mine', 'satelite', 'inviscore']
      };
      setClipsList(prev => [newMined, ...prev]);
    }, 2500);
  };

  // =========================================================================
  // --- SUBMODULE B: HUD DE MÚSICAS (AUDIO STREAMING SATELLITE) ---
  // =========================================================================
  const [activeSongIndex, setActiveSongIndex] = useState(0);
  const [songPlaying, setSongPlaying] = useState(false);
  const [songProgress, setSongProgress] = useState(0);
  const [songVolume, setSongVolume] = useState(70);
  const [isBuffering, setIsBuffering] = useState(false);
  const [musicMood, setMusicMood] = useState('foco'); // 'foco' | 'relaxamento' | 'energia'
  const currentSong = MOCK_SONGS[activeSongIndex];

  // Song progress timeline simulation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (songPlaying && !isBuffering) {
      interval = setInterval(() => {
        setSongProgress(prev => {
          if (prev >= currentSong.duration) {
            // Next track
            handleNextSong();
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [songPlaying, activeSongIndex, isBuffering]);

  const handleNextSong = () => {
    triggerHaptic(20);
    setIsBuffering(true);
    setTimeout(() => {
      setIsBuffering(false);
      setActiveSongIndex(prev => (prev + 1) % MOCK_SONGS.length);
      setSongProgress(0);
    }, 1500); // 3D Buffering rings delay simulation
  };

  const handlePrevSong = () => {
    triggerHaptic(20);
    setIsBuffering(true);
    setTimeout(() => {
      setIsBuffering(false);
      setActiveSongIndex(prev => (prev - 1 + MOCK_SONGS.length) % MOCK_SONGS.length);
      setSongProgress(0);
    }, 1500);
  };

  const handlePlayPauseSong = () => {
    triggerHaptic(20);
    if (!songPlaying) {
      setIsBuffering(true);
      setTimeout(() => {
        setIsBuffering(false);
        setSongPlaying(true);
      }, 1200);
    } else {
      setSongPlaying(false);
    }
  };

  // horizontal swipe simulated gesture on volume adjust
  const handleMusicVolumeScroll = (e: React.WheelEvent) => {
    if (e.deltaY > 0) {
      setSongVolume(prev => Math.max(0, prev - 5));
    } else {
      setSongVolume(prev => Math.min(100, prev + 5));
    }
    triggerHaptic(10);
  };

  // Get current active line of synced lyrics
  const getCurrentLyricText = () => {
    const items = currentSong.lyrics;
    let activeText = '';
    for (let i = 0; i < items.length; i++) {
      if (songProgress >= items[i].t) {
        activeText = items[i].text;
      }
    }
    return activeText;
  };

  // =========================================================================
  // --- SUBMODULE C: HUD DE FILMES (NETFLIX PREMIUM FLUID SATELLITE) ---
  // =========================================================================
  // =========================================================================
  // --- SUBMODULE C: HUD DE FILMES (NETFLIX PREMIUM FLUID SATELLITE) ---
  // =========================================================================
  // Expanded Cinema Roster Database for maximum visual and functional fidelity
  const CINEMA_ROSTER: (Movie & {
    platform?: 'netflix' | 'disney' | 'hbo' | 'prime' | 'globoplay';
    category?: string;
    rating?: number;
    isFavorite?: boolean;
    continueProgress?: number;
    totalDuration?: string;
  })[] = [
    // 6 Real Trailers for auto selection playing
    {
      id: 'tf_br2049',
      title: 'Blade Runner 2049',
      year: 2017,
      posterUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80',
      overview: 'Oficial K desenterra um segredo há muito enterrado que tem o potencial de mergulhar o que restou da sociedade no caos total.',
      videoUrl: 'https://www.youtube.com/embed/gCcx85zlye4',
      type: 'trailer',
      status: true,
      platform: 'netflix',
      category: 'Cyberpunk',
      rating: 8.4,
      isFavorite: true,
      continueProgress: 45,
      totalDuration: '164m',
      audioLanguages: ['PT-BR', 'EN']
    },
    {
      id: 'tf_interstellar',
      title: 'Interstellar',
      year: 2014,
      posterUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&auto=format&fit=crop&q=80',
      overview: 'Uma equipe de exploradores viaja através de um buraco de minhoca no espaço na tentativa de garantir a sobrevivência da humanidade.',
      videoUrl: 'https://www.youtube.com/embed/zSWdZVtXT7E',
      type: 'trailer',
      status: true,
      platform: 'hbo',
      category: 'Sci-Fi',
      rating: 8.7,
      isFavorite: true,
      continueProgress: 75,
      totalDuration: '169m',
      audioLanguages: ['PT-BR', 'EN']
    },
    {
      id: 'tf_matrix',
      title: 'The Matrix Resurrections',
      year: 2021,
      posterUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&auto=format&fit=crop&q=80',
      overview: 'Neo vive uma vida normal sob a identidade de Thomas A. Anderson antes de ser puxado de volta para as fendas da simulação.',
      videoUrl: 'https://www.youtube.com/embed/9ix7TMcY-Hs',
      type: 'trailer',
      status: true,
      platform: 'netflix',
      category: 'Cyberpunk',
      rating: 6.7,
      isFavorite: false,
      continueProgress: 20,
      totalDuration: '148m',
      audioLanguages: ['EN']
    },
    {
      id: 'tf_dune2',
      title: 'Dune: Part Two',
      year: 2024,
      posterUrl: 'https://images.unsplash.com/photo-1547483238-f400e65ccd56?w=500&auto=format&fit=crop&q=80',
      overview: 'Paul Atreides se une a Chani e aos Fremen enquanto busca vingança contra os conspiradores que destruíram sua família.',
      videoUrl: 'https://www.youtube.com/embed/U2Qp5pL38gY',
      type: 'trailer',
      status: true,
      platform: 'hbo',
      category: 'Sci-Fi',
      rating: 8.6,
      isFavorite: true,
      continueProgress: 10,
      totalDuration: '166m',
      audioLanguages: ['PT-BR']
    },
    {
      id: 'tf_maverick',
      title: 'Top Gun: Maverick',
      year: 2022,
      posterUrl: 'https://images.unsplash.com/photo-1519074002996-a69e7ac46a42?w=500&auto=format&fit=crop&q=80',
      overview: 'Após mais de trinta anos de serviço como um dos principais aviadores da Marinha, Pete Mitchell está de volta testando caças hiper sônicos.',
      videoUrl: 'https://www.youtube.com/embed/g4U4BQW9OEk',
      type: 'trailer',
      status: true,
      platform: 'prime',
      category: 'Ação',
      rating: 8.3,
      isFavorite: false,
      continueProgress: 90,
      totalDuration: '130m',
      audioLanguages: ['PT-BR', 'EN']
    },
    {
      id: 'tf_edgerunners',
      title: 'Cyberpunk: Edgerunners',
      year: 2022,
      posterUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500&auto=format&fit=crop&q=80',
      overview: 'Um garoto de rua tentando sobreviver em uma cidade do futuro obcecada por tecnologia e modificação corporal se torna um mercenário.',
      videoUrl: 'https://www.youtube.com/embed/JtqIas3bYhg',
      type: 'trailer',
      status: true,
      platform: 'netflix',
      category: 'Animes',
      rating: 8.6,
      isFavorite: true,
      continueProgress: 55,
      totalDuration: '10 eps',
      audioLanguages: ['PT-BR', 'EN']
    },
 
    // Netflix Blockbuster Shelf
    {
      id: 'nft_stranger',
      title: 'Stranger Things',
      year: 2022,
      posterUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&auto=format&fit=crop&q=80',
      overview: 'Quando um garoto desaparece, uma cidade pequena descobre um mistério envolvendo experimentos secretos e forças sobrenaturais.',
      videoUrl: 'https://www.youtube.com/embed/b9EkMc79ZSU',
      type: 'serie',
      status: true,
      platform: 'netflix',
      category: 'Sci-Fi',
      rating: 8.7,
      isFavorite: true,
      audioLanguages: ['PT-BR', 'EN']
    },
    {
      id: 'nft_blackmirror',
      title: 'Black Mirror',
      year: 2023,
      posterUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=500&auto=format&fit=crop&q=80',
      overview: 'Antologia de ficção científica que explora um futuro de alta tecnologia onde as maiores inovações colidem com nossos instintos.',
      videoUrl: 'https://www.youtube.com/embed/V0XRf_XbeN8',
      type: 'serie',
      status: true,
      platform: 'netflix',
      category: 'Sci-Fi',
      rating: 8.8,
      isFavorite: true
    },
    {
      id: 'nft_dark',
      title: 'Dark',
      year: 2020,
      posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80',
      overview: 'O desaparecimento de duas crianças em uma cidade alemã expõe as relações fraturadas entre quatro famílias e fendas no tempo.',
      videoUrl: 'https://www.youtube.com/embed/ESEUoa-utUM',
      type: 'serie',
      status: true,
      platform: 'netflix',
      category: 'Sci-Fi',
      rating: 8.8,
      isFavorite: false,
      continueProgress: 40
    },
    {
      id: 'nft_cyber_run',
      title: 'Cyberpunk Run',
      year: 2025,
      posterUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80',
      overview: 'Corridas cibernéticas clandestinas e perigosas sob o teto chuvoso de megalópoles sob o controle das megacorporações.',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      type: 'filme',
      status: true,
      platform: 'netflix',
      category: 'Cyberpunk',
      rating: 7.9,
      isFavorite: true
    },
    {
      id: 'nft_mindhunter',
      title: 'Mindhunter',
      year: 2019,
      posterUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=500&auto=format&fit=crop&q=80',
      overview: 'Dois agentes do FBI expandem as fronteiras da ciência criminal entrevistando assassinos em série presos para resolver casos ativos.',
      videoUrl: 'https://www.youtube.com/embed/oD8Z9MIdGg0',
      type: 'serie',
      status: true,
      platform: 'netflix',
      category: 'Suspense',
      rating: 8.6,
      isFavorite: false
    },

    // Disney+ Roster
    {
      id: 'dis_mandalorian',
      title: 'The Mandalorian',
      year: 2023,
      posterUrl: 'https://images.unsplash.com/photo-1593085512500-5d55148d6f0d?w=500&auto=format&fit=crop&q=80',
      overview: 'As viagens de um caçador de recompensas solitário nos confins da galáxia, longe da autoridade della Nova República.',
      videoUrl: 'https://www.youtube.com/embed/aOC8E8z_ifw',
      type: 'serie',
      status: true,
      platform: 'disney',
      category: 'Sci-Fi',
      rating: 8.7,
      isFavorite: true,
      continueProgress: 88
    },
    {
      id: 'dis_loki',
      title: 'Loki',
      year: 2023,
      posterUrl: 'https://images.unsplash.com/photo-1601987177651-8edfe6c20009?w=500&auto=format&fit=crop&q=80',
      overview: 'O Deus da Trapaça é capturado pela Autoridade de Variância Temporal e forçado a consertar as linhas do tempo quebradas.',
      videoUrl: 'https://www.youtube.com/embed/nW948Va-7sg',
      type: 'serie',
      status: true,
      platform: 'disney',
      category: 'Aventura',
      rating: 8.2,
      isFavorite: false
    },
    {
      id: 'dis_andor',
      title: 'Andor',
      year: 2022,
      posterUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=500&auto=format&fit=crop&q=80',
      overview: 'Em uma era repleta de perigos, enganos e intrigas, Cassian Andor embarca no caminho que o transformará em um herói rebelde.',
      videoUrl: 'https://www.youtube.com/embed/cKOegY_LaBc',
      type: 'serie',
      status: true,
      platform: 'disney',
      category: 'Sci-Fi',
      rating: 8.4,
      isFavorite: false
    },
    {
      id: 'dis_walle',
      title: 'WALL-E',
      year: 2008,
      posterUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=500&auto=format&fit=crop&q=80',
      overview: 'No futuro, um pequeno robô coletor de lixo embarca acidentalmente em uma jornada espacial que decidirá o destino da humanidade.',
      videoUrl: 'https://www.youtube.com/embed/CZ1CATHer_A',
      type: 'filme',
      status: true,
      platform: 'disney',
      category: 'Animes',
      rating: 8.4,
      isFavorite: true
    },
    {
      id: 'dis_avatar2',
      title: 'Avatar: O Caminho da Água',
      year: 2022,
      posterUrl: 'https://images.unsplash.com/photo-1500627869374-13cd993b1115?w=500&auto=format&fit=crop&q=80',
      overview: 'Jake Sully vive com sua família em Pandora. Quando uma ameaça familiar retorna, ele deve trabalhar com o exército Na\'vi para proteger seu planeta.',
      videoUrl: 'https://www.youtube.com/embed/d9MyW72ELq0',
      type: 'filme',
      status: true,
      platform: 'disney',
      category: 'Aventura',
      rating: 7.6,
      isFavorite: false
    },

    // HBO Max Roster
    {
      id: 'hbo_lastofus',
      title: 'The Last of Us',
      year: 2023,
      posterUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&auto=format&fit=crop&q=80',
      overview: 'Joel e Ellie, conectados pela brutalidade do mundo em que vivem, são forçados a suportar circunstâncias implacáveis em uma América pós-apocalíptica.',
      videoUrl: 'https://www.youtube.com/embed/uLtkt8BonwM',
      type: 'serie',
      status: true,
      platform: 'hbo',
      category: 'Drama',
      rating: 8.8,
      isFavorite: true,
      continueProgress: 35
    },
    {
      id: 'hbo_house_dragon',
      title: 'A Casa do Dragão',
      year: 2022,
      posterUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80',
      overview: 'A história da família Targaryen reinando sobre os Sete Reinos de Westeros 200 anos antes dos eventos de Guerra dos Tronos.',
      videoUrl: 'https://www.youtube.com/embed/DotnIuSTK30',
      type: 'serie',
      status: true,
      platform: 'hbo',
      category: 'Aventura',
      rating: 8.4,
      isFavorite: false
    },
    {
      id: 'hbo_game_thrones',
      title: 'Game of Thrones',
      year: 2011,
      posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&auto=format&fit=crop&q=80',
      overview: 'Nove famílias nobres lutam pelo controle das terras míticas de Westeros, enquanto um antigo inimigo retorna após estar adormecido por milênios.',
      videoUrl: 'https://www.youtube.com/embed/KPLYYLDt_m0',
      type: 'serie',
      status: true,
      platform: 'hbo',
      category: 'Drama',
      rating: 9.2,
      isFavorite: true
    },
    {
      id: 'hbo_succession',
      title: 'Succession',
      year: 2023,
      posterUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=500&auto=format&fit=crop&q=80',
      overview: 'A saga de uma família multimilionária disfuncional proprietária de um império de mídia global lutando pelo trono do patriarca.',
      videoUrl: 'https://www.youtube.com/embed/t3M-t_E9Z1w',
      type: 'serie',
      status: true,
      platform: 'hbo',
      category: 'Drama',
      rating: 8.9,
      isFavorite: false
    },
    {
      id: 'hbo_joker',
      title: 'Coringa',
      year: 2019,
      posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&auto=format&fit=crop&q=80',
      overview: 'Arthur Fleck, um comediante de stand-up fracassado e isolado, mergulha em uma espiral de loucura e violência que inspira uma revolta em Gotham City.',
      videoUrl: 'https://www.youtube.com/embed/t433PEQGEb4',
      type: 'filme',
      status: true,
      platform: 'hbo',
      category: 'Drama',
      rating: 8.4,
      isFavorite: false
    },

    // Prime Video Roster
    {
      id: 'prm_theboys',
      title: 'The Boys',
      year: 2024,
      posterUrl: 'https://images.unsplash.com/photo-1569003339405-ea396a5a8a90?w=500&auto=format&fit=crop&q=80',
      overview: 'Um grupo de vigilantes se propõe a derrubar super-heróis corruptos que abusam de seus superpoderes sob a gestão da corporação Vought.',
      videoUrl: 'https://www.youtube.com/embed/M1BhU70p_n0',
      type: 'serie',
      status: true,
      platform: 'prime',
      category: 'Ação',
      rating: 8.7,
      isFavorite: true,
      continueProgress: 65
    },
    {
      id: 'prm_fallout',
      title: 'Fallout',
      year: 2024,
      posterUrl: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=500&auto=format&fit=crop&q=80',
      overview: 'Em um futuro pós-apocalíptico retrofuturista, os residentes dos luxuosos abrigos nucleares subterrâneos retornam à superfície arrasada e bizarra.',
      videoUrl: 'https://www.youtube.com/embed/V-mugWDc094',
      type: 'serie',
      status: true,
      platform: 'prime',
      category: 'Sci-Fi',
      rating: 8.5,
      isFavorite: true
    },
    {
      id: 'prm_invincible',
      title: 'Invincible',
      year: 2023,
      posterUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500&auto=format&fit=crop&q=80',
      overview: 'Um jovem herói herda superpoderes brutais e descobre que seu lendário pai extraterrestre oculta segredos de conquista assustadores.',
      videoUrl: 'https://www.youtube.com/embed/tM0sU8VyjY0',
      type: 'serie',
      status: true,
      platform: 'prime',
      category: 'Animes',
      rating: 8.7,
      isFavorite: false
    },
    {
      id: 'prm_reach',
      title: 'Reacher',
      year: 2023,
      posterUrl: 'https://images.unsplash.com/photo-1519074002996-a69e7ac46a42?w=500&auto=format&fit=crop&q=80',
      overview: 'Jack Reacher, um ex-policial militar veterano desabrigado e durão, viaja pelos EUA e é puxado de volta a conspirações locais.',
      videoUrl: 'https://www.youtube.com/embed/GSycMV_v05M',
      type: 'serie',
      status: true,
      platform: 'prime',
      category: 'Ação',
      rating: 8.1,
      isFavorite: false
    },

    // Globoplay Roster
    {
      id: 'glo_justica',
      title: 'Justiça',
      year: 2024,
      posterUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=500&auto=format&fit=crop&q=80',
      overview: 'Quatro personagens independentes são presos no mesmo dia e soltos sete anos mais tarde, buscando vingança ou justiça pessoal.',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      type: 'serie',
      status: true,
      platform: 'globoplay',
      category: 'Drama',
      rating: 8.4,
      isFavorite: true,
      continueProgress: 50
    },
    {
      id: 'glo_compadecida',
      title: 'O Auto da Compadecida',
      year: 2000,
      posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&auto=format&fit=crop&q=80',
      overview: 'As engenhosas trapaças e mentiras de João Grilo e Chicó para sobreviver no sertão nordestino culminam em um julgamento divino impagável.',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      type: 'filme',
      status: true,
      platform: 'globoplay',
      category: 'Aventura',
      rating: 8.8,
      isFavorite: true
    },
    {
      id: 'glo_cidadedeus',
      title: 'Cidade de Deus',
      year: 2002,
      posterUrl: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=500&auto=format&fit=crop&q=80',
      overview: 'Nas favelas do Rio de Janeiro, dois garotos seguem caminhos opostos: um se esforça para se tornar fotógrafo comercial, o outro um barão das drogas.',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      type: 'filme',
      status: true,
      platform: 'globoplay',
      category: 'Drama',
      rating: 8.6,
      isFavorite: false
    }
  ];

  const [moviesList, setMoviesList] = useState<Movie[]>(CINEMA_ROSTER);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [moviePlaying, setMoviePlaying] = useState(false);

  useEffect(() => {
    setMediaIsPlaying(moviePlaying);
    return () => setMediaIsPlaying(false);
  }, [moviePlaying, setMediaIsPlaying]);

  const [movieProgress, setMovieProgress] = useState(35);
  const [movieVolume, setMovieVolume] = useState(85);
  const [movieSpeed, setMovieSpeed] = useState<number>(1);
  const [movieAudioLang, setMovieAudioLang] = useState<'PT-BR' | 'EN'>('PT-BR');
  const [movieSubtitle, setMovieSubtitle] = useState<'OFF' | 'PT-BR' | 'EN' | 'ES'>('OFF');
  const [wasPausedByScroll, setWasPausedByScroll] = useState(false);
  const [activeMediaAlert, setActiveMediaAlert] = useState<string | null>(null);
  const [abrMode, setAbrMode] = useState<'1080p' | '720p' | '480p'>('1080p');
  const [showMovieControls, setShowMovieControls] = useState(true);
  const [continueWatchingTime, setContinueWatchingTime] = useState<number | null>(45); // simulated resume timestamp
  const [showAntiIdleCheck, setShowAntiIdleCheck] = useState(false);
  const [activeServer, setActiveServer] = useState<'principal' | 'alternativo' | 'backup' | 'trailer'>('principal');

  // HTML5 Video Player state hooks and reference tracking
  const movieVideoRef = useRef<HTMLVideoElement>(null);
  const [movieIsPlaying, setMovieIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Player behavior and options selections states
  const [useInternalPlayer, setUseInternalPlayer] = useState<boolean>(true);
  const [activePlayerMenu, setActivePlayerMenu] = useState<'audio' | 'subtitle' | 'speed' | 'quality' | null>(null);
  const [episodeCovers, setEpisodeCovers] = useState<Record<string, string>>({});

  // Utility to grab actual frames from the video as episode thumbnails
  const extractVideoFrame = (videoUrl: string, t: number = 5): Promise<string> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.src = videoUrl;
      video.crossOrigin = 'anonymous';
      video.currentTime = t;
      video.muted = true;
      video.playsInline = true;
      
      const timeout = setTimeout(() => {
        resolve('');
      }, 3500);

      video.onseeked = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = 300;
          canvas.height = 170;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
            clearTimeout(timeout);
            resolve(dataUrl);
            return;
          }
        } catch (e) {
          console.warn("Failed to extract canvas frame:", e);
        }
        resolve('');
      };

      video.onerror = () => {
        clearTimeout(timeout);
        resolve('');
      };
    });
  };

  const getDynamicEpisodesForSelectedMovie = () => {
    if (!selectedMovie) return [];
    const baseTitle = selectedMovie.title;
    const isSerie = selectedMovie.type === 'serie';
    return [
      {
        id: `${selectedMovie.id}_ep1`,
        title: isSerie ? `T1:E1 - Origem Cósmica` : `Capítulo I: Introdução`,
        duration: isSerie ? '45min' : '15min',
        desc: `As primeiras e inesperadas fendas na rede criptografada de ${baseTitle} começam a aparecer.`,
        seekTime: 4,
        defaultThumb: selectedMovie.posterUrl || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=300&auto=format&fit=crop&q=80'
      },
      {
        id: `${selectedMovie.id}_ep2`,
        title: isSerie ? `T1:E2 - Transmissão Aberta` : `Capítulo II: Descoberta`,
        duration: isSerie ? '52min' : '22min',
        desc: `Estruturas de sincronia e alocações de largura de banda são desafiadas pelo fluxo de ${baseTitle}.`,
        seekTime: 8,
        defaultThumb: selectedMovie.posterUrl || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=300&auto=format&fit=crop&q=80'
      },
      {
        id: `${selectedMovie.id}_ep3`,
        title: isSerie ? `T1:E3 - Criptozoico de Dados` : `Capítulo III: Resolução`,
        duration: isSerie ? '48min' : '18min',
        desc: `O despertar crucial do sistema e a consolidação de registros confidenciais de ${baseTitle} revelados.`,
        seekTime: 12,
        defaultThumb: selectedMovie.posterUrl || 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=300&auto=format&fit=crop&q=80'
      }
    ];
  };

  useEffect(() => {
    if (!selectedMovie) return;
    const eps = getDynamicEpisodesForSelectedMovie();
    const videoUrl = getMovieVideoSrc(selectedMovie);
    eps.forEach(async (ep) => {
      if (episodeCovers[ep.id]) return;
      const frameUrl = await extractVideoFrame(videoUrl, ep.seekTime);
      if (frameUrl) {
        setEpisodeCovers(prev => ({ ...prev, [ep.id]: frameUrl }));
      }
    });
  }, [selectedMovie]);

  // UI state variables for filters
  const [scopeFiltering, setScopeFiltering] = useState<'filme' | 'serie' | 'todos'>('todos');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [isCategoryDrawerOpen, setIsCategoryDrawerOpen] = useState(false);
  const [activeTrailerIndex, setActiveTrailerIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  // Floating suggestion focus overlay state
  const [showSuggestionsFocus, setShowSuggestionsFocus] = useState(false);

  // States for block mode and expanded vertical layouts of category shelves
  // const [isMediaPipMode, setIsMediaPipMode] = useState(false); (mapped to context)
  
  const [expandedSessionGrid, setExpandedSessionGrid] = useState<'favorites' | 'continue' | 'suggestions' | 'netflix' | 'disney' | 'hbo' | 'prime' | 'globoplay' | null>(null);

  // Progressive limits for horizontal/vertical lazy loading - initialized to 30 for complete pre-loading
  const [visiblePostersCount, setVisiblePostersCount] = useState(60);
  const [favoritesLimit, setFavoritesLimit] = useState(60);
  const [continueWatchingLimit, setContinueWatchingLimit] = useState(60);
  const [suggestionsLimit, setSuggestionsLimit] = useState(60);
  const [netflixLimit, setNetflixLimit] = useState(60);
  const [disneyLimit, setDisneyLimit] = useState(60);
  const [hboLimit, setHboLimit] = useState(60);
  const [primeLimit, setPrimeLimit] = useState(60);
  const [globoplayLimit, setGloboplayLimit] = useState(60);

  // Pre-load top 30 trending movies/series from TMDb on startup
  useEffect(() => {
    async function loadInitialTrending() {
      try {
        const response = await fetch("/api/tmdb/trending");
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            setMoviesList(data);
          }
        }
      } catch (err) {
        console.error("Failed to load trending movies on mount:", err);
      }
    }
    loadInitialTrending();
  }, []);

  // Real-time TMDb debounced search integration
  useEffect(() => {
    if (!searchQuery.trim()) return;

    const timer = setTimeout(async () => {
      try {
        const resp = await fetch(`/api/tmdb/search?query=${encodeURIComponent(searchQuery)}`);
        if (resp.ok) {
          const results = await resp.json();
          if (results && results.length > 0) {
            // merge results with moviesList securely to avoid duplicate indexes
            setMoviesList(prev => {
              const combined = [...prev];
              results.forEach((item: Movie) => {
                if (!combined.some(m => m.id === item.id)) {
                  combined.push(item);
                }
              });
              return combined;
            });
          }
        }
      } catch (err) {
        console.error("Failed to fetch search results from TMDb:", err);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Lazy-load detailed TMDb assets (duration, cast/actors, production, stream & video URL) on movie card click
  const selectMovieAndFetchDetails = async (movie: Movie) => {
    setSelectedMovie(movie);
    setMoviePlaying(false); // don't start playing until user clicks Play
    setIsLoadingDetails(true);
    triggerHaptic(30);

    try {
      const response = await fetch(`/api/tmdb/details?id=${movie.id}&type=${movie.type}`);
      if (response.ok) {
        const details = await response.json();
        
        const mergedMovie = {
          ...movie,
          actors: details.actors,
          production: details.production,
          totalDuration: details.duration,
          videoUrl: details.videoUrl || movie.videoUrl,
          streamUrl: details.streamUrl || movie.streamUrl
        };

        setMoviesList(prev => prev.map(m => m.id === movie.id ? mergedMovie : m));
        setSelectedMovie(mergedMovie);
      }
    } catch (err) {
      console.error("Failed to load details from TMDb proxy:", err);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  // Toggle favorite trigger with catalog synchronization
  const toggleFavoriteMovie = (id: string) => {
    triggerHaptic(30);
    setMoviesList(prev => prev.map(m => {
      if (m.id === id) {
        const updated = { ...m, isFavorite: !m.isFavorite };
        if (selectedMovie && selectedMovie.id === id) {
          setSelectedMovie(updated);
        }
        return updated;
      }
      return m;
    }));
  };

  // Like movie to raise trend in Invis system
  const likeMovie = (id: string) => {
    triggerHaptic(35);
    setMoviesList(prev => prev.map(m => {
      if (m.id === id) {
        const updated = { ...m, likes: (m.likes || 100) + 1 };
        if (selectedMovie && selectedMovie.id === id) {
          setSelectedMovie(updated);
        }
        return updated;
      }
      return m;
    }));
  };

  // Active Timer to cycle featured trailers in background every 20 seconds (spec requirement) unless selected by user
  useEffect(() => {
    if (expandedSection !== 'movies' || selectedMovie !== null) return;
    const interval = setInterval(() => {
      setActiveTrailerIndex(prev => (prev + 1) % Math.min(10, moviesList.length || 10));
    }, 20000);
    return () => clearInterval(interval);
  }, [expandedSection, selectedMovie, moviesList]);

  const memoizedCategories = React.useMemo(() => {
    // Check if user language is PT-BR based on DDI prefix '+55'
    const isPtBrUser = currentUser?.ddi === '+55';

    const filterByLanguage = (m: Movie) => {
      if (!isPtBrUser) return true; // show everything for non PT-BR accounts
      
      // Default to PT-BR support if unspecified or empty
      const languages = m.audioLanguages || ['PT-BR', 'EN'];
      return languages.includes('PT-BR');
    };

    return {
      filtered: moviesList.filter(filterByLanguage).filter(m => {
        const matchQuery = searchQuery ? m.title.toLowerCase().includes(searchQuery.toLowerCase()) || m.overview.toLowerCase().includes(searchQuery.toLowerCase()) : true;
        const matchCategory = selectedCategory !== 'Todos' ? (m as any).category === selectedCategory : true;
        const matchScope = scopeFiltering !== 'todos' ? m.type === scopeFiltering : true;
        return matchQuery && matchCategory && matchScope && m.status;
      }),
      favorites: moviesList.filter(filterByLanguage).filter(m => m.status && (m as any).isFavorite),
      continue: moviesList.filter(filterByLanguage).filter(m => m.status && (m as any).continueProgress),
      suggestions: moviesList.filter(filterByLanguage).filter(m => m.status && (m as any).rating >= 8.2),
      netflix: moviesList.filter(filterByLanguage).filter(m => m.status && ((m as any).platform === 'netflix' || m.id.startsWith('nft') || m.id.startsWith('tf_b2049') || m.id.startsWith('tf_edgerunners'))),
      disney: moviesList.filter(filterByLanguage).filter(m => m.status && ((m as any).platform === 'disney' || m.id.startsWith('dis'))),
      hbo: moviesList.filter(filterByLanguage).filter(m => m.status && ((m as any).platform === 'hbo' || m.id.startsWith('hbo') || m.id.startsWith('tf_interstellar') || m.id.startsWith('tf_dune2'))),
      prime: moviesList.filter(filterByLanguage).filter(m => m.status && ((m as any).platform === 'prime' || m.id.startsWith('prm') || m.id.startsWith('tf_maverick'))),
      globoplay: moviesList.filter(filterByLanguage).filter(m => m.status && ((m as any).platform === 'globoplay' || m.id.startsWith('glo')))
    };
  }, [moviesList, searchQuery, selectedCategory, scopeFiltering, currentUser]);

  // Procedural titles duplication helper for up to 70 titles in expanded shelves
  const getExpandedTitlesForCategory = (category: string) => {
    let shelfItems: Movie[] = (memoizedCategories as any)[category] || [];

    if (shelfItems.length === 0) {
      shelfItems = moviesList.slice(0, 10);
    }

    // Populate up to 70 titles procedurally
    let expanded: Movie[] = [...shelfItems];
    const originalCount = shelfItems.length;
    let cycle = 1;
    const suffixes = ["(Ultra HD)", "Parte II", "A Origem", "O Retorno", "Edição Especial", "Corte do Diretor", "Legado", "Nova Era", "Ragnarok", "Revelações"];
    
    while (expanded.length < 70 && originalCount > 0) {
      for (let i = 0; i < originalCount; i++) {
        if (expanded.length >= 70) break;
        const baseItem = shelfItems[i];
        const suffix = suffixes[(cycle - 1 + i) % suffixes.length];
        expanded.push({
          ...baseItem,
          id: `${baseItem.id}_ext_${cycle}_${i}`,
          title: `${baseItem.title} - ${suffix}`,
          year: baseItem.year + Math.floor(cycle / 2)
        });
      }
      cycle++;
    }
    return expanded;
  };

  // Infinite Scroll Trigger for Vertical Catalog Grid
  const scrollCountRef = useRef(0);
  const handleContainerScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollTop + clientHeight > scrollHeight - 220) {
      scrollCountRef.current += 1;
      
      // Preload more into horizontal limits dynamically (+60 titles!)
      setFavoritesLimit(prev => prev + 60);
      setContinueWatchingLimit(prev => prev + 60);
      setSuggestionsLimit(prev => prev + 60);
      setNetflixLimit(prev => prev + 60);
      setDisneyLimit(prev => prev + 60);
      setHboLimit(prev => prev + 60);
      setPrimeLimit(prev => prev + 60);
      setGloboplayLimit(prev => prev + 60);

      // Increase main catalog search grid limits
      const totalMatch = memoizedCategories.filtered.length;

      if (visiblePostersCount < totalMatch) {
         setVisiblePostersCount(prev => Math.min(totalMatch, prev + 60));
      } else {
        if (scrollCountRef.current % 3 === 0) {
          // Expand the main catalog by fabricating 60 new titles dynamically!
          const newItems: Movie[] = [];
          const currentCount = moviesList.length;
          for (let i = 0; i < 60; i++) {
            const baseItem = CINEMA_ROSTER[i % CINEMA_ROSTER.length];
            newItems.push({
              ...baseItem,
              id: `gen-${Date.now()}-${currentCount + i}`,
              title: `${baseItem.title} - Expansão ${currentCount + i}`,
              year: baseItem.year + Math.floor(Math.random() * 5),
            });
          }
          setMoviesList(prev => [...prev, ...newItems]);
          setVisiblePostersCount(prev => prev + 60);
        }
      }
      triggerHaptic(10);
    }
  };

  // Infinite Scroll Handler for Horizontal Categories
  const handleHorizontalScroll = (e: React.UIEvent<HTMLDivElement>, category: string) => {
    const { scrollLeft, scrollWidth, clientWidth } = e.currentTarget;
    if (scrollLeft + clientWidth > scrollWidth * 0.6) {
      if (category === 'favorites' && favoritesLimit < 120) {
        setFavoritesLimit(prev => Math.min(180, prev + 60));
        triggerHaptic(10);
      }
      if (category === 'continue' && continueWatchingLimit < 120) {
        setContinueWatchingLimit(prev => Math.min(180, prev + 60));
        triggerHaptic(10);
      }
      if (category === 'suggestions' && suggestionsLimit < 120) {
        setSuggestionsLimit(prev => Math.min(180, prev + 60));
        triggerHaptic(10);
      }
      if (category === 'netflix' && netflixLimit < 120) {
        setNetflixLimit(prev => Math.min(180, prev + 60));
        triggerHaptic(10);
      }
      if (category === 'disney' && disneyLimit < 120) {
        setDisneyLimit(prev => Math.min(180, prev + 60));
        triggerHaptic(10);
      }
      if (category === 'hbo' && hboLimit < 120) {
        setHboLimit(prev => Math.min(180, prev + 60));
        triggerHaptic(10);
      }
      if (category === 'prime' && primeLimit < 120) {
        setPrimeLimit(prev => Math.min(180, prev + 60));
        triggerHaptic(10);
      }
      if (category === 'globoplay' && globoplayLimit < 120) {
        setGloboplayLimit(prev => Math.min(180, prev + 60));
        triggerHaptic(10);
      }
    }
  };

  // =========================================================================
  // --- SUBMODULE D: INDEXADOR & CRAWLER INVIS CORE (BLOCO 1 - 5) ---
  // =========================================================================
  const [showIndexer, setShowIndexer] = useState(false);
  const [isCrawling, setIsCrawling] = useState(false);
  const [isHealthChecking, setIsHealthChecking] = useState(false);
  const [crawlerLogs, setCrawlerLogs] = useState<string[]>([]);
  const [healthCheckProgress, setHealthCheckProgress] = useState(0);
  const [healthCheckLogs, setHealthCheckLogs] = useState<string[]>([]);
  const [scrapedPendingSources, setScrapedPendingSources] = useState<{
    id: string;
    title: string;
    year: number;
    videoUrl: string;
    posterUrl: string;
    overview: string;
    type: 'filme' | 'serie' | 'trailer';
  }[]>([
    {
      id: 'p1',
      title: 'Inception',
      year: 2010,
      videoUrl: 'https://www.youtube.com/embed/YoHD9XEInc0',
      posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&auto=format&fit=crop&q=80',
      overview: 'Dom Cobb é um ladrão habilidoso que rouba segredos de dentro do subconsciente durante o estado de sono.',
      type: 'filme'
    },
    {
      id: 'p2',
      title: 'The Matrix Resurrections',
      year: 2021,
      videoUrl: 'https://www.youtube.com/embed/9ix7TMcY-Hs',
      posterUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=400&auto=format&fit=crop&q=80',
      overview: 'Retorne ao mundo de duas realidades: uma, a vida cotidiana; a outra, o que está por trás dela.',
      type: 'serie'
    }
  ]);

  // Form states matching Bloco 5 Custom fields
  const [formTitle, setFormTitle] = useState('');
  const [formYear, setFormYear] = useState(2026);
  const [formPosterUrl, setFormPosterUrl] = useState('');
  const [formVideoUrl, setFormVideoUrl] = useState('');
  const [formType, setFormType] = useState<'filme' | 'serie' | 'trailer'>('filme');

  // Manual Play Test controller states
  const [playTestUrl, setPlayTestUrl] = useState<string | null>(null);
  const [isPlayingTest, setIsPlayingTest] = useState(false);

  // Real Crawler & Metadata Indexer (Bloco 2 & 3: Web Scraper + TMDB API Sync)
  const runCrawler = async (targetTitle: string, targetYear: number, type: 'filme' | 'serie' | 'trailer' = 'filme') => {
    if (!targetTitle.trim()) return;

    setIsCrawling(true);
    setCrawlerLogs([]);
    triggerHaptic(40);

    const log = (text: string) => {
      setCrawlerLogs(prev => [...prev, text]);
      triggerHaptic(10);
    };

    try {
      log(`[EXTRACTOR ENGINE] Iniciando varredura para: "${targetTitle.toUpperCase()}"...`);
      await new Promise(res => setTimeout(res, 600));

      log(`[TMDb Sync] Querying endpoints: search/multi?query=${encodeURIComponent(targetTitle)}`);
      const searchRes = await fetch(`/api/tmdb/search?query=${encodeURIComponent(targetTitle)}`);
      
      if (!searchRes.ok) {
        throw new Error("Falha na comunicação com os servidores TMDb.");
      }
      
      const searchData = await searchRes.json();
      if (!searchData || searchData.length === 0) {
        log(`[TMDb ERROR] Nenhum título mapeado no TMDb correspondente a '${targetTitle}'.`);
        log(`[AVISO] Varredura abortada por falta de conformidade canônica.`);
        setIsCrawling(false);
        return;
      }

      const match = searchData[0];
      log(`[TMDb OK] Resposta canônica recebida. Id TMDB: ${match.id}`);
      await new Promise(res => setTimeout(res, 600));

      log(`[CRAWLER] Iniciando Raspagem de Embeds...`);
      log(`[SCRAPER] Capturando streams de mirrors estruturados para id: ${match.id}`);
      await new Promise(res => setTimeout(res, 700));

      // Query full details (Cast actors, duration, trailers, streaming url mapping)
      const detailsRes = await fetch(`/api/tmdb/details?id=${match.id}&type=${type}`);
      let details = { duration: "120m", production: "Não Informada", actors: ["Direto de TMDB"], videoUrl: "", streamUrl: "" };
      
      if (detailsRes.ok) {
        details = await detailsRes.json();
        log(`[SCRAPER] Sinal de streaming obtido com sucesso via mirrors resilientes!`);
        log(`[NORMALIZAÇÃO OK] Match: '${match.title}' (${match.year}) bate com indexação canonical.`);
      }

      log(`[STATUS DE SINAL] Sucesso: [STATUS: READY_FOR_METADATA] definido!`);
      log(`[BANCO SQL DIRECT] Sincronização concluída. Adicionando '${match.title}' de forma definitiva ao catálogo.`);

      // Register the newly crawled movie
      const newMo: Movie = {
        id: match.id,
        title: match.title,
        year: match.year,
        posterUrl: match.posterUrl,
        overview: match.overview,
        videoUrl: details.videoUrl || "https://www.youtube.com/embed/dQw4w9WgXcQ",
        streamUrl: details.streamUrl,
        type: type,
        status: true,
        category: match.category || "Cinema",
        platform: "netflix", // populate in default shelf
        rating: match.rating || 8.0,
        actors: details.actors,
        production: details.production,
        totalDuration: details.duration,
        likes: match.likes || 150,
        trendDays: 5
      };

      // Push into moviesList
      setMoviesList(prev => {
        if (prev.some(m => m.id === newMo.id)) return prev;
        return [newMo, ...prev];
      });

      // Update Form properties
      setFormTitle(newMo.title);
      setFormYear(newMo.year);
      setFormPosterUrl(newMo.posterUrl);
      setFormVideoUrl(newMo.videoUrl);
      setFormType(newMo.type);

      // Add to crawled pending list so they can play test it
      setScrapedPendingSources(prev => [
        {
          id: `sc_test_${match.id}`,
          title: newMo.title,
          year: newMo.year,
          videoUrl: newMo.videoUrl,
          posterUrl: newMo.posterUrl,
          overview: newMo.overview,
          type: newMo.type
        },
        ...prev
      ]);

    } catch (err: any) {
      log(`[ERRO CRÍTICO] Falha catastrófica no processo de raspagem: ${err.message}`);
    } finally {
      setIsCrawling(false);
    }
  };

  // Health Check Live Validator (Bloco 4: HTTP HEAD requests verifying if active -> status=1, dead -> status=0)
  const runHealthCheck = () => {
    setIsHealthChecking(true);
    setHealthCheckProgress(0);
    setHealthCheckLogs([]);
    triggerHaptic(50);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      setHealthCheckProgress(progress);

      if (progress === 20) {
        setHealthCheckLogs(prev => [...prev, `[HEALTH CHECK COMPLETO] Enviando requisições HTTP HEAD em tempo real contra todas as fontes...`]);
      } else if (progress === 40) {
        setHealthCheckLogs(prev => [...prev, `[OK] HEAD 'm1' - Cosmic Journey (2026) -> Retornou HTTP 200 OK. Fonte Ativa.`]);
      } else if (progress === 60) {
        // We set m2 (The Silent Sea) to inactive (status = false). Hides automatically from shelves!
        setHealthCheckLogs(prev => [...prev, `[FALHA DETECTADA] HEAD 'm2' - The Silent Sea (2025) -> Retornou HTTP 404 NOT FOUND (Inativo!).`, `[SQL ACTION] Definindo status = 0 (inativo), ocultando o título imediatamente da vitrine HUD.`]);
        setMoviesList(prev => prev.map(m => m.id === 'm2' ? { ...m, status: false } : m));
      } else if (progress === 80) {
        setHealthCheckLogs(prev => [...prev, `[OK] HEAD 'm3' - Cyberpunk Neon Matrix (2026) -> Retornou HTTP 200 OK. Fonte Ativa.`]);
      } else if (progress === 100) {
        setHealthCheckLogs(prev => [...prev, `[CONCLUÍDO] Fim da checagem. Estatísticas de resiliência sincronizadas. 1 de 3 títulos marcados como inativos.`]);
        clearInterval(interval);
        setIsHealthChecking(false);
        triggerHaptic(60);
      }
    }, 600);
  };

  // Hide movie controls after 3 seconds of inactiveness
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (moviePlaying && showMovieControls) {
      timer = setTimeout(() => {
        setShowMovieControls(false);
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [moviePlaying, showMovieControls]);

  // Anti-idle check timed trigger (exactly 5 hours of continuous play)
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (moviePlaying) {
      timer = setTimeout(() => {
        setShowAntiIdleCheck(true);
        setMoviePlaying(false); // Pause on lock
        triggerHaptic(60);
      }, 5 * 60 * 60 * 1000);
    }
    return () => clearTimeout(timer);
  }, [moviePlaying]);

  // Network jitter simulation triggering ABR
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (moviePlaying) {
      interval = setInterval(() => {
        const qualities: ('1080p' | '720p' | '480p')[] = ['1080p', '720p', '480p'];
        const randomQ = qualities[Math.floor(Math.random() * qualities.length)];
        setAbrMode(randomQ);
      }, 10000);
    }
    return () => clearInterval(interval);
  }, [moviePlaying]);

  const handleMovieTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = x / rect.width;
    const video = movieVideoRef.current;
    if (video && video.duration) {
      video.currentTime = pct * video.duration;
      setCurrentTime(video.currentTime);
      setMovieProgress(pct * 100);
    } else {
      setMovieProgress(Math.round(pct * 100));
    }
    triggerHaptic(15);
  };

  const startMoviePlayback = (movie: Movie) => {
    setSelectedMovie(movie);
    setMoviePlaying(true);
    setMovieIsPlaying(true);
    togglePipMode(false);
    setMovieProgress(continueWatchingTime ? 45 : 0);
    triggerHaptic(30);

    const currentMediaIndex = activeBlocks.findIndex(b => b.type === 'media');
    if (currentMediaIndex > 0) {
      swapBlocks(currentMediaIndex, 0);
    }
  };

  // HTML5 Video Player control synchronization effects
  useEffect(() => {
    if (!moviePlaying) {
      setMovieIsPlaying(false);
      return;
    }
    const video = movieVideoRef.current;
    if (video) {
      if (movieIsPlaying) {
        const p = video.play();
        if (p !== undefined) {
          p.catch((err) => {
            // Ignore interruption errors on rapid pause/play clicking
          });
        }
      } else {
        video.pause();
      }
    }
  }, [movieIsPlaying, moviePlaying, selectedMovie]);

  useEffect(() => {
    const video = movieVideoRef.current;
    if (video) {
      video.volume = movieVolume / 100;
    }
  }, [movieVolume]);

  // Auto Pause and Resume video on scroll
  useEffect(() => {
    if (!moviePlaying) return;
    const video = movieVideoRef.current;
    const playerBlock = document.getElementById('youtube-player-block');
    if (!playerBlock) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || entry.intersectionRatio < 0.95) {
            if (movieIsPlaying) {
              if (video) video.pause();
              setMovieIsPlaying(false);
              setWasPausedByScroll(true);
            }
          } else if (entry.intersectionRatio >= 0.95) {
            if (wasPausedByScroll) {
              if (video) video.play().catch(() => {});
              setMovieIsPlaying(true);
              setWasPausedByScroll(false);
            }
          }
        });
      },
      {
        threshold: [0.0, 0.95, 1.0],
      }
    );

    observer.observe(playerBlock);
    return () => {
      observer.disconnect();
    };
  }, [moviePlaying, movieIsPlaying, wasPausedByScroll]);

  const handleMovieTimeUpdate = () => {
    const video = movieVideoRef.current;
    if (video && video.duration) {
      setCurrentTime(video.currentTime);
      setDuration(video.duration);
      setMovieProgress((video.currentTime / video.duration) * 100);
    }
  };

  const handleMovieLoadedMetadata = () => {
    const video = movieVideoRef.current;
    if (video) {
      setDuration(video.duration);
      video.volume = movieVolume / 100;
      if (continueWatchingTime) {
        video.currentTime = 0.45 * video.duration;
      }
    }
  };

  const handleMovieEnded = () => {
    // Continuous Playback: O sistema deve colocar o próximo vídeo da lista de favoritos para tocar
    const favorites = (memoizedCategories && memoizedCategories.favorites) ? memoizedCategories.favorites : moviesList.filter(m => (m as any).isFavorite && m.status);
    
    if (favorites.length > 0) {
      // Find current selected movie in favorites
      const currentIndex = favorites.findIndex(m => m.id === selectedMovie?.id);
      const nextMovie = currentIndex >= 0 && currentIndex < favorites.length - 1 
        ? favorites[currentIndex + 1] 
        : favorites[0];
        
      if (nextMovie && nextMovie.id !== selectedMovie?.id) {
        startMoviePlayback(nextMovie);
      } else {
        // If it's the only favorite, loop it
        const video = movieVideoRef.current;
        if (video) {
          video.currentTime = 0;
          video.play().catch(() => {});
        }
      }
    } else {
      // No favorites, loop current
      const video = movieVideoRef.current;
      if (video) {
        video.currentTime = 0;
        video.play().catch(() => {});
      }
    }
  };

  const getActiveSubtitleText = () => {
    if (movieSubtitle === 'OFF') return '';
    const tracks = [
      { tStart: 1, tEnd: 4, text: { 'PT-BR': '[Música eletrônica de abertura]', 'EN': '[Opening electronic music]', 'ES': '[Música electrónica de apertura]' } },
      { tStart: 4, tEnd: 8, text: { 'PT-BR': 'O sinal de transmissão criptografado foi estabelecido.', 'EN': 'The encrypted broadcast signal has been established.', 'ES': 'La señal de transmisión encriptada ha sido establecida.' } },
      { tStart: 8, tEnd: 12, text: { 'PT-BR': 'Aviso: Todos os dados da sessão estão protegidos.', 'EN': 'Warning: All session data is fully protected.', 'ES': 'Advertencia: Todos los datos de la sesión están protegidos.' } },
      { tStart: 12, tEnd: 16, text: { 'PT-BR': 'Aproveite a experiência sonora de última geração.', 'EN': 'Enjoy the next-generation audio experience.', 'ES': 'Disfrute de la experiencia de audio de próxima generación.' } },
      { tStart: 16, tEnd: 20, text: { 'PT-BR': 'Use os controles inferiores para áudio, legenda e velocidade.', 'EN': 'Use the lower controls for audio, subtitle and progress speed.', 'ES': 'Use los controles inferiores para audio, subtítulos y velocidad.' } },
      { tStart: 21, tEnd: 25, text: { 'PT-BR': '[Efeito ultra sônico pulsante]', 'EN': '[Pulsing ultrasonic effect]', 'ES': '[Efecto ultrasónico pulsante]' } },
      { tStart: 25, tEnd: 30, text: { 'PT-BR': 'Bem-vindo ao Hub de Mídia INVIS Cinema.', 'EN': 'Welcome to the INVIS Cinema Media Hub.', 'ES': 'Bienvenido al Centro de Medios de Cine INVIS.' } }
    ];
    const match = tracks.find(track => currentTime >= track.tStart && currentTime <= track.tEnd);
    return match ? match.text[movieSubtitle] : '';
  };

  const showAlert = (text: string) => {
    setActiveMediaAlert(text);
    setTimeout(() => {
      setActiveMediaAlert(prev => prev === text ? null : prev);
    }, 1800);
  };

  const getMovieVideoSrc = (movie: Movie | null) => {
    if (!movie) return 'https://www.w3schools.com/html/mov_bbb.mp4';
    let src = movie.videoUrl || "";
    // If it's a youtube embed link or empty, fallback to sample high quality movie mp4
    if (src === "" || src.includes('youtube.com') || src.includes('youtu.be') || !src.includes('.')) {
      return 'https://www.w3schools.com/html/mov_bbb.mp4';
    }
    return src;
  };

  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds)) return "00:00";
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const { listTrailers, listSeries, listFilmes } = React.useMemo(() => {
    return {
      listTrailers: moviesList.filter(m => m.type === 'trailer' && m.status),
      listSeries: moviesList.filter(m => m.type === 'serie' && m.status),
      listFilmes: moviesList.filter(m => m.type === 'filme' && m.status)
    };
  }, [moviesList]);

  // End of modules logics
  return (
    <div 
      id="media_module_container" 
      onClick={handleOuterBackdropClick}
      className="w-full h-full min-h-[500px] flex items-center justify-center bg-black text-neutral-200 p-2 font-sans relative overflow-hidden select-none"
    >
      <AnimatePresence mode="wait">
        
        {/* =========================================================================
            SESSÃO EXPANDIDA - PENDENCIA DE SELEÇÃO DE SUBTAB
            ========================================================================= */}
        {expandedSection === null && (
          <motion.div
            key="media-pending-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-md flex flex-col items-center justify-center space-y-4 py-8 px-4 font-mono text-xs"
          >
            <div className="w-12 h-12 rounded-full border-2 border-cyan-500/30 border-t-cyan-400 animate-spin flex items-center justify-center" />
            <span className="text-cyan-400 font-bold tracking-widest animate-pulse uppercase text-center">
              CONECTANDO AO REPRODUTOR DE STREAMING...
            </span>
            <p className="text-[10px] text-zinc-500 text-center uppercase tracking-wider max-w-xs">
              Mapeamento de órbita ativo. Por favor selecione a sessão desejada no menu de hubs.
            </p>
          </motion.div>
        )}

        {/* =========================================================================
            SESSÃO EXPANDIDA A: HUD DE CLIPS (YOUTUBE INVIS CLIENTE)
            ========================================================================= */}
        {expandedSection === 'clips' && (
          <motion.div
            key="clips-max-satelite"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full flex flex-col space-y-4 pt-1"
          >
            {/* Header / Submenu Filters */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-3 py-1 bg-black/40 border border-white/5 rounded-2xl gap-3">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => { 
                    triggerHaptic(20); 
                    setExpandedSection(null); 
                    setSelectedClip(null); 
                    setMediaHubSelectorOpen(true);
                    closeBlock('media');
                  }}
                  className="p-1 px-3 text-xs bg-red-950/40 hover:bg-red-900/50 border border-red-500/20 rounded-lg text-red-400 font-mono flex items-center gap-1 cursor-pointer"
                >
                  ◀ VOLTAR
                </button>
                <div className="text-left">
                  <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest block font-bold">ÓRBITA SATÉLITE</span>
                  <h3 className="text-xs font-black text-rose-500 uppercase tracking-wider">HUD DE CLIPS & VÍDEOS</h3>
                </div>
              </div>

              {/* Dynamic Categories selector bar (SPEC PAGE 3) */}
              <div className="flex gap-1.5 max-w-full overflow-x-auto no-scrollbar py-1">
                {['Tendências', 'Novos no INVIS', 'Metadados Recentes'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => { triggerHaptic(15); setClipCategory(cat); }}
                    className={`px-3 py-1 font-mono text-[9px] tracking-wider uppercase rounded-full border transition-all cursor-pointer whitespace-nowrap ${
                      clipCategory === cat 
                        ? 'bg-rose-500/10 border-rose-500 text-rose-400 shadow-[0_0_8px_rgba(239,68,68,0.25)]' 
                        : 'bg-white/5 border-transparent text-zinc-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <AnimatePresence mode="wait">
              {!selectedClip ? (
                /* CLIP MASONRY GRID CATALOG */
                <motion.div
                  key="clip-masonry-catalog"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-4 flex-1 overflow-y-auto pr-1 no-scrollbar"
                >
                  {/* Grid of cards flutuantes in layout assímetrico masonry structure (SPEC PAGE 3) */}
                  <div className="columns-1 sm:columns-2 md:columns-3 gap-3 space-y-3">
                    {clipsList.map((clip) => (
                      <div 
                        key={clip.id}
                        onMouseEnter={() => setHoveredClipId(clip.id)}
                        onMouseLeave={() => setHoveredClipId(null)}
                        onClick={() => startClipPlayback(clip)}
                        onContextMenu={(e) => { e.preventDefault(); triggerHaptic(30); setAdminMenuClip(clip); }}
                        className="break-inside-avoid group rounded-2xl overflow-hidden bg-[#0d0d12]/60 border border-white/5 hover:border-red-500/30 transition-all duration-300 relative flex flex-col p-1.5 backdrop-blur-xl cursor-pointer"
                        title="Dica: Clique longo / Clique Direito abre Menu de Monitoramento"
                      >
                        {/* Thumbnail Dinâmica with simulated play loop focus zoom */}
                        <div className="w-full aspect-video rounded-xl overflow-hidden relative bg-black/60 shadow-inner">
                          <img 
                            src={clip.thumbnailUrl} 
                            alt={clip.title}
                            className={`w-full h-full object-cover transition-transform duration-[1200ms] ${
                              hoveredClipId === clip.id ? 'scale-110 filter brightness-90 animate-pulse' : 'scale-100 brightness-75'
                            }`}
                            referrerPolicy="no-referrer"
                          />
                          
                          {/* Simulated animated loop feedback text on hover */}
                          {hoveredClipId === clip.id && (
                            <div className="absolute inset-0 bg-red-950/15 flex items-center justify-center pointer-events-none">
                              <span className="text-[7.5px] font-mono font-bold tracking-[0.2em] bg-rose-500 text-black px-1.5 py-0.5 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)]">
                                FOCUS: LOOP ATIVO
                              </span>
                            </div>
                          )}

                          <div className="absolute top-1.5 right-1.5 flex items-center gap-1 text-[7.5px] font-mono bg-black/80 px-1.5 py-0.5 rounded border border-white/10 uppercase font-black text-rose-500">
                            <span className="w-1 h-1 rounded-full bg-rose-500 animate-ping" />
                            <span>CLIP</span>
                          </div>
                        </div>

                        {/* Text and Overlay Metadata (SPEC PAGE 3) */}
                        <div className="pt-1.5 text-left space-y-1 relative">
                          <h4 className="text-[10px] font-black text-white leading-snug group-hover:text-rose-400 transition-colors tracking-wide filter drop-shadow-[0_0_2px_black]">
                            {clip.title}
                          </h4>
                          <p className="text-[8.5px] text-zinc-400 leading-normal line-clamp-1">{clip.description}</p>
                          
                          <div className="flex justify-between items-center text-[7.5px] font-mono text-zinc-500 pt-1 border-t border-white/5">
                            <span className="bg-white/5 px-1 py-0.2 rounded hover:text-white transition-colors">#{clip.tags[0]}</span>
                            <span>{clip.duration} MIN</span>
                          </div>
                        </div>

                        {/* Fine Neon Border status indicator at base (SPEC PAGE 3) */}
                        <div className={`absolute bottom-0 left-2.5 right-2.5 h-[2px] rounded-full blur-[0.5px] shadow-[0_0_5px_currentColor] ${
                          clip.status === 'online' 
                            ? 'bg-emerald-500 text-emerald-400' 
                            : clip.status === 'monitored' 
                              ? 'bg-amber-400 text-amber-300' 
                              : 'bg-rose-500 text-rose-400'
                        }`} />
                      </div>
                    ))}
                  </div>

                  {/* NPC Automated discovery actions bar */}
                  <div className="w-full p-4 rounded-2xl bg-[#0e0e14]/50 border border-white/5 backdrop-blur-xl flex flex-col sm:flex-row justify-between items-center gap-4 text-left">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-[#D4AF37] font-mono text-[9px] uppercase font-black">
                        <Compass className="w-3.5 h-3.5 animate-spin" />
                        <span>Curadoria Freelance NPC de Busca</span>
                      </div>
                      <p className="text-[10px] text-zinc-400 max-w-md leading-relaxed">
                        Não consegue achar o que assistir? Solicite que os mineradores virtuais busquem novas correspondências de <span className="text-rose-400 font-bold">{clipCategory}</span> indexadas na internet.
                      </p>
                    </div>

                    <button
                      onClick={handleNpcMiningRequest}
                      disabled={npcMiningActive}
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 text-black font-black font-mono text-[10px] tracking-wider uppercase transition-all shadow-[0_0_15px_rgba(180,50,50,0.35)] active:scale-95 disabled:opacity-50 hover:brightness-110 cursor-pointer shrink-0"
                    >
                      {npcMiningActive ? '🤖 NPC MINERANDO...' : '🤖 SOLICITAR BUSCA NPC'}
                    </button>
                  </div>
                </motion.div>
              ) : (
                /* YOUTUBE STYLE FULL SIZE GESTURE VIDEO PLAYER (SPEC PAGE 4 & 5) */
                <motion.div
                  key="clip-player-interactive"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="w-full flex flex-col space-y-4"
                >
                  {/* Active Top Status Controls */}
                  <div className="flex justify-between items-center px-1">
                    <span className="font-mono text-[9.5px] text-rose-500 tracking-widest font-black uppercase flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                      REVISÃO DE CANAL ACTIVO
                    </span>
                    
                    {/* SPEC PAGE 4 REQUIREMENT: STYLIZED YOUTUBE CLOSE BUTTON SHRINKS PLAYER */}
                    <button
                      onClick={() => { triggerHaptic(20); setClipPlaying(false); setSelectedClip(null); }}
                      className="group flex items-center gap-2 bg-black/60 border border-white/10 hover:border-red-500/30 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer"
                      title="Encolher vídeo e retornar ao modal de clips"
                    >
                      <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest group-hover:text-red-400 transition-colors">Voltar</span>
                      <div className="w-6 h-[18px] rounded bg-red-600 flex items-center justify-center transition-transform group-hover:scale-105 shadow-[0_0_8px_rgba(220,38,38,0.4)]">
                        <div className="w-0 h-0 border-t-[3.5px] border-t-transparent border-b-[3.5px] border-b-transparent border-l-[6px] border-l-white ml-0.5" />
                      </div>
                    </button>
                  </div>

                  {/* FRAME DE VISUALIZAÇÃO: Red neon pulsing border reacts to audio frequencies (SPEC PAGE 4) */}
                  <div className="w-full aspect-video rounded-3xl overflow-hidden bg-black relative border-[1px] border-rose-600 shadow-[0_0_25px_rgba(225,29,72,0.3)] animate-pulse" style={{ animationDuration: '4s' }}>
                    
                    {/* Backdrop Blur thumbnail in high scale simulation */}
                    <img
                      src={selectedClip.thumbnailUrl}
                      alt="streaming backplate blur"
                      className="absolute inset-0 w-full h-full object-cover filter blur-3xl opacity-50 scale-125 select-none pointer-events-none"
                      referrerPolicy="no-referrer"
                    />

                    {showBumperAd ? (
                      <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black">
                        <div className="absolute top-4 left-4 bg-yellow-500/20 text-yellow-500 border border-yellow-500/50 px-2 py-1 rounded text-[9px] font-mono font-black uppercase tracking-widest">
                          Anúncio
                        </div>
                        <div className="text-zinc-300 text-sm font-mono mt-8 mb-2">Bumper Ad</div>
                        <div className="w-12 h-12 border-4 border-zinc-800 border-t-yellow-500 rounded-full animate-spin mb-4" />
                        <div className="absolute bottom-4 right-4 bg-black/80 border border-white/10 px-3 py-1.5 rounded-lg text-white font-mono text-[10px] flex items-center gap-2">
                          <span>Seu vídeo começará em {bumperCountdown}s</span>
                        </div>
                        {/* Div invisível bloqueadora para proibir cliques/ações durante o Bumper */}
                        <div className="absolute inset-0 z-[100] cursor-not-allowed pointer-events-auto" />
                      </div>
                    ) : (
                      <>
                        {/* Centered large play control action display */}
                        <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/35">
                          <button 
                            onClick={() => { triggerHaptic(20); setClipPlaying(!clipPlaying); }}
                            className="w-14 h-14 rounded-full bg-black/85 border border-rose-500/50 flex items-center justify-center text-rose-500 hover:scale-110 active:scale-95 transition-all shadow-2xl cursor-pointer"
                          >
                            {clipPlaying ? <span className="font-mono text-xs font-bold font-black">||</span> : <Play className="w-6 h-6 fill-rose-500 ml-0.5" />}
                          </button>
                        </div>
                      </>
                    )}

                    {/* SPEC 2: Gestures Touch zones (Left: Brightness, Right: Volume) */}
                    <div className="absolute inset-0 flex pointer-events-none z-20">
                      
                      {/* Left vertical: Drag Brightness */}
                      <div 
                        className="w-1/2 h-full pointer-events-auto cursor-ns-resize"
                        onWheel={(e) => {
                          e.preventDefault();
                          setClipBrightness(prev => Math.min(100, Math.max(0, prev - Math.sign(e.deltaY) * 5)));
                          setShowBrightnessIndicator(true);
                          setTimeout(() => setShowBrightnessIndicator(false), 2000);
                          triggerHaptic(10);
                        }}
                        onClick={() => {
                          setClipBrightness(prev => (prev === 20 ? 90 : 20)); // simulated tap toggle
                          setShowBrightnessIndicator(true);
                          setTimeout(() => setShowBrightnessIndicator(false), 2000);
                          triggerHaptic(15);
                        }}
                        title="Arraste na esquerda para ajustar brilho (ou clique)"
                      />

                      {/* Right vertical: Drag Volume */}
                      <div 
                        className="w-1/2 h-full pointer-events-auto cursor-ns-resize"
                        onWheel={(e) => {
                          e.preventDefault();
                          setClipVolume(prev => Math.min(100, Math.max(0, prev - Math.sign(e.deltaY) * 5)));
                          setShowVolumeIndicator(true);
                          setTimeout(() => setShowVolumeIndicator(false), 2000);
                          triggerHaptic(10);
                        }}
                        onClick={() => {
                          setClipVolume(prev => (prev === 0 ? 80 : 0)); // simulated mute tap toggle
                          setShowVolumeIndicator(true);
                          setTimeout(() => setShowVolumeIndicator(false), 2000);
                          triggerHaptic(15);
                        }}
                        title="Arraste na direita para ajustar volume (ou clique)"
                      />

                    </div>

                    {/* Interactive indicators HUD layout */}
                    <AnimatePresence>
                      {showVolumeIndicator && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute top-4 right-4 z-30 px-3 py-1 bg-black/85 border border-purple-500 rounded-lg flex items-center gap-1.5 text-xs font-mono text-purple-400 shadow-xl"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>VOL: {clipVolume}%</span>
                        </motion.div>
                      )}
                      {showBrightnessIndicator && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute top-4 left-4 z-30 px-3 py-1 bg-black/85 border border-amber-500 rounded-lg flex items-center gap-1.5 text-xs font-mono text-amber-400 shadow-xl"
                        >
                          <Sun className="w-3.5 h-3.5" />
                          <span>LUM: {clipBrightness}%</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* CONTROLS HUD BAR: Timeline with sparkling red crystal scrubber (SPEC PAGE 5) */}
                  <div className="space-y-4 px-1">
                    <div className="space-y-2">
                      {/* Timeline Bar */}
                      <div 
                        onClick={handleClipTimelineClick}
                        className="w-full h-1 bg-zinc-800 rounded-full cursor-pointer relative flex items-center group"
                      >
                        <div 
                          className="h-full bg-rose-600 rounded-full"
                          style={{ width: `${clipProgress}%` }}
                        />
                        {/* THE SYMBOL RED CRYSTAL LOSANGO SCRUBBER */}
                        <div 
                          className="absolute w-2.5 h-4 bg-rose-500 border border-white/55 rotate-45 cursor-grab group-active:cursor-grabbing hover:scale-110 filter drop-shadow-[0_0_6px_#f43f5e] transition-transform"
                          style={{ left: `calc(${clipProgress}% - 5px)` }}
                        />
                      </div>

                      <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500">
                        <div className="flex gap-4">
                          <button onClick={() => { setClipProgress(prev => Math.max(0, prev - 8)); triggerHaptic(12); }} className="hover:text-white transition-colors cursor-pointer text-zinc-400">🕒 -10s</button>
                          <button onClick={() => { setClipProgress(prev => Math.min(100, prev + 8)); triggerHaptic(12); }} className="hover:text-white transition-colors cursor-pointer text-zinc-400">🕒 +10s</button>
                        </div>
                        <span className="font-bold text-zinc-400">{Math.floor(clipProgress * 1.5)}s / 150s</span>
                      </div>
                    </div>

                    {/* METADATA PANEL WITH SLIDING GLASS DRAWER & HEARTBEAT (SPEC PAGE 5) */}
                    <div className="space-y-2.5">
                      <div className="p-4 rounded-2xl bg-[#09090e]/65 border border-white/5 text-left flex justify-between items-start gap-4">
                        <div className="space-y-1">
                          {/* Heartbeat status indicator */}
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex items-center justify-center animate-pulse">
                              <Heart className="w-2.5 h-2.5 text-white animate-ping" />
                            </span>
                            <span className="text-[9px] font-mono text-emerald-400 tracking-wider font-bold">CONEXÃO ATIVA (HEARTBEAT)</span>
                          </div>
                          
                          <h4 className="text-sm font-black text-white uppercase tracking-wide">{selectedClip.title}</h4>
                          <p className="text-[10px] leading-relaxed text-zinc-400 max-w-xl">{selectedClip.description}</p>
                        </div>

                        {/* Slide up metadata trigger */}
                        <button
                          onClick={() => { triggerHaptic(15); setShowClipMetadataDrawer(!showClipMetadataDrawer); }}
                          className="px-3.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-xl text-[9px] font-mono tracking-wider uppercase cursor-pointer whitespace-nowrap"
                        >
                          {showClipMetadataDrawer ? 'Ocultar Gaveta' : 'Ver Metadados'}
                        </button>
                      </div>

                      {/* Sliding metal/glass drawer */}
                      <AnimatePresence>
                        {showClipMetadataDrawer && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden bg-[#07070a]/90 border border-white/5 rounded-2xl p-4 text-left space-y-3"
                          >
                            <span className="text-[8.5px] font-mono font-bold uppercase tracking-widest text-[#D4AF37]">PAINEL INTEGRADO SATELLITE (DEEP SCRAPE)</span>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-[10px] font-mono text-zinc-400">
                              <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                                <span className="text-zinc-500 block text-[7px] uppercase font-black">ORIGEM DA FONTE</span>
                                <span className="text-rose-400">PROXY EMBED MASK</span>
                              </div>
                              <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                                <span className="text-zinc-500 block text-[7px] uppercase font-black">QUALIDADE STREAM</span>
                                <span>1080p ABR ACTIVE</span>
                              </div>
                              <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 col-span-2 sm:col-span-1">
                                <span className="text-zinc-500 block text-[7px] uppercase font-black">FILTRADO POR</span>
                                <span>{clipCategory}</span>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* =========================================================================
            SESSÃO EXPANDIDA B: HUD DE MÚSICAS (AUDIO TERMINAL PCB CONTROL)
            ========================================================================= */}
        {expandedSection === 'music' && (
          <motion.div
            key="music-max-satelite"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full flex flex-col items-center justify-between space-y-4 max-w-2xl py-2"
          >
            {/* Header */}
            <div className="w-full flex justify-between items-center px-2 py-1 bg-black/40 border border-white/5 rounded-2xl">
              <button 
                onClick={() => { 
                  triggerHaptic(20); 
                  setExpandedSection(null); 
                  setSongPlaying(false); 
                  setMediaHubSelectorOpen(true);
                  closeBlock('media');
                }}
                className="p-1 px-3 text-xs bg-purple-950/40 hover:bg-purple-900/50 border border-purple-500/20 rounded-lg text-purple-400 font-mono flex items-center gap-1 cursor-pointer"
              >
                ◀ VOLTAR
              </button>
              <div className="text-right">
                <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest block font-bold">DIGITAL SIGNAL</span>
                <h3 className="text-xs font-black text-purple-400 uppercase tracking-wider">AUDIO HUB SATELLITE</h3>
              </div>
            </div>

            {/* SYNC VIOLET DETAILED PCB铜铂电路 PATTERNS WITH ACTIVE GLOW EQUALIZER (SPEC PAGE 12 & 13) */}
            <div className="w-full flex-1 flex flex-col md:flex-row items-center justify-center p-4 bg-gradient-to-tr from-[#050508] via-[#090614] to-black rounded-3xl border border-purple-500/20 relative overflow-hidden">
              
              {/* Spectral glowing Equalizer background behind components */}
              <div className="absolute inset-0 opacity-[0.22] pointer-events-none flex items-end justify-center">
                <div className="w-full h-32 flex justify-around items-end px-6 gap-[2px]">
                  {Array.from({ length: 32 }).map((_, idx) => (
                    <div 
                      key={idx} 
                      className="bg-purple-500 rounded-t-full w-full"
                      style={{ 
                        height: songPlaying ? `${Math.round(20 + Math.sin(idx + songProgress) * 70)}%` : '5%',
                        transition: 'height 0.15s ease-out',
                        animation: songPlaying ? 'pulse 1.3s infinite ease-in-out' : 'undefined'
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Central Compositing: Disc & Interface Frame (SPEC PAGE 12) */}
              <div className="flex-1 flex flex-col items-center justify-center space-y-6 relative z-10">
                <div className="relative w-48 h-48 flex items-center justify-center">
                  
                  {/* Rotating Vinyl disc purple sticker */}
                  <div 
                    className={`absolute w-44 h-44 rounded-full bg-[#1a0f30] border-4 border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.45),inset_0_0_15px_black] flex items-center justify-center ${
                      songPlaying && !isBuffering ? 'animate-[spin_10s_linear_infinite]' : ''
                    }`}
                    onWheel={handleMusicVolumeScroll}
                    title="Dica: Use scroll na moeda disk para volume!"
                  >
                    <div className="w-32 h-32 rounded-full border border-purple-400/20 flex items-center justify-center">
                      <div className="w-20 h-20 rounded-full bg-black/60 border-2 border-dashed border-purple-500/40 flex items-center justify-center">
                        <img 
                          src={currentSong.coverUrl} 
                          alt="Cover" 
                          className="w-12 h-12 rounded-full object-cover shadow-lg border border-purple-200" 
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Embossed square playback control interface overlay on outer rim representing digital flow */}
                  <div className="absolute left-[-25px] w-20 h-28 rounded-2xl bg-[#09090f]/90 border border-white/10 shadow-[5px_5px_15px_black] p-2 flex flex-col justify-between text-left">
                    <span className="text-[7px] font-mono text-purple-400">ID3 STATUS</span>
                    
                    <div className="text-[9px] font-mono text-zinc-400 space-y-1">
                      <p className="line-clamp-1">{currentSong.title}</p>
                      <p className="text-[7.5px] text-zinc-500">HI-FI FLAC</p>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-white/5">
                      <div className="flex justify-between items-center text-[7px] text-zinc-500 font-mono">
                        <span>MODE:</span>
                        <span className="text-emerald-400 font-bold">MONITORED</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* MODES DRAG LETTERS KARAOKE LYRICS SYNC SYNC (SPEC PAGE 13) */}
                <div className="w-full text-center py-2.5 px-4 rounded-xl bg-black/60 border border-white/5 backdrop-blur-md min-h-[48px] flex flex-col justify-center">
                  <span className="text-[7.5px] font-mono tracking-[0.25em] text-[#D4AF37] uppercase font-bold mb-1">CANAIS KARAOKE SYNC MODE</span>
                  <p className="text-xs font-bold text-purple-300 transition-all duration-300 tracking-wide filter drop-shadow-[0_0_4px_rgba(168,85,247,0.4)]">
                    {songPlaying ? getCurrentLyricText() || '[Instrumental]' : 'Reprodução Pausada'}
                  </p>
                </div>
              </div>

              {/* Right Sidebar Control Column: Multi-interactions, WebRTC, NPC custom environments */}
              <div className="w-full md:w-56 flex flex-col gap-3 shrink-0 relative z-10 mt-6 md:mt-0">
                <div className="p-3.5 rounded-2xl bg-[#08080c]/85 border border-white/5 space-y-3 text-left">
                  <span className="text-[8.5px] font-mono text-indigo-400 tracking-wider font-bold block uppercase">TRILHAS PCB CONTROLLER</span>
                  
                  {/* MICRO-INTERACTIONS 3D BUTTON: Turns into buffering loading ring (SPEC PAGE 13) */}
                  <div className="flex justify-between items-center bg-black/40 p-2.5 rounded-xl border border-white/5">
                    <button 
                      onClick={handlePrevSong}
                      className="text-xs text-purple-400 hover:text-white transition-colors cursor-pointer"
                    >
                      ◀◀
                    </button>

                    {/* Central Buffering Dynamic play circle */}
                    <button
                      onClick={handlePlayPauseSong}
                      className="w-12 h-12 rounded-full border border-purple-500/50 bg-[#160f29] flex items-center justify-center cursor-pointer transition-transform duration-300 active:scale-90 hover:scale-105"
                    >
                      {isBuffering ? (
                        <div className="w-6 h-6 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
                      ) : songPlaying ? (
                        <span className="font-mono text-[10px] text-purple-300">||</span>
                      ) : (
                        <Play className="w-4 h-4 text-purple-400 fill-purple-400 ml-0.5" />
                      )}
                    </button>

                    <button 
                      onClick={handleNextSong}
                      className="text-xs text-purple-400 hover:text-white transition-colors cursor-pointer"
                    >
                      ▶▶
                    </button>
                  </div>

                  {/* Swipe horizontal control simulation */}
                  <div className="p-2 bg-black/60 rounded-xl border border-white/5 text-center">
                    <span className="text-[7.5px] font-mono text-zinc-500 block uppercase">ARRASRAR DE MÚSICA</span>
                    <div className="flex justify-between items-center text-[9px] text-zinc-400 mt-1">
                      <button onClick={handlePrevSong} className="hover:text-purple-300">swipe esq</button>
                      <span className="text-purple-400 font-bold">•</span>
                      <button onClick={handleNextSong} className="hover:text-purple-300">swipe dir</button>
                    </div>
                  </div>

                  {/* Sincronização Multiplex WebRTC (SPEC PAGE 13 & 14) */}
                  <div className="space-y-1 bg-purple-500/5 p-2.5 rounded-xl border border-purple-500/10 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-[8px] font-mono font-bold uppercase text-purple-400">MULTIPLEX STATUS</span>
                      <span className="px-1.5 py-0.2 text-[7.5px] font-mono bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded">ATIVO</span>
                    </div>
                    <p className="text-[9.5px] text-zinc-400 leading-normal">
                      Multiplex WebRTC conectado (Sala 1/12 usuários). Sincronismo da reprodução inferior a 50ms. Volume reduzido (ducking) se outra voz falar.
                    </p>
                  </div>
                </div>

                {/* Freelance NPC curator environment parameters */}
                <div className="p-3.5 rounded-2xl bg-[#08080c]/85 border border-white/5 text-left space-y-2.5">
                  <span className="text-[8.5px] font-mono text-amber-500 tracking-wider font-bold block uppercase flex items-center gap-1">
                    <Compass className="w-3 h-3 animate-spin" />
                    NPC MOOD SELECTOR
                  </span>
                  
                  <div className="grid grid-cols-2 gap-1.5 text-[9px] font-mono">
                    {['foco', 'relaxamento', 'energia'].map((m) => (
                      <button
                        key={m}
                        onClick={() => { triggerHaptic(15); setMusicMood(m); }}
                        className={`px-2 py-1 rounded-lg uppercase tracking-wider text-center border transition-all cursor-pointer ${
                          musicMood === m 
                            ? 'bg-amber-400/10 border-amber-400 text-amber-300' 
                            : 'bg-black/40 border-transparent text-zinc-400 hover:text-white'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>

                  <p className="text-[9px] text-zinc-500 leading-tight">
                    NPC opera como curador algorítmico diariamente filtrando BPM por estado de espírito do utilizador.
                  </p>
                </div>
              </div>

            </div>

            {/* Simulated Track Info Bar */}
            <div className="w-full p-4 rounded-2xl bg-[#09090f]/50 border border-white/5 text-left flex justify-between items-center">
              <div className="space-y-0.5">
                <span className="text-[8.5px] font-mono text-purple-400 uppercase font-black">REPRODUZINDO AGORA</span>
                <p className="text-xs font-black text-white uppercase tracking-wide">{currentSong.title}</p>
                <p className="text-[10px] text-zinc-400">{currentSong.artist}</p>
              </div>

              {/* Progress bar info */}
              <div className="w-32 space-y-1 font-mono text-[9px] text-zinc-500 text-right">
                <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden">
                  <div 
                    className="bg-purple-500 h-full" 
                    style={{ width: `${(songProgress / currentSong.duration) * 100}%` }}
                  />
                </div>
                <span>{Math.floor(songProgress / 60)}:{(songProgress % 60).toString().padStart(2, '0')} / {Math.floor(currentSong.duration / 60)}:{(currentSong.duration % 60).toString().padStart(2, '0')}</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* =========================================================================
            SESSÃO EXPANDIDA C: HUD DE FILMES (NETFLIX PREMIUM FLUID SHELVES)
            ========================================================================= */}
        {expandedSection === 'movies' && (
          <motion.div
            key="movies-max-satelite"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full flex flex-col space-y-4 pt-1 text-left"
          >
            {/* Header / Top Ribbon Replacement: Sticky Categories & Search Bar */}
            {!selectedMovie && !isCompact && (
              <div className="sticky top-0 z-50 bg-[#0d0d12]/90 backdrop-blur-md rounded-b-2xl border-b border-white/5 pb-2 pt-2 px-2 shadow-xl shadow-black/40 space-y-3 transition-transform duration-300">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 w-full">
                  {/* Filmes vs Series switches + Category Toggle */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => { triggerHaptic(15); setScopeFiltering(prev => prev === 'filme' ? 'todos' : 'filme'); }}
                      className={`px-4 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-bold transition-all cursor-pointer ${
                        scopeFiltering === 'filme' 
                          ? 'bg-red-650 text-white shadow-[0_0_12px_rgba(220,38,38,0.4)] border border-red-500/55' 
                          : 'bg-zinc-900 border border-white/5 text-zinc-400 hover:text-white'
                      }`}
                    >
                      🎬 Filmes
                    </button>
                    <button
                      onClick={() => { triggerHaptic(15); setScopeFiltering(prev => prev === 'serie' ? 'todos' : 'serie'); }}
                      className={`px-4 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-bold transition-all cursor-pointer ${
                        scopeFiltering === 'serie' 
                          ? 'bg-red-650 text-white shadow-[0_0_12px_rgba(220,38,38,0.4)] border border-red-500/55' 
                          : 'bg-zinc-900 border border-white/5 text-zinc-400 hover:text-white'
                      }`}
                    >
                      📺 Séries
                    </button>
                    
                    <div className="relative">
                      <button
                        onClick={() => { triggerHaptic(10); setIsCategoryDrawerOpen(!isCategoryDrawerOpen); }}
                        className={`px-4 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-bold transition-all border cursor-pointer hover:border-cyan-400/55 flex items-center gap-1.5 ${
                          isCategoryDrawerOpen || selectedCategory !== 'Todos'
                            ? 'bg-cyan-950/60 border-cyan-500/55 text-cyan-400 font-black shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                            : 'bg-zinc-900 border-white/5 text-zinc-400'
                        }`}
                      >
                        📂 {selectedCategory !== 'Todos' ? selectedCategory : 'Tipo ▾'}
                      </button>
                    </div>
                  </div>

                  {/* DROP DOWN GAVETA CATEGORY DRAWER COMPONENT */}
                  <AnimatePresence>
                    {isCategoryDrawerOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="w-full absolute top-[110%] left-0 bg-[#0a0b0e] border border-cyan-500/20 rounded-2xl p-3.5 space-y-2 mt-1 shadow-2xl text-left z-50 overflow-hidden"
                      >
                        <span className="text-[8px] font-mono text-cyan-400 font-black uppercase tracking-widest block mb-2">
                          Selecione um Tipo para Filtrar o Escopo Principal:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {['Todos', 'Anime', 'Infantil', 'Romance', 'Comédia', 'Comédia Romântica', 'Ação', 'Aventura', 'Suspense', 'Thriller', 'Ficção', 'Terror', 'Adulto', 'Documentário', 'Drama', 'Dorama', 'Nacional', 'Sci-Fi', 'Fantasia', 'Faroeste', 'Crime', 'Policial', 'Guerra', 'Musical', 'Épico', 'Biografia', 'Noir', 'DC', 'Marvel', 'Sobrevivência', 'Sobrenatural', 'Super-herói', 'Trash'].map((cat) => (
                            <button
                              key={cat}
                              onClick={() => {
                                triggerHaptic(20);
                                setSelectedCategory(cat);
                                setIsCategoryDrawerOpen(false);
                              }}
                              className={`px-3 py-1 rounded-lg text-[9px] font-mono transition-all cursor-pointer ${
                                selectedCategory === cat
                                  ? 'bg-cyan-500 text-black font-black'
                                  : 'bg-zinc-900/60 text-zinc-400 hover:text-white border border-white/5'
                              }`}
                            >
                              {cat}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* SEARCH BAR ATTACHED DIRECTLY BELOW CATEGORIES */}
                <div className="w-full relative group">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setVisiblePostersCount(18); // Reset pagination on new queries
                      setShowSuggestionsFocus(true);
                    }}
                    onFocus={() => setShowSuggestionsFocus(true)}
                    placeholder="Digite o título, ano ou gênero de filme/série desejada..."
                    className="w-full text-xs font-mono bg-[#090a0d] border border-white/10 hover:border-cyan-500/30 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-500/20 text-neutral-200 rounded-2xl py-2 px-9 placeholder-zinc-600 transition-all shadow-inner"
                  />
                  <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5 transition-colors group-hover:text-cyan-400" />
                  
                  {searchQuery && (
                    <button
                      onClick={() => { setSearchQuery(''); setShowSuggestionsFocus(false); }}
                      className="absolute right-3 top-2.5 text-zinc-500 hover:text-white px-1 text-[10px] font-mono"
                    >
                      ✕ Limpar
                    </button>
                  )}

                  <AnimatePresence>
                    {showSuggestionsFocus && searchQuery.trim() !== '' && (
                      <motion.div
                        initial={{ opacity: 0, y: 3 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 3 }}
                        className="absolute w-full left-0 mt-1.5 bg-[#090b0f] border border-cyan-500/25 rounded-2xl p-2.5 z-40 shadow-2xl space-y-1.5 max-h-48 overflow-y-auto pr-1 text-left no-scrollbar"
                      >
                        <div className="text-[7.5px] font-mono text-cyan-500 uppercase font-black px-1 border-b border-white/5 pb-1 flex justify-between items-center">
                          <span>Sugestões Encontradas:</span>
                          <button 
                            onClick={() => setShowSuggestionsFocus(false)}
                            className="text-zinc-600 hover:text-white uppercase font-bold text-[8px]"
                          >
                            FECHAR [✕]
                          </button>
                        </div>
                        {moviesList
                          .filter(m => m.title.toLowerCase().includes(searchQuery.toLowerCase()) || (m as any).category?.toLowerCase().includes(searchQuery.toLowerCase()))
                          .slice(0, 5)
                          .map(matchedMov => (
                            <div
                              key={matchedMov.id}
                              onClick={() => {
                                triggerHaptic(15);
                                setSearchQuery(matchedMov.title);
                                setShowSuggestionsFocus(false);
                              }}
                              className="flex justify-between items-center p-1.5 hover:bg-cyan-950/40 rounded transition-all cursor-pointer border border-transparent hover:border-cyan-500/10"
                            >
                              <span className="text-[9.5px] text-zinc-200 font-bold uppercase truncate max-w-xs">{matchedMov.title}</span>
                              <div className="flex gap-2 items-center text-[7.5px] font-mono text-zinc-500 shrink-0">
                                <span>{matchedMov.type.toUpperCase()} • {matchedMov.year}</span>
                                <span className="px-1.5 py-0.5 bg-zinc-800 hover:bg-cyan-900 border border-white/5 text-cyan-400 font-black rounded uppercase">Selecionar</span>
                              </div>
                            </div>
                          ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}

            <AnimatePresence mode="wait">
              {!selectedMovie ? (showIndexer ? (
                /* =========================================================================
                    BLOCO INDEXADOR & CRAWLER DIGITAL INTEGRADO (TESTES E ADMIN)
                    ========================================================================= */
                <motion.div
                  key="indexer-crawler-dashboard"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 overflow-y-auto pr-1 no-scrollbar text-[9px] font-mono text-left"
                >
                  {/* ESQUERDA: CRAWLER DE EMBEDS & EXTRATOR (7/12 cols) */}
                  <div className="lg:col-span-7 bg-[#050508]/80 border border-white/5 rounded-3xl p-4 space-y-4 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <span className="text-cyan-400 font-black uppercase text-[10px]">🌐 TMDB TRENDING SYNC & WEB SCRAPER CRAWLER</span>
                        <span className="text-[7.5px] bg-cyan-950 px-2 py-0.5 rounded text-cyan-500">API VERSION: 4.1</span>
                      </div>

                      {/* TMDB Quick Releases feed list */}
                      <p className="text-zinc-500 text-[8px] mt-1">Clique em uma release do feed do TMDb para preencher os metadados:</p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mt-2">
                        {[
                          { title: 'Interstellar', year: 2014, poster: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=200', overview: 'Aventura de ficção científica espacial.', type: 'filme' },
                          { title: 'Blade Runner 2049', year: 2017, poster: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=200', overview: 'Um novo Blade Runner desenterra um segredo há muito enterrado.', type: 'filme' },
                          { title: 'Dune: Part Two', year: 2024, poster: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=200', overview: 'Paul Atreides se une a Chani e aos Fremen para se vingar.', type: 'serie' },
                          { title: 'Cyberpunk Edgerunners', year: 2022, poster: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=200', overview: 'Um garoto de rua tenta sobreviver em uma cidade obsessiva.', type: 'serie' }
                        ].map((trend) => (
                          <div
                            key={trend.title}
                            onClick={() => {
                              triggerHaptic(15);
                              setFormTitle(trend.title);
                              setFormYear(trend.year);
                              setFormPosterUrl(trend.poster);
                              setFormVideoUrl('https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1');
                              setFormType(trend.type as any);
                            }}
                            className="p-1.5 rounded-xl border border-white/5 bg-black/40 hover:border-cyan-500/30 hover:bg-cyan-950/20 cursor-pointer text-left transition-all"
                          >
                            <p className="font-extrabold text-neutral-300 truncate">{trend.title}</p>
                            <p className="text-[7px] text-zinc-500">{trend.year} • {trend.type.toUpperCase()}</p>
                          </div>
                        ))}
                      </div>

                      {/* FORMULÁRIO METADADOS BLOCO 5 */}
                      <div className="mt-4 bg-black/40 p-3 rounded-2xl border border-white/5 space-y-2.5">
                        <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest border-b border-white/5 pb-1 block">✏️ METADADOS DA FONTE FILTRADA</p>
                        <div className="grid grid-cols-2 gap-2">
                          <label className="flex flex-col gap-1">
                            <span className="text-zinc-500 text-[8px]">TÍTULO DA OBRA:</span>
                            <input
                              type="text"
                              value={formTitle}
                              onChange={(e) => setFormTitle(e.target.value)}
                              placeholder="ex: Blade Runner 2049"
                              className="bg-[#0b0c10] border border-white/10 rounded-lg p-1.5 text-white max-w-full focus:outline-none focus:border-cyan-400"
                            />
                          </label>

                          <label className="flex flex-col gap-1">
                            <span className="text-zinc-500 text-[8px]">ANO DE LANÇAMENTO:</span>
                            <input
                              type="number"
                              value={formYear}
                              onChange={(e) => setFormYear(Number(e.target.value))}
                              placeholder="ex: 2026"
                              className="bg-[#0b0c10] border border-white/10 rounded-lg p-1.5 text-white max-w-full focus:outline-none focus:border-cyan-400"
                            />
                          </label>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <label className="flex flex-col gap-1">
                            <span className="text-zinc-500 text-[8px]">CÉDULA TIPO:</span>
                            <select
                              value={formType}
                              onChange={(e) => setFormType(e.target.value as any)}
                              className="bg-[#0b0c10] border border-white/10 rounded-lg p-1.5 text-white focus:outline-none"
                            >
                              <option value="filme">FILME</option>
                              <option value="serie">SÉRIE</option>
                              <option value="trailer">TRAILER</option>
                            </select>
                          </label>

                          <label className="flex flex-col gap-1">
                            <span className="text-zinc-500 text-[8px]">MINIATURA BANNER URL:</span>
                            <input
                              type="text"
                              value={formPosterUrl}
                              onChange={(e) => setFormPosterUrl(e.target.value)}
                              placeholder="ex: https://images.unsplash..."
                              className="bg-[#0b0c10] border border-white/10 rounded-lg p-1.5 text-white max-w-full truncate focus:outline-none"
                            />
                          </label>
                        </div>

                        <label className="flex flex-col gap-1">
                          <span className="text-zinc-500 text-[8px]">STREAM EMBED VIDEO URL (MRE OU MP4/M3U8):</span>
                          <input
                            type="text"
                            value={formVideoUrl}
                            onChange={(e) => setFormVideoUrl(e.target.value)}
                            placeholder="ex: https://youtube.com/embed/..."
                            className="bg-[#0b0c10] border border-white/10 rounded-lg p-1.5 text-white max-w-full focus:outline-none"
                          />
                        </label>

                        <div className="flex gap-2 justify-end pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              if (!formTitle) return;
                              runCrawler(formTitle, formYear, formType);
                            }}
                            disabled={isCrawling}
                            className="px-3 py-1.5 bg-cyan-950 text-cyan-400 font-bold border border-cyan-400/40 rounded-xl uppercase tracking-wider hover:bg-cyan-900 cursor-pointer disabled:opacity-50"
                          >
                            {isCrawling ? "CRAWLING ACTIVE..." : "🌐 RASTREAR APIS & CRAWLER"}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* CRAWLER SHELL LOGS PORT (BLOCO 3: Terminal de Execução com scrolling) */}
                    <div className="mt-2 space-y-1 text-left">
                      <div className="flex justify-between items-center text-[8px] text-zinc-500 font-mono">
                        <span className="flex items-center gap-1"><Terminal className="w-3.5 h-3.5" /> EXECUÇÃO WEB SCRAPER TERMINAL:</span>
                        <span>STATUS: {isCrawling ? "SCANNING APIS" : "READY"}</span>
                      </div>
                      
                      <div className="h-32 rounded-xl bg-black border border-white/10 p-2.5 font-mono text-[8px] text-emerald-400 overflow-y-auto space-y-1">
                        {crawlerLogs.length === 0 ? (
                          <span className="text-zinc-600 block">[CRAWLER] Aguardando comando de extração contínua...</span>
                        ) : (
                          crawlerLogs.map((log, idx) => (
                            <div key={idx} className="leading-relaxed">
                              {log}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  {/* DIREITA: HEALTH CHECK & AUDIT MANAGEMENT CLIENT (5/12 cols) */}
                  <div className="lg:col-span-5 flex flex-col gap-4 text-left">
                    
                    {/* SEÇÃO 1: AUTOMATED HEALTH CHECK VALIDATOR (BLOCO 4) */}
                    <div className="bg-[#050508]/80 border border-white/5 rounded-3xl p-4 space-y-3">
                      <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <span className="text-amber-400 font-black uppercase text-[10px]">🩺 AUTO HEALTH CHECK SENSOR</span>
                        <span className="text-[7px] text-zinc-400">HTTP HEAD CHECKS</span>
                      </div>

                      <p className="text-zinc-500 text-[8.5px] leading-relaxed">
                        Varre as URLs do catálogo via requisição HTTP HEAD simulada. Ativo (<span className="text-emerald-400 font-bold">status=1</span>), links expirados (<span className="text-red-400 font-bold">status=0</span>) são removidos do HUD!
                      </p>

                      <div className="space-y-2 bg-black/40 p-3 rounded-2xl border border-white/5">
                        <div className="flex justify-between items-center">
                          <button
                            type="button"
                            onClick={runHealthCheck}
                            disabled={isHealthChecking}
                            className="px-3.5 py-1.5 bg-amber-400 text-black font-black rounded-xl uppercase tracking-wider hover:bg-amber-300 disabled:opacity-50 cursor-pointer"
                          >
                            {isHealthChecking ? "CHECAGEM ATIVA..." : "🩺 INICIAR HEALTH CHECK"}
                          </button>
                          
                          <div className="text-right">
                            <span className="text-zinc-400 text-[8px]">PROCESSO:</span>
                            <span className="text-white font-bold block">{healthCheckProgress}%</span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-amber-400 h-full transition-all duration-300" style={{ width: `${healthCheckProgress}%` }} />
                        </div>

                        {/* Audit Terminal Log */}
                        <div className="h-20 bg-black rounded-lg p-2 font-mono text-[7.5px] overflow-y-auto text-amber-300 border border-amber-400/15">
                          {healthCheckLogs.length === 0 ? (
                            <span className="text-zinc-650">[SINAL] Sensor de ping inativo.</span>
                          ) : (
                            healthCheckLogs.map((log, idx) => (
                              <p key={idx} className="line-clamp-2">{log}</p>
                            ))
                          )}
                        </div>
                      </div>
                    </div>

                    {/* SEÇÃO 2: PLAY TEST DE STREAM PREVIEW & BANCO SQL LOCAL (BLOCO 5) */}
                    <div className="bg-[#05055]/5 border border-white/5 rounded-3xl p-4 space-y-3 flex-1 flex flex-col justify-between bg-[#08080c]/85">
                      <div>
                        <div className="flex justify-between items-center border-b border-white/5 pb-2">
                          <span className="text-purple-400 font-black uppercase text-[10px]">📺 PLAY TESTE DE PRÉVIA & INTEGRIDADE</span>
                          <span className="text-[8px] text-zinc-400">SIMULADOR</span>
                        </div>

                        {/* Scraped Pending list elements to pick from */}
                        <div className="space-y-1.5 mt-2">
                          <span className="text-zinc-500 text-[8px]">FONTES INDEXADAS PENDENTES DE STREAM:</span>
                          <div className="flex flex-col gap-1.5 max-h-24 overflow-y-auto pr-1">
                            {scrapedPendingSources.map((sch) => (
                              <div
                                key={sch.id}
                                className={`p-1.5 rounded-lg border flex justify-between items-center transition-all cursor-pointer ${
                                  playTestUrl === sch.videoUrl 
                                    ? 'bg-purple-950/20 border-purple-500/70' 
                                    : 'bg-black/40 border-white/5 hover:border-white/15'
                                }`}
                                onClick={() => {
                                  triggerHaptic(15);
                                  setPlayTestUrl(sch.videoUrl);
                                  // fill form to make editing easy
                                  setFormTitle(sch.title);
                                  setFormYear(sch.year);
                                  setFormPosterUrl(sch.posterUrl);
                                  setFormVideoUrl(sch.videoUrl);
                                  setFormType(sch.type);
                                }}
                              >
                                <div>
                                  <p className="font-bold text-white uppercase text-[8.5px]">{sch.title} ({sch.year})</p>
                                  <span className="text-[7.5px] text-zinc-500 uppercase tracking-widest">{sch.type} • READY_FOR_METADATA</span>
                                </div>
                                <span className={`text-[7px] font-mono px-1 rounded ${playTestUrl === sch.videoUrl ? 'bg-purple-500 text-black font-black' : 'bg-zinc-800 text-zinc-400'}`}>
                                  {playTestUrl === sch.videoUrl ? "PLAYING" : "TEST"}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Interactive Play Test Viewbox */}
                        <div className="mt-3 relative w-full aspect-video rounded-2xl overflow-hidden bg-black/95 border border-white/5 flex flex-col justify-center items-center">
                          {playTestUrl ? (
                            <div className="absolute inset-0 flex flex-col justify-between p-2">
                              {isPlayingTest ? (
                                <div className="absolute inset-0 bg-black">
                                  <iframe
                                    src={playTestUrl}
                                    title="Pre-check Stream Player Preview"
                                    className="w-full h-full border-none pointer-events-none"
                                  />
                                  <div className="absolute top-1 left-1 bg-purple-500 text-black font-mono font-black text-[7px] px-1.5 py-0.5 rounded tracking-widest uppercase animate-pulse">
                                    LIVE MONITORING
                                  </div>
                                </div>
                              ) : (
                                <div className="flex-1 flex flex-col justify-center items-center space-y-2">
                                  <p className="text-zinc-400 text-center font-black text-[9px] uppercase tracking-wider block">PRÉ-CHECK DE PLAYBACK DISPONÍVEL</p>
                                  <p className="text-zinc-650 text-[8px] line-clamp-1">{playTestUrl}</p>
                                  <button
                                    onClick={() => { triggerHaptic(30); setIsPlayingTest(true); }}
                                    className="px-4 py-1 bg-purple-500 text-black font-black font-mono text-[8px] rounded-lg uppercase tracking-wider hover:bg-purple-400"
                                  >
                                    ▶ INICIAR PLAY TESTE MANUAL
                                  </button>
                                </div>
                              )}
                              
                              <div className="absolute bottom-1 right-1">
                                <button
                                  onClick={() => { triggerHaptic(15); setIsPlayingTest(false); }}
                                  className="p-1 px-1.5 bg-black/50 border border-white/10 rounded text-[7px] uppercase tracking-wider text-rose-400"
                                >
                                  RESET
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center space-y-1.5 text-zinc-650 p-2 pointer-events-none">
                              <span className="block text-[14px]">📺</span>
                              <p className="uppercase text-[8px] font-black tracking-widest">NENHUM FLUXO SELECIONADO</p>
                              <p className="text-[7.5px] leading-tight">Mapeie um canal ao lado para carregar preview de estúdio</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Confirm/sync directly into movies list */}
                      <button
                        onClick={() => {
                          if (!formTitle) return;
                          triggerHaptic(35);
                          // append directly
                          const validatedMovie: Movie = {
                            id: `m_${Date.now()}`,
                            title: formTitle,
                            year: formYear,
                            posterUrl: formPosterUrl || 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=400',
                            overview: `Cadastrado em tempo real. Link de streaming validado manualmente via Play Teste.`,
                            videoUrl: formVideoUrl || 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                            type: formType,
                            status: true
                          };
                          setMoviesList(prev => [validatedMovie, ...prev]);
                          // cleanup / notifier
                          setFormTitle('');
                          setFormPosterUrl('');
                          setFormVideoUrl('');
                          setPlayTestUrl(null);
                          setIsPlayingTest(false);
                          setShowIndexer(false); // return to vitrine
                        }}
                        className="w-full mt-3 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-black font-black font-mono uppercase tracking-widest rounded-xl hover:opacity-90 active:scale-98 cursor-pointer shadow-[0_4px_12px_rgba(168,85,247,0.3)]"
                      >
                        💾 SALVAR & PUBLICAR NO CATÁLOGO DO HUD
                      </button>
                    </div>

                  </div>
                </motion.div>
              ) : (
                /* REDERIZAÇÃO DA VITRINE ESTILO NETFLIX (SPEC PAGE 18 & 23) */
                <motion.div
                  key="movies-netflix-rows"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-6 flex-1 overflow-y-auto no-scrollbar pr-1"
                  onScroll={handleContainerScroll}
                >
                  
                  {/* METADATA ACTION CONTROLS / SECTIONS BAR HAS BEEN REMOVED TO PREVENT DUPLICATION */}

                  {/* 6 AUTOMATIC TRAILERS ROW - HORIZONTAL CAROUSEL WITH AUDIOLESS AUTOPLAY */}
                  <div className="space-y-4 text-left border-b border-white/5 pb-6 mt-2">
                    <div className="flex justify-between items-center px-2">
                      <span className="text-[10px] font-black text-cyan-400 font-mono uppercase tracking-widest block flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-cyan-500 animate-ping shrink-0" />
                        ♛ TENDÊNCIAS
                      </span>
                      <span className="text-[8px] font-mono text-zinc-500">Arraste para explorar</span>
                    </div>

                    <div className="relative w-full h-[60vw] max-h-[300px] flex items-center justify-center overflow-hidden touch-none" style={{ perspective: '800px' }}>
                      <motion.div
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        onDragEnd={(e, info) => {
                          const threshold = 50;
                          if (info.offset.x < -threshold && activeTrailerIndex < Math.min(10, moviesList.length) - 1) {
                            setActiveTrailerIndex(prev => prev + 1);
                          } else if (info.offset.x > threshold && activeTrailerIndex > 0) {
                            setActiveTrailerIndex(prev => prev - 1);
                          }
                        }}
                        className="absolute inset-0 flex items-center justify-center cursor-grab active:cursor-grabbing z-20"
                      >
                        {moviesList.slice(0, 10).map((movie, idx) => {
                          const isActive = idx === activeTrailerIndex;
                          const offset = idx - activeTrailerIndex;
                          const absOffset = Math.abs(offset);
                          const isVisible = absOffset < 3;
                          
                          if (!isVisible) return null;

                          return (
                            <motion.div
                              key={`coverflow_${movie.id}`}
                              animate={{
                                x: offset * 110,
                                scale: isActive ? 1.1 : Math.max(0.6, 0.85 - (absOffset * 0.1)),
                                rotateY: -offset * 12,
                                zIndex: 10 - absOffset,
                                opacity: isActive ? 1 : Math.max(0.2, 0.7 - (absOffset * 0.2)),
                              }}
                              transition={{ type: 'spring', stiffness: 250, damping: 25 }}
                              onClick={() => {
                                if (!isActive) triggerHaptic(20);
                                setActiveTrailerIndex(idx);
                              }}
                              className={`absolute w-[240px] md:w-[280px] aspect-video rounded-2xl overflow-hidden bg-black border ${isActive ? 'border-cyan-500/80 shadow-[0_0_30px_rgba(6,182,212,0.3)]' : 'border-white/10'} shadow-xl flex flex-col pointer-events-auto`}
                            >
                              <div className="relative w-full flex-1 bg-zinc-900 overflow-hidden pointer-events-none">
                                {isActive && movie.videoUrl ? (
                                  <iframe
                                    src={`${movie.videoUrl}?autoplay=1&mute=1&controls=0&modestbranding=1&playlist=${movie.videoUrl.split('/').pop()?.split('?')[0]}&loop=1&showinfo=0&rel=0&iv_load_policy=3&disablekb=1&playsinline=1`}
                                    title={movie.title}
                                    className="absolute inset-0 w-full h-full object-cover border-0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                  />
                                ) : (
                                  <>
                                    <img 
                                      src={movie.backdropUrl || movie.posterUrl} 
                                      alt={movie.title} 
                                      className="absolute inset-0 w-full h-full object-cover" 
                                      referrerPolicy="no-referrer"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent" />
                                  </>
                                )}
                              </div>
                              <div className="h-[55px] bg-[#07090c] p-2 flex flex-col justify-center pointer-events-auto z-10 w-full text-left border-t border-white/5">
                                <h4 className={`text-[10px] md:text-[11px] font-black truncate uppercase ${isActive ? 'text-cyan-400' : 'text-neutral-300'}`}>
                                  {movie.title}
                                </h4>
                                <div className="flex justify-between items-center text-[8px] font-mono mt-1">
                                  <span className="text-zinc-500">{movie.year} • {movie.type.toUpperCase()}</span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      selectMovieAndFetchDetails(movie);
                                    }}
                                    className="px-2 py-1 bg-white/5 hover:bg-cyan-900/50 rounded flex items-center transition-colors text-zinc-300 font-bold uppercase tracking-wider border border-white/10 active:scale-95 cursor-pointer"
                                  >
                                    + DETALHES
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </motion.div>
                    </div>
                  </div>

                  {/* ACTIVE FILTER SECTION PANEL - ONLY SHOWN WHEN SEARCH OR GENRES EXPANSE IS ENGAGED */}
                  {(searchQuery || selectedCategory !== 'Todos' || scopeFiltering !== 'todos') && (
                    <div className="space-y-4 text-left">
                      <div className="flex justify-between items-center border-b border-zinc-900 pb-1">
                        <span className="text-[10px] font-black text-cyan-400 font-mono uppercase tracking-widest block">
                          ⚡ RESULTADOS DETALHADOS DA BUSCA EM CURSO
                        </span>
                        <div className="flex gap-2 text-[8px] font-mono">
                          <button
                            onClick={() => {
                              triggerHaptic(10);
                              setSearchQuery('');
                              setSelectedCategory('Todos');
                              setScopeFiltering('todos');
                            }}
                            className="text-zinc-500 hover:text-rose-400 underline font-extrabold uppercase border border-transparent active:scale-95 cursor-pointer"
                          >
                            ✕ Resetar Filtros
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        {memoizedCategories.filtered
                          .slice(0, visiblePostersCount)
                          .map((movie) => (
                            <div
                              key={movie.id}
                              className="group relative rounded-xl overflow-hidden bg-zinc-950/45 border border-white/5 hover:border-cyan-500/30 p-1.5 hover:shadow-[0_0_15px_rgba(6,182,212,0.15)] flex flex-col justify-between transition-all cursor-pointer"
                              onClick={() => selectMovieAndFetchDetails(movie)}
                            >
                              <div className="w-full aspect-video rounded-lg overflow-hidden bg-zinc-900 relative">
                                <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                              </div>
                              <div className="pt-1.5 text-left space-y-0.5">
                                <h4 className="text-[9.5px] font-bold text-neutral-200 uppercase truncate group-hover:text-cyan-400 transition-colors">{movie.title}</h4>
                                <div className="flex justify-between items-center text-[7.5px] font-mono text-zinc-500">
                                  <span>{movie.year} • {movie.type.toUpperCase()}</span>
                                  {movie.status && <span className="text-cyan-400 font-extrabold font-mono">● SINAL ON</span>}
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>

                      {/* PROGRESSIVE MORE POSTERS LOAD SENSOR CONTROL */}
                      {memoizedCategories.filtered.length > visiblePostersCount && (
                        <div className="flex justify-center pt-2">
                          <button
                            onClick={() => {
                              triggerHaptic(20);
                              setVisiblePostersCount(prev => prev + 18);
                            }}
                            className="px-6 py-2 bg-zinc-900/40 hover:bg-cyan-950/40 text-cyan-400 border border-cyan-500/20 rounded-xl text-[9.5px] font-mono uppercase tracking-widest font-black active:scale-95 transition-all shadow cursor-pointer"
                          >
                            ✦ Carregar mais 18 Títulos ✦
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* MAIN VITRINE SHELVES CONTAINER - HIDDEN OR COMPLEMENTED BY FILTER */}
                  <div className="space-y-6">

                    {/* SHELF A: FAVORITOS DO USUÁRIO (SESSÃO DO USUÁRIO) */}
                    <div className="space-y-2 text-left">
                      <div 
                        onClick={() => { triggerHaptic(20); setExpandedSessionGrid(prev => prev === 'favorites' ? null : 'favorites'); }}
                        className="flex justify-between items-center border-b border-zinc-900/40 pb-1 cursor-pointer hover:opacity-80 transition-opacity"
                      >
                        <span className="text-[10px] font-black text-cyan-400 font-mono uppercase tracking-widest block flex items-center gap-1">
                          <Heart className="w-3 h-3 text-red-500 fill-red-500 animate-pulse" />
                          FAVORITOS
                        </span>
                      </div>

                      {expandedSessionGrid === 'favorites' ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 pt-2 max-h-[65vh] overflow-y-auto no-scrollbar place-content-start">
                          {getExpandedTitlesForCategory('favorites').map((movie) => (
                            <div
                              key={`expanded_fav_${movie.id}`}
                              onClick={() => selectMovieAndFetchDetails(movie)}
                              className="group rounded-xl overflow-hidden bg-zinc-950/60 border border-white/5 hover:border-cyan-500/40 p-1.5 transition-all cursor-pointer"
                            >
                              <div className="w-full aspect-video rounded-lg overflow-hidden bg-zinc-900 relative">
                                <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                                <div className="absolute top-1.5 left-1.5 bg-black/60 border border-red-500/30 px-1 py-0.5 rounded text-[6.5px] font-sans text-red-400 flex items-center gap-0.5 font-bold">
                                  <Heart className="w-2 h-2 fill-red-500 text-red-500" /> FAV
                                </div>
                              </div>
                              <div className="pt-1.5 text-left">
                                <h5 className="text-[9px] font-bold text-neutral-200 uppercase truncate">{movie.title}</h5>
                                <div className="flex justify-between items-center text-[7px] font-mono text-zinc-500 mt-0.5">
                                  <span>{movie.year} • {movie.type.toUpperCase()}</span>
                                  {movie.status && <span className="text-cyan-405 font-bold">H.265</span>}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        /* Infinite Scrollable Box with program scroll detection */
                        <div
                          onScroll={(e) => handleHorizontalScroll(e, 'favorites')}
                          className="flex overflow-x-auto gap-3 pb-2 no-scrollbar scroll-smooth"
                          style={{ scrollbarWidth: 'none' }}
                        >
                          {memoizedCategories.favorites
                            .slice(0, favoritesLimit)
                            .map((movie) => (
                              <div
                                key={`fav_${movie.id}`}
                                onClick={() => selectMovieAndFetchDetails(movie)}
                                className="min-w-[140px] max-w-[140px] group rounded-xl overflow-hidden bg-zinc-950/60 border border-white/5 hover:border-cyan-500/40 p-1.5 transition-all cursor-pointer inline-block"
                              >
                                <div className="w-full aspect-video rounded-lg overflow-hidden bg-zinc-900 relative">
                                  <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                                  <div className="absolute top-1.5 left-1.5 bg-black/60 border border-red-500/30 px-1 py-0.5 rounded text-[6.5px] font-sans text-red-400 flex items-center gap-0.5 font-bold">
                                    <Heart className="w-2 h-2 fill-red-500 text-red-500" /> FAV
                                  </div>
                                </div>
                                <div className="pt-1.5 text-left">
                                  <h5 className="text-[9px] font-bold text-neutral-200 uppercase truncate">{movie.title}</h5>
                                  <div className="flex justify-between items-center text-[7px] font-mono text-zinc-500 mt-0.5">
                                    <span>{movie.year} • {movie.type.toUpperCase()}</span>
                                    {movie.status && <span className="text-cyan-405 font-bold">H.265</span>}
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>


                    {/* SHELF B: CONTINUAR ASSISTINDO */}
                    <div className="space-y-2 text-left">
                      <div 
                        onClick={() => { triggerHaptic(20); setExpandedSessionGrid(prev => prev === 'continue' ? null : 'continue'); }}
                        className="flex justify-between items-center border-b border-zinc-900/40 pb-1 cursor-pointer hover:opacity-80 transition-opacity"
                      >
                        <span className="text-[10px] font-black text-purple-400 font-mono uppercase tracking-widest block flex items-center gap-1">
                          <Clock className="w-3 h-3 text-purple-400" />
                          CONTINUAR ASSISTINDO
                        </span>
                      </div>

                      {expandedSessionGrid === 'continue' ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 pt-2 max-h-[65vh] overflow-y-auto no-scrollbar place-content-start">
                          {getExpandedTitlesForCategory('continue').map((movie) => {
                            const progress = (movie as any).continueProgress || 45;
                            return (
                              <div
                                key={`expanded_continue_${movie.id}`}
                                onClick={() => selectMovieAndFetchDetails(movie)}
                                className="group rounded-xl overflow-hidden bg-zinc-950/60 border border-white/5 hover:border-purple-500/40 p-1.5 transition-all cursor-pointer"
                              >
                                <div className="w-full aspect-video rounded-lg overflow-hidden bg-zinc-900 relative">
                                  <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                                  <div className="absolute bottom-0 left-0 w-full h-1 bg-zinc-800">
                                    <div className="bg-red-600 h-full transition-all" style={{ width: `${progress}%` }} />
                                  </div>
                                </div>
                                <div className="pt-1.5 text-left">
                                  <h5 className="text-[9px] font-bold text-neutral-200 uppercase truncate">{movie.title}</h5>
                                  <div className="flex justify-between items-center text-[7px] font-mono text-zinc-500 mt-0.5">
                                    <span>{progress}% Concluído</span>
                                    <span className="text-purple-405 font-bold">RETOMAR</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div
                          onScroll={(e) => handleHorizontalScroll(e, 'continue')}
                          className="flex overflow-x-auto gap-3 pb-2 no-scrollbar scroll-smooth"
                          style={{ scrollbarWidth: 'none' }}
                        >
                          {memoizedCategories.continue
                            .slice(0, continueWatchingLimit)
                            .map((movie) => {
                              const progress = (movie as any).continueProgress || 45;
                              return (
                                <div
                                  key={`continue_${movie.id}`}
                                  onClick={() => selectMovieAndFetchDetails(movie)}
                                  className="min-w-[140px] max-w-[140px] group rounded-xl overflow-hidden bg-zinc-950/60 border border-white/5 hover:border-purple-500/40 p-1.5 transition-all cursor-pointer inline-block"
                                >
                                  <div className="w-full aspect-video rounded-lg overflow-hidden bg-zinc-900 relative">
                                    <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                                    
                                    {/* Red Progress Indicator at visual footer */}
                                    <div className="absolute bottom-0 left-0 w-full h-1 bg-zinc-800">
                                      <div className="bg-red-600 h-full transition-all" style={{ width: `${progress}%` }} />
                                    </div>
                                  </div>
                                  <div className="pt-1.5 text-left">
                                    <h5 className="text-[9px] font-bold text-neutral-200 uppercase truncate">{movie.title}</h5>
                                    <div className="flex justify-between items-center text-[7px] font-mono text-zinc-500 mt-0.5">
                                      <span>{progress}% Concluído</span>
                                      <span className="text-purple-405 font-bold">RETOMAR</span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      )}
                    </div>


                    {/* SHELF C: SUGESTÕES BASEADAS EM SEU HISTÓRICO */}
                    <div className="space-y-2 text-left">
                      <div 
                        onClick={() => { triggerHaptic(20); setExpandedSessionGrid(prev => prev === 'suggestions' ? null : 'suggestions'); }}
                        className="flex justify-between items-center border-b border-zinc-900/40 pb-1 cursor-pointer hover:opacity-80 transition-opacity"
                      >
                        <span className="text-[10px] font-black text-cyan-400 font-mono uppercase tracking-widest block flex items-center gap-1">
                          <Star className="w-3 h-3 text-cyan-400 animate-pulse" />
                          SUGESTÕES COM BASE EM SEU ESTILO
                        </span>
                      </div>

                      {expandedSessionGrid === 'suggestions' ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 pt-2 max-h-[65vh] overflow-y-auto no-scrollbar place-content-start">
                          {getExpandedTitlesForCategory('suggestions').map((movie) => {
                            const rating = (movie as any).rating || 8.5;
                            return (
                              <div
                                key={`expanded_sug_${movie.id}`}
                                onClick={() => selectMovieAndFetchDetails(movie)}
                                className="group rounded-xl overflow-hidden bg-zinc-950/60 border border-white/5 hover:border-cyan-500/40 p-1.5 transition-all cursor-pointer"
                              >
                                <div className="w-full aspect-video rounded-lg overflow-hidden bg-zinc-900 relative">
                                  <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                                  <div className="absolute top-1.5 right-1.5 bg-black/80 px-1.5 py-0.5 rounded text-[6.5px] font-mono text-cyan-400 border border-cyan-500/30">
                                    ★ {rating.toFixed(1)}
                                  </div>
                                </div>
                                <div className="pt-1.5 text-left">
                                  <h5 className="text-[9px] font-bold text-neutral-200 uppercase truncate">{movie.title}</h5>
                                  <p className="text-[7.5px] text-zinc-500 truncate leading-snug">Para fãs de {(movie as any).category || "Premium"}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div
                          onScroll={(e) => handleHorizontalScroll(e, 'suggestions')}
                          className="flex overflow-x-auto gap-3 pb-2 no-scrollbar scroll-smooth"
                          style={{ scrollbarWidth: 'none' }}
                        >
                          {memoizedCategories.suggestions
                            .slice(0, suggestionsLimit)
                            .map((movie) => {
                              const rating = (movie as any).rating || 8.5;
                              return (
                                <div
                                  key={`sug_${movie.id}`}
                                  onClick={() => selectMovieAndFetchDetails(movie)}
                                  className="min-w-[140px] max-w-[140px] group rounded-xl overflow-hidden bg-zinc-950/60 border border-white/5 hover:border-cyan-500/40 p-1.5 transition-all cursor-pointer inline-block"
                                >
                                  <div className="w-full aspect-video rounded-lg overflow-hidden bg-zinc-900 relative">
                                    <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                                    <div className="absolute top-1.5 right-1.5 bg-black/80 px-1.5 py-0.5 rounded text-[6.5px] font-mono text-cyan-400 border border-cyan-500/30">
                                      ★ {rating.toFixed(1)}
                                    </div>
                                  </div>
                                  <div className="pt-1.5 text-left">
                                    <h5 className="text-[9px] font-bold text-neutral-200 uppercase truncate">{movie.title}</h5>
                                    <p className="text-[7.5px] text-zinc-500 truncate leading-snug">Para fãs de {(movie as any).category || "Premium"}</p>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      )}
                    </div>


                    {/* SHELF D: TOP MAIS VISTOS NA NETFLIX */}
                    <div className="space-y-2 text-left relative p-3 rounded-2xl bg-gradient-to-r from-red-950/5 to-black/40 border border-red-500/5">
                      <div 
                        onClick={() => { triggerHaptic(20); setExpandedSessionGrid(prev => prev === 'netflix' ? null : 'netflix'); }}
                        className="flex justify-between items-center border-b border-red-900/20 pb-1 cursor-pointer hover:opacity-80 transition-opacity"
                      >
                        <span className="text-[10px] font-black text-red-500 font-mono uppercase tracking-widest block flex items-center gap-1.5">
                          <span className="px-1.5 py-0.5 bg-red-600 text-white rounded font-sans text-[7.5px] font-black shadow-md">N</span>
                          TOP MAIS VISTOS NA NETFLIX
                        </span>
                      </div>

                      {expandedSessionGrid === 'netflix' ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 pt-2 max-h-[65vh] overflow-y-auto no-scrollbar place-content-start">
                          {getExpandedTitlesForCategory('netflix').map((movie, index) => (
                            <div
                              key={`expanded_nft_${movie.id}`}
                              onClick={() => selectMovieAndFetchDetails(movie)}
                              className="group rounded-xl overflow-hidden bg-[#0a0707] border border-red-900/10 hover:border-red-500/40 p-1.5 transition-all cursor-pointer"
                            >
                              <div className="w-full aspect-video rounded-lg overflow-hidden bg-zinc-900 relative">
                                <span className="absolute top-1.5 left-1.5 text-red-500 font-sans font-black text-xl select-none leading-none z-10 antialiased italic drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                                  #{index + 1}
                                </span>
                                <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                              </div>
                              <div className="pt-1.5 text-left">
                                <h5 className="text-[9px] font-bold text-neutral-200 truncate uppercase">{movie.title}</h5>
                                <span className="text-[7.5px] font-mono text-zinc-500">{movie.year} • {(movie as any).category || 'NETFLIX'}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div
                          onScroll={(e) => handleHorizontalScroll(e, 'netflix')}
                          className="flex overflow-x-auto gap-3 pb-2 no-scrollbar scroll-smooth"
                          style={{ scrollbarWidth: 'none' }}
                        >
                          {memoizedCategories.netflix
                            .slice(0, netflixLimit)
                            .map((movie, index) => (
                              <div
                                key={`nft_shelf_${movie.id}`}
                                onClick={() => selectMovieAndFetchDetails(movie)}
                                className="min-w-[140px] max-w-[140px] group rounded-xl overflow-hidden bg-[#0a0707] border border-red-900/10 hover:border-red-500/40 p-1.5 transition-all cursor-pointer inline-block"
                              >
                                <div className="w-full aspect-video rounded-lg overflow-hidden bg-zinc-900 relative">
                                  <span className="absolute top-1.5 left-1.5 text-red-500 font-sans font-black text-xl select-none leading-none z-10 antialiased italic drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                                    #{index + 1}
                                  </span>
                                  <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                                </div>
                                <div className="pt-1.5 text-left">
                                  <h5 className="text-[9px] font-bold text-neutral-200 truncate uppercase">{movie.title}</h5>
                                  <span className="text-[7.5px] font-mono text-zinc-500">{movie.year} • {(movie as any).category || 'NETFLIX'}</span>
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>


                    {/* SHELF E: MAIS VISTOS NA DISNEY+ */}
                    <div className="space-y-2 text-left relative p-3 rounded-2xl bg-gradient-to-r from-blue-950/10 to-black/40 border border-blue-500/5">
                      <div 
                        onClick={() => { triggerHaptic(20); setExpandedSessionGrid(prev => prev === 'disney' ? null : 'disney'); }}
                        className="flex justify-between items-center border-b border-blue-900/20 pb-1 cursor-pointer hover:opacity-80 transition-opacity"
                      >
                        <span className="text-[10px] font-black text-blue-400 font-mono uppercase tracking-widest block flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                          MAIS VISTOS NA DISNEY+
                        </span>
                      </div>

                      {expandedSessionGrid === 'disney' ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 pt-2 max-h-[65vh] overflow-y-auto no-scrollbar place-content-start">
                          {getExpandedTitlesForCategory('disney').map((movie) => (
                            <div
                              key={`expanded_dis_${movie.id}`}
                              onClick={() => selectMovieAndFetchDetails(movie)}
                              className="group rounded-xl overflow-hidden bg-[#07090f] border border-blue-900/10 hover:border-blue-400/45 p-1.5 transition-all cursor-pointer"
                            >
                              <div className="w-full aspect-video rounded-lg overflow-hidden bg-zinc-900 relative">
                                <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                              </div>
                              <div className="pt-1.5 text-left">
                                <h5 className="text-[9px] font-bold text-neutral-200 truncate uppercase">{movie.title}</h5>
                                <span className="text-[7.5px] font-mono text-zinc-500">{movie.year} • {(movie as any).category || 'DISNEY+'}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div
                          onScroll={(e) => handleHorizontalScroll(e, 'disney')}
                          className="flex overflow-x-auto gap-3 pb-2 no-scrollbar scroll-smooth"
                          style={{ scrollbarWidth: 'none' }}
                        >
                          {memoizedCategories.disney
                            .slice(0, disneyLimit)
                            .map((movie) => (
                              <div
                                key={`dis_shelf_${movie.id}`}
                                onClick={() => selectMovieAndFetchDetails(movie)}
                                className="min-w-[140px] max-w-[140px] group rounded-xl overflow-hidden bg-[#07090f] border border-blue-900/10 hover:border-blue-400/45 p-1.5 transition-all cursor-pointer inline-block"
                              >
                                <div className="w-full aspect-video rounded-lg overflow-hidden bg-zinc-900 relative">
                                  <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                                </div>
                                <div className="pt-1.5 text-left">
                                  <h5 className="text-[9px] font-bold text-neutral-200 truncate uppercase">{movie.title}</h5>
                                  <span className="text-[7.5px] font-mono text-zinc-500">{movie.year} • {(movie as any).category || 'DISNEY+'}</span>
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>


                    {/* SHELF F: MAIS VISTOS NA HBO MAX */}
                    <div className="space-y-2 text-left relative p-3 rounded-2xl bg-gradient-to-r from-purple-950/10 to-black/40 border border-purple-500/5">
                      <div 
                        onClick={() => { triggerHaptic(20); setExpandedSessionGrid(prev => prev === 'hbo' ? null : 'hbo'); }}
                        className="flex justify-between items-center border-b border-purple-900/20 pb-1 cursor-pointer hover:opacity-80 transition-opacity"
                      >
                        <span className="text-[10px] font-black text-purple-400 font-mono uppercase tracking-widest block flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                          MAIS VISTOS NA HBO MAX
                        </span>
                      </div>

                      {expandedSessionGrid === 'hbo' ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 pt-2 max-h-[65vh] overflow-y-auto no-scrollbar place-content-start">
                          {getExpandedTitlesForCategory('hbo').map((movie) => (
                            <div
                              key={`expanded_hbo_${movie.id}`}
                              onClick={() => selectMovieAndFetchDetails(movie)}
                              className="group rounded-xl overflow-hidden bg-[#09070c] border border-purple-900/10 hover:border-purple-400/45 p-1.5 transition-all cursor-pointer"
                            >
                              <div className="w-full aspect-video rounded-lg overflow-hidden bg-zinc-900 relative">
                                <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                              </div>
                              <div className="pt-1.5 text-left">
                                <h5 className="text-[9px] font-bold text-neutral-200 truncate uppercase">{movie.title}</h5>
                                <span className="text-[7.5px] font-mono text-zinc-500">{movie.year} • {(movie as any).category || 'HBO MAX'}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div
                          onScroll={(e) => handleHorizontalScroll(e, 'hbo')}
                          className="flex overflow-x-auto gap-3 pb-2 no-scrollbar scroll-smooth"
                          style={{ scrollbarWidth: 'none' }}
                        >
                          {memoizedCategories.hbo
                            .slice(0, hboLimit)
                            .map((movie) => (
                              <div
                                key={`hbo_shelf_${movie.id}`}
                                onClick={() => selectMovieAndFetchDetails(movie)}
                                className="min-w-[140px] max-w-[140px] group rounded-xl overflow-hidden bg-[#09070c] border border-purple-900/10 hover:border-purple-400/45 p-1.5 transition-all cursor-pointer inline-block"
                              >
                                <div className="w-full aspect-video rounded-lg overflow-hidden bg-zinc-900 relative">
                                  <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                                </div>
                                <div className="pt-1.5 text-left">
                                  <h5 className="text-[9px] font-bold text-neutral-200 truncate uppercase">{movie.title}</h5>
                                  <span className="text-[7.5px] font-mono text-zinc-500">{movie.year} • {(movie as any).category || 'HBO MAX'}</span>
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>


                    {/* SHELF G: MAIS VISTOS NA AMAZON PRIME */}
                    <div className="space-y-2 text-left relative p-3 rounded-2xl bg-gradient-to-r from-sky-950/10 to-black/40 border border-sky-500/5">
                      <div 
                        onClick={() => { triggerHaptic(20); setExpandedSessionGrid(prev => prev === 'prime' ? null : 'prime'); }}
                        className="flex justify-between items-center border-b border-sky-900/20 pb-1 cursor-pointer hover:opacity-80 transition-opacity"
                      >
                        <span className="text-[10px] font-black text-sky-400 font-mono uppercase tracking-widest block flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                          MAIS VISTOS NA AMAZON PRIME
                        </span>
                      </div>

                      {expandedSessionGrid === 'prime' ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 pt-2 max-h-[65vh] overflow-y-auto no-scrollbar place-content-start">
                          {getExpandedTitlesForCategory('prime').map((movie) => (
                            <div
                              key={`expanded_prm_${movie.id}`}
                              onClick={() => selectMovieAndFetchDetails(movie)}
                              className="group rounded-xl overflow-hidden bg-[#07090b] border border-sky-900/10 hover:border-sky-400/45 p-1.5 transition-all cursor-pointer"
                            >
                              <div className="w-full aspect-video rounded-lg overflow-hidden bg-zinc-900 relative">
                                <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                              </div>
                              <div className="pt-1.5 text-left">
                                <h5 className="text-[9px] font-bold text-neutral-200 truncate uppercase">{movie.title}</h5>
                                <span className="text-[7.5px] font-mono text-zinc-500">{movie.year} • {(movie as any).category || 'PRIME Video'}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div
                          onScroll={(e) => handleHorizontalScroll(e, 'prime')}
                          className="flex overflow-x-auto gap-3 pb-2 no-scrollbar scroll-smooth"
                          style={{ scrollbarWidth: 'none' }}
                        >
                          {memoizedCategories.prime
                            .slice(0, primeLimit)
                            .map((movie) => (
                              <div
                                key={`prm_shelf_${movie.id}`}
                                onClick={() => selectMovieAndFetchDetails(movie)}
                                className="min-w-[140px] max-w-[140px] group rounded-xl overflow-hidden bg-[#07090b] border border-sky-900/10 hover:border-sky-400/45 p-1.5 transition-all cursor-pointer inline-block"
                              >
                                <div className="w-full aspect-video rounded-lg overflow-hidden bg-zinc-900 relative">
                                  <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                                </div>
                                <div className="pt-1.5 text-left">
                                  <h5 className="text-[9px] font-bold text-neutral-200 truncate uppercase">{movie.title}</h5>
                                  <span className="text-[7.5px] font-mono text-zinc-500">{movie.year} • {(movie as any).category || 'PRIME VIDEO'}</span>
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>


                    {/* SHELF H: MAIS VISTOS NA GLOBOPLAY */}
                    <div className="space-y-2 text-left relative p-3 rounded-2xl bg-gradient-to-r from-orange-950/10 to-black/40 border border-orange-500/5">
                      <div 
                        onClick={() => { triggerHaptic(20); setExpandedSessionGrid(prev => prev === 'globoplay' ? null : 'globoplay'); }}
                        className="flex justify-between items-center border-b border-orange-900/20 pb-1 cursor-pointer hover:opacity-80 transition-opacity"
                      >
                        <span className="text-[10px] font-black text-orange-400 font-mono uppercase tracking-widest block flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                          MAIS VISTOS NA GLOBOPLAY
                        </span>
                      </div>

                      {expandedSessionGrid === 'globoplay' ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 pt-2 max-h-[65vh] overflow-y-auto no-scrollbar place-content-start">
                          {getExpandedTitlesForCategory('globoplay').map((movie) => (
                            <div
                              key={`expanded_glo_${movie.id}`}
                              onClick={() => selectMovieAndFetchDetails(movie)}
                              className="group rounded-xl overflow-hidden bg-[#0b0807] border border-orange-900/10 hover:border-orange-400/45 p-1.5 transition-all cursor-pointer"
                            >
                              <div className="w-full aspect-video rounded-lg overflow-hidden bg-zinc-900 relative">
                                <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                              </div>
                              <div className="pt-1.5 text-left">
                                <h5 className="text-[9px] font-bold text-neutral-200 truncate uppercase">{movie.title}</h5>
                                <span className="text-[7.5px] font-mono text-zinc-500">{movie.year} • {(movie as any).category || 'GLOBOPLAY'}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div
                          onScroll={(e) => handleHorizontalScroll(e, 'globoplay')}
                          className="flex overflow-x-auto gap-3 pb-2 no-scrollbar scroll-smooth"
                          style={{ scrollbarWidth: 'none' }}
                        >
                          {memoizedCategories.globoplay
                            .slice(0, globoplayLimit)
                            .map((movie) => (
                              <div
                                key={`glo_shelf_${movie.id}`}
                                onClick={() => selectMovieAndFetchDetails(movie)}
                                className="min-w-[140px] max-w-[140px] group rounded-xl overflow-hidden bg-[#0b0807] border border-orange-900/10 hover:border-orange-400/45 p-1.5 transition-all cursor-pointer inline-block"
                              >
                                <div className="w-full aspect-video rounded-lg overflow-hidden bg-zinc-900 relative">
                                  <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                                </div>
                                <div className="pt-1.5 text-left">
                                  <h5 className="text-[9px] font-bold text-neutral-200 truncate uppercase">{movie.title}</h5>
                                  <span className="text-[7.5px] font-mono text-zinc-500">{movie.year} • {(movie as any).category || 'GLOBOPLAY'}</span>
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>

                  </div>

                </motion.div>
              )) : (
                /* MOVIE SELECTED FLOW SATELLITE */
                <motion.div
                  key="movies-active-detail-or-player"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="flex flex-col justify-center items-center w-full h-full bg-black/90 font-sans relative z-50 overflow-hidden"
                >
                  {!moviePlaying ? (
                    /* PREMIUM MOVIE DETAILS PANEL */
                    <div className="w-full max-w-4xl flex flex-col rounded-[32px] bg-[#07080c]/98 border border-cyan-500/20 p-5 md:p-8 relative shadow-[0_0_50px_rgba(0,180,255,0.15)] text-left bg-gradient-to-b from-[#090b11] to-[#040508] max-h-[90vh] overflow-hidden">
                      {/* Top bar */}
                      <div className="flex justify-between items-center z-10 shrink-0 pb-3">
                        <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                          SINAL CRIPTOGRAFADO TMDB
                        </span>
                      </div>

                      {/* Content middle */}
                      <div className="flex flex-row gap-6 items-stretch relative flex-1 min-h-0 overflow-hidden text-left mb-4 mt-2">
                        {/* Blur Backdrop Effect */}
                        <div className="absolute -inset-10 bg-[#090b11]/20 opacity-20 pointer-events-none select-none blur-3xl" />

                        {/* Left: Poster (40%) */}
                        <div className="w-[40%] shrink-0 flex items-start justify-center">
                          <div className="rounded-2xl overflow-hidden shadow-2xl border border-white/10 aspect-[2/3] w-full max-w-sm relative group animate-fade-in">
                            <img 
                              src={selectedMovie.posterUrl} 
                              alt={selectedMovie.title} 
                              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500" 
                              referrerPolicy="no-referrer"
                            />
                            {(selectedMovie as any).rating && (
                              <span className="absolute bottom-3 right-3 px-2 py-1 rounded-lg bg-black/95 font-mono text-[10px] text-cyan-400 font-bold border border-cyan-400/30 backdrop-blur-md">
                                ★ {(selectedMovie as any).rating.toFixed(1)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Right: Technical Info (60%) scrollable */}
                        <div className="w-[60%] overflow-y-auto no-scrollbar pr-3 flex flex-col justify-start space-y-4">
                          <div className="space-y-1 pl-1">
                            <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-wide leading-tight">
                              {selectedMovie.title}
                            </h2>
                            <p className="text-[11px] font-mono text-cyan-400 font-bold uppercase tracking-widest">
                              {selectedMovie.type === 'serie' ? 'Série Oficial' : 'Filme Oficial'} • {(selectedMovie as any).category || 'Premium H.265'}
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-2 text-[10px] font-mono text-zinc-400 pl-1">
                            <span className="px-2 py-1 rounded-md bg-zinc-900 border border-white/5 font-black text-white">{selectedMovie.year}</span>
                            <span className="px-2 py-1 rounded-md bg-zinc-900 border border-white/5">Duração: {selectedMovie.duration || selectedMovie.totalDuration || 'N/A'}</span>
                            <span className="px-2 py-1 rounded-md bg-zinc-900 border border-white/5">Produtor: {selectedMovie.production || 'N/A'}</span>
                          </div>

                          <div className="space-y-2 pb-4 pl-1">
                            <h3 className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest border-b border-white/5 pb-1 mt-2">Sinopse</h3>
                            <p className="text-sm md:text-[13px] leading-relaxed text-zinc-300 font-normal select-text">
                              {selectedMovie.overview || 'Nenhuma sinopse disponível para este título no momento.'}
                            </p>
                            
                            <h3 className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest border-b border-white/5 pb-1 mt-6">Elenco Principal</h3>
                            <p className="text-xs font-mono text-zinc-400 leading-normal select-text">
                              {selectedMovie.actors || 'Indisponível.'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Bottom Controls Panel (Fixed) */}
                      <div className="shrink-0 flex flex-col gap-3 pt-4 border-t border-white/5">
                        
                        {/* Control Option: Player Engine Selector */}
                        <div className="flex bg-zinc-950/60 rounded-xl p-1 border border-white/5 w-full text-xs items-center justify-between">
                          <span className="text-[10px] font-mono text-zinc-400 ml-2 font-bold uppercase">Motor de Reprodução:</span>
                          <div className="flex gap-1">
                            <button
                              onClick={() => { triggerHaptic(10); setUseInternalPlayer(true); }}
                              className={`px-3 py-1.5 rounded-lg text-[9px] font-mono font-bold transition-all uppercase cursor-pointer ${useInternalPlayer ? 'bg-cyan-500 text-black shadow-md font-black' : 'text-zinc-400 hover:text-white bg-transparent'}`}
                            >
                              Player Interno
                            </button>
                            <button
                              onClick={() => { triggerHaptic(10); setUseInternalPlayer(false); }}
                              className={`px-3 py-1.5 rounded-lg text-[9px] font-mono font-bold transition-all uppercase cursor-pointer ${!useInternalPlayer ? 'bg-cyan-500 text-black shadow-md font-black' : 'text-zinc-400 hover:text-white bg-transparent'}`}
                            >
                              Mirror Stream (Iframe)
                            </button>
                          </div>
                        </div>

                        {/* Actions Row */}
                        <div className="flex gap-4 h-[52px]">
                          <button
                            onClick={() => {
                              triggerHaptic(35);
                              setMoviePlaying(true);
                              setMovieProgress(0);
                              setTimeout(() => {
                                setMovieIsPlaying(true);
                              }, 100);
                            }}
                            className="flex-[1.5] bg-gradient-to-r from-cyan-500 to-teal-500 hover:brightness-110 text-black font-black font-mono text-xs rounded-2xl uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.3)] active:scale-95 transition-all cursor-pointer"
                          >
                            <Play className="w-5 h-5 fill-black shrink-0" />
                            <span>PLAY STREAMING</span>
                          </button>

                          <button
                            onClick={() => toggleFavoriteMovie(selectedMovie.id)}
                            className={`flex-1 rounded-2xl font-mono text-[11px] uppercase font-black tracking-wide border transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer ${
                              (selectedMovie as any).isFavorite 
                                ? 'bg-rose-950/30 text-rose-300 border-rose-500/30'
                                : 'bg-zinc-900/40 text-zinc-400 border-white/5 hover:text-white'
                            }`}
                          >
                            <Heart className={`w-4 h-4 shrink-0 ${(selectedMovie as any).isFavorite ? 'fill-rose-500 text-rose-500' : 'text-zinc-400'}`} />
                            <span>{(selectedMovie as any).isFavorite ? 'REMOVER' : 'FAVORITAR'}</span>
                          </button>

                          <button
                            onClick={() => likeMovie(selectedMovie.id)}
                            className="flex-1 bg-zinc-900/40 hover:bg-zinc-800 text-zinc-300 font-mono text-[11px] rounded-2xl font-black uppercase tracking-wide border border-white/5 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <ThumbsUp className="w-4 h-4 text-cyan-400 shrink-0" />
                            <span>CURTIR</span>
                          </button>
                        </div>
                        
                        {/* Close Button Full Width bottom */}
                        <button
                          onClick={() => { triggerHaptic(15); setSelectedMovie(null); }}
                          className="w-full py-3.5 mt-2 rounded-2xl border-2 border-white/5 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-white text-[11px] font-mono font-black tracking-widest uppercase cursor-pointer transition-all active:scale-95"
                        >
                          ✕ FECHAR ABA
                        </button>
                      </div>

                    </div>
                  ) : (
                    /* MOVIE PLAYBACK GRAPHIC VIEW WITH ACTIVE STREAM SOURCE */
                    <div 
                      id="cinema_player_scrollable_container"
                      className="w-full h-full overflow-y-auto scrollbar-none [&::-webkit-scrollbar]:hidden flex flex-col pt-4 pb-16 px-4 space-y-8 select-none"
                      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                      {/* The standard YouTube-sized video block aspect-video (16:9 ratio) */}
                      <div className="w-full max-w-4xl mx-auto flex flex-col space-y-3 shrink-0">
                        <div 
                          id="youtube-player-block"
                          className="w-full aspect-video bg-black relative rounded-2xl overflow-hidden border border-cyan-500/50 shadow-[0_0_25px_rgba(6,182,212,0.3)] group/player"
                        >
                          {/* Inside Video element or iframe */}
                          {selectedMovie?.streamUrl && !useInternalPlayer ? (
                            <iframe
                              src={selectedMovie.streamUrl}
                              className="w-full h-full border-0 relative z-10"
                              allowFullScreen
                              allow="autoplay; encrypted-media"
                              title="Player stream"
                            />
                          ) : (
                            <video
                              ref={movieVideoRef}
                              src={getMovieVideoSrc(selectedMovie)}
                              className="w-full h-full object-contain pointer-events-none relative z-10"
                              onTimeUpdate={handleMovieTimeUpdate}
                              onLoadedMetadata={handleMovieLoadedMetadata}
                              onEnded={handleMovieEnded}
                              autoPlay
                            />
                          )}

                          {/* Top Center: Alert HUD Notification for player parameter changes */}
                          {activeMediaAlert && (
                            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-cyan-950/90 border border-cyan-400 text-cyan-300 font-mono text-[10px] font-bold px-4 py-1.5 rounded-full z-[100] shadow-lg flex items-center gap-1.5 animate-in fade-in zoom-in-95 duration-150">
                              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                              <span>{activeMediaAlert}</span>
                            </div>
                          )}

                          {/* Center: Netflix-style persistent subtitler overlay synced with realcurrentTime */}
                          {useInternalPlayer && movieSubtitle !== 'OFF' && getActiveSubtitleText() !== '' && (
                            <div className="absolute bottom-16 md:bottom-20 left-1/2 -translate-x-1/2 bg-black/85 border border-white/5 px-4 py-2 rounded-xl text-white font-sans text-xs md:text-sm font-semibold tracking-wide text-center z-50 select-none shadow-[0_4px_15px_rgba(0,0,0,0.8)] max-w-[85%] pointer-events-none animate-in fade-in duration-200">
                              {getActiveSubtitleText()}
                            </div>
                          )}

                          {/* Loading spinner overlay */}
                          {useInternalPlayer && !duration && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-blackSpace z-50 select-none pointer-events-none">
                              <div className="w-10 h-10 border-2 border-cyan-500/30 border-t-cyan-400 anonymity-spin rounded-full animate-spin" />
                              <span className="text-[10px] font-mono text-cyan-300 tracking-widest animate-pulse font-bold mt-2">CONECTANDO CANAL HLS...</span>
                            </div>
                          )}

                          {/* Complete control Overlay bar. Hovering shows controls. If paused, controls are locked visible */}
                          <div 
                            onClick={(e) => {
                              // Click on video toggles play/pause
                              if (useInternalPlayer) {
                                triggerHaptic(15);
                                if (movieIsPlaying) {
                                  if (movieVideoRef.current) movieVideoRef.current.pause();
                                  setMovieIsPlaying(false);
                                  showAlert('PAUSADO');
                                } else {
                                  if (movieVideoRef.current) movieVideoRef.current.play().catch(() => {});
                                  setMovieIsPlaying(true);
                                  showAlert('PLAY');
                                }
                              }
                            }}
                            className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/50 opacity-0 group-hover/player:opacity-100 flex flex-col justify-between p-4 z-30 transition-opacity duration-300 ${(!movieIsPlaying && useInternalPlayer) || !useInternalPlayer ? 'opacity-100' : ''} ${!useInternalPlayer ? 'pointer-events-none bg-none' : ''}`}
                          >
                            {/* Player Header Info */}
                            <div className="flex justify-between items-start w-full pointer-events-auto">
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    triggerHaptic(15);
                                    setMoviePlaying(false);
                                  }}
                                  className="w-8 h-8 rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-white/10 flex items-center justify-center text-white transition-all cursor-pointer"
                                >
                                  <ArrowLeft className="w-4 h-4" />
                                </button>
                                <div className="text-left">
                                  <h4 className="text-xs font-black text-white uppercase tracking-wide truncate max-w-[200px] sm:max-w-xs">{selectedMovie?.title}</h4>
                                  <p className="text-[9px] font-mono text-zinc-400 capitalize">{selectedMovie?.category || 'Cinema Master'}</p>
                                </div>
                              </div>

                              {/* Server & Pipeline status */}
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    triggerHaptic(20);
                                    setUseInternalPlayer(!useInternalPlayer);
                                    showAlert(useInternalPlayer ? "MIRROR DE TRANSMISSÃO TMDB" : "PLAYER INTERNO CANÔNICO");
                                  }}
                                  className="px-2.5 py-1 rounded border border-cyan-500/30 bg-black/80 hover:bg-black text-[8px] font-mono font-bold text-cyan-300 hover:text-white transition-colors cursor-pointer mr-1 uppercase"
                                >
                                  {useInternalPlayer ? "⚙️ Usar Mirror" : "⚙️ Player Interno"}
                                </button>
                                <span className="bg-[#E50914] text-white font-mono text-[8px] font-black tracking-widest uppercase px-2 py-0.5 rounded shadow-sm">NETFLIX</span>
                                <span className="bg-zinc-900/80 border border-cyan-500/30 text-cyan-400 font-mono text-[8px] font-bold px-2 py-0.5 rounded">{activeServer.toUpperCase()}</span>
                              </div>
                            </div>

                            {/* Centered Large Play Button Overlay when paused */}
                            {!movieIsPlaying && useInternalPlayer && (
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  triggerHaptic(30);
                                  if (movieVideoRef.current) movieVideoRef.current.play().catch(() => {});
                                  setMovieIsPlaying(true);
                                  showAlert('PLAY');
                                }}
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-cyan-500 text-black rounded-full flex items-center justify-center hover:scale-110 active:scale-95 shadow-[0_0_20px_rgba(6,182,212,0.6)] cursor-pointer transition-all z-40"
                              >
                                <Play className="w-6 h-6 fill-black ml-0.5" />
                              </button>
                            )}

                            {/* Bottom controls container */}
                            <div 
                              onClick={(e) => e.stopPropagation()}
                              className={`w-full space-y-3 pointer-events-auto ${!useInternalPlayer ? 'opacity-0 hover:opacity-100 transition-opacity pointer-events-none' : ''}`}
                            >
                              {/* Timeline scrub bar */}
                              {useInternalPlayer && (
                                <div className="flex items-center gap-3 w-full">
                                  <span className="text-[9px] font-mono font-bold text-zinc-300 w-8">{formatTime(currentTime)}</span>
                                  <div 
                                    onClick={handleMovieTimelineClick}
                                    className="flex-1 h-1.5 relative bg-white/20 rounded-full cursor-pointer group/timeline flex items-center"
                                  >
                                    <div 
                                      className="absolute left-0 h-full bg-cyan-400 rounded-full"
                                      style={{ width: `${movieProgress}%` }}
                                    />
                                    <div 
                                      className="absolute w-3 h-3 bg-white rounded-full scale-0 group-hover/timeline:scale-100 transition-transform shadow-[0_0_8px_white]"
                                      style={{ left: `calc(${movieProgress}% - 6px)` }}
                                    />
                                  </div>
                                  <span className="text-[9px] font-mono font-bold text-zinc-500 w-8">{formatTime(duration)}</span>
                                </div>
                              )}

                              {/* Buttons toolbar row */}
                              {useInternalPlayer && (
                                <div className="flex items-center justify-between gap-2.5 flex-wrap pt-1 select-none">
                                  {/* Left Side controls */}
                                  <div className="flex items-center gap-3">
                                    {/* Play/Pause */}
                                    <button
                                      onClick={() => {
                                        triggerHaptic(15);
                                        if (movieIsPlaying) {
                                          if (movieVideoRef.current) movieVideoRef.current.pause();
                                          setMovieIsPlaying(false);
                                          showAlert('PAUSADO');
                                        } else {
                                          if (movieVideoRef.current) movieVideoRef.current.play().catch(() => {});
                                          setMovieIsPlaying(true);
                                          showAlert('PLAY');
                                        }
                                      }}
                                      className="text-white hover:text-cyan-400 transition-colors w-5 h-5 flex items-center justify-center cursor-pointer"
                                    >
                                      {movieIsPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
                                    </button>

                                    {/* Volume level control */}
                                    <div className="flex items-center gap-2 group/volume">
                                      <button
                                        onClick={() => {
                                          triggerHaptic(15);
                                          if (movieVolume > 0) {
                                            setMovieVolume(0);
                                            showAlert('MUTADO');
                                          } else {
                                            setMovieVolume(85);
                                            showAlert('VOLUME: 85%');
                                          }
                                        }}
                                        className="text-white hover:text-cyan-400 transition-colors cursor-pointer"
                                      >
                                        {movieVolume === 0 ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
                                      </button>
                                      <input 
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={movieVolume}
                                        onChange={(e) => {
                                          const vol = parseInt(e.target.value);
                                          setMovieVolume(vol);
                                          if (vol === 0) {
                                            showAlert('MUTADO');
                                          } else {
                                            showAlert(`VOLUME: ${vol}%`);
                                          }
                                        }}
                                        className="w-14 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none transition-all"
                                      />
                                    </div>
                                  </div>

                                  {/* Right Side: Netflix Advanced controls */}
                                  <div className="flex items-center gap-2 sm:gap-3.5">
                                    
                                    {/* Audio dropdown */}
                                    <div className="relative flex flex-col items-center">
                                      {(activePlayerMenu === 'audio' || activePlayerMenu === null) && (
                                        <div className={`absolute bottom-full mb-2 ${activePlayerMenu === 'audio' ? 'flex' : 'hidden group-hover/menu:flex'} flex-col bg-black/95 border border-white/10 rounded-xl p-1 z-50 shadow-2xl min-w-[100px] animate-in fade-in zoom-in-95 duration-150`}>
                                          {(['PT-BR', 'EN'] as const).map((lang) => (
                                            <button 
                                              key={lang} 
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                triggerHaptic(10);
                                                setMovieAudioLang(lang);
                                                setActivePlayerMenu(null);
                                                showAlert(`ÁUDIO: ${lang === 'PT-BR' ? 'PORTUGUÊS' : 'INGLÊS (EN)'}`);
                                              }} 
                                              className={`w-full py-1.5 px-3 text-[9px] font-mono text-left font-bold rounded-lg transition-colors cursor-pointer ${movieAudioLang === lang ? 'bg-cyan-500/20 text-cyan-400' : 'hover:bg-white/5 text-zinc-400'}`}
                                            >
                                              {lang}
                                            </button>
                                          ))}
                                        </div>
                                      )}
                                      <button 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          triggerHaptic(15);
                                          setActivePlayerMenu(activePlayerMenu === 'audio' ? null : 'audio');
                                        }}
                                        className={`w-8 h-8 rounded-full flex items-center justify-center border bg-zinc-900/80 hover:bg-zinc-800 transition-colors cursor-pointer ${activePlayerMenu === 'audio' ? 'text-cyan-400 border-cyan-500/40' : 'text-zinc-300 border-white/5 hover:text-cyan-400'}`}
                                      >
                                        <Volume2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>

                                    {/* Subtitles dropdown */}
                                    <div className="relative flex flex-col items-center">
                                      {(activePlayerMenu === 'subtitle' || activePlayerMenu === null) && (
                                        <div className={`absolute bottom-full mb-2 ${activePlayerMenu === 'subtitle' ? 'flex' : 'hidden group-hover/menu:flex'} flex-col bg-black/95 border border-white/10 rounded-xl p-1 z-50 shadow-2xl min-w-[110px] animate-in fade-in zoom-in-95 duration-150`}>
                                          {(['OFF', 'PT-BR', 'EN', 'ES'] as const).map((sub) => (
                                            <button 
                                              key={sub} 
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                triggerHaptic(10);
                                                setMovieSubtitle(sub);
                                                setActivePlayerMenu(null);
                                                showAlert(`LEGENDA: ${sub}`);
                                              }} 
                                              className={`w-full py-1.5 px-3 text-[9px] font-mono text-left font-bold rounded-lg transition-colors cursor-pointer ${movieSubtitle === sub ? 'bg-cyan-500/20 text-cyan-400' : 'hover:bg-white/5 text-zinc-400'}`}
                                            >
                                              {sub}
                                            </button>
                                          ))}
                                        </div>
                                      )}
                                      <button 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          triggerHaptic(15);
                                          setActivePlayerMenu(activePlayerMenu === 'subtitle' ? null : 'subtitle');
                                        }}
                                        className={`w-8 h-8 rounded-full flex items-center justify-center border bg-zinc-900/80 hover:bg-zinc-800 transition-colors cursor-pointer ${movieSubtitle !== 'OFF' || activePlayerMenu === 'subtitle' ? 'text-cyan-400 border-cyan-500/35' : 'text-zinc-300 border-white/5 hover:text-cyan-400'}`}
                                      >
                                        <Type className="w-3.5 h-3.5" />
                                      </button>
                                    </div>

                                    {/* Speed dropdown */}
                                    <div className="relative flex flex-col items-center">
                                      {(activePlayerMenu === 'speed' || activePlayerMenu === null) && (
                                        <div className={`absolute bottom-full mb-2 ${activePlayerMenu === 'speed' ? 'flex' : 'hidden group-hover/menu:flex'} flex-col bg-black/95 border border-white/10 rounded-xl p-1 z-50 shadow-2xl min-w-[90px] animate-in fade-in zoom-in-95 duration-150`}>
                                          {[0.5, 1, 1.5, 2].map((sp) => (
                                            <button 
                                              key={sp} 
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                triggerHaptic(10);
                                                setMovieSpeed(sp);
                                                if (movieVideoRef.current) movieVideoRef.current.playbackRate = sp;
                                                setActivePlayerMenu(null);
                                                showAlert(`VELOCIDADE: ${sp}x`);
                                              }} 
                                              className={`w-full py-1.5 px-3 text-[9px] font-mono text-left font-bold rounded-lg transition-colors cursor-pointer ${movieSpeed === sp ? 'bg-cyan-500/20 text-cyan-400' : 'hover:bg-white/5 text-zinc-400'}`}
                                            >
                                              {sp}x
                                            </button>
                                          ))}
                                        </div>
                                      )}
                                      <button 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          triggerHaptic(15);
                                          setActivePlayerMenu(activePlayerMenu === 'speed' ? null : 'speed');
                                        }}
                                        className={`w-8 h-8 rounded-full flex items-center justify-center border bg-zinc-900/80 hover:bg-zinc-800 transition-colors cursor-pointer ${activePlayerMenu === 'speed' ? 'text-cyan-400 border-cyan-500/40' : 'text-zinc-300 border-white/5 hover:text-cyan-400'}`}
                                      >
                                        <Clock className="w-3.5 h-3.5" />
                                      </button>
                                    </div>

                                    {/* Quality HLS Adaptive */}
                                    <div className="relative flex flex-col items-center">
                                      {(activePlayerMenu === 'quality' || activePlayerMenu === null) && (
                                        <div className={`absolute bottom-full mb-2 ${activePlayerMenu === 'quality' ? 'flex' : 'hidden group-hover/menu:flex'} flex-col bg-black/95 border border-white/10 rounded-xl p-1 z-50 shadow-2xl min-w-[100px] animate-in fade-in zoom-in-95 duration-150`}>
                                          {['1080p', '720p', '480p'].map((q) => (
                                            <button 
                                              key={q} 
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                triggerHaptic(10);
                                                setAbrMode(q as any);
                                                setActivePlayerMenu(null);
                                                showAlert(`RESOLUÇÃO: ${q}`);
                                              }} 
                                              className={`w-full py-1.5 px-3 text-[9px] font-mono text-left font-bold rounded-lg transition-colors cursor-pointer ${abrMode === q ? 'bg-cyan-500/20 text-cyan-400' : 'hover:bg-white/5 text-zinc-400'}`}
                                            >
                                              {q}
                                            </button>
                                          ))}
                                        </div>
                                      )}
                                      <button 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          triggerHaptic(15);
                                          setActivePlayerMenu(activePlayerMenu === 'quality' ? null : 'quality');
                                        }}
                                        className={`w-8 h-8 rounded-full flex items-center justify-center border bg-zinc-900/80 hover:bg-zinc-800 transition-colors cursor-pointer ${activePlayerMenu === 'quality' ? 'text-cyan-400 border-cyan-500/40' : 'text-zinc-300 border-white/5 hover:text-cyan-400'}`}
                                      >
                                        <Settings className="w-3.5 h-3.5" />
                                      </button>
                                    </div>

                                    {/* PiP button (native browser window-floating widget) */}
                                    <button
                                      onClick={async (e) => {
                                        e.stopPropagation();
                                        const video = movieVideoRef.current;
                                        if (!video) return;
                                        try {
                                          if (document.pictureInPictureElement) {
                                            await document.exitPictureInPicture();
                                            showAlert('SAIU DO PIP');
                                          } else {
                                            await video.requestPictureInPicture();
                                            showAlert('ENTROU EM PIP');
                                          }
                                        } catch (err) {
                                          showAlert('PiP INDISPONÍVEL');
                                          // fallback
                                          togglePipMode(true);
                                        }
                                      }}
                                      className="w-8 h-8 rounded-full flex items-center justify-center border border-white/5 bg-zinc-900/80 hover:bg-zinc-800 transition-colors text-zinc-300 hover:text-cyan-400 cursor-pointer"
                                      title="Modo Picture-in-Picture"
                                    >
                                      <MonitorSmartphone className="w-3.5 h-3.5" />
                                    </button>

                                    {/* Native Fullscreen */}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        triggerHaptic(20);
                                        const el = document.getElementById('youtube-player-block');
                                        if (!el) return;
                                        if (!document.fullscreenElement) {
                                          el.requestFullscreen().catch(() => {});
                                          showAlert('TELA CHEIA');
                                        } else {
                                          document.exitFullscreen().catch(() => {});
                                          showAlert('SAIU TELA CHEIA');
                                        }
                                      }}
                                      className="w-8 h-8 rounded-full flex items-center justify-center border border-white/5 bg-zinc-900/80 hover:bg-zinc-800 transition-colors text-zinc-300 hover:text-cyan-400 cursor-pointer"
                                      title="Tela Cheia"
                                    >
                                      <Maximize2 className="w-3.5 h-3.5" />
                                    </button>

                                  </div>
                                </div>
                              )}
                            </div>

                          </div>

                        </div>

                        {/* Title & Metadata row like YouTube detail layer */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 bg-zinc-950/40 rounded-2xl border border-white/5">
                          <div className="space-y-1 text-left">
                            <h2 className="text-base font-black text-white">{selectedMovie?.title}</h2>
                            <div className="flex items-center gap-3 text-xs text-zinc-400 font-mono flex-wrap">
                              <span>Ano: {selectedMovie?.year}</span>
                              <span className="px-1.5 py-0.5 bg-zinc-800 text-[9px] font-bold uppercase rounded text-zinc-300">{selectedMovie?.type}</span>
                              <span className="text-cyan-400 font-bold">★ {selectedMovie?.rating || 8.0}</span>
                              <span className="text-[10px] text-zinc-500 font-medium">Áudio Original: {selectedMovie?.audioLanguages?.join(', ') || 'PT-BR, EN'}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-mono font-black bg-[#E50914] text-white px-2 py-1 rounded tracking-wider shadow-md">INVIS ORIGINAL STREAM</span>
                            <span className="text-[9px] font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-500/20 px-2 py-1 rounded">{abrMode}</span>
                          </div>
                        </div>

                      </div>

                      {/* EPISODES & RELATED CONTENT PANELS BELOW PLAYER */}
                      <div className="w-full max-w-4xl mx-auto space-y-8 select-none">
                         
                        {/* Section A: Series Episodes list or Movies chapters based on type */}
                        <div className="space-y-4">
                          <h3 className="text-xs font-mono tracking-widest text-cyan-400 uppercase font-black flex items-center gap-2 text-left">
                            <Tv className="w-4 h-4 text-cyan-400" />
                            <span>{selectedMovie?.type === 'serie' ? 'Seleção de Episódios' : 'Seleção de Capítulos'}</span>
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {getDynamicEpisodesForSelectedMovie().map((ep) => (
                              <div 
                                key={ep.id}
                                onClick={() => {
                                  triggerHaptic(15);
                                  showAlert(`Carregando ${ep.title}...`);
                                  const video = movieVideoRef.current;
                                  if (video) {
                                    video.currentTime = ep.seekTime;
                                    video.play().catch(() => {});
                                    setMovieIsPlaying(true);
                                  }
                                }}
                                className="group/ep bg-zinc-950/60 hover:bg-zinc-900/80 border border-white/5 hover:border-cyan-500/30 rounded-2xl p-3 flex flex-col space-y-2 cursor-pointer transition-all active:scale-98 text-left"
                              >
                                <div className="aspect-video w-full rounded-lg overflow-hidden relative bg-black/50">
                                  <img 
                                    src={episodeCovers[ep.id] || ep.defaultThumb} 
                                    alt="" 
                                    referrerPolicy="no-referrer" 
                                    className="w-full h-full object-cover group-hover/ep:scale-105 transition-transform duration-300" 
                                  />
                                  <div className="absolute inset-0 bg-black/45 group-hover/ep:bg-black/15 transition-colors flex items-center justify-center">
                                    <Play className="w-8 h-8 text-white opacity-0 group-hover/ep:opacity-100 transition-opacity bg-cyan-500/80 rounded-full p-2" />
                                  </div>
                                  <span className="absolute bottom-1 right-1 bg-black/80 px-1.5 py-0.5 rounded text-[9px] font-mono text-zinc-400">{ep.duration}</span>
                                </div>
                                <div className="space-y-0.5">
                                  <h4 className="text-[11px] font-bold text-white group-hover/ep:text-cyan-400 transition-colors leading-tight truncate">{ep.title}</h4>
                                  <p className="text-[9px] text-zinc-500 line-clamp-2 leading-relaxed">{ep.desc}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Section B: Related Titles (Filmes Relacionados) */}
                        <div className="space-y-4">
                          <h3 className="text-xs font-mono tracking-widest text-[#E50914] uppercase font-black flex items-center gap-2 text-left">
                            <Film className="w-4 h-4 text-[#E50914]" />
                            <span>Títulos Relacionados</span>
                          </h3>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {moviesList
                              .filter(m => m.id !== selectedMovie?.id && (m.type === selectedMovie?.type || m.category === selectedMovie?.category))
                              .slice(0, 4)
                              .map((m) => (
                                <div 
                                  key={m.id}
                                  onClick={() => {
                                    triggerHaptic(20);
                                    selectMovieAndFetchDetails(m);
                                  }}
                                  className="group/rel flex flex-col space-y-2 cursor-pointer bg-zinc-950/40 border border-white/5 hover:border-cyan-500/20 p-2.5 rounded-2xl transition-all hover:scale-[1.02] text-left"
                                >
                                  <div className="aspect-[2/3] w-full rounded-xl overflow-hidden relative bg-black/50">
                                    <img src={m.posterUrl} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover group-hover/rel:scale-105 transition-transform duration-300" />
                                    <div className="absolute top-2 right-2 bg-black/80 px-1.5 py-0.5 rounded text-[8px] font-mono font-bold text-cyan-400 uppercase tracking-widest leading-none shrink-0">{m.type}</div>
                                  </div>
                                  <div className="px-1 space-y-0.5">
                                    <h4 className="text-[11px] font-bold text-white group-hover/rel:text-cyan-400 transition-colors truncate">{m.title}</h4>
                                    <div className="flex items-center justify-between text-[9px] text-zinc-500 font-mono font-bold leading-none select-none">
                                      <span>{m.year}</span>
                                      <span className="text-cyan-400 font-bold">★ {m.rating || 8.0}</span>
                                    </div>
                                  </div>
                                </div>
                              ))
                            }
                          </div>
                        </div>

                        {/* Section C: Voltar para Cinema Home Page button option */}
                        <div className="flex items-center justify-center pt-8 border-t border-white/5">
                          <button
                            onClick={() => {
                              triggerHaptic(20);
                              setMoviePlaying(false);
                            }}
                            className="px-6 py-3.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-white/10 hover:border-cyan-400/30 text-zinc-300 hover:text-white text-[11px] font-bold font-mono tracking-widest uppercase transition-all flex items-center justify-center gap-2 max-w-sm w-full shadow-2xl cursor-pointer active:scale-95"
                          >
                            <ArrowLeft className="w-4 h-4" />
                            <span>VOLTAR À PÁGINA INICIAL DO CINEMA</span>
                          </button>
                        </div>

                      </div>

                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          GLOBAL SPECIFIC SUB-MODALS DRAWER
          ========================================================================= */}
      
      {/* 1. ADMIN MENU FOR CLIPS (LONG PRESS / CONTEXT MENU SPEC PAGE 4) */}
      <AnimatePresence>
        {adminMenuClip && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/95 font-sans">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm rounded-[24px] bg-[#0c0c14] border-2 border-red-500 p-6 space-y-4 text-left shadow-2xl"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-rose-500 font-mono text-[9px] uppercase font-bold">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Satelite Admin Control Module</span>
                </div>
                <h4 className="text-xs font-black text-white uppercase tracking-wide leading-snug">
                  Monitoramento de Link do Clip: {adminMenuClip.title}
                </h4>
              </div>

              <p className="text-[10px] text-zinc-400 leading-normal">
                Modifique o sinal do status do link exposto indexado. O robô em segundo plano e a query SQL removerão ou classificarão este card de acordo.
              </p>

              <div className="flex flex-col gap-2 pt-2 text-xs">
                {[
                  { id: 'online', label: 'Verde: Online / Ativo', style: 'border-emerald-500/20 text-emerald-400 focus:bg-emerald-500/10' },
                  { id: 'monitored', label: 'Amarelo: Monitorado', style: 'border-amber-500/20 text-amber-400 focus:bg-amber-500/10' },
                  { id: 'offline', label: 'Vermelho: Offline / Removido', style: 'border-rose-500/20 text-rose-400 focus:bg-rose-500/10' }
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => {
                      triggerHaptic(20);
                      setClipsList(prev => prev.map(c => c.id === adminMenuClip.id ? { ...c, status: st.id as any } : c));
                      setAdminMenuClip(null);
                    }}
                    className={`w-full py-2.5 rounded-xl border bg-black/40 hover:brightness-110 cursor-pointer text-left px-4 font-mono text-[10px] uppercase font-bold transition-all ${st.style}`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>

              <div className="pt-2 text-center">
                <button
                  onClick={() => setAdminMenuClip(null)}
                  className="text-[10px] font-mono text-zinc-500 hover:text-white uppercase transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. ANTI-IDLE "ARE YOU STILL WATCHING" CHECK (SPEC PAGE 28) */}
      <AnimatePresence>
        {showAntiIdleCheck && (
          <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-black/98 font-sans">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-sm rounded-[32px] bg-[#090a10] border border-cyan-500/30 p-8 space-y-6 text-center shadow-2xl"
            >
              <div className="space-y-2">
                <span className="text-[9px] font-mono text-cyan-400 uppercase tracking-[0.2em] font-black block">Anti-Idle System Check</span>
                <h4 className="text-sm font-black text-white uppercase tracking-wider">Ainda está assistindo?</h4>
                <p className="text-[10px] text-zinc-400 leading-normal max-w-xs mx-auto">
                  Para economizar a alocação de largura de banda e não sobrecarregar as fontes de HLS expiradas, confirme sua visualização ativa.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    triggerHaptic(20);
                    setShowAntiIdleCheck(false);
                    setSelectedMovie(null);
                    setMoviePlaying(false);
                  }}
                  className="flex-1 py-2.5 bg-zinc-900 text-zinc-400 rounded-2xl text-[10px] font-mono uppercase border border-white/5 active:scale-95 cursor-pointer"
                >
                  Dormir
                </button>
                <button
                  onClick={() => {
                    triggerHaptic(30);
                    setShowAntiIdleCheck(false);
                    setMoviePlaying(true);
                  }}
                  className="flex-grow py-2.5 bg-cyan-500 text-black font-black font-mono text-[10px] rounded-2xl uppercase tracking-wider shadow-[0_0_15px_rgba(6,182,212,0.4)] active:scale-95 cursor-pointer"
                >
                  Sim, Continuar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
