import React, { useState, useEffect } from 'react';
import { Server, Activity, CheckCircle2, AlertTriangle, Workflow, Play, Pause } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DeployStatusProps {
  isStreaming?: boolean;
  onToggleStreaming?: () => void;
}

export const DeployStatus: React.FC<DeployStatusProps> = ({ 
  isStreaming = true, 
  onToggleStreaming = () => {} 
}) => {
  const [vercelStatus, setVercelStatus] = useState<'LOADING' | 'ONLINE' | 'ERROR'>('LOADING');
  const [ghStatus, setGhStatus] = useState<'LOADING' | 'SUCCESS' | 'FAILURE'>('LOADING');

  useEffect(() => {
    // Simulando verificações reais via API de Vercel e GitHub Actions.
    let t1 = setTimeout(() => {
      setVercelStatus('ONLINE');
    }, 1500);
    let t2 = setTimeout(() => {
      // Simulação de erro ocasional, ou sucesso na maioria das vezes. 
      // Por solicitação do usuário, ele quer ser notificado se estiver 'FAILURE'
      setGhStatus('SUCCESS'); // Mude para 'FAILURE' para testar
    }, 2000);

    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div className="w-full flex flex-col mb-6">
      <AnimatePresence>
        {ghStatus === 'FAILURE' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="w-full bg-red-950/40 border border-red-500/50 rounded-xl p-3 mb-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <div className="flex flex-col">
                <span className="text-red-400 font-bold text-xs uppercase">Alerta Crítico: Quebra de Pipeline</span>
                <span className="text-neutral-300 text-[10px]">O último job no GitHub Actions falhou. O deploy no Vercel pode estar comprometido.</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full flex border border-white/10 rounded-xl bg-black/40 overflow-hidden divide-x divide-white/10 relative">
        {/* Vercel Status */}
        <div className="flex-1 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-black/50 border border-white/5">
              <Server className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <p className="text-[10px] text-neutral-400 font-mono uppercase tracking-wider mb-0.5">Vercel Edge</p>
              <p className="text-xs font-semibold text-white">Deploy Ativo</p>
            </div>
          </div>
          <div>
            {vercelStatus === 'LOADING' ? (
              <Activity className="w-4 h-4 text-neutral-500 animate-spin" />
            ) : vercelStatus === 'ONLINE' ? (
              <span className="flex items-center gap-1.5 px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] uppercase font-bold font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                ONLINE
              </span>
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-500" />
            )}
          </div>
        </div>

        {/* GitHub Actions Status */}
        <div className="flex-1 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-black/50 border border-white/5">
              <Workflow className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <p className="text-[10px] text-neutral-400 font-mono uppercase tracking-wider mb-0.5">CI/CD Pipeline</p>
              <p className="text-xs font-semibold text-white">GitHub Actions</p>
            </div>
          </div>
          <div>
            {ghStatus === 'LOADING' ? (
              <Activity className="w-4 h-4 text-neutral-500 animate-spin" />
            ) : ghStatus === 'SUCCESS' ? (
              <span className="flex items-center gap-1.5 px-2 py-1 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30 text-[9px] uppercase font-bold font-mono">
                <CheckCircle2 className="w-3 h-3" />
                SUCCESS
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-2 py-1 rounded bg-red-500/20 text-red-400 border border-red-500/30 text-[9px] uppercase font-bold font-mono">
                <AlertTriangle className="w-3 h-3" />
                FAILURE
              </span>
            )}
          </div>
        </div>

        {/* Simulation Control */}
        <button
          onClick={onToggleStreaming}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#0b0e11] border border-white/10 flex items-center justify-center transition-all hover:bg-neutral-800 cursor-pointer shadow-lg outline-none"
          title={isStreaming ? "Pausar Simulação" : "Retomar Simulação"}
        >
          {isStreaming ? (
            <Pause className="w-3.5 h-3.5 text-amber-400" />
          ) : (
            <Play className="w-3.5 h-3.5 text-emerald-400" />
          )}
        </button>
      </div>
    </div>
  );
};
