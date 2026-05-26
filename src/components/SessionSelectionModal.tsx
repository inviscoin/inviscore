import React from 'react';
import { useInvis } from '../context/InvisContext';
import { BlockType } from '../types';
import { motion } from 'motion/react';
import { Shield, Sparkles, LogIn, Lock, CheckCircle2, MessageSquare, Flame, PlaySquare, ShieldAlert } from 'lucide-react';

interface SessionSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SessionSelectionModal: React.FC<SessionSelectionModalProps> = ({ isOpen, onClose }) => {
  const { 
    hubSelectionPending,
    setHubSelectionPending,
    currentUser,
    addBlock,
    showToast,
    setSocialSubTab,
    setMediaSubTab,
    setLibrarySubTab,
    setGamesSubTab,
    language
  } = useInvis();

  if (!isOpen || !hubSelectionPending) return null;

  const { type, title } = hubSelectionPending;
  const userTier = currentUser?.tier || 'FREE';
  const isPremium = userTier !== 'FREE';

  // Session option interface
  interface SessionOption {
    name: string;
    description: string;
    durationLabel: string;
    disabledOnFree: boolean;
    icon: string;
    onClickAction: () => void;
  }

  // Define sessions for each Hub Category
  const sessions: Record<string, SessionOption[]> = {
    social: [
      {
        name: 'Chat Global',
        description: 'Conecte-se com a Matriz global em tempo real.',
        durationLabel: isPremium ? 'Tempo Ilimitado' : '1 Hora de Acesso',
        disabledOnFree: false,
        icon: '💬',
        onClickAction: () => {
          setSocialSubTab('chat');
          addBlock('social', 'Social — Chat', true);
          showToast('Sala de Chat Global carregada.', 'info');
        }
      },
      {
        name: 'Fórum (Reels)',
        description: 'Feed interativo e debates entre os membros.',
        durationLabel: 'Tempo Ilimitado',
        disabledOnFree: false,
        icon: ' reels ',
        onClickAction: () => {
          setSocialSubTab('forum');
          addBlock('social', 'Social — Fórum', true);
          showToast('Fórum de Reels sincronizado.', 'info');
        }
      },
      {
        name: 'ID Virtual',
        description: 'Sua assinatura e aura binária exclusiva.',
        durationLabel: 'Tempo Ilimitado',
        disabledOnFree: false,
        icon: '🆔',
        onClickAction: () => {
          setSocialSubTab('chat');
          addBlock('social', 'Social ID', true);
          showToast(`Nome de ID Virtual: @${currentUser?.nickname || 'Guest'} carregado.`, 'success');
        }
      }
    ],
    media: [
      {
        name: 'VideoTube',
        description: 'Reprodutor de vídeos descentralizado integrado.',
        durationLabel: 'Tempo Ilimitado',
        disabledOnFree: false,
        icon: '📹',
        onClickAction: () => {
          setMediaSubTab('videotube');
          addBlock('media', 'Mídia — VideoTube', true);
          showToast('Acesso ao player VideoTube liberado.', 'info');
        }
      },
      {
        name: 'Filmes Multiplex',
        description: 'Sessão de cinema cibernética compartilhada.',
        durationLabel: isPremium ? '6 Horas de Acesso' : '20 Minutos de Acesso',
        disabledOnFree: false,
        icon: '🎬',
        onClickAction: () => {
          setMediaSubTab('movies');
          addBlock('media', 'Mídia — Filmes', true);
          showToast(`Sessão Multiplex carregada. Limite de teste: ${isPremium ? '6 Horas' : '20 Minutos'}.`, 'info');
        }
      },
      {
        name: 'Músicas',
        description: 'Áudios binaurais e sintetizador de áudio lo-fi.',
        durationLabel: 'Tempo Ilimitado',
        disabledOnFree: false,
        icon: '🎵',
        onClickAction: () => {
          setMediaSubTab('music');
          addBlock('media', 'Mídia — Synth', true);
          showToast('Estúdio de Músicas inicializado.', 'info');
        }
      }
    ],
    library: [
      {
        name: 'Livros Gerais',
        description: 'Acesse obras e relatórios do acervo digital.',
        durationLabel: 'Tempo Ilimitado',
        disabledOnFree: false,
        icon: '📚',
        onClickAction: () => {
          setLibrarySubTab('books');
          addBlock('library', 'Biblioteca — Obras', true);
          showToast('Obras Gerais carregadas.', 'info');
        }
      },
      {
        name: 'INVIS Biblioteca',
        description: 'Acervo criptográfico de pesquisa literária.',
        durationLabel: isPremium ? '2 Horas de Acesso' : '30 Minutos de Acesso',
        disabledOnFree: false,
        icon: '🔑',
        onClickAction: () => {
          setLibrarySubTab('books');
          addBlock('library', 'Biblioteca VIP', true);
          showToast(`Biblioteca Integrada de Alta Produtividade. Limite: ${isPremium ? '2 Horas' : '30 Minutos'}.`, 'info');
        }
      },
      {
        name: 'Escritor Fantasma IA',
        description: 'Co-autor IA avançado para escrever manuscritos.',
        durationLabel: isPremium ? '1 Hora de Acesso' : 'Desativado para Free',
        disabledOnFree: !isPremium,
        icon: '✍️',
        onClickAction: () => {
          if (!isPremium) {
            showToast('Upgrade Nescessário: Opção de Escritor IA está indisponível na conta FREE.', 'error');
            return;
          }
          setLibrarySubTab('ghostwriter');
          addBlock('library', 'Biblioteca — Escritor', true);
          showToast('Escritor Fantasma IA Ativado.', 'success');
        }
      }
    ],
    games: [
      {
        name: 'Games INVIS',
        description: 'Jogos sofisticados com mineração de moedas ativa.',
        durationLabel: isPremium ? '3 Horas de Acesso' : 'Desativado para Free',
        disabledOnFree: !isPremium,
        icon: '🌌',
        onClickAction: () => {
          if (!isPremium) {
            showToast('Upgrade Necessário: Gamas INVIS VIP requer plano Premium (Vip1).', 'error');
            return;
          }
          setGamesSubTab('invis');
          addBlock('games', 'Jogos — Arena INVIS', true);
          showToast('Arena Premium de Games carregada.', 'success');
        }
      },
      {
        name: 'Games Rápidos',
        description: 'Passatempos arcade livres.',
        durationLabel: 'Tempo Ilimitado',
        disabledOnFree: false,
        icon: '👾',
        onClickAction: () => {
          setGamesSubTab('fast');
          addBlock('games', 'Jogos — Rápidos', true);
          showToast('Jogos Arcade carregados.', 'info');
        }
      },
      {
        name: 'Mais Jogados',
        description: 'Os títulos mais procurados do ecossistema.',
        durationLabel: isPremium ? 'Tempo Ilimitado' : 'Desativado para Free',
        disabledOnFree: !isPremium,
        icon: '🔥',
        onClickAction: () => {
          if (!isPremium) {
            showToast('Upgrade Necessário: Mais Jogados requer plano Premium (Vip1).', 'error');
            return;
          }
          setGamesSubTab('most');
          addBlock('games', 'Jogos — Populares', true);
          showToast('Jogos populares carregados em segundo plano.', 'info');
        }
      }
    ]
  };

  const activeSessions = sessions[type] || [];

  const handleOptionClick = (opt: SessionOption) => {
    if (opt.disabledOnFree && !isPremium) {
      if (navigator.vibrate) navigator.vibrate([10 * 10]);
      showToast(`Acesso Bloqueado: "${opt.name}" requer assinatura Premium!`, 'error');
      return;
    }
    
    if (navigator.vibrate) navigator.vibrate(20);
    opt.onClickAction();
    setHubSelectionPending(null);
    onClose();
  };

  return (
    <div 
      onClick={() => setHubSelectionPending(null)}
      className="fixed inset-0 z-[8000] flex items-center justify-center bg-black/90 p-4 font-sans backdrop-blur-md cursor-pointer"
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 30 }}
        className="w-full max-w-md rounded-3xl bg-[#0b0e11] border border-[#00c8ff]/30 flex flex-col overflow-hidden relative shadow-[0_0_50px_rgba(0,200,255,0.2)] cursor-default p-6"
      >
        {/* Glow Header Accent Banner */}
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-cyan-400 to-purple-500" />

        {/* Header Metadata block */}
        <div className="flex justify-between items-center pb-4 border-b border-white/5 mb-5 shrink-0">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-[#00c8ff] animate-pulse" />
            <div>
              <span className="font-mono text-[9px] tracking-[0.2em] font-black uppercase text-neutral-400 block leading-none">
                SELETOR DE FLUXO
              </span>
              <h3 className="text-xs font-black uppercase tracking-wider text-white mt-1">
                Acessando Hub: {title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-950/40 border border-cyan-500/20 text-[#00c8ff] text-[8.5px] font-mono uppercase font-black">
            <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span>Nível {userTier}</span>
          </div>
        </div>

        {/* Sessions option tree cards */}
        <div className="space-y-3.5 my-3">
          {activeSessions.map((opt, i) => {
            const isLocked = opt.disabledOnFree && !isPremium;

            return (
              <button
                key={i}
                onClick={() => handleOptionClick(opt)}
                className={`w-full p-4 rounded-2xl border text-left transition-all relative flex gap-4 items-start cursor-pointer hover:-translate-y-0.5 min-h-[90px] ${
                  isLocked 
                    ? 'bg-neutral-950/40 border-red-500/10 opacity-70 hover:border-red-500/35' 
                    : isPremium 
                    ? 'bg-black/25 border-cyan-500/10 hover:border-[#00c8ff]/30 hover:bg-cyan-950/5'
                    : 'bg-black/25 border-white/5 hover:border-[#00c8ff]/20'
                }`}
              >
                {/* Visual Icon Badge circular */}
                <div 
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${
                    isLocked 
                      ? 'bg-red-950/20 text-red-400' 
                      : 'bg-white/5 text-white'
                  }`}
                >
                  {isLocked ? <Lock className="w-4 h-4" /> : opt.icon}
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-center">
                    <span 
                      className={`text-xs font-black uppercase tracking-wide ${
                        isLocked ? 'text-red-400' : 'text-white'
                      }`}
                    >
                      {opt.name}
                    </span>
                    <span 
                      className={`font-mono text-[8.5px] font-bold uppercase rounded-md px-1.5 py-0.5 ${
                        isLocked 
                          ? 'bg-red-950/20 text-red-400 border border-red-500/10' 
                          : isPremium 
                          ? 'bg-[#00c8ff]/10 text-[#00c8ff] border border-[#00c8ff]/15' 
                          : 'bg-neutral-800 text-neutral-400'
                      }`}
                    >
                      {opt.durationLabel}
                    </span>
                  </div>

                  <p className="text-[10px] text-neutral-400 leading-normal">
                    {opt.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Close dialog footprint tag */}
        <div className="mt-5 pt-4 border-t border-white/5 flex justify-between items-center text-[10px]">
          <span className="font-mono text-[8px] text-neutral-500 uppercase tracking-wide">
            Cripto-Multiplexing v1_INVIS
          </span>
          <button 
            onClick={() => setHubSelectionPending(null)}
            className="px-4 py-2 border border-white/10 hover:border-cyan-400 rounded-xl text-neutral-400 hover:text-white font-mono text-[9px] uppercase font-black transition-all cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </motion.div>
    </div>
  );
};
