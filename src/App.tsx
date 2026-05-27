import React, { useState, useEffect } from 'react';
import { InvisProvider, useInvis, DICTIONARY } from './context/InvisContext';
import { LiveKitProvider } from './context/LiveKitContext';
import { LockScreen } from './components/LockScreen';
import { LoginScreen } from './components/LoginScreen';
import { RegisterScreen } from './components/RegisterScreen';
import { SupportPasswordScreen } from './components/SupportPasswordScreen';
import { OnboardingFlow } from './components/OnboardingFlow';
import { DashboardMaster } from './components/DashboardMaster';
import { HeaderTop } from './components/HeaderTop';
import { FooterFoot } from './components/FooterFoot';
import { WalletModal } from './components/WalletModal';
import { RoletaGanhos } from './components/RoletaGanhos';
import { ShopModal } from './components/ShopModal';
import { GeminiSearchModal } from './components/GeminiSearchModal';
import { AccountModal } from './components/AccountModal';
import { SessionSelectionModal } from './components/SessionSelectionModal';
import { MediaHubSelectorOverlay } from './components/MediaHubSelectorOverlay';
import { AnimatePresence, motion } from 'motion/react';
import { ShieldCheck, Info, Trash2, X } from 'lucide-react';

function AppContent() {
  const { 
    currentStage, 
    selectedSupportPage, 
    setSelectedSupportPage, 
    language,
    setCurrentUser,
    setStage,
    isLangDrawerOpen,
    setLangDrawerOpen,
    setLanguage,
    setSelectedBookId,
    setSelectedMovieId,
    addBlock,
    currentUser,
    hubSelectionPending,
    setHubSelectionPending,
    socialSubTab,
    setSocialSubTab,
    librarySubTab,
    setLibrarySubTab,
    mediaSubTab,
    setMediaSubTab,
    gamesSubTab,
    setGamesSubTab,
    toasts,
    removeToast,
    showToast,
    isNavVisible,
    setIsNavVisible
  } = useInvis();

  const languagesList = [
    { code: 'pt-BR', name: 'Português', flag: '🇧🇷' },
    { code: 'en-US', name: 'English', flag: '🇺🇸' },
    { code: 'es-ES', name: 'Español', flag: '🇪🇸' },
    { code: 'fr-FR', name: 'Français', flag: '🇫🇷' },
    { code: 'de-DE', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'it-IT', name: 'Italiano', flag: '🇮🇹' },
    { code: 'ja-JP', name: '日本語', flag: '🇯🇵' },
    { code: 'zh-CN', name: '中文', flag: '🇨🇳' },
    { code: 'ru-RU', name: 'Русский', flag: '🇷🇺' },
    { code: 'ar-SA', name: 'العربية', flag: '🇸🇦' },
    { code: 'hi-IN', name: 'हिन्दी', flag: '🇮🇳' },
    { code: 'ko-KR', name: '한국어', flag: '🇰🇷' }
  ];

  // Modal display controllers
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [isRoletaOpen, setIsRoletaOpen] = useState(false);
  const [isLayoutOpen, setIsLayoutOpen] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);

  // Specific UI visibilities
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [isFooterVisible, setIsFooterVisible] = useState(true);

  // Inactivity tracking for Nav auto-hide
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    
    // Defines "active" as both header and footer visible
    const handleActivity = (showHeader = true, showFooter = true) => {
      setIsHeaderVisible(showHeader);
      setIsFooterVisible(showFooter);
      setIsNavVisible(true);
      
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setIsHeaderVisible(false);
        setIsFooterVisible(false);
        setIsNavVisible(false);
      }, 4000);
    };

    // Only click triggers both. We omit mousemove to respect user instruction strictly.
    const handleClickEvent = () => handleActivity(true, true);
    
    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
      // Do not wake up on touch start, wait for gesture/click analysis
    };
    
    const handleTouchEnd = (e: TouchEvent) => {
      if (!e.changedTouches || e.changedTouches.length === 0) return;
      const touchEndY = e.changedTouches[0].clientY;
      const diffY = touchEndY - touchStartY;
      
      if (Math.abs(diffY) > 30) {
        // Swipe occurred
        if (diffY > 0) {
          // Swiped down -> show header
          handleActivity(true, false);
        } else {
          // Swiped up -> show footer
          handleActivity(false, true);
        }
      } else {
        // Treat as a click tap -> show both
        handleActivity(true, true);
      }
    };
    
    // React to wheel for desktop too (scroll up = show footer, scroll down = show header)
    const handleWheel = (e: WheelEvent) => {
       if (e.deltaY > 0) {
           handleActivity(false, true); // Scroll down -> show footer
       } else {
           handleActivity(true, false); // Scroll up -> show header
       }
    }

    handleActivity(true, true); // initial state

    const opts = { passive: true };
    window.addEventListener('click', handleClickEvent, opts);
    window.addEventListener('wheel', handleWheel, opts);
    window.addEventListener('touchstart', handleTouchStart, opts);
    window.addEventListener('touchend', handleTouchEnd, opts);

    return () => {
      clearTimeout(timeout);
      window.removeEventListener('click', handleClickEvent);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [setIsNavVisible]);

  // Render main screen based on routing stage state
  const renderCurrentStage = () => {
    switch (currentStage) {
      case 'locks':
        return <LockScreen key="locks" />;
      case 'login':
        return <LoginScreen key="login" />;
      case 'support_password':
        return <SupportPasswordScreen key="support_password" />;
      case 'register':
        return <RegisterScreen key="register" />;
      case 'onboarding_age':
      case 'onboarding_terms':
        return <OnboardingFlow key="onboarding" />;
      case 'dashboard':
        return (
          <DashboardMaster 
            key="dashboard"
            isLayoutOpen={isLayoutOpen}
            onCloseLayout={() => setIsLayoutOpen(false)}
          />
        );
      default:
        return <LockScreen key="locks" />;
    }
  };

  const handleHardDataReset = () => {
    if (window.confirm('Atenção: Esta ação irá expurgar permanentemente todos os cookies, chaves de API locais e registros de mineração do seu navegador. Continuar?')) {
      localStorage.clear();
      setCurrentUser(null);
      setStage('locks');
      setSelectedSupportPage(null);
      window.location.reload();
    }
  };

  return (
    <div id="invis_app_root" className="h-screen flex flex-col bg-[#050508] text-white relative overflow-hidden antialiased">
      {/* Upper persistent Navigation Bar (Shown on dashboard only) */}
      <AnimatePresence>
        {currentStage === 'dashboard' && isHeaderVisible && (
          <motion.div
            initial={{ y: '-100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '-100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute top-0 left-0 w-full z-[5000]"
          >
            <HeaderTop 
              onOpenWallet={() => setIsWalletOpen(true)} 
              onOpenShop={() => setIsShopOpen(true)} 
              onOpenSearch={() => setIsSearchOpen(true)}
              onOpenAccount={() => setIsAccountOpen(true)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Primary content area */}
      <main className={`flex-1 flex flex-col justify-stretch relative overflow-hidden ${currentStage === 'dashboard' ? 'pt-0' : ''}`}>
        <AnimatePresence mode="wait">
          {renderCurrentStage()}
        </AnimatePresence>
      </main>

      {/* Downward Navigation Tab Bar (Shown on dashboard only) */}
      <AnimatePresence>
        {currentStage === 'dashboard' && isFooterVisible && (
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute bottom-0 left-0 w-full z-[5000]"
          >
            <FooterFoot 
              onOpenRoleta={() => setIsRoletaOpen(true)}
              onOpenLayoutManager={() => setIsLayoutOpen(true)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL COVERS */}
      <WalletModal isOpen={isWalletOpen} onClose={() => setIsWalletOpen(false)} onOpenShop={() => setIsShopOpen(true)} />
      <RoletaGanhos isOpen={isRoletaOpen} onClose={() => setIsRoletaOpen(false)} />
      <ShopModal isOpen={isShopOpen} onClose={() => setIsShopOpen(false)} />
      <SessionSelectionModal isOpen={!!hubSelectionPending} onClose={() => setHubSelectionPending(null)} />
      <MediaHubSelectorOverlay />
      <AccountModal isOpen={isAccountOpen} onClose={() => setIsAccountOpen(false)} />
      <GeminiSearchModal 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)}
        onSelectBook={(bookId) => {
          setSelectedBookId(bookId);
          addBlock('library', 'Biblioteca');
        }}
        onSelectMovie={(movieId) => {
          setSelectedMovieId(movieId);
          addBlock('media', 'Mídia');
        }}
        onOpenShop={() => setIsShopOpen(true)}
        onOpenWallet={() => setIsWalletOpen(true)}
      />

      {/* LEGAL SUPPORT PAGES DIALOG (LGPD/GDPR EXCLUSION VECTORS) */}
      <AnimatePresence>
        {selectedSupportPage && (
          <div className="fixed inset-0 z-[6000] flex items-center justify-center bg-black/90 p-4 font-sans backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="w-full max-w-lg rounded-3xl bg-[#0b0e11] border border-cyan-500/30 p-6 relative max-h-[85vh] flex flex-col text-left shadow-[0_0_40px_rgba(0,200,255,0.2)]"
            >
              {/* Modal header */}
              <div className="flex justify-between items-center pb-4 border-b border-white/5 mb-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-cyan-400" />
                  <h3 className="font-mono text-xs tracking-widest font-black uppercase text-[#00c8ff]">
                    {selectedSupportPage === 'privacidade' && 'Política de Privacidade (LGPD)'}
                    {selectedSupportPage === 'termos' && 'Termos de Utilização'}
                    {selectedSupportPage === 'exclusao' && 'Exclusão de Dados Pessoais'}
                  </h3>
                </div>
                <button 
                  onClick={() => setSelectedSupportPage(null)}
                  className="p-2 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal content body */}
              <div className="flex-1 overflow-y-auto pr-1 text-xs text-neutral-300 space-y-4 leading-relaxed no-scrollbar pb-4 select-text">
                {selectedSupportPage === 'privacidade' && (
                  <>
                    <p className="font-bold text-white uppercase text-[10px] tracking-wider">Tratamento de Dados de Usuários em Conformidade LGPD</p>
                    <p>
                      Em estrita conformidade com a Lei Geral de Proteção de Dados Pessoais (LGPD - Lei nº 13.709/18), a plataforma INVIS assegura controle pleno sobre seus registros cibernéticos.
                    </p>
                    <p>
                      <strong>1. Coleta Mínima Necessária:</strong> Coletamos exclusivamente seus metadados de acesso de forma criptografada para habilitar o balanço em sua conta de moedas (ic). Seu nome completo, e-mail e telefone são blindados localmente em buffers descentralizados.
                    </p>
                    <p>
                      <strong>2. Remoção de Exif Stalking (Fórum/Imagens):</strong> Todas as fotos, mídias e anexos carregados no sistema passam por um pipeline local e imediato de desidentificação de dados. Removemos metadados sensíveis do arquivo (marca da câmera, abertura de lente e coordenadas GPS geográficas) impedindo rastreamento colateral.
                    </p>
                    <p>
                      <strong>3. Cookies e Sessão:</strong> Suas credenciais são guardadas em tokens criptográficos no armazenamento local. Nós não vendemos, partilhamos ou arrendamos os seus cadastros a terceiros sob qualquer pretexto comercial.
                    </p>
                  </>
                )}

                {selectedSupportPage === 'termos' && (
                  <>
                    <p className="font-bold text-white uppercase text-[10px] tracking-wider">Regulamento Operacional do Ecossistema</p>
                    <p>
                      Ao criar sua credencial e assinar a identidade biométrica na plataforma INVIS, você outorga adesão vinculativa aos regulamentos descritos.
                    </p>
                    <p>
                      <strong>1. Proteção de Paridade Fiduciária:</strong> O balanço fiduciário IC possui taxa controlada de 2500ic para cada R$ 1,00. Tentativas de fraude cibernética, manipulação de scripts ou injeção de conexões falsas acarretam em remoção automática de saldo via Circuit Breaker de segurança.
                    </p>
                    <p>
                      <strong>2. Limitação de Multitasking:</strong> A divisão de tela em 1/3, 2/3 ou preenchimento total de trilhas obedece ao limite técnico de 3 blocos abertos simultâneos para preservação de CPU do dispositivo móvil.
                    </p>
                    <p>
                      <strong>3. Isenção de Responsabilidade:</strong> Por se tratar de um ambiente livre e descentralizado de multiplexação em grupo, os usuários respondem direta e legalmente pelos diálogos compartilhados no fórum e chats.
                    </p>
                  </>
                )}

                {selectedSupportPage === 'exclusao' && (
                  <>
                    <p className="font-bold text-white uppercase text-[10px] tracking-wider">Direito ao Esquecimento e Expulsa Instantânea</p>
                    <p>
                      O ecossistema INVIS respeita plenamente seu direito constitucional de remoção de dados pessoais. É assegurado o descarte instantâneo e irrecuperável de sua conta a qualquer momento.
                    </p>
                    <p>
                      Ao acionar o botão de limpeza abaixo, todos os dados de login, histórico de transações em livro-razão e saldos de mineração serão limpos permanentemente dos servidores e cache local.
                    </p>
                    <div className="p-4 rounded-xl border border-red-500/20 bg-red-950/10 flex flex-col gap-3 mt-4">
                      <div className="flex gap-2 text-red-400 font-bold items-center font-mono text-[10px] uppercase">
                        <Info className="w-4 h-4" />
                        <span>Aviso de Perda Irreversível</span>
                      </div>
                      <p className="text-[11px] text-neutral-300 leading-normal">Esta operação é definitiva. Os saldos convertidos em reais e as conquistas do inventário de presentes não poderão ser restabelecidos em hipótese alguma.</p>
                      <button
                        onClick={handleHardDataReset}
                        className="py-3.5 mt-2 rounded-xl bg-red-500 text-white font-black uppercase text-xs tracking-wider flex items-center justify-center gap-2 hover:bg-red-600 transition-all cursor-pointer shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>EXPURGAR TODOS MEUS DADOS AGORA</span>
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Close support pane footer */}
              <div className="mt-4 pt-4 border-t border-white/5 text-right shrink-0">
                <button
                  onClick={() => setSelectedSupportPage(null)}
                  className="px-5 py-2.5 border border-white/10 hover:border-cyan-400 rounded-xl text-neutral-400 hover:text-white text-xs font-bold uppercase transition-all tracking-wider cursor-pointer font-mono"
                >
                  Voltar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Global Babel Language Selector Drawer */}
      <AnimatePresence>
        {isLangDrawerOpen && (
          <div className="fixed inset-0 z-[7000] flex items-end justify-center bg-black/80 font-sans">
            {/* Backdrop click closer */}
            <div 
              className="absolute inset-0 cursor-pointer"
              onClick={() => setLangDrawerOpen(false)}
            />
            
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full max-w-lg bg-[#0b0e11] border-t-2 border-cyan-400 rounded-t-[32px] p-6 text-left relative z-10 shadow-2xl glass-container max-h-[75vh] flex flex-col overflow-hidden"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-mono text-sm tracking-[0.2em] text-[#00c8ff] uppercase font-bold">
                  SELECIONE O IDIOMA
                </h3>
                <button 
                  onClick={() => setLangDrawerOpen(false)}
                  className="text-neutral-400 hover:text-white px-3 py-1 font-bold text-lg rounded cursor-pointer transition-all focus:outline-none"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 overflow-y-auto pr-1 no-scrollbar flex-1 pb-4">
                {languagesList.map((langItem) => (
                  <button
                    key={langItem.code}
                    onClick={() => {
                      setLanguage(langItem.code);
                      localStorage.setItem('invis_lang', langItem.code);
                      setLangDrawerOpen(false);
                    }}
                    className={`flex items-center gap-3 p-4 rounded-xl border transition-all text-left cursor-pointer ${
                      language === langItem.code 
                        ? 'border-[#00c8ff] bg-cyan-950/20 text-[#00c8ff] shadow-[0_0_15px_rgba(0,200,255,0.1)]' 
                        : 'border-white/5 bg-black/20 hover:border-cyan-500/40 text-neutral-300'
                    }`}
                  >
                    <span className="text-2xl">{langItem.flag}</span>
                    <span className="font-sans font-medium text-sm">{langItem.name}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Global Toast / Push Alert overlay list */}
      <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts && toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 80, scale: 0.92 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 80, scale: 0.92 }}
              onClick={() => removeToast(toast.id)}
              className={`p-4 rounded-2xl border pointer-events-auto cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.5)] flex gap-3 text-xs justify-between items-start transition-all ${
                toast.type === 'error'
                  ? 'bg-red-950/95 border-[#FF4D4D] text-white shadow-[0_0_25px_rgba(255,77,77,0.25)]'
                  : toast.type === 'success'
                  ? 'bg-emerald-950/95 border-[#00FF80] text-white shadow-[0_0_25px_rgba(0,255,128,0.25)]'
                  : 'bg-[#0d0d12]/95 border-[#00c8ff] text-white shadow-[0_0_25px_rgba(0,200,255,0.25)]'
              }`}
            >
              <div className="flex gap-2.5 text-left items-start">
                <span className="text-sm shrink-0">
                  {toast.type === 'error' ? '❌' : toast.type === 'success' ? '⚡' : '💬'}
                </span>
                <div>
                  <p className="font-sans font-medium leading-relaxed">{toast.message}</p>
                </div>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); removeToast(toast.id); }}
                className="text-neutral-500 hover:text-white font-black text-[10px] ml-1 shrink-0 p-0.5"
              >
                ✕
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <InvisProvider>
      <LiveKitProvider>
        <AppContent />
      </LiveKitProvider>
    </InvisProvider>
  );
}
