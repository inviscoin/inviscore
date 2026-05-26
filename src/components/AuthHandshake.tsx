import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';

interface AuthHandshakeProps {
  statusText?: string;
  onComplete?: () => void;
}

export const AuthHandshake: React.FC<AuthHandshakeProps> = ({ 
  statusText = 'Sincronizando Identidade...', 
  onComplete 
}) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 5;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const onCompleteRef = React.useRef(onComplete);
  React.useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (progress >= 100) {
      const timeout = setTimeout(() => {
        if (onCompleteRef.current) onCompleteRef.current();
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [progress]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-[#0b0e11]/95 text-white overflow-hidden"
    >
      {/* Matrix background perspective grid */}
      <div 
        className="absolute inset-0 opacity-10 matrix-line-overlay pointer-events-none"
        style={{
          transform: 'perspective(500px) rotateX(60deg) translateY(-100px)',
          animation: 'gridMove 10s infinite linear'
        }}
      />

      {/* Circle Scanner Circular SVG */}
      <div className="relative w-80 h-80 flex items-center justify-center">
        <svg viewBox="0 0 200 200" className="w-full h-full filter drop-shadow-[0_0_20px_var(--neon-cyan)]">
          <defs>
            <radialGradient id="glow-grad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#00c8ff" stopOpacity="0.5" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Glowing central indicator */}
          <circle cx="100" cy="100" r="70" fill="url(#glow-grad)" className="opacity-45" />

          {/* Anéis de Dados Giratórios (Spinning Rings) */}
          <motion.circle 
            cx="100" cy="100" r="80" 
            fill="none" 
            stroke="#00c8ff" 
            strokeWidth="1.5"
            strokeDasharray="15 30"
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
            className="origin-center"
          />

          <motion.circle 
            cx="100" cy="100" r="60" 
            fill="none" 
            stroke="#00FF80" 
            strokeWidth="1.5"
            strokeDasharray="8 15"
            animate={{ rotate: -360 }}
            transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
            className="origin-center"
          />

          {/* Raios de Validação (Validation Lines) */}
          {Array.from({ length: 12 }).map((_, i) => (
            <line
              key={i}
              x1="100" y1="100"
              x2="100" y2="20"
              stroke="#00c8ff"
              strokeWidth="0.5"
              className="opacity-20"
              style={{
                transformOrigin: '100px 100px',
                transform: `rotate(${i * 30}deg)`,
                animation: 'rayPulse 2s infinite alternate'
              }}
            />
          ))}

          {/* Ícone Central de Identidade (Biometrics core representation) */}
          <path 
            d="M80,130 Q100,70 120,130" 
            stroke="#00FF80" 
            strokeWidth="3" 
            fill="none" 
            className="opacity-80"
          />
          <circle 
            cx="100" cy="80" r="15" 
            fill="#00c8ff" 
            className="opacity-70"
            style={{ animation: 'corePulse 2.5s infinite alternate' }}
          />
        </svg>

        {/* Absolute floating scanner bar feedback */}
        <motion.div 
          animate={{ y: [-70, 70, -70] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute w-56 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#00c8ff] pointer-events-none"
        />
      </div>

      {/* Progress status information */}
      <div className="mt-8 flex flex-col items-center">
        <p className="font-mono text-sm tracking-[0.3em] text-[#00c8ff] uppercase font-bold text-center px-4 max-w-sm">
          {statusText}
        </p>

        <div className="w-64 h-1 bg-black/40 rounded-full overflow-hidden border border-cyan-500/20 mt-4">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-gradient-to-r from-[#00c8ff] to-[#00FF80] shadow-[0_0_10px_#00FF80]"
          />
        </div>

        <span className="font-mono text-xs text-[#00FF80] mt-3 tracking-widest font-bold">
          {progress}%
        </span>
      </div>
    </motion.div>
  );
};
