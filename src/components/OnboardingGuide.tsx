import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Terminal, ArrowRight, HelpCircle, X, CheckCircle } from 'lucide-react';

interface TourStep {
  target: string;
  title: string;
  description: string;
  badge: string;
  icon: string;
}

export const OnboardingGuide: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Check if user has already completed the guide
    const completed = localStorage.getItem('invis_onboarding_guide_completed');
    if (!completed) {
      // Small timeout to let dashboard render first
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const steps: TourStep[] = [
    {
      target: 'header',
      title: 'Painel Core & Aura Cromática',
      description: 'Na barra superior, visualize seu saldo sacável de GOLD e SILVER, configure contratos de investimento (Upgrades) e mude a Aura Cromática (glow) do seu painel corporativo.',
      badge: 'SISTEMA CORE',
      icon: '👑'
    },
    {
      target: 'carousel',
      title: 'Trilhas do Carrossel de Multitarefas',
      description: 'Não há limites fixos! Quando não tiver janelas abertas, use o carrossel central para injetar até três módulos simultâneos na tela do seu computador. Você pode arrastá-los e reordená-los.',
      badge: 'CARROSSEL',
      icon: '🎠'
    },
    {
      target: 'tasks',
      title: 'Gerenciador Operacional',
      description: 'Temos um novíssimo submódulo To-Do List! Crie metas operacionais, ordene por prioridade, salve localmente e habilite alertas satélite clicando no botão de notificações push.',
      badge: 'NOVOS RECURSOS',
      icon: '🎯'
    },
    {
      target: 'social',
      title: 'Chat Global e Tradutor Babel',
      description: 'Converse com membros da resistência em tempo real. O sistema traduz automaticamente mensagens enviadas em russo, japonês ou inglês usando chaves integradas.',
      badge: 'SISTEMA SOCIAL',
      icon: '💬'
    },
    {
      target: 'coin',
      title: 'Roleta de Gold e Toques Háticos',
      description: 'Clique uma vez na moeda dourada central para abrir a Roleta Cibernética e minerar Gold grátis! Duplo clique abre o Gerenciador de Fração de Tela.',
      badge: 'MINERAÇÃO',
      icon: '🪙'
    }
  ];

  const triggerHaptic = (ms: number | number[] = 25) => {
    if (navigator.vibrate) {
      navigator.vibrate(ms as any);
    }
  };

  const handleNext = () => {
    triggerHaptic(30);
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    triggerHaptic(15);
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    triggerHaptic([60, 40, 60]);
    localStorage.setItem('invis_onboarding_guide_completed', 'true');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  const step = steps[currentStep];

  return (
    <div className="fixed inset-0 z-[8000] flex items-center justify-center bg-black/85 p-4 font-sans backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 30 }}
        className="w-full max-w-md rounded-[32px] bg-[#0c0c12] border-2 border-cyan-500/30 p-6 flex flex-col relative overflow-hidden shadow-[0_0_50px_rgba(0,190,255,0.2)]"
      >
        {/* Glow indicator line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-purple-500" />

        {/* Header toolbar */}
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-2 text-cyan-400">
            <Terminal className="w-4 h-4 animate-pulse" />
            <span className="font-mono text-[9px] tracking-[0.25em] font-black uppercase">
              REDE INVIS - ONBOARDING DE PROTOCOLO
            </span>
          </div>

          <button
            onClick={handleComplete}
            className="p-1 rounded-full text-neutral-500 hover:text-white transition-colors cursor-pointer"
            title="Encerrar Guia"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body content */}
        <div className="space-y-4 text-left flex-1 py-2">
          <div className="flex justify-between items-center">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-950/40 text-cyan-400 border border-cyan-500/20 font-mono text-[8px] font-bold tracking-widest uppercase">
              {step.badge}
            </span>
            <span className="text-xs text-neutral-500 font-mono">
              [ {currentStep + 1} / {steps.length} ]
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-3xl filter drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">
              {step.icon}
            </span>
            <h3 className="text-sm font-black uppercase text-white tracking-wider">
              {step.title}
            </h3>
          </div>

          <p className="text-[11.5px] text-neutral-400 leading-relaxed font-medium">
            {step.description}
          </p>
        </div>

        {/* Interactive progress bar */}
        <div className="w-full h-1 bg-neutral-900 rounded-full my-5 overflow-hidden flex">
          {steps.map((_, idx) => (
            <div
              key={idx}
              className={`flex-1 h-full transition-colors duration-350 ${
                idx <= currentStep ? 'bg-cyan-400' : 'bg-neutral-850'
              }`}
            />
          ))}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-1 shrink-0">
          <button
            onClick={handleComplete}
            className="px-4 py-2 hover:bg-neutral-900/50 text-neutral-500 hover:text-neutral-300 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
          >
            Pular Guia
          </button>

          <div className="flex gap-2">
            {currentStep > 0 && (
              <button
                onClick={handleBack}
                className="px-4 py-2.5 rounded-xl border border-white/5 text-neutral-400 hover:text-white text-[10px] font-mono uppercase tracking-wider transition-all cursor-pointer hover:bg-white/5"
              >
                Voltar
              </button>
            )}

            <button
              onClick={handleNext}
              className="px-5 py-2.5 rounded-xl bg-cyan-500 text-black text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer hover:bg-cyan-400 shadow-[0_0_15px_rgba(0,200,255,0.25)] flex items-center gap-1 hover:scale-103"
            >
              <span>{currentStep === steps.length - 1 ? 'Concluir' : 'Inserir Próximo'}</span>
              <ArrowRight className="w-3 h-3 text-black font-black" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
