import React, { useState, useEffect } from 'react';
import { useInvis, DICTIONARY } from '../context/InvisContext';
import { useTranslation } from '../hooks/useTranslation';
import { motion, AnimatePresence } from 'motion/react';
import { User, Mail, Tag, Lock, ChevronDown, Check, ArrowLeft, X, Calendar } from 'lucide-react';
import { SupabaseService } from '../lib/supabase';
import { AuthWrapper } from './AuthWrapper';
import { InvisModal } from './InvisModal';

const DDI_COUNTRIES = [
  { code: '+55', flag: '🇧🇷', name: 'Brasil' },
  { code: '+1', flag: '🇺🇸', name: 'USA/Canada' },
  { code: '+34', flag: '🇪🇸', name: 'España' },
  { code: '+33', flag: '🇫🇷', name: 'France' },
  { code: '+49', flag: '🇩🇪', name: 'Deutschland' },
  { code: '+39', flag: '🇮🇹', name: 'Italia' },
  { code: '+81', flag: '🇯🇵', name: 'Japan' },
  { code: '+86', flag: '🇨🇳', name: 'China' },
  { code: '+7', flag: '🇷🇺', name: 'Russia' },
  { code: '+966', flag: '🇸🇦', name: 'Saudi Arabia' },
  { code: '+91', flag: '🇮🇳', name: 'India' },
  { code: '+82', flag: '🇰🇷', name: 'South Korea' }
];

const getDdiPhoneRule = (code: string) => {
  switch (code) {
    case '+55':
      return { minLocal: 10, maxLocal: 11, placeholder: '(DD) 99999-9999', label: 'Brasil: DDD (2) + Nº (8 ou 9 dgt)' };
    case '+1':
      return { minLocal: 10, maxLocal: 10, placeholder: '(AAA) 555-0199', label: 'USA/Canada: Area (3) + Nº (7 dgt)' };
    case '+34':
      return { minLocal: 9, maxLocal: 9, placeholder: '600000000', label: 'Espanha: Nº de 9 dígitos' };
    case '+33':
      return { minLocal: 9, maxLocal: 9, placeholder: '600000000', label: 'França: Nº de 9 dígitos' };
    default:
      return { minLocal: 8, maxLocal: 11, placeholder: 'Número de telefone', label: 'Local: 8 a 11 dígitos' };
  }
};

export const RegisterScreen: React.FC = () => {
  const { setStage, language, setCurrentUser } = useInvis();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [ddi, setDdi] = useState('+55');
  const [phone, setPhone] = useState('');
  const [isDdiOpen, setIsDdiOpen] = useState(false);
  const [modalObj, setModalObj] = useState<{ title: string; message: string; type: 'error' | 'success' | 'info' } | null>(null);
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  // Birth Date and Age setup
  const [birthDate, setBirthDate] = useState(''); // dd/mm/aa
  const [calculatedAge, setCalculatedAge] = useState<number | null>(null);
  const [birthDateError, setBirthDateError] = useState('');

  const { currentTexts } = useTranslation();

  useEffect(() => {
    if (localStorage.getItem('invis_oauth_error') === 'not_found') {
      localStorage.removeItem('invis_oauth_error');
      setModalObj({
        title: "CADASTRO NECESSÁRIO",
        message: "Conta não localizada. Por favor, preencha os dados abaixo para criar seu perfil no ecosistema INVIS e vincular sua conta social.",
        type: "info"
      });
    }
  }, []);

  // Block Spaces physically on key down / change
  const handleNoSpacesInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ' ') {
      e.preventDefault();
    }
  };

  const handleEmailChange = (val: string) => {
    const cleanEmail = val.replace(/\s+/g, '');
    setEmail(cleanEmail);
    if (!cleanEmail) {
      setEmailError('');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setEmailError((currentTexts as any).reg_err_email || 'Formato de e-mail inválido (exemplo@dominio.com).');
    } else {
      setEmailError('');
    }
  };

  const handlePhoneChange = (val: string) => {
    const digits = val.replace(/\D/g, '');
    setPhone(digits);

    const rule = getDdiPhoneRule(ddi);
    if (!digits) {
      setPhoneError('');
    } else if (digits.length < rule.minLocal) {
      setPhoneError(`Mínimo de ${rule.minLocal} dígitos para este DDI.`);
    } else if (digits.length > rule.maxLocal) {
      setPhoneError(`Máximo de ${rule.maxLocal} dígitos permitido.`);
    } else {
      setPhoneError('');
    }
  };

  // Re-validate phone when DDI changes
  useEffect(() => {
    if (phone) {
      const digits = phone.replace(/\D/g, '');
      const rule = getDdiPhoneRule(ddi);
      if (digits.length < rule.minLocal) {
        setPhoneError(`Mínimo de ${rule.minLocal} dígitos para este DDI.`);
      } else if (digits.length > rule.maxLocal) {
        setPhoneError(`Máximo de ${rule.maxLocal} dígitos permitido.`);
      } else {
        setPhoneError('');
      }
    }
  }, [ddi, phone]);

  const handleBirthDateChange = (val: string) => {
    let digits = val.replace(/\D/g, '');
    
    let formatted = '';
    if (digits.length > 0) {
      formatted += digits.substring(0, 2);
    }
    if (digits.length > 2) {
      formatted += '/' + digits.substring(2, 4);
    }
    if (digits.length > 4) {
      formatted += '/' + digits.substring(4, 8); 
    }
    
    setBirthDate(formatted);
    
    if (digits.length >= 6) {
      validateAndCalculateAge(formatted, digits);
    } else {
      setCalculatedAge(null);
      setBirthDateError('');
    }
  };

  const validateAndCalculateAge = (formatted: string, digits: string) => {
    const day = parseInt(digits.substring(0, 2), 10);
    const month = parseInt(digits.substring(2, 4), 10);
    const yearStr = digits.substring(4);
    
    if (month < 1 || month > 12) {
      setBirthDateError('Mês inválido.');
      setCalculatedAge(null);
      return;
    }
    
    if (day < 1 || day > 31) {
      setBirthDateError('Dia inválido.');
      setCalculatedAge(null);
      return;
    }

    let year = parseInt(yearStr, 10);
    if (yearStr.length === 2) {
      if (year <= 26) {
        year += 2000;
      } else {
        year += 1900;
      }
    } else if (yearStr.length !== 4) {
      setBirthDateError('Ano incompleto (use DD/MM/AA).');
      setCalculatedAge(null);
      return;
    }

    const daysInMonths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) {
      daysInMonths[1] = 29;
    }

    if (day > daysInMonths[month - 1]) {
      setBirthDateError('Data incorreta ou inexistente.');
      setCalculatedAge(null);
      return;
    }

    const refYear = 2026;
    const refMonth = 5;
    const refDay = 19;

    let age = refYear - year;
    if (month > refMonth || (month === refMonth && day > refDay)) {
      age--;
    }

    if (age < 0 || age > 115) {
      setBirthDateError('Idade fora dos limites operacionais.');
      setCalculatedAge(null);
      return;
    }

    setBirthDateError('');
    setCalculatedAge(age);
  };

  const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,20}$/;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (fullName.trim().length < 15) {
      setModalObj({ title: (currentTexts as any).declined || "CADASTRO DECLINADO", message: (currentTexts as any).reg_err_name || 'O Nome Completo deve possuir no mínimo 15 caracteres.', type: 'error' });
      return;
    }
    const isValidFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!isValidFormat) {
      setModalObj({ title: (currentTexts as any).declined || "CADASTRO DECLINADO", message: (currentTexts as any).reg_err_email || 'E-mail formatado incorretamente.', type: 'error' });
      setEmailError((currentTexts as any).reg_err_email || 'Formato de e-mail inválido (exemplo@dominio.com).');
      return;
    }
    if (nickname.trim().length < 5 || nickname.trim().length > 10) {
      setModalObj({ title: (currentTexts as any).declined || "CADASTRO DECLINADO", message: (currentTexts as any).reg_err_nick || 'O Nickname deve conter de 5 a 10 caracteres.', type: 'error' });
      return;
    }

    const rule = getDdiPhoneRule(ddi);
    const cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < rule.minLocal || cleanPhone.length > rule.maxLocal) {
      setModalObj({ title: (currentTexts as any).declined || "CADASTRO DECLINADO", message: `Telefone inválido para ${selectedDdiObj.name}. Esperado de ${rule.minLocal} a ${rule.maxLocal} dígitos.`, type: 'error' });
      setPhoneError(`Esperado de ${rule.minLocal} a ${rule.maxLocal} dígitos.`);
      return;
    }

    if (!birthDate) {
      setModalObj({ title: (currentTexts as any).declined || "CADASTRO DECLINADO", message: (currentTexts as any).reg_err_birth || 'A Data de Nascimento é obrigatória.', type: 'error' });
      setBirthDateError((currentTexts as any).required_field || 'Campo obrigatório.');
      return;
    }
    if (birthDateError || calculatedAge === null) {
      setModalObj({ title: (currentTexts as any).declined || "CADASTRO DECLINADO", message: (currentTexts as any).reg_err_birth || 'Forneça uma Data de Nascimento válida.', type: 'error' });
      return;
    }

    if (!passRegex.test(password)) {
      setModalObj({ title: (currentTexts as any).declined || "CADASTRO DECLINADO", message: (currentTexts as any).reg_err_pass || 'Sua senha não atende aos critérios do padrão INVIS.', type: 'error' });
      return;
    }

    try {
      const { data, error } = await SupabaseService.signUp(email, password, {
        fullName,
        nickname,
        phone: `${ddi} ${phone}`,
        ddi,
        birthDate
      });
      const user = data?.user;

      if (error) {
        setModalObj({ title: "ERRO DE SERVIDOR", message: error.message || 'Falha ao realizar o registro no sistema backend.', type: 'error' });
        return;
      }

      setCurrentUser({
        id: user?.id || 'usr_temp_' + Math.random().toString(36).substr(2, 9),
        fullName,
        nickname,
        email,
        phone: `${ddi} ${phone}`,
        ddi,
        birthDate,
        age: calculatedAge,
        tier: 'FREE',
        ageGroup: calculatedAge < 18 ? 'Kids' : 'Adult',
        isActive: true,
        termsAccepted: false,
        biometricsActive: false,
        tempPassword: password
      } as any);

      setStage('onboarding_age');
    } catch (err: any) {
      setModalObj({ title: "ERRO CRÍTICO", message: err.message || 'Erro inesperado durante o registro.', type: 'error' });
    }
  };

  const selectedDdiObj = DDI_COUNTRIES.find(c => c.code === ddi) || DDI_COUNTRIES[0];

  return (
    <>
      <AnimatePresence>
        {modalObj && <InvisModal title={modalObj.title} message={modalObj.message} type={modalObj.type} onClose={() => setModalObj(null)} />}
      </AnimatePresence>
      
      <AuthWrapper>
      <div className="w-full max-h-screen overflow-y-auto no-scrollbar pb-6 pt-4">
        <div className="w-full max-w-md p-[1px] bg-gradient-to-b from-[#00FF80]/40 to-transparent rounded-[32px] shadow-[0_0_30px_rgba(0,255,128,0.15)] bg-black/40 backdrop-blur-md z-10 relative">
          
          <div className="w-full p-8 rounded-[32px] bg-[#0b0e11]/85 border border-white/5 flex flex-col items-center">
            
            <div className="w-full flex justify-start mb-2">
              <button 
                id="register_back_login"
                onClick={() => setStage('login')}
                className="flex items-center gap-2 text-xs text-neutral-400 hover:text-white transition-all cursor-pointer outline-none focus:outline-none"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{currentTexts.back_login || "Voltar ao Login"}</span>
              </button>
            </div>

            <div className="text-center mb-6">
              <h2 className="font-sans font-black text-2xl tracking-wider text-emerald-400 uppercase mb-1">
                {currentTexts.reg_title || "NOVA CONTA INVIS"}
              </h2>
              <p className="text-neutral-500 text-[10px] uppercase font-mono tracking-widest leading-none">
                {currentTexts.reg_subtitle || "Cadastro Blindado Padrão INVIS"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="w-full flex flex-col space-y-4 font-sans">
              
              <div className="relative w-full">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400/60" />
                <input
                  type="text"
                  placeholder={currentTexts.full_name_label || "NOME COMPLETO"}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-cyan-500/20 bg-black/25 text-left text-sm outline-none focus:border-[#00FF80] transition-all"
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                />
              </div>

              <div className="relative w-full">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400/60" />
                  <input
                    type="email"
                    placeholder={(currentTexts as any).email_sov || "E-MAIL SOVEREIGN"}
                    value={email}
                    onKeyDown={handleNoSpacesInput}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    className={`w-full pl-11 pr-4 py-3.5 rounded-xl border bg-black/25 text-left text-sm outline-none transition-all ${
                      emailError 
                        ? 'border-red-500/50 focus:border-red-400 text-red-200' 
                        : 'border-cyan-500/20 focus:border-[#00FF80]'
                    }`}
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  />
                </div>
                {emailError && (
                  <p className="text-[10px] text-red-400 font-mono text-center mt-1 animate-pulse">
                    ⚠ {emailError}
                  </p>
                )}
              </div>

              <div className="relative w-full">
                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400/60" />
                <input
                  type="text"
                  placeholder={currentTexts.nickname_label || "NICKNAME"}
                  value={nickname}
                  maxLength={10}
                  onKeyDown={handleNoSpacesInput}
                  onChange={(e) => setNickname(e.target.value.replace(/\s+/g, ''))}
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-cyan-500/20 bg-black/25 text-left text-sm outline-none focus:border-[#00FF80] transition-all"
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                />
              </div>

              <div className="w-full">
                <div className="relative flex w-full gap-2 z-50">
                  <button
                    type="button"
                    onClick={() => setIsDdiOpen(!isDdiOpen)}
                    className="w-20 px-2 flex items-center justify-center gap-[2px] rounded-xl border border-cyan-500/20 bg-black/25 text-center text-sm cursor-pointer outline-none focus:outline-none"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    <span className="font-mono text-xs font-semibold tracking-tighter text-neutral-300">{selectedDdiObj.code}</span>
                    <ChevronDown className="w-3.5 h-3.5 opacity-50" />
                  </button>

                  <div className="relative flex-1">
                    <span className="absolute left-4 top-1/2 -translate-y-[55%] text-sm select-none">{selectedDdiObj.flag}</span>
                    <input
                      type="text"
                      placeholder={getDdiPhoneRule(ddi).placeholder}
                      value={phone}
                      onKeyDown={handleNoSpacesInput}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      className={`w-full pl-11 pr-4 py-3.5 rounded-xl border bg-black/25 text-left text-sm outline-none transition-all ${
                        phoneError 
                          ? 'border-red-500/50 focus:border-red-400 text-red-200' 
                          : 'border-cyan-500/20 focus:border-[#00FF80]'
                      }`}
                      style={{ WebkitTapHighlightColor: 'transparent' }}
                    />
                  </div>

                  {isDdiOpen && (
                    <div className="absolute top-[52px] left-0 w-48 max-h-48 overflow-y-auto rounded-xl bg-[#0b0e11] border border-neutral-800 p-1 divide-y divide-white/5 no-scrollbar shadow-2xl z-[1000]">
                      {DDI_COUNTRIES.map((cnt) => (
                        <button
                          key={cnt.code}
                          type="button"
                          onClick={() => {
                            setDdi(cnt.code);
                            setIsDdiOpen(false);
                          }}
                          className="w-full px-3 py-2 flex items-center justify-between text-xs hover:bg-neutral-800/80 rounded-lg transition-all text-left cursor-pointer outline-none focus:outline-none"
                          style={{ WebkitTapHighlightColor: 'transparent' }}
                        >
                          <span className="flex items-center gap-2">
                            <span>{cnt.flag}</span>
                            <span>{cnt.name}</span>
                          </span>
                          <span className="font-mono opacity-60 text-[10px]">{cnt.code}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-[9.5px] text-neutral-500 font-mono mt-1 text-center font-semibold">
                  🔔 Req: {getDdiPhoneRule(ddi).label}
                </p>
                {phoneError && (
                  <p className="text-[10px] text-red-400 font-mono text-center mt-1 animate-pulse">
                    ⚠ {phoneError}
                  </p>
                )}
              </div>

              <div className="w-full">
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400/60" />
                  <input
                    type="text"
                    maxLength={10}
                    placeholder="Data de Nascimento (DD/MM/AA)"
                    value={birthDate}
                    onKeyDown={handleNoSpacesInput}
                    onChange={(e) => handleBirthDateChange(e.target.value)}
                    className={`w-full pl-11 pr-4 py-3.5 rounded-xl border bg-black/25 text-left text-sm outline-none transition-all ${
                      birthDateError 
                        ? 'border-red-500/50 focus:border-red-400 text-red-200' 
                        : 'border-cyan-500/20 focus:border-[#00FF80]'
                    }`}
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  />
                </div>
                {birthDateError && (
                  <p className="text-[10px] text-red-400 font-mono text-center mt-1 animate-pulse">
                    ⚠ {birthDateError}
                  </p>
                )}
                {calculatedAge !== null && (
                  <div className="flex items-center justify-center gap-1.5 mt-1.5 p-2 rounded-xl bg-cyan-950/20 border border-cyan-500/20 animate-fade-in">
                    <span className="text-[10px] font-mono tracking-wide text-cyan-400">
                      Idade Detectada: <strong className="text-white text-xs">{calculatedAge} anos</strong>
                    </span>
                    <span className={`px-1.5 py-0.5 rounded text-[8.5px] font-mono font-bold uppercase ${
                      calculatedAge < 18 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/20' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
                    }`}>
                      {calculatedAge < 18 ? 'Sistêmico Menor' : 'Sistêmico Adulto'}
                    </span>
                  </div>
                )}
              </div>

              <div className="relative w-full">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400/60" />
                <input
                  type="password"
                  placeholder={currentTexts.password_reg_label || "CRIAR SENHA BLINDADA"}
                  value={password}
                  onKeyDown={handleNoSpacesInput}
                  onChange={(e) => setPassword(e.target.value.replace(/\s+/g, ''))}
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-cyan-500/20 bg-black/25 text-left text-sm outline-none focus:border-[#00FF80] transition-all"
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                />
              </div>

              <div className="p-3.5 rounded-xl bg-black/40 border border-neutral-800/80 text-[10px] text-neutral-400 grid grid-cols-2 gap-x-2 gap-y-2.5 font-mono select-none relative z-10">
                <div className="flex items-center gap-2">
                  {password.length >= 6 ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <X className="w-3.5 h-3.5 text-red-500/50 shrink-0" />
                  )}
                  <span className={password.length >= 6 ? 'text-emerald-400 font-bold' : 'text-neutral-500'}>Min. 6 caracteres</span>
                </div>
                <div className="flex items-center gap-2">
                  {/[A-Z]/.test(password) ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <X className="w-3.5 h-3.5 text-red-500/50 shrink-0" />
                  )}
                  <span className={/[A-Z]/.test(password) ? 'text-emerald-400 font-bold' : 'text-neutral-500'}>{currentTexts.reg_req_upper || "Letra Maiúscula"}</span>
                </div>
                <div className="flex items-center gap-2">
                  {/[a-z]/.test(password) ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <X className="w-3.5 h-3.5 text-red-500/50 shrink-0" />
                  )}
                  <span className={/[a-z]/.test(password) ? 'text-emerald-400 font-bold' : 'text-neutral-500'}>{currentTexts.reg_req_lower || "Letra Minúscula"}</span>
                </div>
                <div className="flex items-center gap-2">
                  {/\d/.test(password) ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <X className="w-3.5 h-3.5 text-red-500/50 shrink-0" />
                  )}
                  <span className={/\d/.test(password) ? 'text-emerald-400 font-bold' : 'text-neutral-500'}>{currentTexts.reg_req_num || "Um dígito"}</span>
                </div>
                <div className="flex items-center gap-2 col-span-2">
                  {/[@$!%*?&]/.test(password) ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <X className="w-3.5 h-3.5 text-red-500/50 shrink-0" />
                  )}
                  <span className={/[@$!%*?&]/.test(password) ? 'text-emerald-400 font-bold' : 'text-neutral-500'}>{currentTexts.reg_req_spec || "Especial (@$!%*?&)"}</span>
                </div>
              </div>

              <button
                type="submit"
                id="register_submit_btn"
                className="w-full py-4 mt-2 rounded-xl bg-[#00FF80] text-black font-black hover:scale-[1.02] active:scale-[0.98] transition-all text-sm uppercase shadow-[0_0_15px_rgba(0,255,128,0.3)] cursor-pointer outline-none"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                {currentTexts.create_btn || "CRIAR ACESSO BLINDADO"}
              </button>
            </form>

            <p className="mt-4 text-[9px] text-neutral-500 font-sans tracking-wide text-center">
              {(currentTexts as any).reg_terms_note || "Ao prosseguir, você concorda com nossos termos da LGPD e processamentos criptográficos de metadados."}
            </p>
          </div>
        </div>
      </div>
      </AuthWrapper>
    </>
  );
};
