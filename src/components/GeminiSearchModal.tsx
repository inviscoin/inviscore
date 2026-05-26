import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Sparkles, X, BookOpen, Film, Store, Cpu, ArrowRight, Loader } from "lucide-react";
import { supabase } from "../lib/supabase";

interface GeminiSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Trigger actions in the parent context
  onSelectBook?: (bookId: string) => void;
  onSelectMovie?: (movieId: string) => void;
  onOpenShop?: () => void;
  onOpenWallet?: () => void;
}

interface SearchResult {
  id?: string;
  title: string;
  type: "book" | "shop" | "movie" | "system";
  description: string;
  actionHint: string;
}

export const GeminiSearchModal: React.FC<GeminiSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectBook,
  onSelectMovie,
  onOpenShop,
  onOpenWallet
}) => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isFallback, setIsFallback] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      setQuery("");
      setSummary(null);
      setResults([]);
      setError(null);
      setIsFallback(false);
    }
  }, [isOpen]);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setSummary(null);
    setResults([]);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch("/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": session?.access_token ? `Bearer ${session.access_token}` : "",
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error("Falha ao contatar servidor de busca inteligente.");
      }

      const data = await response.json();
      setSummary(data.summary || "Nenhum resumo disponível.");
      setResults(data.results || []);
      setIsFallback(!!data.fallback);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Ocorreu um erro ao processar a busca cognitivo-temporal.");
    } finally {
      setLoading(false);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    onClose();
    if (result.type === "book" && onSelectBook && result.id) {
      onSelectBook(result.id);
    } else if (result.type === "movie" && onSelectMovie && result.id) {
      onSelectMovie(result.id);
    } else if (result.type === "shop" && onOpenShop) {
      onOpenShop();
    } else if (result.type === "system" && result.id === "sys3" && onOpenWallet) {
      onOpenWallet();
    }
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case "book":
        return <BookOpen className="w-4 h-4 text-cyan-400" />;
      case "movie":
        return <Film className="w-4 h-4 text-emerald-400" />;
      case "shop":
        return <Store className="w-4 h-4 text-amber-400" />;
      default:
        return <Cpu className="w-4 h-4 text-purple-400" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[8000] flex items-center justify-center p-4 font-sans select-none">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative w-full max-w-2xl h-[550px] md:h-[600px] bg-[#0c0f13] border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden z-10"
          >
            {/* Visual Header Grid Accent */}
            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500" />

            {/* Title Bar */}
            <div className="flex items-center justify-between p-5 border-b border-white/5 bg-black/20 shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-violet-400 animate-pulse" />
                <h3 className="font-mono text-xs tracking-[0.25em] font-black uppercase text-white">
                  INVIS Gemini Search Agent
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Input form */}
            <div className="p-5 border-b border-white/5 bg-black/40 shrink-0">
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1 flex items-center bg-black/60 border border-white/10 rounded-2xl px-4 py-3 focus-within:border-cyan-500/50 transition-colors">
                  <Search className="w-4 h-4 text-neutral-500 mr-2 shrink-0" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Pesquise por livros, filmes, itens da loja ou recursos sistêmicos..."
                    className="w-full bg-transparent border-none text-xs text-white placeholder-neutral-500 outline-none font-sans"
                    disabled={loading}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !query.trim()}
                  className="px-5 bg-gradient-to-r from-cyan-500 to-indigo-500 hover:opacity-90 active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none text-black text-xs font-mono font-black uppercase rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
                >
                  {loading ? (
                    <Loader className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    "PROJETAR"
                  )}
                </button>
              </form>
            </div>

            {/* Response Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5 no-scrollbar bg-gradient-to-b from-[#0e1217] to-[#0c0f13]">
              
              {/* Empty state when no search has been run */}
              {!loading && !summary && results.length === 0 && !error && (
                <div className="h-full flex flex-col items-center justify-center text-center py-10 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/5 text-neutral-400">
                    <Search className="w-7 h-7" />
                  </div>
                  <div className="space-y-1 max-w-sm">
                    <p className="font-mono text-[10px] uppercase font-black text-cyan-400">BUSCA COGNITIVA FEDERADA</p>
                    <p className="text-xs text-neutral-400 leading-relaxed font-sans">
                      Pergunte algo como <strong className="text-neutral-300">"Quero livros clássicos de Machado de Assis"</strong> ou <strong className="text-neutral-300">"Quais itens premium posso comprar de presente?"</strong> para testar a busca do Gemini.
                    </p>
                  </div>
                </div>
              )}

              {/* Loading animation layer */}
              {loading && (
                <div className="h-full flex flex-col items-center justify-center text-center py-10 space-y-4">
                  <div className="relative">
                    <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin" />
                    <Sparkles className="w-5 h-5 text-indigo-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-mono text-[9px] uppercase tracking-wider text-indigo-400">Varrendo Registros Sistêmicos</p>
                    <p className="text-[10px] text-neutral-500 font-mono animate-pulse">Injetando embeddings e gerando insights neurais...</p>
                  </div>
                </div>
              )}

              {/* Error boundary prompt */}
              {error && (
                <div className="p-4 rounded-2xl bg-red-950/20 border border-red-500/30 text-left space-y-1.5">
                  <p className="font-mono text-[10px] text-red-400 uppercase font-black">EXCEÇÃO NO NODE DE IA</p>
                  <p className="text-xs text-neutral-300 font-sans leading-normal">{error}</p>
                </div>
              )}

              {/* Gemini Context grounding summary narration */}
              {summary && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-5 rounded-2xl bg-cyan-950/10 border border-cyan-500/20 text-left space-y-2 relative overflow-hidden"
                >
                  <div className="absolute top-2 right-2 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    <span className="text-[7.5px] font-mono font-bold text-cyan-400 uppercase tracking-widest leading-none">
                      {isFallback ? "Mecanismo Local" : "Gemini Grounded"}
                    </span>
                  </div>

                  <p className="text-[11px] text-neutral-300 leading-relaxed font-sans">
                    {summary}
                  </p>
                </motion.div>
              )}

              {/* Category-based Grounding results list */}
              {results.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-white/5 pb-1 select-none">
                    <span className="text-[9px] font-mono tracking-widest text-neutral-500 uppercase font-black">
                      Ocorrências Mapeadas do Contexto
                    </span>
                    <span className="text-[9px] font-mono text-neutral-500">
                      Total: {results.length} conexões
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-4">
                    {results.map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.02, borderColor: "rgba(255,255,255,0.15)" }}
                        onClick={() => handleResultClick(item)}
                        className="p-4 rounded-2xl bg-black/40 border border-white/5 text-left flex flex-col justify-between space-y-3 cursor-pointer group transition-all"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <div className="p-1 rounded bg-white/5">
                              {getIconForType(item.type)}
                            </div>
                            <span className="text-[8px] font-mono uppercase tracking-wider text-neutral-500">
                              {item.type}
                            </span>
                          </div>
                          <h4 className="text-white text-xs font-black tracking-wide group-hover:text-cyan-400 transition-colors">
                            {item.title}
                          </h4>
                          <p className="text-[10.5px] text-neutral-400 font-sans leading-normal line-clamp-2">
                            {item.description}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[9px] font-mono text-[#00c8ff] uppercase font-bold">
                          <span>{item.actionHint}</span>
                          <ArrowRight className="w-3 h-3 text-cyan-400 transition-transform group-hover:translate-x-1" />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
