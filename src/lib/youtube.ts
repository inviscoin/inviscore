export class YouTubeService {
  private static apiKey: string = (import.meta as any).env.VITE_YOUTUBE_API_KEY || '';

  static updateApiKey(newKey: string) {
    this.apiKey = newKey;
    console.log('[YouTube Service] API Key atualizada via ADM Gateway');
  }

  static async searchVideos(query: string) {
    if (!this.apiKey || this.apiKey === 'JAMENDO_CLIENT_ID_PLACEHOLDER') {
      console.warn('[YouTube Service] Chave API não configurada.');
      return [];
    }

    try {
      const resp = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=${encodeURIComponent(query)}&key=${this.apiKey}`);
      if (!resp.ok) throw new Error('Falha ao buscar no YouTube');
      const data = await resp.json();
      return data.items || [];
    } catch (e) {
      console.error('[YouTube Service] Erro:', e);
      return [];
    }
  }
}
