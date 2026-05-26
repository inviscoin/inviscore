import React, { useState } from 'react';
import { useInvis } from '../context/InvisContext';
import { motion, AnimatePresence } from 'motion/react';
import { Gift, Sparkles, X, RotateCw, Play, Trophy, Ban, HelpCircle } from 'lucide-react';

const SECTOR_COLORS = [
  '#ef4444', // Red
  '#3b82f6', // Blue
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#8b5cf6', // Violet
  '#ec4899'  // Pink
];

const SECTORS = [
  { value: '200ic', label: '200 ic', type: 'gold', gain: 200 },
  { value: '150ic', label: '150 ic', type: 'gold', gain: 150 },
  { value: '300ic', label: '300 ic', type: 'gold', gain: 300 },
  { value: '50ic', label: '50 ic', type: 'gold', gain: 50 },
  { value: 'cadeira', label: '1 Cadeira (Presente)', type: 'item', itemId: '159' },
  { value: 'perdeu', label: 'Perdeu a Vez', type: 'loss', gain: 0 }
];

interface RoletaGanhosProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RoletaGanhos: React.FC<RoletaGanhosProps> = ({ isOpen, onClose }) => {
  const { wallet, setWallet, addTransaction, language, setSystemStatus } = useInvis();

  const [isPlayingAd, setIsPlayingAd] = useState(false);
  const [adProgress, setAdProgress] = useState(0);
  const [adFinished, setAdFinished] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [currentRotation, setCurrentRotation] = useState(0);
  const [wonPrize, setWonPrize] = useState<typeof SECTORS[0] | null>(null);

  if (!isOpen) return null;

  // Plays a required simulated Bumper Ad (6 seconds) before spinning for Free Tier
  const handleStartAdFlow = () => {
    if (navigator.vibrate) navigator.vibrate(50);
    setIsPlayingAd(true);
    setAdProgress(0);

    const interval = setInterval(() => {
      setAdProgress(prev => {
        const next = prev + 10;
        if (next >= 100) {
          clearInterval(interval);
          setAdFinished(true);
          setIsPlayingAd(false);
          // Auto trigger Spin
          triggerSpin();
          return 100;
        }
        return next;
      });
    }, 400); // ~4 seconds ad
  };

  const triggerSpin = () => {
    if (isRotating) return;
    setIsRotating(true);
    setWonPrize(null);

    // Compute random selected degrees (minimum 5 full spins + randomized sector offset)
    const sectorsCount = SECTORS.length;
    const selectedIndex = Math.floor(Math.random() * sectorsCount);
    const sectorAngle = 360 / sectorsCount;
    // Align index at center point of Sector
    const targetDegrees = 360 * 5 + (360 - (selectedIndex * sectorAngle) - (sectorAngle / 2));

    setCurrentRotation(targetDegrees);

    setTimeout(() => {
      setIsRotating(false);
      const prize = SECTORS[selectedIndex];
      setWonPrize(prize);
      applyPrizePayout(prize);
      setAdFinished(false); // Reset ad states
    }, 4500); // Match transit timing
  };

  const applyPrizePayout = (prize: typeof SECTORS[0]) => {
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);

    if (prize.type === 'gold' && prize.gain) {
      setWallet(prev => ({ ...prev, icGold: prev.icGold + prize.gain! }));
      addTransaction({
        type: 'Gain',
        amount: `+${prize.gain.toFixed(4)}`,
        desc: `Ganho na Roleta da Sorte: ${prize.label}`
      });
      setSystemStatus('Ganhos Kreditados');
    } else if (prize.type === 'item') {
      alert(`Parabéns! Você ganhou: "${prize.label}". O item "Cadeira (ID 159)" foi colocado no seu armário GiftBox!`);
      // Since it's gained by bonus, its silver stamped is true per rules
      addTransaction({
        type: 'Bonus',
        amount: '+0.0000',
        desc: `Ganho na Roleta: ${prize.label} (Stamped)`
      });
    } else {
      addTransaction({
        type: 'Spend',
        amount: '0.0000',
        desc: `Roleta da Sorte: Sem sorte nesta tentativa`
      });
    }
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-[5000] flex flex-col items-center justify-center bg-black/95 text-white font-sans p-6 overflow-hidden cursor-pointer"
    >
      {/* Moving stars background overlay */}
      <div className="absolute inset-0 opacity-10 matrix-line-overlay pointer-events-none" />

      {/* Main Container Card */}
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg glass-container border border-amber-500/20 p-8 flex flex-col items-center relative rounded-[32px] overflow-hidden cursor-default"
      >
        
        {/* Header Title controls */}
        <div className="w-full flex justify-between items-center mb-6">
          <div className="flex items-center gap-2 text-[#D4AF37]">
            <Trophy className="w-5 h-5 animate-bounce" />
            <h2 className="font-mono text-sm tracking-[0.2em] uppercase font-black">ROLETA DE GANHOS</h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-full hover:bg-neutral-800 transition-all text-neutral-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Outer Wheel spinning apparatus wrapper */}
        <div className="relative w-72 h-72 md:w-80 md:h-80 flex items-center justify-center mb-8 select-none">
          
          {/* Decelaration wheel base graphics */}
          <motion.div 
            animate={{ rotate: currentRotation }}
            transition={{ duration: 4.5, ease: 'easeOut' }}
            className="w-full h-full rounded-full border-8 border-[#D4AF37] relative flex items-center justify-center shadow-[0_0_40px_rgba(212,175,55,0.4)] overflow-hidden bg-[#0d0d12]"
            style={{ transformOrigin: 'center' }}
          >
            {/* Draw 6 colored sectors */}
            <svg viewBox="0 0 200 200" className="w-full h-full absolute">
              {SECTORS.map((sec, idx) => {
                const sectorAngle = 360 / SECTORS.length;
                const startAngle = idx * sectorAngle;
                const endAngle = startAngle + sectorAngle;
                
                // SVG arc formula representation
                const rad = Math.PI / 180;
                const x1 = 100 + 100 * Math.cos(startAngle * rad);
                const y1 = 100 + 100 * Math.sin(startAngle * rad);
                const x2 = 100 + 100 * Math.cos(endAngle * rad);
                const y2 = 100 + 100 * Math.sin(endAngle * rad);

                return (
                  <g key={idx} transform={`rotate(${startAngle} 100 100)`}>
                    <path 
                      d={`M100,100 L200,100 A100,100 0 0,1 ${100 + 100 * Math.cos(sectorAngle * rad)},${100 + 100 * Math.sin(sectorAngle * rad)} Z`}
                      fill={SECTOR_COLORS[idx]} 
                      className="opacity-25 border border-white/10"
                    />
                    {/* Prints label rotated */}
                    <text 
                      x="145" y="105" 
                      fill="white" 
                      fontSize="9" 
                      fontWeight="bold"
                      className="font-sans antialiased text-[7px]"
                      transform={`rotate(${sectorAngle / 2} 100 100)`}
                    >
                      {sec.label}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Central static coin icon display */}
            <div className="absolute w-12 h-12 rounded-full bg-gradient-to-tr from-[#D4AF37] to-[#FFD700] border border-white flex items-center justify-center font-sans font-black text-black z-10 shadow-lg">
              Ic
            </div>
          </motion.div>

          {/* Pointer indicator arrow on top */}
          <div className="absolute top-[-10px] z-20 flex flex-col items-center">
            <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-red-500 filter drop-shadow-[0_0_5px_rgba(239,68,68,0.8)]" />
          </div>
        </div>

        {/* Results indicator / interactive play triggers */}
        <AnimatePresence mode="wait">
          {wonPrize ? (
            <motion.div 
              key="prize-won"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center space-y-3"
            >
              <div className="flex items-center justify-center gap-1.5 text-[#00FF80]">
                <Sparkles className="w-5 h-5 animate-spin" />
                <span className="font-mono text-sm tracking-widest font-black uppercase">RECOMPENSA CONQUISTADA</span>
              </div>
              <p className="text-2xl font-black">{wonPrize.label}</p>
              
              <button
                onClick={() => setWonPrize(null)}
                className="px-6 py-2 border border-neutral-700 bg-neutral-800 text-xs rounded-full uppercase tracking-wider font-semibold cursor-pointer"
              >
                Girar Novamente
              </button>
            </motion.div>
          ) : isPlayingAd ? (
            /* Bumper Advertising simulated loading overlay wrapper */
            <motion.div 
              key="bumper-ad"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full text-center space-y-4 font-mono select-none"
            >
              <div className="flex items-center justify-center gap-2 text-rose-500">
                <Play className="w-4 h-4 animate-ping" />
                <span className="text-xs tracking-widest font-bold">REDUZINDO BANNER PUBLICITÁRIO...</span>
              </div>
              <p className="text-[11px] text-neutral-400">Ganhos em mineração exigem um pedágio de publicidade (4s)</p>
              <div className="w-full h-1 bg-black/40 rounded-full overflow-hidden border border-rose-500/20">
                <div 
                  className="h-full bg-rose-500 shadow-[0_0_10px_#f43f5e]" 
                  style={{ width: `${adProgress}%` }}
                />
              </div>
              <span className="text-xs text-[#00c8ff]">{adProgress}%</span>
            </motion.div>
          ) : (
            <motion.div 
              key="spin-trigger"
              className="flex flex-col items-center space-y-3"
            >
              <p className="text-[11px] text-neutral-400">Cada giro consome 1 tentativa voluntária ou 400ic adicionais.</p>
              <button
                disabled={isRotating}
                onClick={handleStartAdFlow}
                className="px-10 py-4 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black font-black uppercase text-sm tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(212,175,55,0.4)] cursor-pointer disabled:opacity-50"
              >
                GIRAR PARA GANHAR
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Las Vegas decorative light dots */}
        {isRotating && (
          <div className="absolute inset-x-0 bottom-4 flex justify-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-ping delay-75" />
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping delay-150" />
          </div>
        )}
      </div>
    </div>
  );
};
