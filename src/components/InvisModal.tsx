import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Info, XCircle } from 'lucide-react';

interface InvisModalProps {
  title?: string;
  message: string;
  type?: 'info' | 'error' | 'success';
  onClose: () => void;
}

export const InvisModal: React.FC<InvisModalProps> = ({ 
  title = "AVISO DO SISTEMA", 
  message, 
  type = 'info', 
  onClose 
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/85 z-[5000] flex items-center justify-center backdrop-blur-md px-4"
      onClick={onClose}
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[400px] p-10 rounded-[24px] bg-[#0b0e11] border border-cyan-500 text-center flex flex-col relative overflow-hidden"
      >
        {/* Superior Status Indicator Line */}
        <div className={`w-[60px] h-1 mx-auto mb-5 rounded-sm ${
          type === 'error' ? 'bg-red-500 shadow-[0_0_10px_#ef4444]' : 
          type === 'success' ? 'bg-emerald-400 shadow-[0_0_10px_#34d399]' : 
          'bg-cyan-400 shadow-[0_0_10px_#22d3ee]'
        }`} />

        <h3 className="text-white tracking-[3px] text-[0.9rem] mb-4 font-black uppercase">
          {title}
        </h3>
        
        <p className="text-[#ccc] text-[0.85rem] leading-[1.5] mb-8 font-sans">
          {message}
        </p>

        <button 
          onClick={onClose}
          className="mt-2 w-full py-4 text-cyan-400 font-black text-sm uppercase rounded-[10px] border border-cyan-400/30 hover:bg-cyan-400 hover:text-black transition-all cursor-pointer outline-none focus:outline-none"
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          CIENTE
        </button>
      </motion.div>
    </motion.div>
  );
};
