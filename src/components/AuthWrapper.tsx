import React, { ReactNode } from 'react';
import { motion } from 'motion/react';

export const AuthWrapper: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-radial from-[#1a1a40] to-[#0b0e11] flex items-center justify-center">
      {/* Neon rays external to the card */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {Array.from({ length: 12 }).map((_, i) => (
          <div 
            key={i}
            className="absolute top-1/2 left-1/2 w-[2px] h-[150vh] origin-center opacity-10 bg-gradient-to-t from-cyan-400 to-transparent"
            style={{
              transform: `translate(-50%, -50%) rotate(${i * 30}deg)`,
              animation: `rayPulse_${i} 4s infinite alternate ease-in-out`,
              animationDelay: `${i * 0.2}s`
            }}
          />
        ))}
      </div>

      {/* Wet floor reflection effect */}
      <div 
        className="absolute bottom-0 w-full h-[30%] z-0 pointer-events-none"
        style={{
          background: 'linear-gradient(to top, rgba(0, 200, 255, 0.15), transparent)',
          maskImage: 'linear-gradient(to bottom, transparent, black)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent, black)',
          filter: 'blur(10px)'
        }}
      />

      {/* Embedded style for keyframes */}
      <style dangerouslySetInnerHTML={{__html: `
        ${Array.from({ length: 12 }).map((_, i) => `
          @keyframes rayPulse_${i} {
            from { opacity: 0.05; transform: translate(-50%, -50%) rotate(${i * 30}deg) scale(0.8); }
            to { opacity: 0.2; transform: translate(-50%, -50%) rotate(${i * 30}deg) scale(1.1); }
          }
        `).join('')}
      `}} />

      {/* Centered Box */}
      <motion.div 
        initial={{ opacity: 0.2, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.8 }}
        className="z-10 w-full max-w-[420px] p-[20px] flex flex-col items-center relative"
      >
        {children}
      </motion.div>
    </div>
  );
};
