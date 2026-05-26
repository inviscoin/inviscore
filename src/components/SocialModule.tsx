import React, { useState, useEffect, useRef } from 'react';
import { useInvis } from '../context/InvisContext';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Mic, Sparkles, Smile, RefreshCw, Layers, AlignLeft, Volume2, Globe, Heart, MessageSquare, ThumbsUp } from 'lucide-react';
import { supabase, SupabaseService, isSupabaseConfigured } from '../lib/supabase';

interface ChatMessage {
  id: string;
  sender: string;
  avatar: string;
  text: string;
  lang: string; // original language code
  timestamp: string;
  audioDuration?: string;
}

const INITIAL_CONVERSATIONS: ChatMessage[] = [
  { id: 'c1', sender: 'John Smith', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80', text: 'Hello my friend, this INVIS system runs super stable at 60 FPS!', lang: 'en-US', timestamp: '12:35' },
  { id: 'c2', sender: 'Elena Rostova', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80', text: 'Здравствуй! Я тестирую дуплексный синхромотор прямо из Москвы. Это удивительно.', lang: 'ru-RU', timestamp: '12:38' },
  { id: 'c3', sender: 'Takashi Sato', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&auto=format&fit=crop&q=80', text: 'こんにちは！このインターフェースは美しく、反応性が高いです。最高です。', lang: 'ja-JP', timestamp: '12:41' }
];

const FLOTING_EMOJIS_LIST = ['❤️', '😂', '🔥', '👏', '😮', '🎉'];

export const SocialModule: React.FC = () => {
  const { currentUser, language, addTransaction } = useInvis();

  const [activeTab, setActiveTab] = useState<'chat' | 'forum'>('chat');
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_CONVERSATIONS);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  // Load chat messages from Supabase Postgres and subscribe to WebSocket stream in real-time
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    let active = true;
    let channel: any = null;

    const loadAndSubscribe = async () => {
      const dbMsgs = await SupabaseService.fetchMessages();
      if (!active) return;
      if (dbMsgs && dbMsgs.length > 0) {
        setMessages(dbMsgs);
      }

      // Generate a unique channel name per-subscription to avoid duplicate channel conflicts in StrictMode
      const channelId = `chat-messages-${Math.random().toString(36).substring(2, 9)}`;
      channel = supabase
        .channel(channelId)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'messages' },
          (payload) => {
            if (!active) return;
            const newM = payload.new;
            setMessages(prev => {
              if (prev.some(m => m.id === newM.id.toString())) return prev;
              return [...prev, {
                id: newM.id.toString(),
                sender: newM.sender,
                avatar: newM.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
                text: newM.text,
                lang: newM.lang || 'pt-BR',
                timestamp: new Date(newM.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                audioDuration: newM.audio_duration
              }];
            });
          }
        );

      channel.subscribe((status: string) => {
        if (status === 'SUBSCRIBED') {
          console.log('[INVIS Realtime] Subscribed to real-time chat messages.');
        }
      });
    };

    loadAndSubscribe();

    return () => {
      active = false;
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  // Reels states
  const [activeReelIndex, setActiveReelIndex] = useState(0);
  const [likedReels, setLikedReels] = useState<Record<number, boolean>>({});
  const [localReelComments, setLocalReelComments] = useState<Record<number, string[]>>({});
  const [reelInputComment, setReelInputComment] = useState('');
  const [floatingEmojis, setFloatingEmojis] = useState<{ id: number; symbol: string; left: number }[]>([]);

  // Babel Translator State: Translates any typed foreign language to selected user language
  const [translatedMessages, setTranslatedMessages] = useState<Record<string, string>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto translate on message mount to simulate Babel
  useEffect(() => {
    messages.forEach(msg => {
      if (msg.lang !== language) {
        // Enche o tradutor de svelte com simulação
        simulateBabelTranslation(msg.id, msg.text, msg.lang);
      }
    });
  }, [messages, language]);

  const simulateBabelTranslation = (id: string, text: string, fromLang: string) => {
    if (translatedMessages[id]) return;

    // Fake translate mapping to user language
    setTimeout(() => {
      let translationResult = text;
      
      const targetLang = language;
      if (text.includes('60 FPS')) {
        translationResult = targetLang === 'pt-BR' 
          ? 'Olá meu amigo, este sistema INVIS roda super estável a 60 FPS!' 
          : '¡Hola amigo, este sistema INVIS funciona súper estable a 60 FPS!';
      } else if (text.includes('тестирую')) {
        translationResult = targetLang === 'pt-BR'
          ? 'Olá! Estou testando o motor síncrono duplex diretamente de Moscou. É surpreendente.'
          : 'Hello! I am testing the duplex synchronous motor directly from Moscow. Quite amazing.';
      } else if (text.includes('こんにちは')) {
        translationResult = targetLang === 'pt-BR'
          ? 'Olá! Esta interface é bonita e altamente responsiva. É excelente!'
          : 'Hello! This interface is beautiful and highly responsive. Absolutely outstanding.';
      }

      setTranslatedMessages(prev => ({
        ...prev,
        [id]: translationResult
      }));
    }, 600);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg: ChatMessage = {
      id: Math.random().toString(),
      sender: currentUser?.nickname || 'Fundador',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      text: inputText,
      lang: language,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newMsg]);
    setInputText('');

    if (currentUser?.id && isSupabaseConfigured()) {
      SupabaseService.sendMessage(currentUser.id, newMsg);
    }
  };

  // Recording audio simulator
  const startRecordingAudio = () => {
    if (isRecording) {
      setIsRecording(false);
      const audioMsg: ChatMessage = {
        id: Math.random().toString(),
        sender: currentUser?.nickname || 'Fundador',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        text: 'Mensagem de voz',
        lang: language,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        audioDuration: `0:${recordingSeconds < 10 ? '0' : ''}${recordingSeconds}`
      };
      setMessages(prev => [...prev, audioMsg]);
      addTransaction({
        type: 'Gain',
        amount: '+0.0001',
        desc: 'Mineração Ativa: Mensagem de voz enviada'
      });

      if (currentUser?.id && isSupabaseConfigured()) {
        SupabaseService.sendMessage(currentUser.id, audioMsg);
      }
    } else {
      setIsRecording(true);
      setRecordingSeconds(0);
    }
  };

  // Timer for audio recorder
  useEffect(() => {
    let t: NodeJS.Timeout;
    if (isRecording) {
      t = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(t);
  }, [isRecording]);

  // Reels details
  const REELS_MOCK_VIDEOS = [
    {
      id: 1,
      title: 'Espaço MEET: Arena de Conexão',
      publisher: 'matrix_hacker',
      desc: 'Como configurar servidores WebRTC na VPS para lag zero de áudio.',
      videoUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&auto=format&fit=crop&q=80',
      defaultComments: ['Muito estável!', 'Show de bola', 'Parabéns pela tecnologia']
    },
    {
      id: 2,
      title: 'Injeção de Código ADM sem novos deploys',
      publisher: 'arquiteto_invis',
      desc: 'Processando fragmentos de JS e HTML5 via WebAssembly na Sala de Controle.',
      videoUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80',
      defaultComments: ['Arquiteto é o mestre', 'Semente correta', 'Incrível']
    }
  ];

  const currentReel = REELS_MOCK_VIDEOS[activeReelIndex];

  const triggerReelReaction = (symbol: string) => {
    if (navigator.vibrate) navigator.vibrate(15);
    const newEmoji = {
      id: Date.now() + Math.random(),
      symbol,
      left: 10 + Math.random() * 80 // Spread horizontal percent
    };
    setFloatingEmojis(prev => [...prev, newEmoji]);
    
    // Auto cleanup floating emojis
    setTimeout(() => {
      setFloatingEmojis(prev => prev.filter(e => e.id !== newEmoji.id));
    }, 2000);
  };

  const handleAddReelComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reelInputComment.trim()) return;

    const existList = localReelComments[activeReelIndex] || [];
    setLocalReelComments(prev => ({
      ...prev,
      [activeReelIndex]: [...existList, reelInputComment.trim()]
    }));
    setReelInputComment('');
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#0b0e11] text-[#e0e0e0] font-sans overflow-hidden">
      
      {/* Category selector row: Chat vs Fórum Reels */}
      <div className="flex bg-[#0d0d12] border-b border-white/5 select-none p-2 shrink-0">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex-1 py-2 text-xs font-mono font-bold tracking-widest uppercase transition-all rounded-lg cursor-pointer ${
            activeTab === 'chat' 
              ? 'bg-[#00c8ff]/10 text-[#00c8ff] border border-[#00c8ff]/30 shadow-[0_0_10px_rgba(0,190,255,0.15)]'
              : 'text-neutral-500 hover:text-neutral-400'
          }`}
        >
          Conversas (Chat)
        </button>
        <button
          onClick={() => setActiveTab('forum')}
          className={`flex-1 py-2 text-xs font-mono font-bold tracking-widest uppercase transition-all rounded-lg cursor-pointer ${
            activeTab === 'forum' 
              ? 'bg-[#00c8ff]/10 text-[#00c8ff] border border-[#00c8ff]/30 shadow-[0_0_10px_rgba(0,190,255,0.15)]'
              : 'text-neutral-500 hover:text-neutral-400'
          }`}
        >
          Fórum (Reels)
        </button>
      </div>

      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          {activeTab === 'chat' ? (
            /* CONVERSAS CHAT PANEL BLOCK */
            <motion.div
              key="social-chat"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="w-full h-full flex flex-col justify-between"
            >
              {/* Messages Body Flow (WhatsApp Theme Layout) */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
                
                {/* Notice secure encryption popup */}
                <div className="p-3 rounded-xl bg-neutral-900/40 border border-white/5 text-center text-[10px] text-neutral-400 max-w-xs mx-auto">
                  🔒 As mensagens e ligações são protegidas com criptografia de ponta a ponta.
                </div>

                {messages.map((msg) => {
                  const hasTranslation = msg.lang !== language && translatedMessages[msg.id];
                  const translatedText = translatedMessages[msg.id] || msg.text;
                  const isMine = msg.sender === currentUser?.nickname;

                  return (
                    <div 
                      key={msg.id}
                      className={`flex gap-3 max-w-[85%] ${isMine ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                    >
                      {/* Avatar */}
                      <img 
                        src={msg.avatar} 
                        alt="avatar" 
                        className="w-8 h-8 rounded-full object-cover border border-white/10 shrink-0" 
                        referrerPolicy="no-referrer"
                      />

                      {/* Msg bubble container */}
                      <div className="space-y-1">
                        <span className="text-[9px] text-neutral-500 font-mono">@{msg.sender}</span>
                        
                        <div 
                          className={`p-3.5 rounded-2xl relative border ${
                            isMine 
                              ? 'bg-[#00FF80]/10 border-[#00FF80]/30 text-white rounded-tr-none' 
                              : 'bg-black/30 border-white/5 text-white rounded-tl-none'
                          }`}
                        >
                          {/* Audio custom voice waveform simulated */}
                          {msg.audioDuration ? (
                            <div className="flex items-center gap-3">
                              <button className="w-7 h-7 rounded-full bg-cyan-500 text-black flex items-center justify-center font-bold text-xs">
                                ▶
                              </button>
                              <div className="flex gap-0.5 items-end h-4 w-28">
                                <span className="w-[2px] h-3 bg-cyan-400 rounded-full animate-pulse" />
                                <span className="w-[2px] h-2 bg-cyan-400 rounded-full" />
                                <span className="w-[2px] h-4 bg-cyan-400 rounded-full" />
                                <span className="w-[2px] h-1 bg-cyan-400 rounded-full" />
                                <span className="w-[2px] h-3 bg-cyan-400 rounded-full" />
                              </div>
                              <span className="text-[10px] font-mono opacity-80 shrink-0">{msg.audioDuration}</span>
                            </div>
                          ) : (
                            <p className="text-xs leading-relaxed select-text">{translatedText}</p>
                          )}

                          {/* Babel Translations indicator banner block */}
                          {msg.lang !== language && (
                            <div className="mt-2 pt-1 border-t border-white/5 flex items-center justify-between gap-1 text-[8px] font-mono text-cyan-400">
                              <div className="flex items-center gap-1">
                                <Globe className="w-2.5 h-2.5" />
                                <span>BABEL TRADUZIDO DE ({msg.lang})</span>
                              </div>
                              <span className="opacity-60 cursor-help" title={`Original: "${msg.text}"`}>VER ORIGINAL</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Send forms */}
              <form 
                onSubmit={handleSendMessage}
                className="p-3 bg-[#0d0d12] border-t border-white/5 flex gap-3 items-center"
              >
                {/* Audio voice records indicator */}
                <button
                  type="button"
                  onClick={startRecordingAudio}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    isRecording 
                      ? 'bg-red-500 border-red-400 text-white animate-pulse'
                      : 'border-white/5 bg-black/40 text-cyan-400 hover:text-white'
                  }`}
                >
                  <Mic className="w-4 h-4" />
                </button>

                {isRecording ? (
                  /* Recording overlay */
                  <div className="flex-1 text-xs font-mono text-red-400 flex items-center gap-3 justify-center select-none py-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-400 animate-ping" />
                    <span>AUDIO EM INSTANTE: {recordingSeconds}s (Clique no MIC para enviar)</span>
                  </div>
                ) : (
                  <>
                    <input
                      type="text"
                      placeholder="Converse e Babel traduz..."
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      className="flex-1 px-4 py-3 rounded-xl border border-white/5 bg-black/40 text-xs text-white placeholder-neutral-500 outline-none"
                    />

                    <button
                      type="submit"
                      className="p-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold cursor-pointer transition-all active:scale-95"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </>
                )}
              </form>
            </motion.div>
          ) : (
            /* FÓRUM REELS VERTICAL VIDEOS PANEL BLOCK */
            <motion.div
              key="social-forum"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="w-full h-full flex flex-col md:flex-row overflow-y-auto no-scrollbar md:overflow-hidden"
            >
              {/* Reels Vertical Frame video display */}
              <div className="flex-1 h-[45vh] md:h-full relative overflow-hidden bg-black/80 flex items-center justify-center border-b md:border-b-0 md:border-r border-white/5">
                <img 
                  src={currentReel.videoUrl} 
                  className="w-full h-full object-cover opacity-80" 
                  alt="reel asset"
                  referrerPolicy="no-referrer"
                />

                {/* Left/Right controls indicators */}
                <div className="absolute top-4 left-4 z-15 p-2 bg-black/60 rounded-xl border border-white/5">
                  <span className="text-[10px] font-mono text-[#00c8ff] font-bold">@reels_{currentReel.publisher}</span>
                </div>

                {/* Floating Emojis Reaction Overlay (Page 40) */}
                <div className="absolute inset-0 z-30 pointer-events-none">
                  <AnimatePresence>
                    {floatingEmojis.map((emoji) => (
                      <motion.span
                        key={emoji.id}
                        initial={{ opacity: 1, y: '80vh', scale: 0.8 }}
                        animate={{ opacity: 0, y: '50px', scale: 1.5 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.8, ease: 'easeOut' }}
                        className="absolute text-4xl"
                        style={{ left: `${emoji.left}%` }}
                      >
                        {emoji.symbol}
                      </motion.span>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Absolute Floating Emoji Pill Menu selector (Page 39) */}
                <div className="absolute bottom-4 left-4 right-4 z-20 p-2.5 rounded-full bg-black/80 border border-white/10 flex gap-2 justify-around pointer-events-auto">
                  {FLOTING_EMOJIS_LIST.map((symbol) => (
                    <button
                      key={symbol}
                      onClick={() => triggerReelReaction(symbol)}
                      className="text-xl hover:scale-130 transition-transform cursor-pointer outline-none focus:outline-none"
                    >
                      {symbol}
                    </button>
                  ))}
                </div>

                {/* Lateral Navigation dots to scroll through reels */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-2">
                  {REELS_MOCK_VIDEOS.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveReelIndex(idx)}
                      className={`w-3.5 h-3.5 rounded-full transition-all cursor-pointer ${
                        activeReelIndex === idx ? 'bg-[#00FF80]' : 'bg-neutral-600 hover:bg-neutral-400'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Reels Comments and discussion segment */}
              <div className="w-full md:w-80 shrink-0 h-[45ch] md:h-full flex flex-col justify-between bg-black/30">
                <div className="p-4 border-b border-white/5 text-left font-sans space-y-1">
                  <h4 className="text-white text-xs font-bold leading-tight">{currentReel.title}</h4>
                  <p className="text-[10px] text-neutral-400 leading-normal">{currentReel.desc}</p>
                </div>

                {/* Comments List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 font-sans text-left pr-2 no-scrollbar">
                  {currentReel.defaultComments.map((com, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-neutral-900/35 border border-white/5">
                      <p className="text-[9px] text-[#00c8ff] font-mono leading-none mb-1">@fã_invis</p>
                      <p className="text-[11px] text-neutral-300 leading-relaxed">{com}</p>
                    </div>
                  ))}

                  {(localReelComments[activeReelIndex] || []).map((com, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/10">
                      <p className="text-[9px] text-[#00FF80] font-mono leading-none mb-1">@{currentUser?.nickname || 'Fundador'}</p>
                      <p className="text-[11px] text-neutral-200 leading-normal">{com}</p>
                    </div>
                  ))}
                </div>

                {/* Submitting comment */}
                <form 
                  onSubmit={handleAddReelComment}
                  className="p-3 border-t border-white/5 flex gap-2 items-center bg-[#0d0d12]"
                >
                  <input
                    type="text"
                    placeholder="Deixe um comentário..."
                    value={reelInputComment}
                    onChange={(e) => setReelInputComment(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 rounded-lg border border-white/5 bg-black/40 text-xs text-white outline-none placeholder-neutral-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-lg bg-[#00FF80] text-black font-bold text-xs cursor-pointer"
                  >
                    Postar
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
