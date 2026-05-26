import React, { useState, useEffect, useRef } from 'react';
import { useInvis, DICTIONARY } from '../context/InvisContext';
import { motion } from 'motion/react';
import { ShieldCheck, CalendarRange, Scale, AlertOctagon, UserCheck, Trash2 } from 'lucide-react';
import { SupabaseService, isSupabaseConfigured } from '../lib/supabase';

export const OnboardingFlow: React.FC = () => {
  const { 
    currentUser, setCurrentUser, setStage, language, wallet, setWallet, addTransaction 
  } = useInvis();

  const [subStage, setSubStage] = useState<'age' | 'terms'>('age');
  const [birthInput, setBirthInput] = useState('');
  const [calculatedAge, setCalculatedAge] = useState<number | null>(null);
  const [isValidAge, setIsValidAge] = useState(false);

  // Terms scroll tracking
  const [hasScrollToBottom, setHasScrollToBottom] = useState(false);
  const [userIP, setUserIP] = useState('Detectando...');
  const textContainerRef = useRef<HTMLDivElement>(null);

  const currentTexts = DICTIONARY[language];

  // Fetch real IP or mock fallback
  useEffect(() => {
    fetch('https://api.ipify.org?format=json')
      .then(res => res.json())
      .then(data => setUserIP(data.ip))
      .catch(() => setUserIP('216.58.202.78')); // fallback Google DNS IP
  }, []);

  // Age mask formatter on type
  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 6) value = value.substring(0, 6);

    // Apply dd/mm/aa format
    let formatted = '';
    if (value.length >= 1) formatted += value.substring(0, 2);
    if (value.length >= 3) formatted += '/' + value.substring(2, 4);
    if (value.length >= 5) formatted += '/' + value.substring(4, 6);

    setBirthInput(formatted);

    // Calculate age automatically upon full date match
    if (value.length === 6) {
      const day = parseInt(value.substring(0, 2));
      const month = parseInt(value.substring(2, 4));
      const yearPrefix = parseInt(value.substring(4, 6));

      if (day > 0 && day <= 31 && month > 0 && month <= 12) {
        const currentYearFull = new Date().getFullYear();
        const currentYearPrefix = currentYearFull % 100;
        
        let fullYear = 2000 + yearPrefix;
        if (yearPrefix > currentYearPrefix) {
          fullYear = 1900 + yearPrefix;
        }

        const birthDate = new Date(fullYear, month - 1, day);
        const today = new Date();
        let ageDiff = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          ageDiff--;
        }

        if (ageDiff >= 0 && ageDiff < 120) {
          setCalculatedAge(ageDiff);
          setIsValidAge(true);
        } else {
          setCalculatedAge(null);
          setIsValidAge(false);
        }
      } else {
        setCalculatedAge(null);
        setIsValidAge(false);
      }
    } else {
      setCalculatedAge(null);
      setIsValidAge(false);
    }
  };

  const handleAgeConfirm = () => {
    if (!currentUser) return;

    // We already calculated this in the Registration screen.
    const age = currentUser?.age || 18;

    // Determine age group tier routing mapping
    let allocatedGroup: 'Kids' | 'Teen' | 'Adult' | 'Senior' = 'Adult';
    if (age <= 13) allocatedGroup = 'Kids';
    else if (age <= 17) allocatedGroup = 'Teen';
    else if (age >= 50) allocatedGroup = 'Senior';

    setCurrentUser({
      ...currentUser,
      ageGroup: allocatedGroup,
      tier: allocatedGroup === 'Senior' ? 'VIP1' : 'VIP2' // High convenience testing tiers
    });

    localStorage.setItem('invis_age', age.toString());

    setSubStage('terms');
  };

  const handleScrollDetect = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (target.scrollTop + target.clientHeight >= target.scrollHeight - 12) {
      setHasScrollToBottom(true);
    }
  };

  const handleTermsAccept = async () => {
    if (!currentUser) return;

    let finalUser = {
      ...currentUser,
      termsAccepted: true,
      ipAcceptance: userIP,
      timestampAcceptance: new Date().toISOString()
    };

    if (isSupabaseConfigured()) {
      const email = currentUser.email;
      const pass = (currentUser as any).tempPassword || 'InvisP@ssw0rd!';
      const profileData = {
        fullName: currentUser.fullName,
        nickname: currentUser.nickname,
        phone: currentUser.phone,
        birthDate: currentUser.birthDate,
        age: currentUser.age
      };

      const { data, error } = await SupabaseService.signUp(email, pass, profileData);
      if (error) {
        alert('Falha ao registrar dados no Supabase: ' + error.message);
        return;
      }
      if (data?.user) {
        finalUser.id = data.user.id;
      }
    }

    // Clean tempPassword reference
    delete (finalUser as any).tempPassword;

    setCurrentUser(finalUser);
    setStage('dashboard');
  };

  // Hard Delete cleanup action on cancel/disagree
  const handleHardDelete = () => {
    localStorage.clear();
    setCurrentUser(null);
    setStage('login');
  };

  return (
    <div className="relative w-full min-h-screen py-10 px-4 flex flex-col items-center justify-center bg-[#0b0e11] text-white">
      {/* Moving background details */}
      <div className="absolute inset-0 opacity-10 pointer-events-none matrix-line-overlay" />

      {subStage === 'age' ? (
        /* STAGE 1: TRAVA DE IDADE (Confirmation since we already got it in Register) */
        <motion.div 
          key="onb-age"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md p-8 rounded-3xl bg-[#0b0e11]/85 border border-[#00c8ff]/30 shadow-[0_0_25px_rgba(0,200,255,0.15)] flex flex-col items-center text-center font-sans"
        >
          <div className="relative w-20 h-20 mb-6 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow-[0_0_8px_#00c8ff]">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#00c8ff" strokeWidth="1" strokeDasharray="5 5" />
              <path d="M30,70 Q50,20 70,70" stroke="#00FF80" fill="none" strokeWidth="3" />
              <circle cx="50" cy="40" r="10" fill="#00c8ff" />
            </svg>
            <CalendarRange className="absolute w-6 h-6 text-[#00c8ff]" />
          </div>

          <h2 className="text-sm font-mono tracking-[0.25em] text-[#00c8ff] uppercase mb-4">
            PERFIL SANCIONADO
          </h2>

          <div className="w-full mb-6 text-center">
             <div className="text-[#00FF80] font-mono text-xl font-bold tracking-widest mt-4 bg-[#00FF80]/10 py-2 rounded-xl border border-[#00FF80]/20">
               {currentUser?.age} ANOS
             </div>
             <p className="text-xs text-neutral-400 mt-3 font-semibold uppercase font-mono">
                Acesso Liberado para o perfil: <span className="text-cyan-400">{currentUser?.ageGroup}</span>
             </p>
          </div>

          <div className="flex gap-4 w-full">
            <button
              onClick={handleHardDelete}
              className="flex-1 py-3.5 border border-red-500 text-red-500 rounded-xl text-xs font-bold uppercase transition-all tracking-wider hover:bg-red-500/10 cursor-pointer"
            >
              {currentTexts.cancel}
            </button>
            <button
              onClick={handleAgeConfirm}
              className="flex-1 py-3.5 bg-[#00FF80] text-black rounded-xl text-xs font-black uppercase transition-all tracking-wider shadow-[0_0_15px_rgba(0,255,128,0.25)] cursor-pointer hover:scale-105"
            >
              Confirmar
            </button>
          </div>

          <p className="mt-6 text-[10px] text-neutral-500 leading-relaxed uppercase">
            {currentTexts.coppa_note}
          </p>
        </motion.div>
      ) : (
        /* STAGE 2: ADESÃO E CERTIDÃO DE TERMOS LGPD */
        <motion.div 
          key="onb-terms"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg p-8 rounded-3xl bg-[#0b0e11]/85 border border-[#00FF80]/30 shadow-[0_0_25px_rgba(0,255,128,0.15)] flex flex-col font-sans"
        >
          <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-4">
            <Scale className="w-5 h-5 text-cyan-400" />
            <div className="text-left">
              <h3 className="text-xs font-mono tracking-widest text-[#00c8ff] uppercase font-black">Conformidade Jurídica LGPD</h3>
              <p className="text-[10px] text-neutral-500">IP DE ACESSO: <span className="font-mono text-white">{userIP}</span></p>
            </div>
          </div>

          {/* terms terms context text */}
          <div 
            ref={textContainerRef}
            onScroll={handleScrollDetect}
            className="h-64 overflow-y-auto bg-black/40 border border-white/5 rounded-xl p-4 text-[11px] text-neutral-400 leading-relaxed space-y-4 no-scrollbar scroll-smooth"
          >
            <p className="font-bold text-white text-xs align-center text-center uppercase tracking-wider">
              --- ESTREITA OBSERVÂNCIA À LEI Nº 13.709/2018 ---
            </p>
            <p>
              <strong>Cláusula 1 (Privacidade e Segurança):</strong> Este documento formaliza o compromisso de segurança de dados e zelo pelos registros, evitando vazamentos e acessos indevidos no ecossistema INVIS. Os dados estão em compliance integral com a LGPD e GDPR internacional.
            </p>
            <p>
              <strong>Cláusula 2 (Ecossistema Restrito):</strong> O ecossistema INVIS opera como uma Single Page Application unificada com sandboxes de redirecionamento. Págamentos são processados em APIs do lado do servidor (Bouncer API Gateway).
            </p>
            <p>
              <strong>Cláusula 3 (Remoção de Metadados):</strong> Toda imagem enviada ao sistema (Galeria, Fórum, Fotos) passa por um processo local e imediato de <strong>EXIF Stripping</strong> (descarte de geolocalização e modelo do aparelho) para garantir sua segurança e anonimato absoluto contra stalking.
            </p>
            <p>
              <strong>Cláusula 4 (Antifraude e Regras da Economia):</strong> A mineração de moedas INVIS (ic) está atrelada à retenção de tela ativa e visualizações genuínas. A utilização de bots, simuladores de clicks, ou macros acarretará em Shadow-Ban permanente aplicado por nossos <strong>Circuit Breakers</strong>.
            </p>
            <p>
              <strong>Cláusula 5 (Dual Wallet e Moeda de Prata):</strong> Itens adquiridos com Moedas de Prata (acumuladas por bônus ou aportes) herdam permanentemente a tag <code>is_stamped=true</code>, impossibilitando sua revenda.
            </p>
            <p className="font-mono text-center text-neutral-500 text-[10px] py-2 border-t border-white/5">
              Role até o fim para liberar a assinatura digital corporativa de termos.
            </p>
          </div>

          {/* Action Row progress buttons */}
          <div className="mt-6 flex flex-col gap-3">
            <button
              disabled={!hasScrollToBottom}
              onClick={handleTermsAccept}
              className="w-full py-4 bg-[#00FF80] disabled:bg-neutral-800 disabled:text-neutral-500 text-black font-black uppercase text-xs tracking-widest rounded-xl transition-all shadow-[0_0_15px_rgba(0,255,128,0.25)] flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{hasScrollToBottom ? 'ACEITO E ASSINO' : 'ROLE ATÉ O FIM'}</span>
            </button>

            <button
              onClick={handleHardDelete}
              className="w-full py-3 border border-red-500/40 text-red-500 rounded-xl text-xs font-bold uppercase transition-all tracking-wider hover:bg-red-500/10 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Discordo (Expurgar dados)</span>
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
