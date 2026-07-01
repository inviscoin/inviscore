import React, { useState, useEffect } from 'react';
import { useInvis, DICTIONARY } from '../context/InvisContext';
import { useTranslation } from '../hooks/useTranslation';
import { motion, AnimatePresence } from 'motion/react';
import { AuthHandshake } from './AuthHandshake';
import { AuthWrapper } from './AuthWrapper';
import { InvisModal } from './InvisModal';
import { Eye, EyeOff, KeyRound, Globe, User, Mail, Lock } from 'lucide-react';
import { SupabaseService, isSupabaseConfigured, supabase } from '../lib/supabase';
import { useGoogleLogin } from '@react-oauth/google';
import { getLocalProfiles } from '../lib/supabase';

import { startAuthentication } from '@simplewebauthn/browser';

export const LoginScreen: React.FC = () => {
  const { 
    setStage, language, setLangDrawerOpen,
    setCurrentUser, setSystemStatus, setSelectedSupportPage
  } = useInvis();

  const [authStatusText, setAuthStatusText] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [modalObj, setModalObj] = useState<{ title: string; message: string; type: 'error' | 'success' | 'info', onClose?: () => void } | null>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { currentTexts } = useTranslation();

  const handleWebAuthnLogin = async () => {
    if (!email) {
      setModalObj({ title: "E-mail Necessário", message: "Insira seu e-mail para usar o login biométrico.", type: "error" });
      return;
    }
    setAuthStatusText("Inicializando Biometria...");
    setShowScanner(true);
    try {
      // Mock flow with our Express backend
      const optsResp = await fetch('/api/webauthn/generate-options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const options = await optsResp.json();
      
      // In a real flow with simplewebauthn:
      let asseResp;
      try {
        asseResp = await startAuthentication(options);
      } catch (authErr: any) {
        // se cancelar ou falhar a biometria do browser:
        throw new Error("Biometria cancelada ou dispositivo não compatível. " + authErr.message);
      }
      
      const verifyResp = await fetch('/api/webauthn/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, response: asseResp })
      });
      const verifyResult = await verifyResp.json();
      
      if (verifyResult.verified) {
         // Bypass login with biometric confirmation
         const list = getLocalProfiles();
         let found = list.find((p: any) => p.email?.toLowerCase().trim() === email.toLowerCase().trim());
         if (!found) {
            found = {
              id: 'bio-' + Date.now(),
              email: email,
              fullName: email.split('@')[0],
              tier: 'FREE'
            };
         }
         setCurrentUser({
            id: found.id,
            fullName: found.full_name || found.fullName || found.email?.split('@')[0] || "Membro Biométrico",
            nickname: found.nickname || found.email?.split('@')[0] || "BioUser",
            email: found.email,
            phone: found.phone || '+5511999999999',
            ddi: found.ddi || '+55',
            birthDate: found.birth_date || found.birthDate || '1995-10-31',
            age: found.age || 30,
            tier: found.tier || 'FREE',
            ageGroup: (found.age || 30) < 18 ? 'Kids' : 'Adult',
            isActive: true,
            termsAccepted: true,
            biometricsActive: true
         });
         setShowScanner(false);
         setStage('dashboard');
      } else {
        throw new Error("Falha na validação biométrica");
      }
    } catch (err: any) {
      setShowScanner(false);
      setModalObj({ title: "Falha na Biometria", message: err.message || "Não foi possível autenticar.", type: "error" });
    }
  };

  useEffect(() => {
    const handleOauthNotFound = () => {
      setShowScanner(false);
      setModalObj({
        title: "CADASTRO NECESSÁRIO",
        message: "Conta INVIS não localizada. Por favor, registre-se para criar seu perfil no ecossistema e vincular sua conta social.",
        type: "info",
        onClose: () => {
          setModalObj(null);
          setStage('register');
        }
      });
    };
    window.addEventListener('invis_oauth_not_found', handleOauthNotFound);
    return () => window.removeEventListener('invis_oauth_not_found', handleOauthNotFound);
  }, [setStage]);

  const handleStandardLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setModalObj({ title: "Acesso Negado", message: currentTexts.login_err_empty || "E-mail e senha são obrigatórios.", type: "error" });
      return;
    }

    setAuthStatusText(currentTexts.login_auth || "Autenticando na Matriz...");
    setShowScanner(true);

    try {
      const { data, error } = await SupabaseService.signIn(email, password);
      if (error) throw error;
      
      // Se for um usuário local de fallback (sem sessão ativa no Supabase ou objeto de sessão)
      if (data && data.user && !data.session) {
        setCurrentUser({
          id: data.user.id,
          fullName: data.user.full_name || data.user.fullName || "Membro INVIS",
          nickname: data.user.nickname || data.user.email?.split('@')[0] || "User",
          email: data.user.email,
          phone: data.user.phone || '+5511999999999',
          ddi: data.user.ddi || '+55',
          birthDate: data.user.birth_date || data.user.birthDate || '1995-10-31',
          age: data.user.age || 30,
          tier: data.user.tier || 'FREE',
          ageGroup: (data.user.age || 30) < 18 ? 'Kids' : 'Adult',
          isActive: true,
          termsAccepted: data.user.termsAccepted !== undefined ? data.user.termsAccepted : true,
          biometricsActive: false
        });
        setShowScanner(false);
        setStage('dashboard');
        return;
      }
      // InvisContext onAuthStateChange will handle redirection otherwise
    } catch (err: any) {
      setShowScanner(false);
      setModalObj({ title: "Falha na Autenticação", message: err.message || currentTexts.login_err_invalid || "E-mail ou senha incorretos.", type: "error" });
    }
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setAuthStatusText("Conectando ao INVIS...");
      setShowScanner(true);
      try {
        const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        if (!res.ok) throw new Error("Erro ao obter perfil do Googleinfo.");
        
        const userInfo = await res.json();
        const googleEmail = userInfo.email;
        const googleName = userInfo.name || "Membro INVIS Google";

        if (!isSupabaseConfigured()) {
          // Fallback local robusto
          const list = getLocalProfiles();
          const found = list.find((p: any) => p.email?.toLowerCase().trim() === googleEmail.toLowerCase().trim());
          if (found) {
            setCurrentUser({
              id: found.id,
              fullName: found.full_name || found.fullName || googleName,
              nickname: found.nickname || googleEmail.split('@')[0],
              email: googleEmail,
              phone: found.phone || '+5511999999999',
              ddi: found.ddi || '+55',
              birthDate: found.birth_date || found.birthDate || '1995-10-31',
              age: found.age || 30,
              tier: found.tier || 'FREE',
              ageGroup: (found.age || 30) < 18 ? 'Kids' : 'Adult',
              isActive: true,
              termsAccepted: found.termsAccepted !== undefined ? found.termsAccepted : true,
              biometricsActive: false
            });
            setShowScanner(false);
            setStage('dashboard');
          } else {
            setShowScanner(false);
            setModalObj({
              title: "CADASTRO NECESSÁRIO",
              message: `A conta Google (${googleEmail}) não possui cadastro no ecossistema INVIS. Vamos te direcionar para finalizar o seu cadastro com seus dados integrados.`,
              type: "info",
              onClose: () => {
                setModalObj(null);
                sessionStorage.setItem('invis_google_prefilled', JSON.stringify({
                  email: googleEmail,
                  fullName: googleName,
                }));
                setStage('register');
              }
            });
          }
          return;
        }

        // Fluxo com Supabase habilitado: Verificamos o perfil associado ao email do Google diretamente
        const profile = await SupabaseService.getProfileByEmail(googleEmail);
        if (profile) {
          setCurrentUser({
            id: profile.id,
            fullName: profile.full_name || profile.fullName || googleName,
            nickname: profile.nickname || googleEmail.split('@')[0],
            email: googleEmail,
            phone: profile.phone || '+5511999999999',
            ddi: profile.ddi || '+55',
            birthDate: profile.birth_date || profile.birthDate || '1995-10-31',
            age: profile.age || 30,
            tier: profile.tier || 'FREE',
            ageGroup: (profile.age || 30) < 18 ? 'Kids' : 'Adult',
            isActive: true,
            termsAccepted: true,
            biometricsActive: false
          });
          setShowScanner(false);
          setStage('dashboard');
          return;
        } else {
          setShowScanner(false);
          setModalObj({
            title: "CADASTRO NECESSÁRIO",
            message: `A conta Google (${googleEmail}) não possui cadastro no ecossistema INVIS. Redirecionando para finalização do cadastro.`,
            type: "info",
            onClose: () => {
              setModalObj(null);
              sessionStorage.setItem('invis_google_prefilled', JSON.stringify({
                email: googleEmail,
                fullName: googleName,
              }));
              setStage('register');
            }
          });
        }
      } catch (err: any) {
        setShowScanner(false);
        setModalObj({ title: "Erro de Autenticação", message: err.message || "Falha ao conectar via Google.", type: "error" });
      }
    },
    onError: () => {
      setShowScanner(false);
      setModalObj({ title: "Erro do Google", message: "Falha na resposta do credenciador de contas Google.", type: "error" });
    }
  });

  return (
    <>
      <AnimatePresence>
         {modalObj && <InvisModal title={modalObj.title} message={modalObj.message} type={modalObj.type} onClose={() => {
           if (modalObj.onClose) {
             modalObj.onClose();
           } else {
             setModalObj(null);
           }
         }} />}
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
                INVIS ECOSYSTEM
              </p>
            </div>

            <form onSubmit={handleStandardLogin} className="w-full flex flex-col space-y-4 font-sans">
              <div className="relative w-full">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400/60" />
                <input
                  type="text"
                  placeholder={currentTexts.user_placeholder || "Usuário, E-mail ou Telefone"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-cyan-500/20 bg-black/25 text-left text-sm outline-none focus:border-[#00c8ff] transition-all"
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                />
              </div>

              <div className="relative w-full">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400/60" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder={currentTexts.password_placeholder || "Senha"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-11 py-3.5 rounded-xl border border-cyan-500/20 bg-black/25 text-left text-sm outline-none focus:border-[#00c8ff] transition-all"
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-cyan-400/60 hover:text-cyan-400 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <button
                type="submit"
                className="w-full py-4 mt-2 rounded-xl bg-[#00c8ff] text-black font-black hover:scale-[1.02] active:scale-[0.98] transition-all text-sm uppercase shadow-[0_0_15px_rgba(0,200,255,0.3)] cursor-pointer outline-none"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                {currentTexts.login_btn || "ENTRAR"}
              </button>

              <div className="w-full flex justify-end">
                <button 
                  type="button" 
                  onClick={() => setStage('support_password')} 
                  className="text-[10px] text-cyan-500 hover:text-cyan-400 hover:underline cursor-pointer outline-none font-mono"
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  {currentTexts.forgot_password || "Esqueci a senha"}
                </button>
              </div>
            </form>

            <div className="w-full mt-6 flex flex-col items-center">
              <p className="text-xs text-neutral-500 tracking-wider uppercase mb-3 text-center select-none font-sans">
                {currentTexts.or_connect || "Ou conecte com:"}
              </p>

              <div className="grid grid-cols-1 gap-2 w-full">
                <button
                  type="button"
                  onClick={handleWebAuthnLogin}
                  className="relative w-full flex items-center justify-center gap-3 rounded-xl border border-white/5 bg-black/30 hover:bg-[#00c8ff]/10 transition-all cursor-pointer py-3 outline-none group"
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-400">
                    <path d="M12 2a10 10 0 0 0-10 10c0 5.52 4.48 10 10 10s10-4.48 10-10A10 10 0 0 0 12 2z"></path>
                    <path d="M12 6v6l4 2"></path>
                    <path d="M10 9a2 2 0 1 0 0 4 2 2 0 1 0 0-4z"></path>
                  </svg>
                  <span className="text-sm font-sans font-medium text-neutral-300 group-hover:text-white">Login Biométrico (WebAuthn)</span>
                </button>

                <button
                  type="button"
                  onClick={() => loginWithGoogle()}
                  className="relative w-full flex items-center justify-center gap-3 rounded-xl border border-white/5 bg-black/30 hover:bg-[#4285F4]/10 transition-all cursor-pointer overflow-hidden py-3 outline-none group"
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  <div className="flex items-center justify-center pointer-events-none">
                    <svg viewBox="0 0 24 24" width="20" height="20">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  </div>
                  <span className="text-sm font-sans font-medium text-neutral-300 group-hover:text-white">Acessar com Google</span>
                </button>
              </div>

              <div className="flex flex-col items-center space-y-3 pt-6 w-full">
                <hr className="w-full border-white/5" />
                <div className="text-center font-sans">
                  <p className="text-[#00c8ff] text-xs font-semibold cursor-pointer select-none hover:underline outline-none" onClick={() => setStage('register')} style={{ WebkitTapHighlightColor: 'transparent' }}>
                    {currentTexts.no_account || "Não possui cadastro? Clique Aqui"}
                  </p>
                </div>
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
            onComplete={() => {}}
          />
        )}
      </AnimatePresence>
    </>
  );
};

