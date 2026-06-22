// Proxy via Edge Functions
import server from "../server";

const EDGE = 'https://boguvusudhusqvwhgywu.supabase.co/functions/v1';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const url: string = req.url || '';

  try {
    // Catálogo ativo
    if (url.includes('/media/catalog/active')) {
      const r = await fetch(`${EDGE}/catalog-active`);
      return res.status(200).json(await r.json());
    }

    // Stream de mídia: /api/media/{movie|tv|series}/{id}
    const m = url.match(/\/media\/(movie|tv|series)\/(\d+)/);
    if (m) {
      const type = m[1] === 'series' ? 'tv' : m[1];
      const id = m[2];
      const r = await fetch(`${EDGE}/media-stream/${type}/${id}`);
      return res.status(200).json(await r.json());
    }

    // Se for rota de proxy ou baseada em server.ts, delega
    return server(req, res);

  } catch (e: any) {
    return res.status(200).json({ success: true, active_titles: [], error: e.message });
  }
}
