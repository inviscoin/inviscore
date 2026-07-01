import React, { useState } from 'react';
import { useInvis } from '../context/InvisContext';
import { motion, AnimatePresence } from 'motion/react';
import { AuthWrapper } from './AuthWrapper';
import { InvisModal } from './InvisModal';
import { supabase } from '../lib/supabase';

export const UpdatePasswordScreen: React.FC = () => {
  const { setStage } = useInvis();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<{title: string, msg: string, type: 'error' | 'info' | 'success'} | null>(null);

  const handleSubmit = async () => {
    if (password.length < 6) {
      setModal({ title: 'SENHA FRACA', msg: 'Sua nova senha deve ter no mínimo 6 caracteres.', type: 'error' });
      return;
    }
    if (password !== confirmPassword) {
      setModal({ title: 'SENHAS DIFERENTES', msg: 'As senhas não coincidem.', type: 'error' });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setModal({ title: 'ERRO', msg: error.message || 'Falha ao atualizar a senha.', type: 'error' });
    } else {
      setModal({ title: 'SUCESSO', msg: 'Sua senha foi atualizada. Você já pode acessar sua conta.', type: 'success' });
      setTimeout(() => {
        setStage('dashboard');
      }, 3000);
    }
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
              onClose={() => {
                setModal(null);
                if (modal.type === 'success') {
                  setStage('dashboard');
                }
              }} 
            />
          )}
        </AnimatePresence>

        <div className="w-full p-[1px] bg-gradient-to-b from-[#00c8ff]/40 to-transparent rounded-[32px] shadow-[0_0_30px_rgba(0,200,255,0.15)] bg-black/40 backdrop-blur-md">
          <div className="w-full p-10 rounded-[32px] bg-[#0b0e11]/85 border border-[#00c8ff]/20 flex flex-col items-center">
            
            <h2 className="font-sans font-black text-2xl tracking-[6px] text-[#00c8ff] uppercase mb-8 text-center">
              NOVA SENHA
            </h2>

            <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="w-full flex flex-col gap-4">
              <p className="text-[#aaa] text-[0.8rem] text-center mb-2">Digite sua nova senha de acesso.</p>
              
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nova Senha"
                className="w-full p-[18px] bg-white/5 border border-[#00c8ff]/50 rounded-xl text-white text-center mb-[5px] font-sans outline-none focus:outline-none focus:ring-1 focus:ring-[#00c8ff] placeholder:text-white/30"
              />
              
              <input 
                type="password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirme a Nova Senha"
                className="w-full p-[18px] bg-white/5 border border-[#00c8ff]/50 rounded-xl text-white text-center mb-[20px] font-sans outline-none focus:outline-none focus:ring-1 focus:ring-[#00c8ff] placeholder:text-white/30"
              />

              <button 
                onClick={handleSubmit}
                disabled={loading}
                className="w-full p-[18px] bg-[#00c8ff] text-black font-black text-sm uppercase rounded-xl border-none shadow-[0_0_15px_rgba(0,200,255,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'ATUALIZANDO...' : 'SALVAR NOVA SENHA'}
              </button>
            </motion.div>

          </div>
        </div>
      </div>
    </AuthWrapper>
  );
};
