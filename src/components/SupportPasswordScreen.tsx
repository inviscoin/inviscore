import React, { useState } from 'react';
import { useInvis } from '../context/InvisContext';
import { motion, AnimatePresence } from 'motion/react';
import { AuthWrapper } from './AuthWrapper';
import { InvisModal } from './InvisModal';
import { ArrowLeft } from 'lucide-react';

export const SupportPasswordScreen: React.FC = () => {
  const { setStage } = useInvis();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [message, setMessage] = useState('');
  const [modal, setModal] = useState<{title: string, msg: string, type: 'error' | 'info' | 'success'} | null>(null);

  const handleRecover = () => {
    if (!email.includes('@')) {
      setModal({ title: 'E-MAIL INVÁLIDO', msg: 'Por favor, digite um e-mail válido.', type: 'error' });
      return;
    }
    setStep(2);
  };

  const finalSubmit = () => {
    if (!firstName.trim()) {
      setModal({ title: 'NOME INVÁLIDO', msg: 'Digite seu primeiro nome.', type: 'error' });
      return;
    }
    setMessage("Sua senha chegará em seu e-mail em até 12 horas.");
    setTimeout(() => {
      setStage('login');
    }, 5000);
  };

  return (
    <AuthWrapper>
      <div className="w-full relative">
        <AnimatePresence>
          {modal && (
            <InvisModal 
              title={modal.title} 
              message={modal.msg} 
              type={modal.type} 
              onClose={() => setModal(null)} 
            />
          )}
        </AnimatePresence>

        <div className="w-full p-[1px] bg-gradient-to-b from-[#ef4444]/40 to-transparent rounded-[32px] shadow-[0_0_30px_rgba(239,68,68,0.15)] bg-black/40 backdrop-blur-md">
          <div className="w-full p-10 rounded-[32px] bg-[#0b0e11]/85 border border-[#ef4444]/20 flex flex-col items-center">
            
            <h2 className="font-sans font-black text-2xl tracking-[6px] text-red-500 uppercase mb-8 text-center">
              RECUPERAÇÃO
            </h2>

            <AnimatePresence mode="wait">
              {step === 1 && !message ? (
                <motion.div key="step1" initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }} className="w-full flex flex-col gap-4">
                  <p className="text-[#aaa] text-[0.8rem] text-center mb-2">Digite seu e-mail cadastrado</p>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@exemplo.com"
                    className="w-full p-[18px] bg-white/5 border border-red-500/50 rounded-xl text-white text-center mb-[20px] font-sans outline-none focus:outline-none focus:ring-1 focus:ring-red-400 placeholder:text-white/30"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  />
                  <button 
                    onClick={handleRecover}
                    className="w-full p-[18px] bg-red-500 text-white font-black text-sm uppercase rounded-xl border-none shadow-[0_0_15px_rgba(239,68,68,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all outline-none"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    CONTINUAR
                  </button>
                </motion.div>
              ) : step === 2 && !message ? (
                <motion.div key="step2" initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }} className="w-full flex flex-col gap-4">
                  <p className="text-[#aaa] text-[0.8rem] text-center mb-2">Para confirmar, digite seu primeiro nome</p>
                  <input 
                    type="text" 
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Seu nome"
                    className="w-full p-[18px] bg-white/5 border border-red-500/50 rounded-xl text-white text-center mb-[20px] font-sans outline-none focus:outline-none focus:ring-1 focus:ring-red-400 placeholder:text-white/30"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  />
                  <button 
                    onClick={finalSubmit}
                    className="w-full p-[18px] bg-red-500 text-white font-black text-sm uppercase rounded-xl border-none shadow-[0_0_15px_rgba(239,68,68,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all outline-none"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    SOLICITAR SENHA
                  </button>
                </motion.div>
              ) : message ? (
                <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full flex flex-col items-center">
                  <p className="text-[#00FF80] font-black text-center mb-2">{message}</p>
                  <div className="w-full h-[2px] bg-[#00FF80] mt-[10px]" style={{ animation: 'drain 5s linear forwards' }} />
                </motion.div>
              ) : null}
            </AnimatePresence>

            <button 
              onClick={() => setStage('login')}
              className="mt-8 text-neutral-500 text-[0.8rem] hover:text-white transition-colors uppercase tracking-[1px] outline-none"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              Voltar ao Login
            </button>
          </div>
        </div>

        <style dangerouslySetInnerHTML={{__html: `
          @keyframes drain { from { width: 100%; } to { width: 0%; } }
        `}} />
      </div>
    </AuthWrapper>
  );
};
