export class JamendoService {
  private static clientId: string = (import.meta as any).env.VITE_JAMENDO_CLIENT_ID || '';

  static updateClientId(newId: string) {
    this.clientId = newId;
    console.log('[Jamendo Service] Client ID atualizada via ADM Gateway');
  }

  static async searchTracks(query: string) {
    if (!this.clientId || this.clientId === 'JAMENDO_CLIENT_ID_PLACEHOLDER') {
      console.warn('[Jamendo Service] Chave Client ID não configurada.');
      return [];
    }

    try {
      const resp = await fetch(`https://api.jamendo.com/v3.0/tracks/?client_id=${this.clientId}&format=jsonpretty&limit=10&search=${encodeURIComponent(query)}`);
      if (!resp.ok) throw new Error('Falha ao buscar no Jamendo');
      const data = await resp.json();
      return data.results || [];
    } catch (e) {
      console.error('[Jamendo Service] Erro:', e);
      return [];
    }
  }
}
