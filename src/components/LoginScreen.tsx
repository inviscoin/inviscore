import React, { useState } from 'react';
import { useInvis, DICTIONARY } from '../context/InvisContext';
import { motion, AnimatePresence } from 'motion/react';
import { AuthHandshake } from './AuthHandshake';
import { AuthWrapper } from './AuthWrapper';
import { InvisModal } from './InvisModal';
import { Eye, EyeOff, KeyRound, Globe, User } from 'lucide-react';
import { SupabaseService, isSupabaseConfigured } from '../lib/supabase';

export const LoginScreen: React.FC = () => {
  const { 
    setStage, language, setLangDrawerOpen,
    setCurrentUser, setSystemStatus, setSelectedSupportPage
  } = useInvis();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authStatusText, setAuthStatusText] = useState('Autenticando...');
  const [showScanner, setShowScanner] = useState(false);
  const [modalObj, setModalObj] = useState<{ title: string; message: string; type: 'error' | 'success' | 'info' } | null>(null);

  const currentTexts = DICTIONARY[language];
  const [authedSupabaseUser, setAuthedSupabaseUser] = useState<any>(null);

  const triggerSocialAuth = async (provider: 'google' | 'facebook' | 'instagram') => {
    setAuthStatusText(`Conectando ao provedor ${provider.toUpperCase()}...`);
    setShowScanner(true);
    
    // We attempt real OAuth handshake
    const { error } = await SupabaseService.signInWithOAuth(provider);
    
    if (error) {
       setShowScanner(false);
       setModalObj({
         title: "Erro de Conexão",
         message: "Falha na autenticação social: " + error.message,
         type: "error"
       });
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setModalObj({ title: "DADOS INVÁLIDOS", message: currentTexts.login_err_empty || 'Insira seu usuário, e-mail ou telefone.', type: 'error' });
      return;
    }
    if (!password || password.length < 6) {
      setModalObj({ title: "DADOS INVÁLIDOS", message: currentTexts.reg_req_min || 'Sua senha deve conter no mínimo 6 caracteres.', type: 'error' });
      return;
    }

    setAuthStatusText(currentTexts.login_auth || 'Validando credenciais na Matriz...');

    if (isSupabaseConfigured()) {
      const { data, error } = await SupabaseService.signIn(identifier, password);
      if (error) {
        setModalObj({ title: "FALHA NO LOGIN", message: error.message || 'Erro de autenticação no Supabase.', type: 'error' });
        return;
      }
      if (data?.user) {
        const profile = await SupabaseService.getProfile(data.user.id);
        setAuthedSupabaseUser({
          id: data.user.id,
          fullName: profile?.full_name || 'Fundador INVIS Cérebro',
          nickname: profile?.nickname || identifier.split('@')[0],
          email: data.user.email || identifier,
          phone: profile?.phone || '+5511999999999',
          ddi: profile?.ddi || '+55',
          birthDate: profile?.birth_date || '1995-10-31',
          age: profile?.age || 30,
          tier: profile?.tier || 'FREE',
          ageGroup: (profile?.age || 30) < 18 ? 'Kids' : 'Adult',
          isActive: true,
          termsAccepted: true,
          biometricsActive: false
        });
      }
    } else {
      setAuthedSupabaseUser(null);
    }

    setShowScanner(true);
  };

  const finalizeSessionAura = () => {
    setShowScanner(false);
    if (authedSupabaseUser) {
      setCurrentUser(authedSupabaseUser);
    } else {
      setCurrentUser({
        id: 'usr_' + Math.random().toString(36).substr(2, 9),
        fullName: 'Usuário INVIS',
        nickname: identifier.includes('@') ? identifier.split('@')[0].substring(0, 10) : identifier.substring(0, 10),
        email: identifier.includes('@') ? identifier : 'user@inviscore.com',
        phone: '+5511999999999',
        ddi: '+55',
        birthDate: '1995-10-31',
        age: 30,
        tier: 'FREE', 
        ageGroup: 'Adult',
        isActive: true,
        termsAccepted: true,
        biometricsActive: false
      });
    }
    // Transition to Onboarding Age logic instead of immediately dashboard, as requested
    // "não dá pra acessar o dashboard sem confirmação de idade"
    // Though for returning logic maybe skip, but strictly go to onboarding_age
    setStage('onboarding_age');
  };

  return (
    <>
      <AnimatePresence>
         {modalObj && <InvisModal title={modalObj.title} message={modalObj.message} type={modalObj.type} onClose={() => setModalObj(null)} />}
      </AnimatePresence>

      <AuthWrapper>
        <div className="w-full flex justify-end mb-4">
          <button 
            id="login_lang_toggle"
            onClick={() => setLangDrawerOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-cyan-500/20 bg-black/30 hover:bg-black/60 transition-all text-xs outline-none"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>🌐 {language}</span>
          </button>
        </div>

        <div className="w-full p-[1px] bg-gradient-to-b from-[#00c8ff]/40 to-transparent rounded-[32px] shadow-[0_0_30px_rgba(0,200,255,0.15)] bg-black/40 backdrop-blur-md">
          <div className="w-full p-8 rounded-[32px] bg-[#0b0e11]/85 border border-white/5 flex flex-col items-center">
            
            <div className="text-center mb-6">
              <h1 className="font-sans font-black text-4xl tracking-[0.25em] text-white uppercase mb-1 drop-shadow-[0_0_15px_rgba(0,200,255,0.4)]">
                LOGIN
              </h1>
              <p className="font-mono text-[9px] text-[#00c8ff] uppercase tracking-[0.3em] font-medium opacity-80 mt-1">
                INVIS ECOSYSTEM v1.0
              </p>
            </div>

            <motion.form 
              key="login-form"
              onSubmit={handleLoginSubmit}
              className="w-full flex flex-col space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="relative w-full">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400/60" />
                <input
                  type="text"
                  placeholder={currentTexts.user_placeholder || "Usuário, E-mail ou Telefone"}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full pl-11 pr-4 py-4 rounded-xl border border-cyan-500/20 bg-black/20 text-left font-sans focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all text-sm outline-none text-white placeholder-neutral-500"
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                />
              </div>

              <div className="relative w-full">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400/60" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder={currentTexts.password_placeholder || "Senha"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-12 py-4 rounded-xl border border-cyan-500/20 bg-black/20 text-left font-sans focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all text-sm outline-none text-white placeholder-neutral-500"
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                />
                
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-cyan-400/60 hover:text-cyan-400 transition-all cursor-pointer outline-none focus:outline-none focus:ring-0 active:scale-95"
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <button
                type="submit"
                className="w-full py-4 mt-2 rounded-xl bg-[#00FF80] text-black font-black hover:scale-[1.02] active:scale-[0.98] transition-all text-sm uppercase shadow-[0_0_15px_rgba(0,255,128,0.3)] cursor-pointer outline-none"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                {currentTexts.login_btn || "Entrar"}
              </button>

              <div className="flex flex-col items-center space-y-3 pt-3">
                <button
                  type="button"
                  onClick={() => setStage('support_password')}
                  className="text-xs text-neutral-400 hover:text-white transition-all cursor-pointer font-sans outline-none"
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                   {currentTexts.forgot_password || "Esqueci a senha"}
                </button>

                <hr className="w-full border-white/5" />

                <div className="text-center font-sans">
                  <p className="text-[#00c8ff] text-xs font-semibold cursor-pointer select-none hover:underline outline-none" onClick={() => setStage('register')} style={{ WebkitTapHighlightColor: 'transparent' }}>
                    {currentTexts.no_account || "Não possui cadastro? Clique Aqui"}
                  </p>
                </div>
              </div>
            </motion.form>

            <div className="w-full mt-6 flex flex-col items-center">
              <p className="text-xs text-neutral-500 tracking-wider uppercase mb-3 text-center select-none font-sans">
                {currentTexts.or_connect || "Ou conecte com"}
              </p>

              <div className="grid grid-cols-2 gap-4 w-full">
                <button
                  type="button"
                  onClick={() => triggerSocialAuth('google')}
                  className="relative flex items-center justify-center p-3 rounded-xl border border-white/5 bg-black/30 hover:bg-[#4285F4]/10 transition-all cursor-pointer outline-none focus:outline-none"
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  <svg viewBox="0 0 24 24" width="22" height="22">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={() => triggerSocialAuth('facebook')}
                  className="relative flex items-center justify-center p-3 rounded-xl border border-white/5 bg-black/30 hover:bg-[#1877F2]/10 transition-all cursor-pointer outline-none focus:outline-none"
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="#1877F2">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-4 text-xs text-neutral-500 font-sans">
          <button onClick={() => { setSelectedSupportPage('privacidade'); setStage('onboarding_terms'); }} className="hover:text-cyan-400 hover:underline cursor-pointer outline-none" style={{ WebkitTapHighlightColor: 'transparent' }}>Política de Privacidade</button>
          <span>•</span>
          <button onClick={() => { setSelectedSupportPage('termos'); setStage('onboarding_terms'); }} className="hover:text-cyan-400 hover:underline cursor-pointer outline-none" style={{ WebkitTapHighlightColor: 'transparent' }}>Termos de Uso</button>
          <span>•</span>
          <button onClick={() => { setSelectedSupportPage('exclusao'); setStage('onboarding_terms'); }} className="hover:text-cyan-400 hover:underline cursor-pointer outline-none" style={{ WebkitTapHighlightColor: 'transparent' }}>Exclusão de Dados</button>
        </div>
      </AuthWrapper>

      <AnimatePresence>
        {showScanner && (
          <AuthHandshake 
            statusText={authStatusText}
            onComplete={finalizeSessionAura}
          />
        )}
      </AnimatePresence>
    </>
  );
};
