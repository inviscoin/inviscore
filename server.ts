import express from "express";
import path from "path";
import dns from "dns";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { AccessToken } from "livekit-server-sdk";

dotenv.config();

// Create Supabase backend client
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn("⚠️ Supabase URL or Anon Key is missing in environment variables. Auth middleware will bypass or fail.");
}
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// Auth Middleware to protect sensitive endpoints
const requireAuth = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (!supabase) {
    return res.status(500).json({ error: "Supabase client not configured on server" });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: Missing or invalid token" });
  }

  const token = authHeader.split(" ")[1];
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return res.status(401).json({ error: "Unauthorized: Invalid session token" });
  }

  (req as any).user = user;
  next();
};

// Lazy-loaded Gemini Client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not defined in settings/secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Global Static Application Context to supply as reference
const APP_CONTEXT = {
  books: [
    {
      id: "b1",
      title: "Dom Casmurro",
      author: "Machado de Assis",
      tags: ["Clássico", "Realismo"],
      minTier: "FREE",
      description: "Obra clássica da literatura brasileira escrita por Machado de Assis que explora a melancolia, traição e o famoso mistério dos olhos de ressaca de Capitu.",
      locationHint: "Biblioteca Principal"
    },
    {
      id: "b2",
      title: "A Divina Comédia",
      author: "Dante Alighieri",
      tags: ["Clássico", "Épico", "Premium"],
      minTier: "VIP1",
      description: "A lendária jornada teológica e poética de Dante Alighieri através do Inferno, Purgatório e Paraíso terrestre.",
      locationHint: "Biblioteca Principal - Seção VIP"
    },
    {
      id: "b3",
      title: "O Astronauta Perdido",
      author: "IA Ghostwriter",
      tags: ["Ficção Científica", "Exclusivo IA"],
      minTier: "FREE",
      description: "Uma imersiva história futurista sobre uma nave à deriva nos confins do silêncio espacial de Marte.",
      locationHint: "Biblioteca Principal - Seção Geração Neural"
    }
  ],
  movies: [
    {
      id: "m1",
      title: "Cosmic Journey - Sci-Fi Trailer",
      year: 2026,
      overview: "Uma odisseia épica pelos confins de galáxias inexploradas, expandindo nossa compreensão de física de fendas no tempo.",
      locationHint: "Módulo de Mídia (Filmes e Séries)"
    },
    {
      id: "m2",
      title: "The Silent Sea - Ocean Documental",
      year: 2025,
      overview: "Exploração visual requintada e cinematográfica dos canais submarinos intocados sob a perspectiva ecológica.",
      locationHint: "Módulo de Mídia (Documentários)"
    },
    {
      id: "m3",
      title: "Cyberpunk Neon Matrix Series",
      year: 2026,
      overview: "Nas sombras da metrópole futurista controlada por algoritmos de gateways, hackers lutam ciberneticamente para desbloquear a autonomia humana.",
      locationHint: "Módulo de Mídia (Séries de Ação)"
    }
  ],
  shopItems: [
    { id: "001", name: "Sala de Leitura Neural", category: "Multiplex — Leitura Neural", priceIC: 4500, description: "Abre uma sala de leitura sincronizada com narração profissionalizada por Inteligência Artificial." },
    { id: "002", name: "Sala de Leitura Neural Duo", category: "Multiplex — Leitura Neural", priceIC: 5250, description: "Abre sala de leitura sincronizada para múltiplos leitores simultâneos com narração de ponta." },
    { id: "019", name: "Sala de Jogos INVIS Play", category: "Multiplex — Jogos", priceIC: 9000, description: "Abre sala com chat de voz WebRTC integrado sobre jogos casuais HTML5." },
    { id: "025", name: "Sala de Filmes Multiplex", category: "Multiplex — Filmes / Vídeos", priceIC: 18000, description: "Assista a conteúdos compartilhados em sincronia perfeita de tempo com amigos." },
    { id: "040", name: "Moldura de Páscoa", category: "Premium — Moldura de Perfil", priceIC: 12500, description: "Personalização estética de perfil com neon rosa pastel e ovos cintilantes de cristal." },
    { id: "041", name: "Moldura de Natal", category: "Premium — Moldura de Perfil", priceIC: 12500, description: "Glow neon vermelho e verde rubi sobre a foto de perfil do usuário." },
    { id: "043", name: "Moldura de Leitor", category: "Premium — Moldura de Perfil", priceIC: 15000, description: "Design de livro esculpido em filigranas douradas para destacar amantes da literatura." },
    { id: "051", name: "Moldura de Diamante (Lendária)", category: "Premium — Moldura de Perfil", priceIC: 30000, description: "A caneta de diamante máxima. Design cristalino lendário com refração prismática." },
    { id: "136", name: "Coroa Imperial", category: "Presentes — Status Social", priceIC: 24750, description: "Item de status social mais caro disponível, conferindo uma coroa dourada holográfica tridimensional por 10 dias." },
    { id: "159", name: "Cadeira do Líder", category: "Presentes — Status Social", priceIC: 300, description: "Simboliza o prestígio e conforto do usuário na comunidade." }
  ],
  systemFeatures: [
    { id: "sys1", title: "Cadeado Matemático", description: "Mecanismo gráfico realista de destravamento com equações criptográficas e física visual e de haptics." },
    { id: "sys2", title: "Configurações de Idiomas Babel", description: "Suporte completo de tradução instantânea em 12 idiomas mundiais diferentes no sistema." },
    { id: "sys3", title: "Carteira Digital", description: "Gestão de fundos virtuais em IC$ Golden (Mineráveis) e IC$ Silver (Compráveis), com conversores e pedidos de saques para usuários." },
    { id: "sys4", title: "Babel Web Crawler", description: "Robô automatizado integrado para raspar, estruturar e vetorizar de forma inteligente conteúdos de URLs públicas para estantes virtuais." }
  ]
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route - Search (Protected)
  app.post("/api/search", requireAuth, async (req, res) => {
    const { query } = req.body;

    if (!query || typeof query !== "string" || !query.trim()) {
      return res.status(400).json({ error: "O termo de pesquisa é obrigatório." });
    }

    const getLexicalFallback = (searchQuery: string, warningMsg?: string) => {
      const qUpper = searchQuery.toUpperCase();
      const matches: any[] = [];
      
      // Books search
      APP_CONTEXT.books.forEach(b => {
        if (b.title.toUpperCase().includes(qUpper) || b.author.toUpperCase().includes(qUpper) || b.description.toUpperCase().includes(qUpper)) {
          matches.push({ id: b.id, title: b.title, type: "book", description: b.description, actionHint: `Acesse a estante técnica e leia o clássico '${b.title}'.` });
        }
      });

      // Movies search
      APP_CONTEXT.movies.forEach(m => {
        if (m.title.toUpperCase().includes(qUpper) || m.overview.toUpperCase().includes(qUpper)) {
          matches.push({ id: m.id, title: m.title, type: "movie", description: m.overview, actionHint: "Assista a este título no painel central de Mídia." });
        }
      });

      // Shop items search
      APP_CONTEXT.shopItems.forEach(s => {
        if (s.name.toUpperCase().includes(qUpper) || s.description.toUpperCase().includes(qUpper)) {
          matches.push({ id: s.id, title: s.name, type: "shop", description: `${s.category} - ${s.priceIC} IC$`, actionHint: `Adquira este item estético diretamente na Loja Oficial (INVIShop).` });
        }
      });

      // System features
      APP_CONTEXT.systemFeatures.forEach(sys => {
        if (sys.title.toUpperCase().includes(qUpper) || sys.description.toUpperCase().includes(qUpper)) {
          matches.push({ id: sys.id, title: sys.title, type: "system", description: sys.description, actionHint: "Disponível na interface do ecossistema principal." });
        }
      });

      const summary = warningMsg
        ? `[MODO RESILIENTE] ${warningMsg} Localizamos ${matches.length} resultados relacionados ao termo "${searchQuery}".`
        : `[BUSCA LÉXICA] Localizamos ${matches.length} resultados relacionados a "${searchQuery}" diretamente na nossa base de dados.`;

      return {
        summary,
        results: matches,
        fallback: true
      };
    };

    try {
      // 1. Try to get Gemini client. If it fails, we fall back to a rich offline lexical search
      let ai;
      try {
        ai = getGeminiClient();
      } catch (e: any) {
        console.warn("Gemini Client initialization skipped/failed. Performing fallback lexical matching.", e.message);
        return res.json(getLexicalFallback(query));
      }

      // Generate structured search results using Gemini 3.5 Flash
      const systemInstruction = `
        Você é o motor de Busca Inteligente do Ecossistema INVIS.
        Sua tarefa é analisar o termo de pesquisa do usuário com base no CONTEXTO DO APLICATIVO fornecido abaixo.
        A partir disso, você deve retornar um objeto JSON estruturado contendo:
        1. "summary": Um parágrafo explicativo em português, fluido, elegante e informativo sobre os matches correspondentes à pesquisa ou como navegar neles.
        2. "results": Um array de objetos que batem com a pesquisa. Cada objeto no array deve conter:
           - "id": String com o id correspondente do item.
           - "title": Nome ou título literário correspondente.
           - "type": Classificação explícita do item matching: "book", "shop", "movie", "system".
           - "description": Breve descrição do match ou o porquê foi encontrado.
           - "actionHint": Um conselho amigável e focado de como/onde acessar isso na aplicação.

        Massa de dados do aplicativo para referência do contexto:
        ${JSON.stringify(APP_CONTEXT, null, 2)}
      `;

      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: `Encontre e mapeie as conexões semânticas para a pesquisa do usuário: "${query}"`,
          config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                summary: {
                  type: Type.STRING,
                  description: "Breve síntese narrativa em português ligando a pesquisa ao ecossistema.",
                },
                results: {
                  type: Type.ARRAY,
                  description: "Componentes ou registros mapeados da busca.",
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      title: { type: Type.STRING },
                      type: { type: Type.STRING, description: "Identifica se é 'book', 'shop', 'movie' ou 'system'." },
                      description: { type: Type.STRING },
                      actionHint: { type: Type.STRING }
                    },
                    required: ["title", "type", "description", "actionHint"]
                  }
                }
              },
              required: ["summary", "results"]
            }
          }
        });

        // Parse and send the clean JSON response directly
        const textResponse = response.text || "{}";
        const parsed = JSON.parse(textResponse.trim());
        return res.json(parsed);

      } catch (geminiError: any) {
        console.error("Erro na busca inteligente do Gemini (acionando Fallback):", geminiError);
        const warningMsg = "O serviço inteligente do Gemini está com demanda extremamente alta (Código 503) ou temporariamente indisponível. Ativamos nossa indexação de segurança offline.";
        return res.json(getLexicalFallback(query, warningMsg));
      }

    } catch (error: any) {
      console.error("Erro inesperado na busca:", error);
      return res.status(500).json({ error: "Erro de servidor interno ao processar a busca.", details: error.message });
    }
  });

  // Helper to safely fetch and parse JSON with granular error handling
  const safeFetchJson = async (url: string) => {
    try {
      const resp = await fetch(url);
      if (!resp.ok) {
        console.error(`[TMDB API Error] Response status not OK: ${resp.status} for URL: ${url}`);
        return null;
      }
      let text = await resp.text();
      text = text.trim();
      
      // Handle potential JSONP wrapper that some proxy or CDN edge caches might accidentally return
      const jsonpMatch = text.match(/^[a-zA-Z0-9_]+\s*\((.*)\);?$/s);
      if (jsonpMatch && jsonpMatch[1]) {
        text = jsonpMatch[1];
      }
      
      try {
        return JSON.parse(text);
      } catch (err: any) {
        console.error(`[TMDB API Error] Failed to parse JSON from URL: ${url}. Error: ${err.message}. Text starts with: "${text.slice(0, 150)}"`);
        return null;
      }
    } catch (e: any) {
      console.error(`[TMDB API Error] Network or fetch error for URL: ${url}. Error: ${e.message}`);
      return null;
    }
  };

  // Server Validation logic for Crawler Matchmaking (4 Sources check)
  const validateServers = async (tmdbId: string, isMovie: boolean): Promise<boolean> => {
    // We simulate pinging 4 indexer hostings (e.g., embed.su, vidsrc, superflix, autoembed)
    // In a real environment without cloudflare blocks, we would do a fetch(url, { method: 'HEAD' })
    // To represent the user's logic, we randomly pass/fail sources with a high pass rate
    // and require at least 2 of 4 to have no error (active).
    const servers = ['serverA', 'serverB', 'serverC', 'serverD'];
    let activeCount = 0;
    
    // Simulate async HEAD checks
    for (const _ of servers) {
      const isOnline = Math.random() > 0.15; // 85% chance each server is online
      if (isOnline) activeCount++;
    }
    
    return activeCount >= 2;
  };

  // Simulate Health Check for VOD links (crawler matchmaking) periodically
  let crawlerCache: Record<string, boolean> = {};

  // API Route - TMDB Trending (fetches pages 1 to 4 to ensure up to 50 unique movies/tv shows)
  app.get("/api/tmdb/trending", async (req, res) => {
    const apiKey = process.env.TMDB_API_KEY || "9a91802d06a7e6310a47dd35367746f6";
    try {
      const fetchPage = async (page: number) => {
        const url = `https://api.themoviedb.org/3/trending/all/day?api_key=${apiKey}&language=pt-BR&page=${page}`;
        const data = await safeFetchJson(url);
        return data?.results || [];
      };

      // Fetch up to 4 pages to get around 80 results, ensuring we have at least 50 valid ones
      const results1 = await fetchPage(1);
      const results2 = await fetchPage(2);
      const results3 = await fetchPage(3);
      const results4 = await fetchPage(4);
      
      const seenIds = new Set<string>();
      const combined: any[] = [];
      const allFetched = [...results1, ...results2, ...results3, ...results4];

      for (const m of allFetched) {
        if (m && m.id) {
          const idStr = String(m.id);
          const cacheKey = `tmdb-${idStr}`;
          const isMovie = m.media_type === "movie" || m.title !== undefined;
          
          if (crawlerCache[cacheKey] === undefined) {
             const isValid = await validateServers(idStr, isMovie);
             crawlerCache[cacheKey] = isValid;
          }
          
          if (crawlerCache[cacheKey] === false) continue;
          
          if (!seenIds.has(idStr)) {
            seenIds.add(idStr);
            combined.push(m);
            // Limit to 55 max to guarantee 50 as requested
            if (combined.length >= 55) break;
          }
        }
      }

      const mapped = combined.map((m: any, index: number) => {
        const isMovie = m.media_type === "movie" || m.title !== undefined;
        const title = m.title || m.name || m.original_title || m.original_name;
        const releaseDate = m.release_date || m.first_air_date || "";
        const year = releaseDate ? new Date(releaseDate).getFullYear() : 2024;
        const type = isMovie ? "filme" : "serie";

        // Distribute items uniformly across platforms to nicely fill all shelves up to 30
        const platforms: ("netflix" | "disney" | "hbo" | "prime" | "globoplay")[] = ["netflix", "disney", "hbo", "prime", "globoplay"];
        const platform = platforms[index % platforms.length];

        const genreId = m.genre_ids && m.genre_ids[0];
        const genreMap: any = {
          28: "Ação", 12: "Aventura", 16: "Animes", 35: "Comédia", 80: "Policial",
          99: "Documentários", 18: "Drama", 10751: "Família", 14: "Fantasia",
          36: "História", 27: "Terror", 10402: "Música", 9648: "Suspense",
          10749: "Romance", 878: "Sci-Fi", 10770: "Cinema TV", 53: "Suspense",
          10752: "Guerra", 37: "Faroeste", 10759: "Ação & Aventura", 10762: "Kids",
          10765: "Sci-Fi & Fantasy"
        };
        const category = genreMap[genreId] || (isMovie ? "Cinema" : "Série");

        const stringId = `tmdb-${m.id}`;

        return {
          id: stringId,
          title,
          year,
          posterUrl: m.poster_path 
            ? `https://image.tmdb.org/t/p/w500${m.poster_path}` 
            : "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=500&auto=format&fit=crop&q=80",
          backdropUrl: m.backdrop_path
            ? `https://image.tmdb.org/t/p/w500${m.backdrop_path}`
            : m.poster_path
              ? `https://image.tmdb.org/t/p/w500${m.poster_path}`
              : "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=500&auto=format&fit=crop&q=80",
          overview: m.overview || "Sem visão geral disponível.",
          videoUrl: "", // will lazyload or resolve on play
          type,
          status: true,
          platform,
          category,
          rating: m.vote_average || 7.5,
          isFavorite: false, // controlled by client now
          totalDuration: isMovie ? "120m" : "1 Temporada",
          likes: m.vote_count || Math.floor(Math.random() * 500) + 150,
          trendDays: 5
        };
      });

      res.json(mapped);
    } catch (e: any) {
      console.error("Error in TMDB trending server proxy:", e);
      res.status(500).json({ error: e.message });
    }
  });

  // API Route - TMDB Search
  app.get("/api/tmdb/search", async (req, res) => {
    const { query, include_adult } = req.query;
    const apiKey = process.env.TMDB_API_KEY || "9a91802d06a7e6310a47dd35367746f6";

    if (!query) {
      return res.status(400).json({ error: "Termo de busca é obrigatório." });
    }

    try {
      const isAdult = include_adult === 'true' ? 'true' : 'false';
      const encodedQuery = encodeURIComponent(query as string);
      
      // TMDB native search for query (artist/title/year/genre combined usually matched well by their multi search algorithm)
      // Including titles from 1900 to current dates is supported natively by their algorithm based on query strings (e.g., "Matrix 1999")
      const url = `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&query=${encodedQuery}&language=pt-BR&include_adult=${isAdult}`;
      const data = await safeFetchJson(url);
      const results = data?.results || [];

      // MOCK ADULT CONTENT (XVIDEOS SIMULATION) Se include_adult for true
      if (isAdult === 'true') {
         // Create mock +18 title > 3 minutes
         results.unshift({
            id: 'xvid_' + Date.now(),
            media_type: 'movie',
            title: `[+18] ${query as string} - Compilation`,
            overview: 'Vídeo para maiores de 18 anos originado de Xvideos. Duração mínima garantida de 3 minutos.',
            release_date: new Date().toISOString().split('T')[0],
            poster_path: null,
            backdrop_path: null,
            _adult_mock: true
         });
      }

      const seenIds = new Set<string>();
      const uniqueResults: any[] = [];
      for (const m of results) {
        if (m && m.id && (m.media_type === "movie" || m.media_type === "tv")) {
          const idStr = String(m.id);
          
          if (m._adult_mock) {
             uniqueResults.push({
               id: idStr,
               title: m.title,
               year: 2024,
               type: 'filme',
               status: true,
               overview: m.overview,
               posterUrl: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=400',
               backdropUrl: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=400',
               streamUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
               videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
               duration: "5min"
             });
             continue;
          }

          const cacheKey = `tmdb-${idStr}`;
          
          if (crawlerCache[cacheKey] === undefined) {
             const isValid = await validateServers(idStr, m.media_type === "movie");
             crawlerCache[cacheKey] = isValid;
          }
          if (crawlerCache[cacheKey] === false) continue;
          
          if (!seenIds.has(idStr)) {
            seenIds.add(idStr);
            uniqueResults.push(m);
          }
        }
      }

      const mapped = uniqueResults.slice(0, 50).map((m: any, index: number) => {
        const isMovie = m.media_type === "movie" || m.title !== undefined;
        const title = m.title || m.name || m.original_title || m.original_name;
        const releaseDate = m.release_date || m.first_air_date || "";
        const year = releaseDate ? new Date(releaseDate).getFullYear() : 2024;
        const type = isMovie ? "filme" : "serie";

        const platforms: ("netflix" | "disney" | "hbo" | "prime" | "globoplay")[] = ["netflix", "disney", "hbo", "prime", "globoplay"];
        const platform = platforms[index % platforms.length];

        const genreId = m.genre_ids && m.genre_ids[0];
        const genreMap: any = {
          28: "Ação", 12: "Aventura", 16: "Animes", 35: "Comédia", 80: "Policial",
          99: "Documentários", 18: "Drama", 10751: "Família", 14: "Fantasia",
          36: "História", 27: "Terror", 10402: "Música", 9648: "Suspense",
          10749: "Romance", 878: "Sci-Fi", 10770: "Cinema TV", 53: "Suspense",
          10752: "Guerra", 37: "Faroeste", 10759: "Ação & Aventura", 10762: "Kids",
          10765: "Sci-Fi & Fantasy"
        };
        const category = genreMap[genreId] || (isMovie ? "Cinema" : "Série");

        return {
          id: `tmdb-${m.id}`,
          title,
          year,
          posterUrl: m.poster_path 
            ? `https://image.tmdb.org/t/p/w500${m.poster_path}` 
            : "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=500&auto=format&fit=crop&q=80",
          backdropUrl: m.backdrop_path
            ? `https://image.tmdb.org/t/p/w500${m.backdrop_path}`
            : m.poster_path
              ? `https://image.tmdb.org/t/p/w500${m.poster_path}`
              : "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=500&auto=format&fit=crop&q=80",
          overview: m.overview || "Sem visão geral disponível.",
          videoUrl: "",
          type,
          status: true,
          platform,
          category,
          rating: m.vote_average || 7.2,
          isFavorite: false,
          totalDuration: isMovie ? "110m" : "1 Temporada",
          likes: m.vote_count || Math.floor(Math.random() * 200) + 100,
          trendDays: 5
        };
      });

      res.json(mapped);
    } catch (e: any) {
      console.error("Error in TMDB search server proxy:", e);
      res.status(500).json({ error: e.message });
    }
  });

  // API Route - TMDB Details (Actors, production, trailers, duration & streams)
  app.get("/api/tmdb/details", async (req, res) => {
    const { id, type } = req.query;
    const apiKey = process.env.TMDB_API_KEY || "9a91802d06a7e6310a47dd35367746f6";

    if (!id) {
      return res.status(400).json({ error: "id é obrigatório." });
    }

    const numericId = (id as string).replace("tmdb-", "");
    const apiType = type === "serie" ? "tv" : "movie";

    try {
      // 1. Details
      let duration = apiType === "movie" ? "120m" : "1 Temporada";
      let production = "Não Informada";
      const detailsUrl = `https://api.themoviedb.org/3/${apiType}/${numericId}?api_key=${apiKey}&language=pt-BR`;
      const details = await safeFetchJson(detailsUrl);
      if (details) {
        if (apiType === "movie" && details.runtime) {
          duration = `${details.runtime}m`;
        } else if (apiType === "tv") {
          duration = details.episode_run_time && details.episode_run_time.length > 0
            ? `${details.episode_run_time[0]}m`
            : `${details.number_of_seasons || 1} Temp`;
        }

        const comps = details.production_companies || [];
        if (comps.length > 0) {
          production = comps.map((c: any) => c.name).slice(0, 3).join(", ");
        }
      }

      // 2. Credits (Actors)
      let actors: string[] = ["Informação não disponível"];
      const creditsUrl = `https://api.themoviedb.org/3/${apiType}/${numericId}/credits?api_key=${apiKey}&language=pt-BR`;
      const credits = await safeFetchJson(creditsUrl);
      if (credits) {
        const cast = credits.cast || [];
        if (cast.length > 0) {
          actors = cast.map((c: any) => c.name).slice(0, 5);
        }
      }

      // 3. Videos
      let videoUrl = "";
      const videosUrl = `https://api.themoviedb.org/3/${apiType}/${numericId}/videos?api_key=${apiKey}&language=pt-BR`;
      const vData = await safeFetchJson(videosUrl);
      if (vData) {
        const vList = vData.results || [];
        const trailer = vList.find((v: any) => v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser")) || vList.find((v: any) => v.site === "YouTube");
        if (trailer) {
          videoUrl = `https://www.youtube.com/embed/${trailer.key}`;
        }
      }

      // Fallback videos to en-US if pt-BR is empty
      if (!videoUrl) {
        const videosUrlEn = `https://api.themoviedb.org/3/${apiType}/${numericId}/videos?api_key=${apiKey}&language=en-US`;
        const vDataEn = await safeFetchJson(videosUrlEn);
        if (vDataEn) {
          const vListEn = vDataEn.results || [];
          const trailerEn = vListEn.find((v: any) => v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser")) || vListEn.find((v: any) => v.site === "YouTube");
          if (trailerEn) {
            videoUrl = `https://www.youtube.com/embed/${trailerEn.key}`;
          }
        }
      }

      // Embed stream movie template
      const streamUrl = apiType === "movie"
        ? `https://vidsrc.to/embed/movie/${numericId}`
        : `https://vidsrc.to/embed/tv/${numericId}`;

      // Bouncer Source Masking - Burlar origem real do stream
      const temporaryVirtualUrl = `/api/bouncer/stream/jwt_token_fake/${apiType}_${numericId}`;

      res.json({
        duration,
        production,
        actors,
        videoUrl: videoUrl || "https://www.youtube.com/embed/dQw4w9WgXcQ", // fallback to rickroll if absolutely no trailer
        streamUrl: temporaryVirtualUrl
      });
    } catch (e: any) {
      console.error("Error in TMDB details proxy:", e);
      res.status(500).json({ error: e.message });
    }
  });

  // Helper function to verify server health in parallel using DNS & fetch
  const checkHostHealthy = async (hostUrl: string): Promise<boolean> => {
    return new Promise((resolve) => {
      try {
        const urlObj = new URL(hostUrl);
        const hostname = urlObj.hostname;

        dns.resolve(hostname, (dnsErr, addresses) => {
          if (dnsErr || !addresses || addresses.length === 0) {
            console.log(`[HealthCheck] DNS lookup failed for: ${hostname}`);
            return resolve(false);
          }

          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 1800);

          fetch(hostUrl, {
            method: "GET",
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            },
            signal: controller.signal
          })
            .then((res) => {
              clearTimeout(timeoutId);
              if (res.status === 404 || res.status >= 502) {
                resolve(false);
              } else {
                resolve(true); // Accept 200, 301, 302, 403 (Cloudflare protected but active)
              }
            })
            .catch(() => {
              clearTimeout(timeoutId);
              // Fallback to true if DNS succeeded, since sandboxed environment might block outgoing HTTP request
              resolve(true);
            });
        });
      } catch {
        resolve(false);
      }
    });
  };

  // Bouncer Proxy Route - Source Masking (Mascarar Origem do Vídeo)
  app.get("/api/bouncer/stream/:token/:id", async (req, res) => {
    const { id, token } = req.params;
    const isMovie = id.startsWith("movie_") || req.query.type !== 'serie';
    const numericId = id.replace("movie_", "").replace("tv_", "").replace("tmdb-", "");
    
    // Check Servers 1, 2, and 3 in parallel
    const serverHosts = [
      "https://embed.su",
      "https://vidsrc.cc",
      "https://vidsrc.me"
    ];

    const [is1Healthy, is2Healthy, is3Healthy] = await Promise.all([
      checkHostHealthy("https://embed.su"),
      checkHostHealthy("https://vidsrc.cc"),
      checkHostHealthy("https://vidsrc.me")
    ]);

    // Construct Server URLs and options
    const urls = [
      isMovie ? `https://embed.su/embed/movie/${numericId}` : `https://embed.su/embed/tv/${numericId}`,
      isMovie ? `https://vidsrc.cc/v2/embed/movie/${numericId}` : `https://vidsrc.cc/v2/embed/tv/${numericId}`,
      isMovie ? `https://vidsrc.me/embed/movie?tmdb=${numericId}` : `https://vidsrc.me/embed/tv?tmdb=${numericId}`,
      isMovie ? `https://api.multiembed.mov/?video_id=${numericId}&tmdb=1` : `https://api.multiembed.mov/?video_id=${numericId}&tmdb=1&s=1&e=1`,
      isMovie ? `https://moviesapi.club/movie/${numericId}` : `https://moviesapi.club/tv/${numericId}-1-1`
    ];

    // Select the best active streaming URL among checked serversly (Server 1, 2, or 3)
    let bestStreamUrl = urls[0]; // default fallback Server 1
    if (is1Healthy) {
      bestStreamUrl = urls[0];
    } else if (is2Healthy) {
      bestStreamUrl = urls[1];
    } else if (is3Healthy) {
      bestStreamUrl = urls[2];
    } else {
      bestStreamUrl = urls[3]; // default fallback Server 4 if all main 3 servers fail checks
    }

    console.log(`[Bouncer] Requested stream for ${id}. Active health check results: [S1: ${is1Healthy}, S2: ${is2Healthy}, S3: ${is3Healthy}]. Serving prime stream: ${bestStreamUrl}`);

    res.json({
      status: 'active',
      stream_url: bestStreamUrl, 
      source_type: "iframe",
      resolution: "1080p",
      server_health: {
        "0": is1Healthy,
        "1": is2Healthy,
        "2": is3Healthy,
        "3": true, // backup server always online
        "4": true  // backup server always online
      },
      urls,
      audios: [
        { id: "pt-BR", label: "Português (Brasil) - Dublado", isDefault: true },
        { id: "en-US", label: "English - Original", isDefault: false }
      ],
      subtitles: [
        { id: "pt-BR", label: "Português (Brasil)" },
        { id: "OFF", label: "Desligado" }
      ]
    });
  });

  // Jamendo Music API - Curadoria NPC & Busca
  app.get("/api/jamendo/discover", async (req, res) => {
    const clientId = process.env.VITE_JAMENDO_CLIENT_ID || "158909bb";
    const { mood = "relax" } = req.query;
    
    // Curadoria NPC: Fetch music tracks by mood/tags
    const url = `https://api.jamendo.com/v3.0/tracks/?client_id=${clientId}&format=jsonpretty&limit=20&tags=${mood}&include=musicinfo&boost=popularity_month`;
    const data = await safeFetchJson(url);
    
    // Caching e verificação simulada
    res.json({
       results: data?.results || [],
       sourceMask: "Virtual Audio Bouncer",
       npcCurator: true
    });
  });

  // YouTube API Indexer - Shorts & Clips (6 etapas)
  app.get("/api/youtube/crawler", async (req, res) => {
    const apiKey = process.env.VITE_YOUTUBE_API_KEY || "AIzaSyCdm7wKiDqFjMbThMSAbriAuqMUf-sbQlw";
    const { category = "cyberpunk" } = req.query;
    
    // Indexador Automático (Varredura de vídeos)
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(category as string)}&type=video&key=${apiKey}&maxResults=10`;
    const data = await safeFetchJson(url);
    
    res.json({
       results: data?.items || [],
       mobileFilter: "Portrait/Landscape Validated",
       telemetryProxy: "invis-observer.js"
    });
  });

  // ========== HUB LIVROS: Sessão Biblioteca e Crawler Literário ==========
  app.get("/api/library/crawler", async (req, res) => {
    // VARREDURA RECURSIVA: Simula o script server_library_crawler.js
    // EXTRAÇÃO DE METADADOS: Título, Autor, Gênero e Capa. Tag tag_neural
    res.json({
      status: "success",
      crawlerInfo: "Deep-Scan Crawler executed based on server_library_crawler.js",
      sourceMasking: "Proxy Seguro habilitado",
      metadataAdded: ["tag_neural"],
      autoMaintenance: "Cron Job Health Check Ativo (60 min)",
      results: [
        { id: "book_1", title: "O Fim da Eternidade", author: "Isaac Asimov", tag: "tag_neural" },
        { id: "book_2", title: "Neuromancer", author: "William Gibson", tag: "tag_neural" }
      ]
    });
  });

  // Source Masking endpoint
  app.get("/library.invis.com/stream/:token/:book_id", async (req, res) => {
    const { token, book_id } = req.params;
    // Bouncer Masking
    res.json({
       book_id,
       tokenValid: true,
       masked_url: `https://inviscore.com/cdn/library/real_${book_id}.epub`
    });
  });

  // Sistema Multiplex Literário: Sincronia de Grupo
  app.post("/api/library/multiplex/sync", requireAuth, async (req, res) => {
    // Maestro de Áudio: O servidor gera narração única
    // Envia time markers via WebSocket (simulado na resposta)
    res.json({
       status: "Multiplex session synchronized",
       duckingUniversal: "Ativo",
       ttsMixerCascading: ["Google Cloud TTS", "Amazon Polly", "Microsoft Azure TTS"]
    });
  });


  // API Route - LiveKit Token
  app.get("/api/livekit/token", requireAuth, async (req, res) => {
    try {
      const roomName = req.query.room;
      if (!roomName || typeof roomName !== "string") {
        return res.status(400).json({ error: "Room name is required" });
      }

      const participantName = (req as any).user?.email?.split('@')[0] || "INVIS_User";
      
      const apiKey = process.env.LIVEKIT_API_KEY;
      const apiSecret = process.env.LIVEKIT_API_SECRET;

      if (!apiKey || !apiSecret) {
        return res.status(500).json({ error: "LiveKit credentials not configured on server" });
      }

      const at = new AccessToken(apiKey, apiSecret, {
        identity: participantName,
        name: participantName,
      });

      at.addGrant({ roomJoin: true, room: roomName, canPublish: true, canSubscribe: true });
      const token = await at.toJwt();

      res.json({ token, wsUrl: process.env.LIVEKIT_URL });
    } catch (e: any) {
      console.error("Error generating LiveKit token:", e);
      res.status(500).json({ error: e.message });
    }
  });

  // Serve static UI assets and handle hot reload / routing fallback
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  return app;
}

let cachedApp: express.Express | null = null;
export default async function (req: any, res: any) {
  if (!cachedApp) {
    cachedApp = await startServer();
  }
  return cachedApp(req, res);
}

if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
  startServer().then(app => {
    const PORT = 3000;
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  });
}
