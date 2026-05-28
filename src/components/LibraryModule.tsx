import React, { useState, useEffect, useRef } from 'react';
import { useInvis, MOCK_BOOKS, DICTIONARY } from '../context/InvisContext';
import { useTranslation } from '../hooks/useTranslation';
import { Book } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Sparkles, Sliders, Volume2, Search, ArrowLeft, ChevronLeft, ChevronRight, PenTool, CheckCircle, Clock, Globe, Terminal, Cpu } from 'lucide-react';

export const LibraryModule: React.FC = () => {
  const { 
    language, activeSession, setActiveSession, customAIChapters, addAIChapter, setSystemStatus,
    selectedBookId, setSelectedBookId, wallet, setWallet, addTransaction, currentUser
  } = useInvis();

  const [booksList, setBooksList] = useState<Book[]>(MOCK_BOOKS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  // States to keep track of purchased books & personal reading lists
  const [purchasedBookIds, setPurchasedBookIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('invis_purchased_books');
    return saved ? JSON.parse(saved) : ['b1', 'b3'];
  });
  const [readingList, setReadingList] = useState<string[]>(() => {
    const saved = localStorage.getItem('invis_reading_list');
    return saved ? JSON.parse(saved) : [];
  });

  const handleBuyBook = (book: Book) => {
    const cost = 1500; // Book cost in gold coins
    if (wallet.icGold < cost) {
      alert(`Saldo insuficiente. Você precisa de ${cost.toFixed(2)} ic (Moedas Gold). Atualmente possui ${wallet.icGold.toFixed(2)} ic.`);
      return;
    }

    setWallet(prev => ({
      ...prev,
      icGold: prev.icGold - cost
    }));

    addTransaction({
      type: 'Spend',
      amount: `-${cost.toFixed(4)}`,
      desc: `Compra do Livro: ${book.title}`
    });

    setPurchasedBookIds(prev => {
      const updated = [...prev, book.id];
      localStorage.setItem('invis_purchased_books', JSON.stringify(updated));
      return updated;
    });

    setSystemStatus('Livro Adquirido');
    alert(`Sucesso! O livro "${book.title}" agora está liberado para leitura.`);
  };

  const handleToggleReadingList = (bookId: string) => {
    let updated: string[];
    if (readingList.includes(bookId)) {
      updated = readingList.filter(id => id !== bookId);
      setSystemStatus('Removido da Lista');
    } else {
      updated = [...readingList, bookId];
      setSystemStatus('Adicionado à Lista');
    }
    setReadingList(updated);
    localStorage.setItem('invis_reading_list', JSON.stringify(updated));
  };

  // Auto-load book from Global Search Engine selection
  useEffect(() => {
    if (selectedBookId) {
      const matched = booksList.find(b => b.id === selectedBookId);
      if (matched) {
        setSelectedBook(matched);
        setCurrentChapterIndex(0);
        setActiveSentenceIndex(0);
        setActiveLibraryTab('shelf');
      }
      setSelectedBookId(null);
    }
  }, [selectedBookId, booksList, setSelectedBookId]);

  // Reader configurations
  const [fontSize, setFontSize] = useState(16);
  const [isAudioRunning, setIsAudioRunning] = useState(false);
  const [activeSentenceIndex, setActiveSentenceIndex] = useState(0);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);

  // Night Mode & Adaptive Brightness for "O Astronauta Perdido"
  const [nightMode, setNightMode] = useState(true);
  const [brightness, setBrightness] = useState(85);
  const [isAutoBrightness, setIsAutoBrightness] = useState(true);

  useEffect(() => {
    if (isAutoBrightness && selectedBook?.title === 'O Astronauta Perdido') {
      const hours = new Date().getHours();
      // Auto adjust: simulated night/dusk hours (6 PM to 6 AM) goes to 35%, daytime (6 AM to 6 PM) goes to 95%
      const isSimulatedNight = hours < 6 || hours > 18;
      setBrightness(isSimulatedNight ? 38 : 92);
    }
  }, [isAutoBrightness, selectedBook, currentUser]);

  // Ghostwriter States
  const [promptInput, setPromptInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [typedOutput, setTypedOutput] = useState('');

  // Crawler & Indexing states
  const [activeLibraryTab, setActiveLibraryTab] = useState<'shelf' | 'crawler'>('shelf');
  const [crawlUrl, setCrawlUrl] = useState('');
  const [crawlLogs, setCrawlLogs] = useState<string[]>([]);
  const [isCrawling, setIsCrawling] = useState(false);
  const [crawlProgress, setCrawlProgress] = useState(0);

  // Sincronização: auto bookmarking state saving trigger every 30s
  useEffect(() => {
    let t: NodeJS.Timeout;
    if (selectedBook) {
      t = setInterval(() => {
        setSystemStatus('bookmark_salvo');
        // Auto toast feedback
        console.log(`[INVIS Sync] Bookmark auto-salvo na linha ${activeSentenceIndex} do capítulo ${currentChapterIndex}`);
      }, 30000);
    }
    return () => clearInterval(t);
  }, [selectedBook, activeSentenceIndex, currentChapterIndex]);

  // Audio sentence highlighting simulation
  useEffect(() => {
    let highlightInterval: NodeJS.Timeout;
    if (isAudioRunning && selectedBook) {
      console.log(`[TTS-Mixer] Iniciando cascata de voz neural...`);
      console.log(`[TTS-Mixer] 1. Google Cloud TTS (Tentando Cota 1M)...`);
      // Simulate fallback from premium to native
      setTimeout(() => {
        console.warn(`[TTS-Mixer] Cotas premium expiradas. Realizando Fallback de Custo Zero: Web Speech API nativa ativada.`);
      }, 1000);

      highlightInterval = setInterval(() => {
        setActiveSentenceIndex(prev => {
          const sentencesCount = selectedBook.content[currentChapterIndex]?.split('. ').length || 5; 
          if (prev >= sentencesCount - 1) {
            return 0; // loop highlighter
          }
          return prev + 1;
        });
      }, 3000);
    }
    return () => clearInterval(highlightInterval);
  }, [isAudioRunning, selectedBook, currentChapterIndex]);

  // Stream simulation with Typewriter effect for Ghostwriter
  const handleGenerateGhostwriterChapter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptInput.trim()) return;

    if (navigator.vibrate) navigator.vibrate(40);
    setIsGenerating(true);
    setTypedOutput('');

    const aiResponses = [
      "O astronauta ajustou os filtros de oxigênio de seu traje, observando a imensidão desértica e avermelhada de Marte que se estendia além do horizonte. O silêncio era tão denso que ele podia ouvir o eco de sua própria respiração. Sozinho em um planeta hostil, ele percebeu que precisaria reconfigurar os radares e iniciar a descida manual para a cratera de gelo seco.",
      "A caneta flutuava suavemente no ar com a gravidade zero simulada pelas bobinas do Bouncer. Enquanto escrevia o código criptográfico na tela translúcida, a inteligência artificial de bordo murmurou uma canção de ninar melancólica em tons de frequência senoidais douradas."
    ];

    const targetText = promptInput.includes('Marte') ? aiResponses[0] : aiResponses[1];
    let charIdx = 0;

    // Played high accuracy typewriter stream reveal
    setTimeout(() => {
      setIsGenerating(false);
      
      const charTimer = setInterval(() => {
        setTypedOutput(prev => prev + targetText.charAt(charIdx));
        charIdx++;
        if (charIdx >= targetText.length) {
          clearInterval(charTimer);
          // Add generated chapter to book reference index and context list
          addAIChapter(targetText);
          
          if (selectedBook && selectedBook.isGhostwriter) {
            setBooksList(prev => prev.map(b => {
              if (b.id === selectedBook.id) {
                return { ...b, content: [...b.content, `Capítulo Gerado: ${targetText}`] };
              }
              return b;
            }));
            
            // Increment Chapter
            setCurrentChapterIndex(selectedBook.content.length);
          }
          setPromptInput('');
        }
      }, 35); // 35ms reveal per character
    }, 1500); // 1.5s simulated network handshake
  };

  const startCrawlAndIndexing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!crawlUrl.trim()) return;
    if (isCrawling) return;

    setIsCrawling(true);
    setCrawlProgress(5);
    setCrawlLogs([
      '[INVIS INDEX v2.4] Inicializando Babel Crawler Protocol...',
      '[INVIS INDEX] Sintonizando robôs de varredura web...',
      `[TARGET] Varrendo URL principal: "${crawlUrl}"...`
    ]);

    const logsList = [
      '[HTTP REQUEST] Conetando ao domínio de destino via Vercel Edge Cache...',
      '[HTTP 200] Conexão bem-sucedida. Extraindo estrutura DOM do documento...',
      '[ANALYZER] Agrupando tags semânticas (<article>, <p>, <span>)...',
      '[METADATA] Título detectado: "O Segredo da Esfera Cinza" | Autoria: Babel Indexer',
      '[CRAWLER] 2 Capítulos limpos extraídos da estrutura textual com sucesso.',
      '[VECTORIZING] Gerando embeddings multidimensionais via Gemini Vector API...',
      '[SYNC VECTORS] Injetando vetores no banco Supabase indexado...',
      '[INDEX COMPLETE] Livro processado, indexado e injetado na estante local!'
    ];

    let currentLogIdx = 0;
    const interval = setInterval(() => {
      setCrawlProgress(prev => {
        const nextVal = prev + 12;
        if (nextVal >= 100) {
          clearInterval(interval);
          setIsCrawling(false);
          
          // Injetando de fato o livro novo no booksList do estado local!
          const newEBook: Book = {
            id: `crawled_${Date.now()}`,
            title: "O Segredo da Esfera Cinza",
            author: "Babel AI Web Indexer",
            coverUrl: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=300&auto=format&fit=crop",
            content: [
              "Havia um segredo milenar guardado nos confins do núcleo das redes neurais. A lendária esfera cinza continha a cifra que ligava todas as moedas e mídias aos servidores invisíveis.",
              "Com o Crawler do Babel executado com sucesso e os vetores indexados, a estante de livros do usuário se expandiu. A autonomia digital havia sido alcançada e o ciclo dopaminérgico concluído."
            ],
            isNeural: true,
            isGhostwriter: false,
            tags: ["AI", "Babel"],
            minTier: "FREE"
          };
          
          setBooksList(prevBooks => [newEBook, ...prevBooks]);
          setSystemStatus('Biblioteca Atualizada');
          setActiveLibraryTab('shelf'); // Go back to shelf to show the result!
          return 100;
        }
        return nextVal;
      });

      if (currentLogIdx < logsList.length) {
        setCrawlLogs(prev => [...prev, logsList[currentLogIdx]]);
        currentLogIdx++;
      }
    }, 700);
  };

  const { currentTexts } = useTranslation();

  const filteredBooks = booksList.filter(book => 
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full h-full flex flex-col bg-[#0b0e11] p-2 text-[#e0e0e0] font-sans overflow-y-auto no-scrollbar pb-4">
      
      <AnimatePresence mode="wait">
        {!selectedBook ? (
          /* SHELF BOOK CATALOG VIEW */
          <motion.div
            key="shelf-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-2"
          >
            {/* Tab Swappers */}
            <div className="flex bg-black/40 border border-white/5 p-0.5 rounded-xl w-full select-none">
              <button
                onClick={() => setActiveLibraryTab('shelf')}
                className={`flex-1 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer flex justify-center items-center gap-1 border border-transparent ${
                  activeLibraryTab === 'shelf'
                    ? 'bg-[#00c8ff]/10 text-[#00c8ff] border-[#00c8ff]/20 shadow-[0_0_10px_rgba(0,200,255,0.05)]'
                    : 'text-neutral-500 hover:text-white'
                }`}
              >
                <BookOpen className="w-3 h-3" />
                <span>Minha Estante</span>
              </button>
              <button
                onClick={() => setActiveLibraryTab('crawler')}
                className={`flex-1 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer flex justify-center items-center gap-1 border border-transparent ${
                  activeLibraryTab === 'crawler'
                    ? 'bg-[#00c8ff]/10 text-[#00c8ff] border-[#00c8ff]/20 shadow-[0_0_10px_rgba(0,200,255,0.05)]'
                    : 'text-neutral-500 hover:text-white'
                }`}
              >
                <Globe className="w-3 h-3" />
                <span>Babel Crawler IA</span>
              </button>
            </div>

            {activeLibraryTab === 'shelf' ? (
              <>
                {/* Search Input Box with Glassmorphism */}
                <div className="relative w-full flex items-center bg-black/40 border border-white/5 rounded-xl p-1 mt-1">
                  <Search className="w-3.5 h-3.5 text-cyan-400/60 ml-2" />
                  <input
                    type="text"
                    placeholder="Pesquisar livros..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-2 py-1 bg-transparent text-[10.5px] text-white placeholder-neutral-500 outline-none"
                  />
                </div>

                {/* Smart Shelf Rack Layout - Grid */}
                {/* HUD INVIShop Auto-injetado (10% cota restante) */}
                <div className="flex items-center justify-between p-2 mb-2 bg-gradient-to-r from-cyan-900/40 to-transparent border border-cyan-500/20 rounded-xl">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] font-mono font-bold text-cyan-400 uppercase tracking-widest">Aviso de Narração Neural (10% Cota Restante)</span>
                    <span className="text-[8px] text-zinc-400 uppercase">Renove acesso para manter o TTS e o Hub.</span>
                  </div>
                  <button onClick={() => alert('Bem vindo a INVIShop!\n\nLiquidez de livros da Giftbox habilitada com -5% de taxa deflacionária na conversão para IC.')} className="px-3 py-1 bg-cyan-500 text-black text-[9px] font-mono font-bold uppercase rounded hover:bg-cyan-400 cursor-pointer shadow-[0_0_10px_rgba(0,255,255,0.4)]">
                    INVIShop Store
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 px-0.5">
                    {filteredBooks.map((book) => {
                      const isOwned = book.minTier === 'FREE' || purchasedBookIds.includes(book.id);
                      const isInReadingList = readingList.includes(book.id);

                      return (
                        <motion.div
                          key={book.id}
                          className="w-full p-2 rounded-xl bg-black/40 border border-white/5 hover:border-cyan-400/50 hover:scale-[1.02] transition-all duration-300 flex flex-col text-left space-y-1.5 relative group"
                        >
                          {/* Thumbnail e Cover (Shadow item acinzentado se PENDING) */}
                          <div className="absolute top-1.5 left-1.5 w-6 h-8 rounded border border-white/25 shadow-md shadow-black/60 overflow-hidden z-10 transition-transform group-hover:scale-105 duration-300">
                            <img 
                              src={book.coverUrl} 
                              className={`w-full h-full object-cover ${!isOwned && book.minTier !== 'FREE' ? 'grayscale opacity-70' : ''}`} 
                              alt="mini book cover" 
                              referrerPolicy="no-referrer"
                            />
                          </div>

                          {/* Cover Wrap */}
                          <div className="w-full h-28 rounded-lg overflow-hidden relative border border-white/5">
                            <img 
                              src={book.coverUrl} 
                              className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${!isOwned && book.minTier !== 'FREE' ? 'grayscale opacity-60' : ''}`} 
                              alt="book cover" 
                              referrerPolicy="no-referrer"
                            />
                            {/* PENDING Tag for Shadow Items */}
                            {!isOwned && book.minTier !== 'FREE' && (
                              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                <span className="px-2 py-0.5 bg-zinc-900 border border-zinc-700 text-zinc-400 text-[8px] font-mono tracking-widest uppercase rounded">PENDING BOLETO</span>
                              </div>
                            )}
                            {/* Scanlines retro layout overlay */}
                            <div className="absolute inset-0 bg-black/10 matrix-line-overlay opacity-30" />
                            {/* Neural soundwave indicator icon */}
                            {book.isNeural && (
                              <div className="absolute top-1 right-1 p-1 rounded bg-cyan-500 text-black shadow-lg">
                                <Volume2 className="w-2.5 h-2.5" />
                              </div>
                            )}
                          </div>

                          <div className="space-y-0.5">
                            {/* Title line with access level label */}
                            <div className="flex items-start justify-between gap-1">
                              <h4 className="text-white text-[10.5px] font-bold leading-tight line-clamp-1 flex-1">{book.title}</h4>
                              <div className="relative group/tier">
                                <span className={`px-1 py-0.2 rounded text-[6.5px] font-mono font-bold shrink-0 uppercase tracking-wider cursor-default ${
                                  book.minTier === 'FREE' 
                                    ? 'bg-neutral-800 text-neutral-400 border border-neutral-700/40' 
                                    : 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-yellow-500 border border-yellow-500/30 font-black'
                                }`}>
                                  {book.minTier}
                                </span>
                              </div>
                            </div>
                            <p className="text-[9px] text-neutral-400 font-medium font-mono">@{book.author}</p>
                          </div>

                          {/* Progress indicator bar on bottom card */}
                          <div className="w-full h-1 bg-neutral-800 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-400" style={{ width: book.isGhostwriter ? '40%' : '75%' }} />
                          </div>

                          {/* Quick direct interaction buttons */}
                          <div className="pt-2 border-t border-white/5 flex gap-1.5 mt-auto" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => {
                                if (!isOwned) {
                                  alert(`Este livro necessita de permissão ou aquisição. Use o botão "Adquirir" ou libere o nível ${book.minTier}!`);
                                  return;
                                }
                                setSelectedBook(book);
                                setCurrentChapterIndex(0);
                                setActiveSentenceIndex(0);
                                setIsAudioRunning(false);
                              }}
                              className="flex-1 py-1.5 px-1 rounded bg-indigo-500/20 hover:bg-indigo-500 hover:text-white border border-indigo-500/30 text-[9px] font-bold uppercase tracking-wider text-indigo-300 transition-all cursor-pointer flex items-center justify-center select-none"
                              title="Abrir no leitor imersivo"
                            >
                              Detalhes
                            </button>

                            {/* Purchase Trigger check */}
                            {!isOwned ? (
                              <button
                                onClick={() => handleBuyBook(book)}
                                className="flex-1 py-1.5 px-1 rounded bg-cyan-500/10 hover:bg-cyan-400 hover:text-black border border-cyan-500/30 text-[9px] font-bold uppercase tracking-wider text-cyan-400 transition-all cursor-pointer flex items-center justify-center gap-0.5 font-mono select-none"
                                title="Adquirir obra do sistema por 1500 ic"
                              >
                                Adquirir
                              </button>
                            ) : (
                              <div className="flex-1 py-1 px-1 rounded bg-emerald-500/5 border border-emerald-500/20 text-[9px] font-mono tracking-wider text-emerald-400 flex items-center justify-center select-none opacity-50">
                                Adquirido
                              </div>
                            )}

                            {/* Reading list button action */}
                            <button
                              onClick={() => handleToggleReadingList(book.id)}
                              className={`py-1.5 px-2 rounded border text-[10px] transition-all cursor-pointer flex items-center justify-center select-none ${
                                isInReadingList
                                  ? 'bg-purple-500/20 border-purple-400 text-purple-300 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30'
                                  : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:bg-neutral-700 hover:text-white'
                              }`}
                              title={isInReadingList ? "Remover da Lista de Leitura" : "Salvar na Lista de Leitura"}
                            >
                              {isInReadingList ? '★' : '☆'}
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
              </>
            ) : (
              /* BABEL WEB CRAWLER PANEL */
              <div className="space-y-4 text-left">
                <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-3">
                  <div className="flex items-center gap-2 text-cyan-400">
                    <Cpu className="w-4 h-4 text-cyan-400 animate-pulse" />
                    <h4 className="font-mono text-[10px] tracking-widest uppercase font-black">Artigos Babel Web Crawler</h4>
                  </div>
                  <p className="text-[10px] text-neutral-400 leading-normal">
                    Forneça uma URL pública de texto limpo para disparar o robô de varredura web. Os blocos textuais serão embeddings indexados e injetados de volta na sua Biblioteca.
                  </p>

                  <form onSubmit={startCrawlAndIndexing} className="space-y-3">
                    <div className="flex flex-col gap-2">
                      <div className="relative flex-1 flex items-center bg-black/60 border border-white/10 rounded-xl px-3 py-2">
                        <Globe className="w-3.5 h-3.5 text-cyan-400 mr-2 shrink-0" />
                        <input
                          type="url"
                          required
                          placeholder="Ex: https://gutenberg.org/ebooks/1661"
                          value={crawlUrl}
                          onChange={(e) => setCrawlUrl(e.target.value)}
                          disabled={isCrawling}
                          className="w-full bg-transparent border-none text-[11px] text-white outline-none placeholder-neutral-600 font-sans"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isCrawling}
                        className={`w-full py-2 bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 select-none font-mono ${
                          isCrawling ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {isCrawling ? 'PROCESSANDO INJEÇÃO...' : 'DISPARAR ROBÔ DE INDEXAÇÃO'}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Tracking bar */}
                {isCrawling && (
                  <div className="space-y-1.5 p-3 rounded-xl bg-cyan-950/10 border border-cyan-500/20">
                    <div className="flex justify-between font-mono text-[8px] text-cyan-400 uppercase font-bold">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 animate-spin" />
                        Acompanhando Rastreamento
                      </span>
                      <span>{crawlProgress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-neutral-900 rounded-full overflow-hidden relative shadow-inner">
                      {/* Base progress */}
                      <div 
                        className="h-full bg-gradient-to-r from-cyan-600 via-indigo-500 to-cyan-400 transition-all duration-300"
                        style={{ width: `${crawlProgress}%` }}
                      />
                      {/* Pulse overlap animation */}
                      <div className="absolute top-0 left-0 h-full w-full opacity-50 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent)] animate-[pulse_1.5s_infinite]" />
                    </div>
                  </div>
                )}

                {/* Console view terminal */}
                {crawlLogs.length > 0 && (
                  <div className="p-4 rounded-xl bg-black border border-white/5 font-mono text-[9px] space-y-1 max-h-48 overflow-y-auto no-scrollbar shadow-inner text-emerald-400">
                    <div className="flex justify-between items-center text-neutral-500 pb-2 border-b border-white/5 select-none text-[7px] uppercase tracking-widest leading-none mb-1.5 font-bold">
                      <span className="flex items-center gap-1">
                        <Terminal className="w-3 h-3 text-neutral-500" /> Console de Logs do Robô
                      </span>
                      <span>v2.4 offline-proxy</span>
                    </div>
                    {crawlLogs.map((log, idx) => (
                      <div key={idx} className="leading-relaxed opacity-95">
                        {log}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        ) : (
          /* MODO LEITOR IMERSIVO SATELLITE (PAGE 3 OF PDF HUD BIBLIOTECA) */
          <motion.div
            key="reader-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="w-full h-full flex flex-col pt-0 relative"
          >
            {/* STICKY TOP HEADER FOR READER */}
            <div className="sticky top-[-16px] -mx-4 px-4 pt-4 pb-3 bg-[#0b0e11]/90 backdrop-blur-xl border-b border-white/5 z-50 space-y-4 shadow-2xl">
              {/* Header controls back */}
              <div className="flex items-center justify-between">
                <button 
                  onClick={() => { 
                    setSelectedBook(null); 
                    setIsAudioRunning(false); 
                    // MODO READING: Restaura global notifications
                    document.documentElement.classList.remove('reading-mode');
                  }}
                  className="flex items-center gap-2 text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer w-fit px-2 py-1 rounded hover:bg-white/5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Voltar</span>
                </button>

                <div className="flex gap-4 items-center">
                  {/* Multiplex Sincronia de Grupo */}
                  <button
                    onClick={() => {
                        alert("Multiplex Room Criada!\n\nLink no Chat Global para: [Sincronia de Leitura - " + selectedBook?.title + "].\nMaestro de Áudio e Ducking Universal (60% redução ao falar via WebRTC) ativados.");
                    }}
                    className="p-1 px-2 rounded border border-neutral-800 text-[9px] uppercase tracking-wider font-mono text-[#00FF80] hover:bg-[#00FF80]/10 transition-colors cursor-pointer"
                  >
                    Multiplex (8/8)
                  </button>

                  <button 
                    onClick={() => setIsAudioRunning(!isAudioRunning)}
                    className={`p-2.5 rounded-full border transition-all cursor-pointer ${
                      isAudioRunning ? 'border-[#00c8ff] bg-cyan-950/20 text-[#00c8ff] shadow-[0_0_8px_rgba(0,200,255,0.3)]' : 'border-neutral-800 text-neutral-400'
                    }`}
                    title="Ouvir Narração Neural IA"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-1 text-[10px] font-mono text-[#D4AF37]">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Bookmark</span>
                  </div>
                </div>
              </div>

              {/* Font scaling slider panel controls */}
              <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex gap-4 items-center justify-between">
                <div className="flex gap-2">
                  <button onClick={() => setFontSize(prev => Math.max(prev - 2, 12))} className="w-8 h-8 rounded-lg bg-neutral-900 border border-white/5 text-xs font-bold font-mono hover:bg-neutral-800 transition-colors cursor-pointer">A-</button>
                  <button onClick={() => setFontSize(prev => Math.min(prev + 2, 24))} className="w-8 h-8 rounded-lg bg-neutral-900 border border-white/5 text-xs font-bold font-mono hover:bg-neutral-800 transition-colors cursor-pointer">A+</button>
                </div>

                {/* Speech speed indicator slider */}
                <div className="flex items-center gap-3">
                  <Sliders className="w-4 h-4 text-cyan-400" />
                  <span className="text-[10px] text-neutral-400 uppercase font-mono">Espaçamento: 1.6em</span>
                </div>
              </div>

              {/* Intelligent Reading Controls for "O Astronauta Perdido" */}
              {selectedBook?.title === 'O Astronauta Perdido' && (
                <div className="p-3 rounded-xl bg-black/50 border border-amber-500/15 flex flex-col gap-2">
                  <div className="flex justify-between items-center text-[9px] uppercase font-bold text-amber-400 select-none">
                    <span>Ajustes Neuronais: O Astronauta Perdido</span>
                    <span className="text-[8px] text-neutral-400 px-1.5 py-0.5 rounded bg-black/60 border border-cyan-500/20">Modo Noturno Premium</span>
                  </div>
                  
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    {/* Night Mode Toggle */}
                    <button
                      onClick={() => {
                        setNightMode(!nightMode);
                        if (navigator.vibrate) navigator.vibrate(15);
                      }}
                      className={`px-2.5 py-1.5 rounded-xl text-[9px] font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer border ${
                        nightMode 
                          ? 'bg-purple-950/40 border-purple-500/40 text-purple-400 font-extrabold shadow-[0_0_8px_rgba(168,85,247,0.2)]'
                          : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                      }`}
                    >
                      <span>Opacidade Noite: {nightMode ? 'ATIVADA' : 'DESATIVADA'}</span>
                    </button>

                    {/* Auto Brightness Toggle */}
                    <button
                      onClick={() => {
                        setIsAutoBrightness(!isAutoBrightness);
                        if (navigator.vibrate) navigator.vibrate(15);
                      }}
                      className={`px-2.5 py-1.5 rounded-xl text-[9px] font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer border ${
                        isAutoBrightness 
                          ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-400 font-extrabold shadow-[0_0_8px_rgba(6,182,212,0.2)]'
                          : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                      }`}
                    >
                      <span>Auto Brilho Sensor</span>
                    </button>

                    {/* Manual Brightness Slider (if not auto) */}
                    <div className="flex items-center gap-1.5 bg-black/60 px-2 py-1.5 rounded-xl border border-white/5 flex-1 max-w-[150px]">
                      <span className="text-[8px] text-neutral-400 font-bold uppercase shrink-0">Brilho: {brightness}%</span>
                      <input
                        type="range"
                        min="20"
                        max="100"
                        value={brightness}
                        disabled={isAutoBrightness}
                        onChange={(e) => setBrightness(parseInt(e.target.value))}
                        className="w-full accent-cyan-400 cursor-pointer disabled:opacity-40"
                      />
                    </div>
                  </div>

                  {isAutoBrightness && (
                    <p className="text-[8px] text-neutral-500 text-left font-mono">
                      ⚡ [SENSOR DE SINTONIA AMBIENTAL DE LUX] Registrado {new Date().getHours() < 6 || new Date().getHours() > 18 ? 'Ambiente Noturno (Auto 38%)' : 'Luz Diurna (Auto 92%)'}.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* SCROLLABLE INNER CONTENT */}
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-5 pt-5 pb-20">
              {/* IMPRESSIVE GHOSTWRITER INPUT WITH GOLDEN FILIGRANA (PAGE 4) */}
            {selectedBook.isGhostwriter && (
              <div className="w-full p-[1px] bg-[#D4AF37]/30 rounded-2xl">
                <div className="p-5 rounded-2xl bg-[#0b0e11]/90 border border-[#D4AF37]/20 flex flex-col space-y-4 text-left font-sans relative overflow-hidden">
                  
                  {/* Decorative golden chip label */}
                  <div className="flex justify-between items-center select-none">
                    <span className="text-[9px] font-mono text-[#D4AF37] tracking-widest font-black uppercase">ESCRITOR FANTASMA AI</span>
                    <PenTool className="w-4 h-4 text-[#D4AF37]" />
                  </div>

                  <form onSubmit={handleGenerateGhostwriterChapter} className="space-y-4">
                    <input
                      type="text"
                      placeholder="Diretrizes do próximo capítulo (ex: astronauta perdido en Marte...)"
                      value={promptInput}
                      onChange={(e) => setPromptInput(e.target.value)}
                      className="w-full px-4 py-3.5 rounded-xl border border-[#D4AF37]/30 bg-black/35 text-xs text-white placeholder-neutral-500 outline-none focus:border-[#D4AF37] transition-all"
                    />

                    <div className="flex justify-between items-center">
                      <p className="text-[9px] text-neutral-500 uppercase">A geração consome 10 páginas de cota / dia.</p>
                      <button
                        type="submit"
                        disabled={isGenerating || !promptInput.trim()}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-yellow-600 to-[#D4AF37] text-white font-black text-xs uppercase shadow-[0_0_10px_rgba(212,175,55,0.3)] cursor-pointer disabled:opacity-50"
                      >
                        {isGenerating ? 'Escrevendo...' : 'Gerar Capítulo'}
                      </button>
                    </div>
                  </form>

                  {/* Typewriter dynamically generated styled text block */}
                  <AnimatePresence>
                    {(isGenerating || typedOutput) && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-4 rounded-xl bg-yellow-950/20 border border-[#D4AF37]/10 text-xs text-neutral-200 mt-2 font-serif relative"
                      >
                        {isGenerating && (
                          <div className="flex items-center gap-2 mb-2 font-mono text-[9px] text-yellow-500 tracking-wide uppercase">
                            <span className="w-2 h-2 rounded-full bg-yellow-500 animate-ping" />
                            <span>IA gerando em chunks (Página 1 em menos de 1s)...</span>
                          </div>
                        )}
                        <p className="leading-relaxed whitespace-pre-wrap select-text">{typedOutput}</p>
                        
                        {/* FEEDBACK LOOP: Glow (Curtir estilo) ou Desfoque (Rejeitar estilo) */}
                        {!isGenerating && typedOutput && (
                          <div className="flex justify-end gap-2 mt-4 pt-2 border-t border-[#D4AF37]/20">
                            <button onClick={() => alert('Glow Registrado: IA ajustando tom neural para imitação profunda.')} className="px-2 py-1 bg-yellow-500/20 text-yellow-500 text-[9px] uppercase font-mono rounded hover:bg-yellow-500/40">Glow (Curtir Estilo)</button>
                            <button onClick={() => alert('Desfoque Registrado: Revertendo estrutura tonal.')} className="px-2 py-1 bg-red-500/10 text-red-400 text-[9px] uppercase font-mono rounded hover:bg-red-500/30">Desfoque</button>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* BOOK CONTENT BODY (dual viewport mode) */}
            <div 
              className={`flex-1 p-6 rounded-3xl border text-left leading-relaxed relative flex flex-col justify-between transition-all duration-300 ${
                nightMode && selectedBook?.title === 'O Astronauta Perdido'
                  ? 'bg-black/90 border-purple-500/20 text-[#bfbfbf]'
                  : 'bg-neutral-900/35 border-white/5 text-[#f3f4f6]'
              }`}
              style={{ 
                fontSize: `${fontSize}px`, 
                minHeight: '35vh',
                filter: selectedBook?.title === 'O Astronauta Perdido' ? `brightness(${brightness}%)` : undefined
              }}
            >
              {/* Highlight active speech sentence (Neural visual syncing) */}
              <div className="font-serif text-[#f3f4f6] space-y-4 flex-1">
                {selectedBook.content[currentChapterIndex]?.split('. ').map((sentence, idx) => {
                  const isActive = isAudioRunning && idx === activeSentenceIndex;
                  return (
                    <span 
                      key={idx}
                      className={`transition-all duration-300 ${
                        isActive 
                          ? 'bg-[#00c8ff]/10 text-[#00c8ff] px-1 rounded-sm border-b border-[#00c8ff]/40 shadow-[0_2px_10px_rgba(0,200,255,0.15)] font-bold' 
                          : 'opacity-90'
                      }`}
                    >
                      {sentence}.{' '}
                    </span>
                  );
                })}
              </div>

              {/* Carousel Chapter selectors pagination indicators */}
              <div className="flex justify-between items-center mt-6 pt-4 border-t border-white/5 font-mono text-xs text-neutral-500 select-none">
                <button
                  disabled={currentChapterIndex <= 0}
                  onClick={() => { setCurrentChapterIndex(prev => prev - 1); setActiveSentenceIndex(0); }}
                  className="p-1 px-3 border border-neutral-800 rounded-lg hover:text-white cursor-pointer transition-colors disabled:opacity-20"
                >
                  ◄ Anterior
                </button>
                <span>Doc {currentChapterIndex + 1} / {selectedBook.content.length}</span>
                <button
                  disabled={currentChapterIndex >= selectedBook.content.length - 1}
                  onClick={() => { setCurrentChapterIndex(prev => prev + 1); setActiveSentenceIndex(0); }}
                  className="p-1 px-3 border border-neutral-800 rounded-lg hover:text-white cursor-pointer transition-colors disabled:opacity-20"
                >
                  Próximo ►
                </button>
              </div>
            </div>
            
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
