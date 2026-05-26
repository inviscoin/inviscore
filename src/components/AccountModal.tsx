import React, { useState } from 'react';
import { useInvis } from '../context/InvisContext';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, Shield, Info, Key, Cpu, Zap, Activity, Mail, Phone, Calendar, Eye, EyeOff, ShieldCheck, Coins, Gift } from 'lucide-react';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'identidade' | 'virtual' | 'seguranca' | 'metricas' | 'financeiro' | 'giftbox';

export const AccountModal: React.FC<AccountModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, language, wallet, setWallet, systemStatus } = useInvis();
  const [activeTab, setActiveTab] = useState<TabType>('identidade');
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [generationCount, setGenerationCount] = useState(1);
  const [giftBoxCooldown, setGiftBoxCooldown] = useState(false);
  const [giftRewardMsg, setGiftRewardMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Real-time specs simulator
  const mockAESKey = "AES-256-GCM::" + Array.from({ length: 16 }).map(() => Math.floor(Math.random() * 16).toString(16)).join('').toUpperCase();

  const handleRegenerateKeys = () => {
    setGenerationCount(prev => prev + 1);
    if (navigator.vibrate) navigator.vibrate([20, 10, 20]);
    alert(language === 'pt-BR' 
      ? "Nova assinatura RSA gerada com sucesso e ancorada em buffer criptográfico local!"
      : "New RSA signature generated successfully and anchored in local cryptographic buffer!"
    );
  };

  const handleOpenGiftBox = () => {
    if (giftBoxCooldown) return;
    setGiftBoxCooldown(true);
    
    // Generate surprise reward between 100 and 500 IC Gold
    const reward = Math.floor(Math.random() * 401) + 100;
    
    // Apply state change directly to the global wallet!
    setWallet(prev => ({
      ...prev,
      icGold: prev.icGold + reward
    }));

    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);

    const msg = language === 'pt-BR'
      ? `🎉 Sucesso! Você abriu a Caixa Secreta e resgatou +${reward} IC Gold!`
      : `🎉 Success! You opened the Secret Box and claimed +${reward} IC Gold!`;
      
    setGiftRewardMsg(msg);
    setTimeout(() => {
      setGiftRewardMsg(null);
      setGiftBoxCooldown(false);
    }, 4000);
  };

  const handleMockDeposit = () => {
    setWallet(prev => ({
      ...prev,
      icGold: prev.icGold + 2500
    }));
    if (navigator.vibrate) navigator.vibrate([40, 40]);
    alert(language === 'pt-BR'
      ? "Depósito simulado com sucesso! +2500 IC adicionados ao seu saldo financeiro."
      : "Mock deposit success! +2500 IC added to your financial balance."
    );
  };

  // Localized string mapper helper for maximum correctness
  const getTabLabel = (tab: TabType): string => {
    const labels: Record<TabType, Record<string, string>> = {
      identidade: {
        'pt-BR': 'Identidade', 'en-US': 'Identity', 'es-ES': 'Identidad', 'fr-FR': 'Identité',
        'de-DE': 'Identität', 'it-IT': 'Identità', 'ja-JP': '身元', 'zh-CN': '真实身份',
        'ru-RU': 'Личность', 'ar-SA': 'الهوية', 'hi-IN': 'पहचान', 'ko-KR': '기본신원'
      },
      virtual: {
        'pt-BR': 'ID Virtual', 'en-US': 'Virtual ID', 'es-ES': 'ID Virtual', 'fr-FR': 'ID Virtuel',
        'de-DE': 'Virtuelle ID', 'it-IT': 'ID Virtuale', 'ja-JP': '仮想ID', 'zh-CN': '虚拟身份',
        'ru-RU': 'Виртуал ID', 'ar-SA': 'هوية افتراضية', 'hi-IN': 'आभासी आईडी', 'ko-KR': '가상 ID'
      },
      seguranca: {
        'pt-BR': 'Segurança', 'en-US': 'Security', 'es-ES': 'Seguridad', 'fr-FR': 'Sécurité',
        'de-DE': 'Sicherheit', 'it-IT': 'Sicurezza', 'ja-JP': 'セキュリティ', 'zh-CN': '密钥安全',
        'ru-RU': 'Безопасность', 'ar-SA': 'الأمان', 'hi-IN': 'सुरक्षा', 'ko-KR': '보안키'
      },
      metricas: {
        'pt-BR': 'Métricas', 'en-US': 'Metrics', 'es-ES': 'Métricas', 'fr-FR': 'Metriques',
        'de-DE': 'Metriken', 'it-IT': 'Metriche', 'ja-JP': '指標', 'zh-CN': '系统能耗',
        'ru-RU': 'Метрики', 'ar-SA': 'المقاييس', 'hi-IN': 'माप', 'ko-KR': '연결지표'
      },
      financeiro: {
        'pt-BR': 'Financeiro', 'en-US': 'Financial', 'es-ES': 'Financiero', 'fr-FR': 'Financier',
        'de-DE': 'Finanzen', 'it-IT': 'Finanziario', 'ja-JP': '財務', 'zh-CN': '资产负债',
        'ru-RU': 'Финансы', 'ar-SA': 'المالية', 'hi-IN': 'वित्तीय', 'ko-KR': '재무회계'
      },
      giftbox: {
        'pt-BR': 'Giftbox', 'en-US': 'Giftbox', 'es-ES': 'Cofre', 'fr-FR': 'Coffret',
        'de-DE': 'Geschenkbox', 'it-IT': 'Scatola Regalo', 'ja-JP': 'ギフト箱', 'zh-CN': '惊喜礼券',
        'ru-RU': 'Подарки', 'ar-SA': 'مكافآت', 'hi-IN': 'उपहार कूपन', 'ko-KR': '선물함'
      }
    };
    return labels[tab][language] || labels[tab]['en-US'] || labels[tab]['pt-BR'];
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-[7000] flex items-center justify-center bg-black/95 p-4 font-sans backdrop-blur-md cursor-pointer select-none"
    >
      <motion.div 
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 30 }}
        className="w-full max-w-lg rounded-[32px] bg-[#0b0e11] border border-cyan-500/20 text-white shadow-[0_0_40px_rgba(0,200,255,0.25)] flex flex-col overflow-hidden relative cursor-default"
      >
        {/* Glow Header Accent Line */}
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-cyan-400 via-indigo-500 to-[#8a2be2]" />

        {/* Modal Header */}
        <header className="flex justify-between items-center p-5 border-b border-white/5 bg-black/10">
          <div className="flex items-center gap-2.5 text-[#00c8ff]">
            <Shield className="w-5 h-5 animate-pulse" />
            <div>
              <h3 className="font-mono text-xs tracking-widest font-black uppercase text-white">
                {language === 'pt-BR' ? 'Minha Conta INVIS' : 'My INVIS Account'}
              </h3>
              <p className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest leading-none mt-1">
                {language === 'pt-BR' ? 'Aura Identidade Criptográfica' : 'Cryptographic Aura Identity'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/5 text-neutral-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* Dynamic Nav Tabs Scroll Wrapper */}
        <div className="flex overflow-x-auto no-scrollbar border-b border-white/5 bg-black/25 p-2 gap-1.5 shrink-0 whitespace-nowrap scroll-smooth">
          <button
            onClick={() => setActiveTab('identidade')}
            className={`px-3 py-1.5 text-[9.5px] font-mono uppercase font-black tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'identidade' 
                ? 'bg-[#00c8ff]/15 border border-cyan-500/30 text-white shadow-sm' 
                : 'text-neutral-500 hover:text-neutral-300 hover:bg-white/5 border border-transparent'
            }`}
          >
            <User className="w-3.5 h-3.5 text-cyan-400" />
            <span>{getTabLabel('identidade')}</span>
          </button>

          <button
            onClick={() => setActiveTab('virtual')}
            className={`px-3 py-1.5 text-[9.5px] font-mono uppercase font-black tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'virtual' 
                ? 'bg-emerald-500/15 border border-emerald-500/30 text-white shadow-sm' 
                : 'text-neutral-500 hover:text-neutral-300 hover:bg-white/5 border border-transparent'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>{getTabLabel('virtual')}</span>
          </button>

          <button
            onClick={() => setActiveTab('seguranca')}
            className={`px-3 py-1.5 text-[9.5px] font-mono uppercase font-black tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'seguranca' 
                ? 'bg-indigo-500/15 border border-indigo-500/30 text-white shadow-sm' 
                : 'text-neutral-500 hover:text-neutral-300 hover:bg-white/5 border border-transparent'
            }`}
          >
            <Key className="w-3.5 h-3.5 text-indigo-400" />
            <span>{getTabLabel('seguranca')}</span>
          </button>

          <button
            onClick={() => setActiveTab('metricas')}
            className={`px-3 py-1.5 text-[9.5px] font-mono uppercase font-black tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'metricas' 
                ? 'bg-purple-500/15 border border-purple-500/30 text-white shadow-sm' 
                : 'text-neutral-500 hover:text-neutral-300 hover:bg-white/5 border border-transparent'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-purple-400" />
            <span>{getTabLabel('metricas')}</span>
          </button>

          <button
            onClick={() => setActiveTab('financeiro')}
            className={`px-3 py-1.5 text-[9.5px] font-mono uppercase font-black tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'financeiro' 
                ? 'bg-amber-500/15 border border-amber-500/30 text-white shadow-sm' 
                : 'text-neutral-500 hover:text-neutral-300 hover:bg-white/5 border border-transparent'
            }`}
          >
            <Coins className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
            <span>{getTabLabel('financeiro')}</span>
          </button>

          <button
            onClick={() => setActiveTab('giftbox')}
            className={`px-3 py-1.5 text-[9.5px] font-mono uppercase font-black tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'giftbox' 
                ? 'bg-pink-500/15 border border-pink-500/30 text-white shadow-sm' 
                : 'text-neutral-500 hover:text-neutral-300 hover:bg-white/5 border border-transparent'
            }`}
          >
            <Gift className="w-3.5 h-3.5 text-pink-400 animate-bounce" />
            <span>{getTabLabel('giftbox')}</span>
          </button>
        </div>

        {/* Tab Body Viewports */}
        <div className="p-5 overflow-y-auto max-h-[380px] no-scrollbar space-y-4">
          <AnimatePresence mode="wait">
            {activeTab === 'identidade' && (
              <motion.div
                key="identidade-pane"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.15 }}
                className="space-y-4 text-left"
              >
                {/* User Avatar Circle */}
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-black/30 border border-white/5">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center text-black font-black text-sm relative border border-white/10 shrink-0">
                    {currentUser?.nickname?.substring(0, 2).toUpperCase() || 'IN'}
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#00FF80] rounded-full border border-black flex items-center justify-center text-[8px] font-black" title="Node Operacional Ativo">
                      ✓
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[#00c8ff] font-sans font-black text-xs uppercase tracking-wide truncate">
                      {currentUser?.fullName || 'Desenvolvedor INVIS'}
                    </p>
                    <p className="text-[10px] font-mono text-neutral-400">
                      @{currentUser?.nickname || 'guest'}
                    </p>
                  </div>
                  <div className="px-2 py-1 rounded bg-[#00FF80]/10 border border-[#00FF80]/20 text-[#00FF80] font-mono font-black text-[8px] tracking-wider uppercase shrink-0">
                    {currentUser?.tier || 'FREE'} ACC
                  </div>
                </div>

                {/* Identity Form parameters */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-black/20 border border-white/5 flex flex-col space-y-1">
                    <div className="flex items-center gap-1.5 text-neutral-500">
                      <Mail className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="text-[9px] font-mono uppercase tracking-wider font-bold">Correio Eletrônico</span>
                    </div>
                    <p className="text-[11px] text-white font-medium select-text break-all">{currentUser?.email || 'suporte@invis.io'}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-black/20 border border-white/5 flex flex-col space-y-1">
                    <div className="flex items-center gap-1.5 text-neutral-500">
                      <Phone className="w-3.5 h-3.5 text-indigo-400" />
                      <span className="text-[9px] font-mono uppercase tracking-wider font-bold">Dispositivo Móvel</span>
                    </div>
                    <p className="text-[11px] text-white font-medium select-text">{currentUser?.ddi ? `+${currentUser.ddi}` : ''} {currentUser?.phone || '+55 11 99999-9999'}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-black/20 border border-white/5 flex flex-col space-y-1">
                    <div className="flex items-center gap-1.5 text-neutral-500">
                      <Calendar className="w-3.5 h-3.5 text-purple-400" />
                      <span className="text-[9px] font-mono uppercase tracking-wider font-bold">Data de Nascimento</span>
                    </div>
                    <p className="text-[11px] text-white font-medium select-text">{currentUser?.birthDate || '20/05/2000'} ({currentUser?.age || 26} anos)</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-black/20 border border-white/5 flex flex-col space-y-1">
                    <div className="flex items-center gap-1.5 text-neutral-500">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-[9px] font-mono uppercase tracking-wider font-bold">Nível Etário</span>
                    </div>
                    <p className="text-[11px] text-white font-medium capitalize select-text">{currentUser?.ageGroup || 'adulto'}</p>
                  </div>
                </div>

                {/* LGPD Stamp note */}
                <div className="p-3 rounded-lg bg-[#00FF80]/5 border border-[#00FF80]/15 flex items-start gap-2">
                  <span className="text-[10px] mt-0.5" title="Proteção de identidade em tempo real">🛡️</span>
                  <div className="flex-1">
                    <p className="text-[8.5px] font-mono text-[#00FF80] uppercase tracking-wider font-bold">Certificado Homologado LGPD</p>
                    <p className="text-[9.5px] font-sans text-neutral-400 leading-normal mt-0.5">Seus dados pessoais encontram-se protegidos por buffers criptográficos descentralizados. Nenhuma informação sensitiva é retransmitida a rastreadores de terceiros.</p>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'virtual' && (
              <motion.div
                key="virtual-pane"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.15 }}
                className="space-y-4 text-left font-mono"
              >
                {/* Cyberpunk Passport Card */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0c1619] to-[#04080a] border border-emerald-500/20 relative overflow-hidden">
                  <div className="absolute top-3 right-3 text-[10px] text-emerald-400">PASSPORT //</div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-[8.5px] text-neutral-500 uppercase tracking-widest font-black">INVIS DEC TRACE ID</p>
                      <p className="text-xs text-white tracking-widest font-black font-mono">NODE-AURA-{(currentUser?.nickname || 'GUEST').padEnd(8, 'X').toUpperCase().substring(0,8)}-{currentUser?.ddi || '2026'}</p>
                    </div>
                    <hr className="border-white/5" />
                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div>
                        <span className="text-neutral-500 block uppercase text-[8px]">Matrix Server</span>
                        <span className="text-[#00c8ff] font-bold">Edge-West-2.run.app</span>
                      </div>
                      <div>
                        <span className="text-neutral-500 block uppercase text-[8px]">Security Clearance</span>
                        <span className="text-emerald-400 font-bold">Level {currentUser?.tier === 'FREE' ? '01' : '02'} (Active)</span>
                      </div>
                    </div>
                    <div className="h-6 w-full bg-[linear-gradient(90deg,#00ff80_3px,transparent_3px)] bg-[size:10px_100%] opacity-40 mt-2" />
                  </div>
                </div>

                {/* Additional virtual statistics */}
                <div className="p-4 rounded-xl bg-black/30 border border-white/5 text-[10px] space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-400">Status Holográfico:</span>
                    <span className="text-emerald-400 font-black">VIRTUALIZED OPERATIONAL</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-400">Filtro de Ruído Cognitivo:</span>
                    <span className="text-[#00c8ff] font-bold">99.85 Mhz (Ultra Stable)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-400">Taxa de Hash Autenticadora:</span>
                    <span className="text-purple-400">248 kb/s RSA-4096</span>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'seguranca' && (
              <motion.div
                key="seguranca-pane"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.15 }}
                className="space-y-4 text-left"
              >
                {/* 2FA Toggle option */}
                <div className="p-4 rounded-2xl bg-black/30 border border-white/5 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-semibold text-white">Autenticação de Dois Fatores (2FA)</h4>
                    <p className="text-[10px] text-neutral-500 max-w-[250px] leading-normal mt-0.5">Injeta tokens rotativos temporários na fechadura de acesso do screensaver.</p>
                  </div>
                  <button
                    onClick={() => { setTwoFactorEnabled(!twoFactorEnabled); if (navigator.vibrate) navigator.vibrate(15); }}
                    className={`w-11 h-6 rounded-full transition-all cursor-pointer relative ${
                      twoFactorEnabled ? 'bg-indigo-500' : 'bg-neutral-800'
                    }`}
                  >
                    <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-all ${
                      twoFactorEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                {/* Client-side Cryptographic Identity Signature */}
                <div className="p-4 rounded-xl bg-black/20 border border-white/5 space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-mono text-indigo-400 uppercase tracking-widest font-extrabold flex items-center gap-1">
                      <Key className="w-3 h-3 text-indigo-400" />
                      Assinatura RSA Simétrica ({generationCount}ª Gerada)
                    </span>
                    <button
                      onClick={() => setShowSecretKey(!showSecretKey)}
                      className="text-[9px] font-mono text-neutral-500 hover:text-white transition-all cursor-pointer flex items-center gap-1 uppercase font-bold text-left"
                    >
                      {showSecretKey ? (
                        <><EyeOff className="w-3 h-3 text-neutral-400" /> Ocultar</>
                      ) : (
                        <><Eye className="w-3 h-3" /> Visualizar</>
                      )}
                    </button>
                  </div>

                  <div className="bg-black/60 font-mono text-[9.5px] p-2.5 rounded border border-white/5 break-all max-h-16 overflow-y-auto no-scrollbar text-neutral-400 leading-normal">
                    {showSecretKey ? mockAESKey : "••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••"}
                  </div>

                  <button
                    onClick={handleRegenerateKeys}
                    className="w-full py-2 border border-indigo-500/20 bg-indigo-500/10 hover:bg-indigo-500 text-indigo-400 hover:text-white rounded-lg transition-all text-[9.5px] font-mono font-black uppercase tracking-wider cursor-pointer"
                  >
                    Rotacionar Certificado Local
                  </button>
                </div>

                {/* Account metadata statistics */}
                <div className="p-3.5 rounded-xl bg-black/20 border border-white/5 text-[10px] space-y-1.5 text-left">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Biometria Facial Ativa:</span>
                    <span className="text-emerald-400 font-bold">{currentUser?.biometricsActive ? 'HABILITADA' : 'INATIVA'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Data de Ancoragem IP:</span>
                    <span className="text-white font-mono">{currentUser?.ipAcceptance || '127.0.0.1 (Local)'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Última Auditoria Técnica:</span>
                    <span className="text-white font-mono">20/05/2026 - Concluída</span>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'metricas' && (
              <motion.div
                key="metricas-pane"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.15 }}
                className="space-y-4 text-left font-mono"
              >
                {/* real-time CPU node stats */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="p-3 rounded-xl bg-black/20 border border-white/5 space-y-1">
                    <p className="text-[8px] text-neutral-500 uppercase tracking-wider font-bold">Processamento Simulado GPU</p>
                    <p className="text-sm font-black text-white">42.8 <span className="text-[10px] font-normal text-neutral-500">MHs</span></p>
                    <div className="w-full h-1 bg-black/40 rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-400 w-3/5" />
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-black/20 border border-white/5 space-y-1">
                    <p className="text-[8px] text-neutral-500 uppercase tracking-wider font-bold">Taxa de Eficiência Térmica</p>
                    <p className="text-sm font-black text-[#00FF80]">99.42%</p>
                    <div className="w-full h-1 bg-black/40 rounded-full overflow-hidden">
                      <div className="h-full bg-[#00FF80] w-[99%]" />
                    </div>
                  </div>
                </div>

                {/* continuous mining gold balance stats */}
                <div className="p-4 rounded-2xl bg-black/30 border border-white/5 space-y-2 text-center relative overflow-hidden">
                  <div className="absolute top-2 right-2 text-[8px] text-purple-400 bg-purple-500/10 px-1 py-0.5 rounded border border-purple-500/20">LIVE TICK</div>
                  <p className="text-[9px] uppercase tracking-widest text-[#00c8ff] font-bold">Giro Contínuo Aura Gold Balance</p>
                  <p className="text-xl font-black text-[#00FF80]">{wallet.icGold.toFixed(8)} <span className="text-[10px] text-neutral-400 uppercase font-thin">ic</span></p>
                  <p className="text-[8.5px] font-sans text-neutral-500 leading-normal">Seu node está processando algoritmos de mineração contínua em segundo plano enquanto você se mantém focado.</p>
                </div>

                {/* Server-side peer telemetry network */}
                <div className="space-y-2">
                  <span className="text-[9px] uppercase text-neutral-500 font-extrabold tracking-widest">Auditoria de Telemetria de Nodes</span>
                  <div className="p-3.5 rounded-xl bg-black/20 border border-white/5 space-y-1.5 text-[9.5px]">
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Mecanismo Operacional:</span>
                      <span className="text-white">COGNITIVE_MINING</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Latência do Peer Node:</span>
                      <span className="text-white">12 ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Status Geral do Node:</span>
                      <span className="text-emerald-400 font-bold">{systemStatus || 'Sincronizado'}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'financeiro' && (
              <motion.div
                key="financeiro-pane"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.15 }}
                className="space-y-4 text-left font-mono text-[11px]"
              >
                {/* Financial Ledger Balance card */}
                <div className="p-4 rounded-2xl bg-black/40 border border-amber-500/10 relative overflow-hidden flex flex-col items-center justify-center text-center space-y-2">
                  <div className="absolute top-2 right-2 text-[8px] bg-amber-500/10 text-amber-400 px-1 py-0.5 rounded">ECO BALANCE</div>
                  <Coins className="w-7 h-7 text-amber-500 animate-pulse mt-2" />
                  <div className="space-y-0.5">
                    <p className="text-[9px] uppercase text-neutral-500 tracking-wider">Saldo Criptográfico Ativo</p>
                    <p className="text-2xl font-black text-amber-400">{(wallet.icGold).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 5 })} IC</p>
                    <p className="text-[10px] text-neutral-400">≈ ${(wallet.icGold / 2500).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD</p>
                  </div>
                </div>

                {/* PIX Mock Simulator Trigger */}
                <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 flex flex-col justify-between items-center text-center gap-2.5">
                  <div>
                    <h4 className="text-[11px] font-bold text-white uppercase">Injetor de Ativos PIX (Simulado)</h4>
                    <p className="text-[9.5px] text-neutral-400 leading-tight">Adiciona +2500 IC ao saldo para transações instantâneas.</p>
                  </div>
                  <button
                    onClick={handleMockDeposit}
                    className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold uppercase tracking-widest text-[9.5px] cursor-pointer transition-all active:scale-95"
                  >
                    Simular Depósito PIX
                  </button>
                </div>

                {/* Ledger entries mock */}
                <div>
                  <p className="text-[9px] text-neutral-500 uppercase tracking-widest font-black mb-2">Histórico de Alterações de Crédito</p>
                  <div className="space-y-1.5">
                    <div className="p-2 rounded bg-black/25 border border-white/5 flex justify-between items-center text-[10px]">
                      <span className="text-neutral-400">Giro Contínuo Aura Block</span>
                      <span className="text-emerald-400 font-bold">+125.034 IC</span>
                    </div>
                    <div className="p-2 rounded bg-black/25 border border-white/5 flex justify-between items-center text-[10px]">
                      <span className="text-neutral-400">Verificação de Node Secundário</span>
                      <span className="text-emerald-400 font-bold">+500.000 IC</span>
                    </div>
                    <div className="p-2 rounded bg-black/25 border border-white/5 flex justify-between items-center text-[10px]">
                      <span className="text-neutral-400">Acesso Portal Multiplex</span>
                      <span className="text-rose-500 font-bold">-15.540 IC</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'giftbox' && (
              <motion.div
                key="giftbox-pane"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.15 }}
                className="space-y-4 text-left font-mono"
              >
                {/* Visual Interative Giftbox */}
                <div className="p-5 rounded-2xl bg-[#140b12] border border-pink-500/20 text-center flex flex-col items-center justify-center space-y-4">
                  <div className="relative">
                    <Gift className={`w-12 h-12 text-pink-500 ${giftBoxCooldown ? 'animate-bounce' : 'animate-pulse'}`} />
                    <div className="absolute inset-0 bg-pink-500/10 rounded-full filter blur-xl animate-ping" />
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="text-xs font-black uppercase text-pink-400 tracking-wider">
                      {language === 'pt-BR' ? 'CAIXA OPERACIONAL MISTERIOSA' : 'MYSTERIOUS OPERATIONAL GIFTBOX'}
                    </h4>
                    <p className="text-[10px] text-neutral-400 max-w-sm mx-auto leading-normal">
                      {language === 'pt-BR' 
                        ? 'Abra esta caixa holográfica para extrair créditos extras de 100 a 500 IC instantaneamente!' 
                        : 'Open this holographic card to claim random extra credits between 100 and 500 IC instantly!'}
                    </p>
                  </div>

                  {giftRewardMsg && (
                    <motion.div 
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="p-2.5 rounded-xl bg-pink-900/10 border border-pink-500/30 text-pink-300 text-[10.5px] font-bold animate-pulse text-center"
                    >
                      {giftRewardMsg}
                    </motion.div>
                  )}

                  <button
                    onClick={handleOpenGiftBox}
                    disabled={giftBoxCooldown}
                    className={`w-full py-2 bg-pink-500 hover:bg-pink-400 text-black text-[10.5px] uppercase font-bold tracking-widest rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      giftBoxCooldown ? 'opacity-50 cursor-not-allowed bg-neutral-800 text-neutral-500' : ''
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5 fill-black" />
                    <span>{giftBoxCooldown ? 'Cooldown Ativado' : 'Abrir Caixa de Prêmios'}</span>
                  </button>
                </div>

                {/* Additional promotional codes text info */}
                <div className="p-3 rounded-lg bg-black/30 border border-white/5 text-[9.5px]">
                  <p className="text-zinc-500 uppercase font-bold">Vouchers & Campanhas</p>
                  <p className="text-neutral-400 mt-0.5">Fique atento aos canais sociais exclusivos INVIS para resgatar códigos promocionais de recargas adicionais de VIP2!</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Modal Footer actions */}
        <footer className="p-5 border-t border-white/5 bg-black/20 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 hover:border-cyan-400 border border-white/10 rounded-xl text-neutral-400 hover:text-white text-xs font-mono font-bold uppercase transition-all tracking-wider cursor-pointer"
          >
            {language === 'pt-BR' ? 'Voltar' : 'Back'}
          </button>
        </footer>
      </motion.div>
    </div>
  );
};
