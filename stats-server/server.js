// Serveur de statistiques anonymes — Node 18+, aucune dépendance.
// Lancement : STATS_TOKEN=un-mot-secret PORT=8787 node server.js
// Données : fichier data/pings.jsonl (une ligne par joueur et par jour : id aléatoire, jour, langue).
const http = require('http'), fs = require('fs'), path = require('path');
const PORT = +process.env.PORT || 8787;
const TOKEN = process.env.STATS_TOKEN || '';          // protège /stats ; vide = /stats fermé
const DIR = path.join(__dirname, 'data'), FILE = path.join(DIR, 'pings.jsonl');
fs.mkdirSync(DIR, { recursive: true });

const seen = new Set();   // « id|jour » déjà enregistrés
if (fs.existsSync(FILE)) for (const l of fs.readFileSync(FILE, 'utf8').split('\n')) { try { const r = JSON.parse(l); seen.add(r.id + '|' + r.day); } catch (e) { /* ligne vide */ } }

const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' };
const rows = () => fs.readFileSync(FILE, 'utf8').split('\n').filter(Boolean).map(l => JSON.parse(l));
const addDays = (d, n) => { const x = new Date(d + 'T12:00:00Z'); x.setUTCDate(x.getUTCDate() + n); return x.toISOString().slice(0, 10); };

function stats() {
  const byId = new Map();
  for (const r of rows()) { if (!byId.has(r.id)) byId.set(r.id, { first: r.day, days: new Set(), lang: r.lang }); byId.get(r.id).days.add(r.day); }
  const cohorts = {};
  for (const p of byId.values()) { (cohorts[p.first] ||= []).push(p); }
  const today = new Date().toISOString().slice(0, 10);
  return Object.keys(cohorts).sort().map(day => {
    const c = cohorts[day], n = c.length;
    const ret = k => addDays(day, k) > today ? null : Math.round(100 * c.filter(p => p.days.has(addDays(day, k))).length / n);
    return { jour: day, nouveaux: n, 'J+1 %': ret(1), 'J+7 %': ret(7) };   // null = pas encore mesurable
  });
}

http.createServer((req, res) => {
  if (req.method === 'OPTIONS') { res.writeHead(204, CORS); return res.end(); }
  if (req.method === 'POST' && req.url === '/ping') {
    let b = ''; req.on('data', c => { b += c; if (b.length > 1000) req.destroy(); });
    req.on('end', () => {
      try {
        const { id, day, lang, game } = JSON.parse(b);
        if (!/^[\w-]{8,64}$/.test(id) || !/^\d{4}-\d{2}-\d{2}$/.test(day)) throw 0;
        if (!seen.has(id + '|' + day)) { seen.add(id + '|' + day); fs.appendFileSync(FILE, JSON.stringify({ id, day, lang: String(lang).slice(0, 5), game: String(game).slice(0, 20) }) + '\n'); }
        res.writeHead(204, CORS); res.end();
      } catch (e) { res.writeHead(400, CORS); res.end(); }
    });
  } else if (req.method === 'GET' && req.url.startsWith('/stats')) {
    if (!TOKEN || new URL(req.url, 'http://x').searchParams.get('token') !== TOKEN) { res.writeHead(403); return res.end('interdit'); }
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' }); res.end(JSON.stringify(stats(), null, 1));
  } else { res.writeHead(404); res.end(); }
}).listen(PORT, () => console.log('stats sur :' + PORT));
