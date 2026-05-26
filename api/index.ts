import express from 'express';
import { GoogleGenAI, Type } from "@google/genai";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

const requireAuth = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (!supabase) return res.status(500).json({ error: "Supabase client not configured on server" });
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) return res.status(401).json({ error: "Unauthorized: Missing or invalid token" });
  const token = authHeader.split(" ")[1];
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return res.status(401).json({ error: "Unauthorized: Invalid session token" });
  (req as any).user = user;
  next();
};

let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY environment variable is not defined");
    aiClient = new GoogleGenAI({ apiKey, httpOptions: { headers: { "User-Agent": "aistudio-build" } } });
  }
  return aiClient;
}

const safeFetchJson = async (url: string) => {
  try {
    const resp = await fetch(url);
    if (!resp.ok) return null;
    let text = await resp.text();
    text = text.trim();
    const jsonpMatch = text.match(/^[a-zA-Z0-9_]+\s*\((.*)\);?$/s);
    if (jsonpMatch && jsonpMatch[1]) text = jsonpMatch[1];
    return JSON.parse(text);
  } catch (e) {
    return null;
  }
};

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.get("/api/tmdb/trending", async (req, res) => {
    const apiKey = process.env.TMDB_API_KEY || "9a91802d06a7e6310a47dd35367746f6";
    try {
      const fetchPage = async (page: number) => {
        const url = `https://api.themoviedb.org/3/trending/all/day?api_key=${apiKey}&language=pt-BR&page=${page}`;
        const data = await safeFetchJson(url);
        return data?.results || [];
      };

      const results1 = await fetchPage(1);
      const results2 = await fetchPage(2);
      
      const seenIds = new Set<string>();
      const combined: any[] = [];
      for (const m of [...results1, ...results2]) {
        if (m && m.id) {
          const idStr = String(m.id);
          if (!seenIds.has(idStr)) {
            seenIds.add(idStr);
            combined.push(m);
          }
        }
      }

      const mapped = combined.slice(0, 30).map((m: any, index: number) => {
        const isMovie = m.media_type === "movie" || m.title !== undefined;
        const title = m.title || m.name || m.original_title || m.original_name;
        const releaseDate = m.release_date || m.first_air_date || "";
        const year = releaseDate ? new Date(releaseDate).getFullYear() : 2024;
        const type = isMovie ? "filme" : "serie";

        // Distribute items uniformly across platforms to nicely fill all shelves up to 30
        const platforms = ["netflix", "disney", "hbo", "prime", "globoplay"];
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

        // Make every 4th item favorited and every 3rd with some continue progress for demo
        const isFavorite = index % 4 === 0;
        const continueProgress = index % 3 === 0 ? (20 + (index * 7) % 70) : undefined;

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
          videoUrl: "", // will lazyload or resolve on play
          type,
          status: true,
          platform,
          category,
          rating: m.vote_average || 7.5,
          isFavorite,
          continueProgress,
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

app.get("/api/tmdb/search", async (req, res) => {
    const { query } = req.query;
    const apiKey = process.env.TMDB_API_KEY || "9a91802d06a7e6310a47dd35367746f6";

    if (!query) {
      return res.status(400).json({ error: "Termo de busca é obrigatório." });
    }

    try {
      const url = `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&query=${encodeURIComponent(query as string)}&language=pt-BR`;
      const data = await safeFetchJson(url);
      const results = data?.results || [];

      const seenIds = new Set<string>();
      const uniqueResults: any[] = [];
      for (const m of results) {
        if (m && m.id && (m.media_type === "movie" || m.media_type === "tv")) {
          const idStr = String(m.id);
          if (!seenIds.has(idStr)) {
            seenIds.add(idStr);
            uniqueResults.push(m);
          }
        }
      }

      const mapped = uniqueResults.map((m: any, index: number) => {
        const isMovie = m.media_type === "movie" || m.title !== undefined;
        const title = m.title || m.name || m.original_title || m.original_name;
        const releaseDate = m.release_date || m.first_air_date || "";
        const year = releaseDate ? new Date(releaseDate).getFullYear() : 2024;
        const type = isMovie ? "filme" : "serie";

        const platforms = ["netflix", "disney", "hbo", "prime", "globoplay"];
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

      const streamUrl = apiType === "movie"
        ? `https://vidsrc.to/embed/movie/${numericId}`
        : `https://vidsrc.to/embed/tv/${numericId}`;

      res.json({
        duration,
        production,
        actors,
        videoUrl: videoUrl || "https://www.youtube.com/embed/dQw4w9WgXcQ",
        streamUrl
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
});

export default app;
