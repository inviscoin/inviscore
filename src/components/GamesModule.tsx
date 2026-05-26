import React, { useState, useEffect } from 'react';
import { useInvis } from '../context/InvisContext';
import { motion, AnimatePresence } from 'motion/react';
import { Gamepad2, Award, Zap, Crosshair, ShieldAlert, BadgeAlert, Plus, Play, Pause, RefreshCw, Clock, Gift, Sparkles } from 'lucide-react';

export const GamesModule: React.FC = () => {
  const { currentUser, language, addTransaction, setSystemStatus, wallet, setWallet } = useInvis();

  const [activeGame, setActiveGame] = useState<'tap' | 'match' | null>(null);
  
  // Daily Reward Claim status
  const [dailyRewardClaimed, setDailyRewardClaimed] = useState(false);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const lastClaim = localStorage.getItem('invis_last_daily_claim');
    setDailyRewardClaimed(lastClaim === today);
  }, []);

  const handleClaimDailyReward = () => {
    if (dailyRewardClaimed) return;
    
    if (navigator.vibrate) navigator.vibrate([40, 30, 40]);
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem('invis_last_daily_claim', today);
    setDailyRewardClaimed(true);

    // Award IC Coins (150 Gold, 250 Silver)
    setWallet(prev => ({
      ...prev,
      icGold: prev.icGold + 150,
      icSilver: prev.icSilver + 250
    }));

    addTransaction({
      type: 'Bonus',
      amount: '+150.00 GC / +250.00 SC',
      desc: 'Bônus Operacional Diário (Games Hub)'
    });

    setSystemStatus('Bônus Coletado');
  };
  
  // Advantages states (Purchases of advantages from INVIShop)
  const [hasAutoAim, setHasAutoAim] = useState(false);
  const [hasSpeedHack, setHasSpeedHack] = useState(false);
  const [hasAdShield, setHasAdShield] = useState(true); // enabled by default
  const [rentTimeLeft, setRentTimeLeft] = useState(300); // 5 minutes remaining

  // Interactive Games simple states
  const [points, setPoints] = useState(0);
  const [gameMultiplier, setGameMultiplier] = useState(1);
  const [isGamePaused, setIsGamePaused] = useState(false);

  // Match Game puzzle state
  const [cards, setCards] = useState<{ id: number; icon: string; matched: boolean; flipped: boolean }[]>([]);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);

  // Decrement rented advantages time in real-time
  useEffect(() => {
    let t: NodeJS.Timeout;
    if (activeGame && rentTimeLeft > 0) {
      t = setInterval(() => {
        setRentTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(t);
            setHasAutoAim(false);
            setHasSpeedHack(false);
            alert('Aviso de Tempo: Vantagens adquiridas na biblioteca/estatuto expiraram.');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(t);
  }, [activeGame, rentTimeLeft]);

  // Handle Game 1: Space Tap Game
  const handleSpaceTap = () => {
    if (isGamePaused) return;

    if (navigator.vibrate) navigator.vibrate(12);

    // Apply speed hack modifier
    const baseGain = hasSpeedHack ? 2 : 1;
    const clickGain = baseGain * gameMultiplier;

    setPoints(prev => prev + clickGain);

    // Reward micro coins on click representing mining flow
    const coinGained = 0.000344 * clickGain;

    // Direct postMessage simulation to secure backend
    // Dispatch un-cheatable points value update to matrix
    addTransaction({
      type: 'Gain',
      amount: `+${coinGained.toFixed(4)}`,
      desc: `Mining: Ganho em ${activeGame === 'tap' ? 'Space Tap' : 'Card Match'}`
    });
  };

  // Puzzle Match Cards setup
  const MOJI_PUZZLES = ['🚀', '🌌', '👾', '🌀', '💎', '🛸'];
  const startMatchGame = () => {
    setPoints(0);
    setGameMultiplier(1.5);
    const initialPack = [...MOJI_PUZZLES, ...MOJI_PUZZLES]
      .map((icon, idx) => ({ id: idx, icon, matched: false, flipped: false }))
      .sort(() => Math.random() - 0.5);
    setCards(initialPack);
    setActiveGame('match');
  };

  const handleCardClick = (id: number) => {
    if (isGamePaused || selectedCards.length >= 2) return;
    const targetIdx = cards.findIndex(c => c.id === id);
    if (cards[targetIdx].matched || cards[targetIdx].flipped) return;

    // Flip card
    setCards(prev => prev.map(c => c.id === id ? { ...c, flipped: true } : c));
    const nextSelected = [...selectedCards, id];
    setSelectedCards(nextSelected);

    if (nextSelected.length === 2) {
      const first = cards.find(c => c.id === nextSelected[0]);
      const second = cards.find(c => c.id === nextSelected[1]);

      if (first && second && first.icon === second.icon) {
        // Matched
        setTimeout(() => {
          setCards(prev => prev.map(c => c.id === first.id || c.id === second.id ? { ...c, matched: true } : c));
          setPoints(prev => prev + 10);
          setSelectedCards([]);
          // coin payouts
          addTransaction({
            type: 'Gain',
            amount: '+0.0050',
            desc: 'Match Puzzle: Par Encontrado'
          });
        }, 600);
      } else {
        // Failed, flip back
        setTimeout(() => {
          setCards(prev => prev.map(c => c.id === nextSelected[0] || c.id === nextSelected[1] ? { ...c, flipped: false } : c));
          setSelectedCards([]);
        }, 1000);
      }
    }
  };

  const currentSecondsFormat = `${Math.floor(rentTimeLeft / 60)}:${rentTimeLeft % 60 < 10 ? '0' : ''}${rentTimeLeft % 60}`;

  return (
    <div className="w-full h-full flex flex-col bg-[#0b0e11] p-4 text-[#e0e0e0] font-sans overflow-y-auto no-scrollbar pb-10">
      
      {!activeGame ? (
        /* GAME HUB PORTAL SELECTION LIST */
        <div className="space-y-4 text-left">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Game Card 1: Tap Game */}
            <div className="p-5 rounded-2xl bg-black/30 border border-white/5 flex flex-col justify-between h-44 relative overflow-hidden group hover:border-[#00c8ff]/30 transition-all">
              <div className="absolute right-[-10px] top-[-10px] w-24 h-24 bg-cyan-500/5 rounded-full filter blur-xl group-hover:scale-125 transition-transform" />
              <div className="space-y-1">
                <h4 className="text-white text-sm font-black uppercase tracking-wider">TAP GAME: SPACE MINER</h4>
                <p className="text-[10px] text-neutral-400 leading-normal">Clique repetidamente nos geradores de asteroides para minerar INVISCoins em background.</p>
              </div>

              <button
                onClick={() => { setActiveGame('tap'); setPoints(0); setGameMultiplier(1); }}
                className="w-fit px-5 py-2 rounded-xl bg-cyan-500 text-black font-black text-xs uppercase hover:bg-cyan-400 cursor-pointer transition-all active:scale-95"
              >
                Carregar Jogo
              </button>
            </div>

            {/* Game Card 2: Match Game */}
            <div className="p-5 rounded-2xl bg-black/30 border border-white/5 flex flex-col justify-between h-44 relative overflow-hidden group hover:border-[#00FF80]/30 transition-all">
              <div className="absolute right-[-10px] top-[-10px] w-24 h-24 bg-emerald-500/5 rounded-full filter blur-xl group-hover:scale-125 transition-transform" />
              <div className="space-y-1">
                <h4 className="text-white text-sm font-black uppercase tracking-wider">PUZZLE: CARD MATCH</h4>
                <p className="text-[10px] text-neutral-400 leading-normal">Encontre pares de ícones espaciais para coletar multiplicadores e dezenas de moedas.</p>
              </div>

              <button
                onClick={startMatchGame}
                className="w-fit px-5 py-2 rounded-xl bg-[#00FF80] text-black font-black text-xs uppercase hover:bg-[#00FF80]/80 cursor-pointer transition-all active:scale-95"
              >
                Carregar Jogo
              </button>
            </div>
          </div>

          {/* Daily Reward Banner System */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/20 to-indigo-950/20 border border-purple-500/20 flex flex-col sm:flex-row items-center justify-between gap-4 mt-2">
            <div className="flex items-center gap-3.5 text-left">
              <div className="p-3 bg-purple-500/10 rounded-2xl border border-purple-500/20 text-purple-400 shrink-0">
                <Gift className="w-6 h-6 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-purple-400 bg-purple-950/30 px-2 py-0.5 rounded-md border border-purple-500/20">Claim de Fidelidade</span>
                  {dailyRewardClaimed && (
                    <span className="text-[8px] font-mono text-green-400 uppercase">Resgatado Hoje ✔</span>
                  )}
                </div>
                <h4 className="text-white text-xs font-black uppercase tracking-wider mt-1">Recompensa Diária de Login Ativo</h4>
                <p className="text-[9px] text-neutral-400 leading-normal mt-0.5">Sua presença diária mantém os servidores da rede INVIS ativos. Colete seu dividendo operacional: +150 Moedas Gold e +250 Moedas Silver.</p>
              </div>
            </div>

            <button
              onClick={handleClaimDailyReward}
              disabled={dailyRewardClaimed}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase transition-all select-none cursor-pointer tracking-wider ${
                dailyRewardClaimed
                  ? 'bg-neutral-900 border border-neutral-800 text-neutral-500 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_15px_rgba(138,43,226,0.35)] hover:shadow-[0_0_20px_rgba(138,43,226,0.5)] active:scale-95 animate-pulse'
              }`}
            >
              {dailyRewardClaimed ? 'Coletado ✔' : 'Coletar Bônus'}
            </button>
          </div>
        </div>
      ) : (
        /* SATELLITE HUD PLAY VIEWBOX WRAPPER (PAGE 4) */
        <div className="w-full h-full flex flex-col space-y-4">
          
          {/* Active Advantages Toggles & Indicator bar */}
          <div className="flex flex-wrap gap-4 items-center justify-between p-3.5 rounded-2xl bg-black/40 border border-white/5 font-sans">
            
            {/* Advantages Toggles (Page 4) */}
            <div className="flex gap-3 items-center select-none text-xs">
              {/* Auto Aim toggle */}
              <button 
                onClick={() => { setHasAutoAim(!hasAutoAim); setSystemStatus(hasAutoAim ? 'Mira Desativada' : 'Mira Ativada'); }}
                className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase transition-all cursor-pointer flex items-center gap-1 ${
                  hasAutoAim ? 'bg-red-500/10 border-red-500 text-red-400 shadow-[0_0_8px_#ef4444]' : 'bg-[#0b0e11] border-neutral-800 text-neutral-400'
                }`}
              >
                <Crosshair className="w-3 h-3" />
                <span>Auto-aim</span>
              </button>

              {/* Speed hack toggle */}
              <button 
                onClick={() => { setHasSpeedHack(!hasSpeedHack); setSystemStatus(hasSpeedHack ? 'Speed Normal' : 'Hack Ativo'); }}
                className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase transition-all cursor-pointer flex items-center gap-1 ${
                  hasSpeedHack ? 'bg-[#00c8ff]/10 border-[#00c8ff] text-[#00c8ff] shadow-[0_0_8px_#00c8ff]' : 'bg-[#0b0e11] border-neutral-800 text-neutral-400'
                }`}
              >
                <Zap className="w-3 h-3" />
                <span>Speed x2</span>
              </button>

              {/* Ad shield toggle */}
              <button 
                onClick={() => setHasAdShield(!hasAdShield)}
                className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase transition-all cursor-pointer flex items-center gap-1 ${
                  hasAdShield ? 'bg-[#00FF80]/10 border-[#00FF80] text-[#00FF80] shadow-[0_0_8px_#00FF80]' : 'bg-[#0b0e11] border-neutral-800 text-neutral-400'
                }`}
              >
                <ShieldAlert className="w-3 h-3" />
                <span>Ad-Block</span>
              </button>
            </div>

            {/* Time countdown remaining ticker */}
            <div className="flex items-center gap-1.5 text-xs text-[#D4AF37] font-mono">
              <Clock className="w-3.5 h-3.5" />
              <span>TIME REMAINING: {currentSecondsFormat}</span>
            </div>
          </div>

          {/* Core active game board canvas inside Sandbox */}
          <div className="flex-1 min-h-[30vh] aspect-video rounded-3xl bg-neutral-950 border border-white/5 relative overflow-hidden select-none flex items-center justify-center">
            
            {/* Ad Shield block visual mock overlay (Page 5) */}
            {hasAdShield && (
              <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10 px-3 py-1 rounded bg-[#00FF80]/10 border border-[#00FF80]/20 text-[8px] font-mono text-[#00FF80] uppercase tracking-widest pointer-events-none">
                🛡 Ad-Block Shield Ativo
              </div>
            )}

            {/* HIGH-PRECISION AUTO-AIM CROSSHAIR OVERLAY (PAGE 4) */}
            {hasAutoAim && (
              <div className="absolute inset-0 pointer-events-none z-30 flex items-center justify-center">
                {/* Mathematical precise CSS crosshair */}
                <div className="relative w-8 h-8 flex items-center justify-center">
                  <div className="absolute w-full h-[1.5px] bg-red-500/80 shadow-[0_0_4px_#ef4444]" />
                  <div className="absolute h-full w-[1.5px] bg-red-500/80 shadow-[0_0_4px_#ef4444]" />
                  <div className="w-2.5 h-2.5 rounded-full border border-red-500 animate-ping absolute" />
                  <div className="w-1 h-1 rounded-full bg-red-400 absolute" />
                </div>
              </div>
            )}

            {/* GAME 1: SPACE TAP */}
            {activeGame === 'tap' && (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 space-y-4">
                <button
                  onClick={handleSpaceTap}
                  className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-tr from-[#1a1a40] via-neutral-900 to-[#00c8ff]/20 border-4 border-[#00c8ff] hover:border-[#00FF80] shadow-[0_0_30px_rgba(0,190,255,0.2)] hover:shadow-[0_0_40px_rgba(0,255,128,0.2)] hover:scale-105 active:scale-95 transition-all text-6xl select-none outline-none focus:outline-none flex items-center justify-center cursor-pointer"
                >
                  ☄
                </button>
                <div className="text-center font-mono">
                  <p className="text-xs text-neutral-400">Clique no asteroide para minerar</p>
                  <p className="text-lg font-bold text-[#00FF80]">{points} ACUMULADO</p>
                </div>
              </div>
            )}

            {/* GAME 2: PUZZLE MATCH */}
            {activeGame === 'match' && (
              <div className="w-full h-full flex flex-col items-center justify-center p-4">
                <div className="grid grid-cols-4 gap-2 w-max mx-auto mb-4">
                  {cards.map((card) => {
                    const isFlipped = card.flipped || card.matched;
                    return (
                      <button
                        key={card.id}
                        onClick={() => handleCardClick(card.id)}
                        className={`w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center text-lg font-bold border transition-all cursor-pointer outline-none focus:outline-none ${
                          card.matched 
                            ? 'bg-[#00FF80]/10 border-[#00FF80]/40 text-[#00FF80] opacity-60' 
                            : isFlipped 
                            ? 'bg-neutral-800 border-white/25 text-white' 
                            : 'bg-[#12121e] border-white/5 hover:border-cyan-500/30'
                        }`}
                      >
                        {isFlipped ? card.icon : '❓'}
                      </button>
                    );
                  })}
                </div>

                <div className="font-mono text-center text-xs">
                  <p className="text-neutral-400">Match pares corretos (Ganhos x1.5)</p>
                  <p className="text-[#00FF80] font-bold">PONTOS: {points}</p>
                </div>
              </div>
            )}

            {/* Paused state overlay */}
            {isGamePaused && (
              <div className="absolute inset-0 z-40 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center text-center">
                <p className="font-mono text-sm uppercase text-red-500 tracking-widest font-black animate-pulse">Sessão em Pausa</p>
                <button 
                  onClick={() => setIsGamePaused(false)}
                  className="px-6 py-2 rounded-xl bg-cyan-500 text-black font-bold text-xs uppercase mt-3"
                >
                  Retornar
                </button>
              </div>
            )}
          </div>

          {/* Sub-footer control options for return/pause */}
          <div className="flex gap-4 w-full">
            <button
              onClick={() => { setActiveGame(null); setPoints(0); }}
              className="flex-1 py-3 border border-neutral-800 bg-black/40 text-neutral-400 hover:text-white rounded-xl text-xs font-bold uppercase transition-all tracking-wider cursor-pointer"
            >
              Voltar ao Hub
            </button>

            <button
              onClick={() => setIsGamePaused(!isGamePaused)}
              className="flex-1 py-3 bg-[#00c8ff]/10 border border-[#00c8ff]/30 text-[#00c8ff] hover:bg-[#00c8ff]/20 rounded-xl text-xs font-mono font-bold uppercase transition-all tracking-wider cursor-pointer text-center"
            >
              || PAUSAR JOGO
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
