import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 4173);
const mime = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.json':'application/json; charset=utf-8', '.webmanifest':'application/manifest+json; charset=utf-8', '.svg':'image/svg+xml', '.png':'image/png' };

function send(res, status, data, type='application/json; charset=utf-8') {
  res.writeHead(status, { 'Content-Type': type, 'Cache-Control':'no-store', 'X-Content-Type-Options':'nosniff', 'Referrer-Policy':'no-referrer' });
  res.end(typeof data === 'string' ? data : JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  if (req.method === 'POST' && url.pathname === '/api/games') {
    let body = '';
    for await (const chunk of req) {
      body += chunk;
      if (body.length > 8192) return send(res, 413, { error:'İstek çok büyük.' });
    }
    let data;
    try { data = JSON.parse(body); } catch { return send(res, 400, { error:'İstek biçimi geçersiz.' }); }
    const key = String(data.apiKey || '').trim();
    const steamId = String(data.steamId || '').trim();
    if (!/^\d{17}$/.test(steamId)) return send(res, 400, { error:'SteamID64, 17 haneli bir sayı olmalı.' });
    if (!/^[A-Fa-f0-9]{32}$/.test(key)) return send(res, 400, { error:'Steam Web API anahtarı biçimi geçersiz. Anahtar 32 karakter olmalı.' });
    try {
      const endpoint = new URL('https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/');
      endpoint.search = new URLSearchParams({ key, steamid:steamId, include_appinfo:'1', include_played_free_games:'1', format:'json' });
      const response = await fetch(endpoint, { signal:AbortSignal.timeout(20000), headers:{ 'Accept':'application/json' } });
      const text = await response.text();
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) return send(res, 401, { error:'Steam API isteği reddedildi. API key’i kontrol edin.' });
        if (response.status === 429) return send(res, 429, { error:'Steam API istek sınırına ulaşıldı. Biraz bekleyip yeniden deneyin.' });
        return send(res, 502, { error:`Steam API yanıt vermedi (HTTP ${response.status}).` });
      }
      let parsed;
      try { parsed = JSON.parse(text); } catch { return send(res, 502, { error:'Steam API geçerli JSON döndürmedi.' }); }
      const games = parsed?.response?.games;
      if (!Array.isArray(games) && parsed?.response?.game_count !== 0) return send(res, 404, { error:'Kütüphane alınamadı. Profilinizde Oyun ayrıntıları görünürlüğünü herkese açık yapıp SteamID64 ve API key’i kontrol edin.' });
      const owned = games || [];
      return send(res, 200, { gameCount:parsed.response.game_count ?? owned.length, games:owned.map(g => ({ appid:g.appid, name:g.name || `Bilinmeyen oyun (${g.appid})`, playtime_forever:g.playtime_forever || 0, playtime_2weeks:g.playtime_2weeks ?? null, img_icon_url:g.img_icon_url || '' })) });
    } catch (e) {
      const timeout = e?.name === 'TimeoutError' || e?.name === 'AbortError';
      return send(res, 502, { error: timeout ? 'Steam bağlantısı zaman aşımına uğradı. Yeniden deneyin.' : 'Steam API’ye bağlanılamadı. İnternet bağlantınızı kontrol edin.' });
    }
  }
  if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, { error:'Bu istek desteklenmiyor.' });
  let pathname = decodeURIComponent(url.pathname);
  if (pathname === '/') pathname = '/index.html';
  const file = path.resolve(root, `.${pathname}`);
  if (!file.startsWith(root + path.sep)) return send(res, 403, { error:'Erişim reddedildi.' });
  try {
    const content = await readFile(file);
    res.writeHead(200, { 'Content-Type':mime[path.extname(file)] || 'application/octet-stream', 'X-Content-Type-Options':'nosniff', 'Referrer-Policy':'no-referrer' });
    if (req.method === 'HEAD') res.end(); else res.end(content);
  } catch { send(res, 404, 'Dosya bulunamadı.', 'text/plain; charset=utf-8'); }
});

server.listen(port, '127.0.0.1', () => console.log(`Steam Playtime Dashboard: http://127.0.0.1:${port}`));
