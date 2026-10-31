'use strict';
/* ==========================================================================
   Île Paradis — prototype jouable (navigateur / mobile)
   Un seul fichier, aucune dépendance. Les réglages d'équilibrage sont
   regroupés dans la section « DONNÉES » juste en dessous.
   ========================================================================== */
(() => {

/* ---------- utilitaires ---------- */
const $ = (s, r = document) => r.querySelector(s);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const rnd = (a, b) => a + Math.random() * (b - a);
const rint = (a, b) => Math.floor(rnd(a, b + 1));
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

/* ==========================================================================
   DONNÉES (équilibrage)
   ========================================================================== */
const COLS = 14, ROWS = 14, SEED = 20240;
const SAVE_KEY = 'ile-paradis-save-v1';

const RES = {
  bois:    { e: '🪵', n: 'Bois' },
  pierre:  { e: '🪨', n: 'Pierre' },
  poisson: { e: '🐟', n: 'Poisson' },
  ble:     { e: '🌾', n: 'Blé' },
  pieces:  { e: '🪙', n: 'Pièces' },
};

// 3 types d'habitants : chacun double la production de « son » bâtiment
const JOBS = {
  pecheur:  { e: '🎣', m: 'Pêcheur',  f: 'Pêcheuse', building: 'port' },
  fermier:  { e: '🧑‍🌾', m: 'Fermier',  f: 'Fermière', building: 'ferme' },
  marchand: { e: '💼', m: 'Marchand', f: 'Marchande', building: 'marche' },
};
const NAMES = [
  ['Léa', 'f'], ['Marc', 'm'], ['Inès', 'f'], ['Tom', 'm'], ['Zoé', 'f'], ['Hugo', 'm'],
  ['Nina', 'f'], ['Omar', 'm'], ['Jade', 'f'], ['Louis', 'm'], ['Maya', 'f'], ['Noé', 'm'],
];

// 5 bâtiments
const BUILDINGS = {
  maison: { n: 'Maison', e: '🏠', plate: '#ecbf90', cost: { bois: 8, pierre: 2 }, time: 12,
    desc: 'Loge 2 habitants. Chaque habitant ramasse du bois ou de la pierre.' },
  ferme:  { n: 'Ferme', e: '🌾', plate: '#dcc56e', cost: { bois: 10, pierre: 3 }, time: 15,
    interval: 8, out: 'ble', job: 'fermier', desc: 'Produit du blé 🌾 (×2 avec un Fermier).' },
  port:   { n: 'Port', e: '⚓', plate: '#93b8d8', cost: { bois: 12, pierre: 6 }, time: 15,
    interval: 8, out: 'poisson', job: 'pecheur', coast: true,
    desc: 'Produit du poisson 🐟 (×2 avec un Pêcheur). À poser au bord de l\'eau.' },
  marche: { n: 'Marché', e: '🏪', plate: '#eba5a5', cost: { bois: 12, pierre: 8 }, time: 20,
    interval: 10, job: 'marchand', desc: 'Vend le surplus de nourriture : +3 🪙 (×2 avec un Marchand).' },
  mairie: { n: 'Mairie', e: '🏛️', plate: '#d2cbea', cost: { bois: 15, pierre: 10, pieces: 20 }, time: 25,
    unique: true, desc: 'Ouvre l\'Assemblée : on y vote les règles de vie.' },
};

// 3 règles votables. `like` = probabilité qu'un habitant de ce type
// apprécie que la règle soit en vigueur.
const RULES = {
  impots:   { n: 'Impôts', e: '💰', like: { pecheur: .4, fermier: .4, marchand: .2 },
    desc: 'À chaque tournée, le shérif collecte 2 🪙 par habitant dans les maisons. Les gens râlent (bonheur −15).' },
  fetes:    { n: 'Fêtes', e: '🎉', like: { pecheur: .8, fermier: .8, marchand: .6 },
    desc: 'Une fête toutes les 45 s (coûte 4 nourritures) : gros coup de boost au bonheur (+18).' },
  entraide: { n: 'Entraide', e: '🤝', like: { pecheur: .7, fermier: .8, marchand: .4 },
    desc: 'Production +25 %, deux fois moins d\'incidents, bonheur +8. Coûte 1 🪙 par habitant toutes les 20 s.' },
};

const NODE = {
  tree: { max: 3, res: 'bois',    emojis: ['🌲', '🌳'] },
  rock: { max: 3, res: 'pierre',  emojis: ['🪨'] },
  fish: { max: 4, res: 'poisson', emojis: ['🐟'] },
};

const SKINS = [
  { id: 'classic', e: '🐎', n: 'Cheval classique' },
  { id: 'zebre',   e: '🦓', n: 'Zèbre rayé' },
  { id: 'licorne', e: '🦄', n: 'Licorne' },
];

const EMOJI_FONT = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji","Twemoji Mozilla",sans-serif';

/* ==========================================================================
   CARTE (générée de façon déterministe à partir de SEED)
   ========================================================================== */
let MAP;

function genMap() {
  const rng = mulberry32(SEED);
  const idx = (x, y) => y * COLS + x;
  const cx = (COLS - 1) / 2, cy = (ROWS - 1) / 2;
  const ph = [rng() * 6.28, rng() * 6.28, rng() * 6.28];

  let land = new Uint8Array(COLS * ROWS);
  for (let y = 1; y < ROWS - 1; y++) for (let x = 1; x < COLS - 1; x++) {
    const dx = (x - cx) / (COLS / 2), dy = (y - cy) / (ROWS / 2);
    const a = Math.atan2(dy, dx), d = Math.hypot(dx, dy);
    const wob = 1 + 0.13 * Math.sin(3 * a + ph[0]) + 0.09 * Math.sin(5 * a + ph[1]) + 0.05 * Math.sin(2 * a + ph[2]);
    land[idx(x, y)] = d < 0.78 * wob ? 1 : 0;
  }

  // on ne garde que la plus grande composante connexe
  const comp = new Int16Array(COLS * ROWS).fill(-1);
  let best = -1, bestSize = 0, cid = 0;
  for (let i = 0; i < land.length; i++) {
    if (!land[i] || comp[i] !== -1) continue;
    const q = [i]; comp[i] = cid;
    for (let h = 0; h < q.length; h++) {
      const x = q[h] % COLS, y = (q[h] / COLS) | 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= COLS || ny >= ROWS) continue;
        const ni = idx(nx, ny);
        if (land[ni] && comp[ni] === -1) { comp[ni] = cid; q.push(ni); }
      }
    }
    if (q.length > bestSize) { bestSize = q.length; best = cid; }
    cid++;
  }
  for (let i = 0; i < land.length; i++) if (comp[i] !== best) land[i] = 0;

  // 0 = eau, 1 = sable (rivage), 2 = herbe
  const type = new Uint8Array(COLS * ROWS);
  const isL = (x, y) => x >= 0 && y >= 0 && x < COLS && y < ROWS && land[idx(x, y)] === 1;
  for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
    if (!land[idx(x, y)]) continue;
    const coast = !isL(x + 1, y) || !isL(x - 1, y) || !isL(x, y + 1) || !isL(x, y - 1);
    type[idx(x, y)] = coast ? 1 : 2;
  }

  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const grass = [];
  for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) if (type[idx(x, y)] === 2) grass.push({ x, y });

  // tuile de départ : l'herbe la plus proche du centre
  let start = grass[0];
  for (const t of grass) if (Math.hypot(t.x - cx, t.y - cy) < Math.hypot(start.x - cx, start.y - cy)) start = t;

  // forêts et carrière en bouquets
  const chooseCenter = (avoid, minD) => {
    for (let k = 0; k < 300; k++) {
      const t = grass[Math.floor(rng() * grass.length)];
      if (dist(t, start) >= 2.5 && avoid.every(c => dist(c, t) >= minD)) return t;
    }
    return grass[0];
  };
  const f1 = chooseCenter([], 0), f2 = chooseCenter([f1], 4), q1 = chooseCenter([f1, f2], 3.5);
  const used = new Set([idx(start.x, start.y)]);
  const near = (centers, count, kind, spread) => {
    const out = [];
    const scored = grass
      .filter(t => dist(t, start) > 1.6)
      .map(t => ({ t, s: Math.min(...centers.map(c => dist(c, t))) + rng() * spread }))
      .sort((a, b) => a.s - b.s);
    for (const { t } of scored) {
      if (out.length >= count) break;
      if (used.has(idx(t.x, t.y))) continue;
      used.add(idx(t.x, t.y));
      out.push({ kind, x: t.x, y: t.y, v: Math.floor(rng() * NODE[kind].emojis.length) });
    }
    return out;
  };
  const nodeDefs = [...near([f1, f2], 14, 'tree', 2.2), ...near([q1], 7, 'rock', 1.6)];

  // coins de pêche : eau voisine de la terre
  const shore = [];
  for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
    if (land[idx(x, y)]) continue;
    if (isL(x + 1, y) || isL(x - 1, y) || isL(x, y + 1) || isL(x, y - 1)) shore.push({ x, y });
  }
  const shuffled = shore.map(t => ({ t, r: rng() })).sort((a, b) => a.r - b.r).map(o => o.t);
  const fish = [];
  for (const t of shuffled) {
    if (fish.length >= 7) break;
    if (fish.every(f => dist(f, t) >= 2.4)) fish.push(t);
  }
  fish.forEach(t => nodeDefs.push({ kind: 'fish', x: t.x, y: t.y, v: 0 }));

  return { type, start, shore, nodeDefs };
}

const isLand = (x, y) => x >= 0 && y >= 0 && x < COLS && y < ROWS && MAP.type[y * COLS + x] > 0;

function hash2(x, y) {
  let h = Math.imul(x + 17, 374761393) ^ Math.imul(y + 31, 668265263) ^ SEED;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/* ==========================================================================
   ÉTAT DU JEU
   ========================================================================== */
let state;
const nodeGrid = new Map();
const bGrid = new Map();
let placing = null;     // type de bâtiment en cours de pose (UI uniquement)
let hover = null;       // case survolée pendant la pose
let lastHarvest = null; // pour la pub « doubler la récolte »
const fx = [];          // textes flottants

function newState() {
  const nodes = MAP.nodeDefs.map((d, i) => ({
    id: i, kind: d.kind, x: d.x, y: d.y, v: d.v,
    stock: NODE[d.kind].max, regrow: 0, cool: 0,
  }));
  const s = MAP.start;
  const st = {
    v: 1, t: 0, seenIntro: false,
    res: { bois: 22, pierre: 8, poisson: 3, ble: 3, pieces: 20 },
    buildings: [{ id: 1, type: 'maison', x: s.x, y: s.y, built: true, left: 0, acc: 0, workerId: null, lastTax: -99 }],
    people: [{ id: 2, name: 'Tom', g: 'm', type: 'pecheur' }],
    mood: 62, fed: true,
    rules: { impots: false, fetes: false, entraide: false }, entraideOk: true,
    voteCd: 0, lastVote: null,
    nodes, incidents: [], arrival: null,
    timers: { arrival: 22, incident: 50, meal: 20, fete: 30, entraide: 20 },
    partyUntil: -1, gatherAcc: 0, skin: 'classic',
    stats: { resolved: 0 },
    nextId: 10,
    sheriff: { x: s.x + .5, y: s.y + 1.5, path: [], task: { type: 'idle' }, pause: 1, patrolIdx: -1 },
  };
  return st;
}

function rebuildGrids() {
  nodeGrid.clear(); bGrid.clear();
  state.nodes.forEach(n => nodeGrid.set(n.y * COLS + n.x, n));
  state.buildings.forEach(b => bGrid.set(b.y * COLS + b.x, b));
}
const buildingAt = (x, y) => bGrid.get(y * COLS + x);
const nodeAt = (x, y) => nodeGrid.get(y * COLS + x);

function walk(x, y) {
  if (!isLand(x, y)) return false;
  if (bGrid.has(y * COLS + x)) return false;
  const n = nodeGrid.get(y * COLS + x);
  return !(n && n.kind !== 'fish');
}

/* ---------- dérivés ---------- */
const builtOf = type => state.buildings.filter(b => b.built && b.type === type);
const capacity = () => builtOf('maison').length * 2;
const hasMairie = () => builtOf('mairie').length > 0;
const food = () => state.res.poisson + state.res.ble;
const jobLabel = p => (p.g === 'f' ? JOBS[p.type].f : JOBS[p.type].m);
const occupantsOf = houseIdx => state.people.slice(houseIdx * 2, houseIdx * 2 + 2);
const moodFace = m => (m >= 80 ? '😄' : m >= 60 ? '🙂' : m >= 40 ? '😐' : m >= 20 ? '😟' : '😡');
const canAfford = cost => Object.entries(cost).every(([k, v]) => state.res[k] >= v);
const costHtml = cost => Object.entries(cost)
  .map(([k, v]) => `<span class="${state.res[k] >= v ? '' : 'lack'}">${v}${RES[k].e}</span>`).join('');
const addMood = d => { state.mood = clamp(state.mood + d, 0, 100); };

function assignJobs() {
  const s = state;
  s.buildings.forEach(b => { b.workerId = null; });
  for (const p of s.people) {
    const b = s.buildings.find(b => b.built && BUILDINGS[b.type].job === p.type && b.workerId == null);
    if (b) b.workerId = p.id;
  }
}

function moodFactors() {
  const s = state, f = [['Base', 50]];
  f.push(s.fed ? ['Bien nourris 🍽️', 15] : ['Faim 😟', -25]);
  if (s.partyUntil > s.t) f.push(['Fête en cours 🎉', 18]);
  if (s.rules.entraide && s.entraideOk) f.push(['Entraide 🤝', 8]);
  if (s.rules.impots) f.push(['Impôts 💰', -15]);
  if (s.incidents.length) f.push([`Incidents en cours (${s.incidents.length}) ⚠️`, -8 * s.incidents.length]);
  return f;
}
const moodTarget = () => clamp(moodFactors().reduce((a, [, v]) => a + v, 0), 0, 100);

/* ==========================================================================
   ACTIONS DU JOUEUR : récolte, construction
   ========================================================================== */
function give(k, n, tx, ty) {
  state.res[k] += n;
  floatText(tx + .5, ty + .15, `+${n}${RES[k].e}`);
}

function harvest(n) {
  if (n.stock <= 0 || n.cool > state.t) return;
  const def = NODE[n.kind];
  const amt = n.kind === 'rock' ? rint(1, 2) : rint(2, 3);
  n.stock--; n.cool = state.t + .3;
  if (n.stock <= 0) n.regrow = state.t + 25;
  give(def.res, amt, n.x, n.y);
  lastHarvest = { res: def.res, amt, t: state.t, x: n.x, y: n.y };
}

function canPlace(type, x, y) {
  if (!isLand(x, y)) return 'Il faut construire sur la terre ferme.';
  if (buildingAt(x, y)) return 'Cette case est déjà occupée.';
  const n = nodeAt(x, y);
  if (n && n.kind !== 'fish') return 'Un arbre ou un rocher bloque la place.';
  const sh = state.sheriff;
  if (Math.floor(sh.x) === x && Math.floor(sh.y) === y) return 'Le shérif est sur cette case !';
  if (BUILDINGS[type].coast && ![[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => {
    const nx = x + dx, ny = y + dy;
    return nx >= 0 && ny >= 0 && nx < COLS && ny < ROWS && !isLand(nx, ny);
  })) return 'Le Port se pose au bord de l\'eau.';
  return null;
}

function startPlacing(type) {
  const def = BUILDINGS[type];
  if (def.unique && state.buildings.some(b => b.type === type)) { toast(`Tu as déjà une ${def.n}.`); return; }
  if (!canAfford(def.cost)) { toast('Pas assez de ressources.'); return; }
  placing = type;
  renderHint();
}

function placeBuilding(type, x, y) {
  const why = canPlace(type, x, y);
  if (why) { toast(why); return; }
  const def = BUILDINGS[type];
  if (!canAfford(def.cost)) { toast('Pas assez de ressources.'); placing = null; return; }
  for (const [k, v] of Object.entries(def.cost)) state.res[k] -= v;
  state.buildings.push({ id: state.nextId++, type, x, y, built: false, left: def.time, acc: 0, workerId: null, lastTax: -99 });
  rebuildGrids();
  placing = null;
  floatText(x + .5, y, '🔨');
  toast(`🚧 Chantier lancé : ${def.n} (${def.time} s)`);
  renderHint();
}

function finishBuilding(b) {
  b.built = true; b.left = 0;
  assignJobs();
  floatText(b.x + .5, b.y, '✨');
  toast(`${BUILDINGS[b.type].e} ${BUILDINGS[b.type].n} terminé !`);
}

/* ---------- arrivées d'habitants ---------- */
function spawnArrival() {
  const s = state;
  const spots = MAP.shore.filter(t => !nodeAt(t.x, t.y));
  const spot = pick(spots);
  const taken = new Set(s.people.map(p => p.name));
  const free = NAMES.filter(([n]) => !taken.has(n));
  const [name, g] = pick(free.length ? free : NAMES);
  const weights = Object.keys(JOBS).map(k => {
    const slots = builtOf(JOBS[k].building).length;
    const filled = s.people.filter(p => p.type === k).length;
    return [k, 1 + (slots > filled ? 3 : 0)];
  });
  let r = Math.random() * weights.reduce((a, [, w]) => a + w, 0), type = weights[0][0];
  for (const [k, w] of weights) { if ((r -= w) <= 0) { type = k; break; } }
  s.arrival = { name, g, type, x: spot.x, y: spot.y, ttl: 40 };
  toast('⛵ Un bateau accoste ! Touche-le pour accueillir un habitant.');
}

function acceptArrival() {
  const s = state, a = s.arrival;
  if (!a) return;
  if (s.people.length >= capacity()) { toast('Plus de place : construis une Maison.'); return; }
  s.people.push({ id: s.nextId++, name: a.name, g: a.g, type: a.type });
  s.arrival = null;
  s.timers.arrival = rnd(25, 40);
  assignJobs();
  addMood(3);
  toast(`${JOBS[a.type].e} ${a.name} s'installe sur l'île !`);
}

/* ==========================================================================
   RÈGLES & VOTE
   ========================================================================== */
function propose(ruleId) {
  const s = state;
  if (s.voteCd > 0) return;
  if (!s.people.length) { toast('Il faut des habitants pour voter.'); return; }
  const turningOn = !s.rules[ruleId];
  const votes = s.people.map(p => {
    let like = RULES[ruleId].like[p.type] + (s.mood - 50) / 250;
    if (ruleId === 'fetes' && food() < 6) like -= .25;
    if (ruleId === 'entraide' && s.res.pieces < 10) like -= .15;
    if (ruleId === 'impots' && s.res.pieces < 10) like += .15;
    like = clamp(like, .05, .95);
    return { e: JOBS[p.type].e, name: p.name, yes: Math.random() < (turningOn ? like : 1 - like) };
  });
  const yes = votes.filter(v => v.yes).length, no = votes.length - yes;
  const passed = yes > no;
  if (passed) {
    s.rules[ruleId] = turningOn;
    if (ruleId === 'fetes' && turningOn) s.timers.fete = 8;
    if (ruleId === 'entraide' && turningOn) { s.entraideOk = true; s.timers.entraide = 20; }
  }
  s.voteCd = 35;
  s.lastVote = { ruleId, turningOn, votes, yes, no, passed };
}

/* ==========================================================================
   INCIDENTS & SHÉRIF
   ========================================================================== */
function spawnIncident(forceKind) {
  const s = state;
  if (s.incidents.length >= 2) return false;
  const built = s.buildings.filter(b => b.built);
  const houses = built.filter(b => b.type === 'maison');
  const total = s.res.bois + s.res.pierre + s.res.poisson + s.res.ble;
  const canDispute = s.people.length >= 2 && houses.length > 0;
  const canThief = built.length > 0 && total >= 6;
  let kind = forceKind || (canDispute && canThief ? pick(['vol', 'dispute']) : canThief ? 'vol' : canDispute ? 'dispute' : null);
  if (kind === 'dispute' && !canDispute) kind = canThief ? 'vol' : null;
  if (kind === 'vol' && !canThief) kind = canDispute ? 'dispute' : null;
  if (!kind) return false;

  if (kind === 'vol') {
    const target = pick(built);
    s.incidents.push({ id: s.nextId++, kind, x: target.x, y: target.y, age: 0, ttl: 45, loot: {}, stealT: 3 });
    toast(`🦹 Un voleur rôde près du bâtiment « ${BUILDINGS[target.type].n} » ! Touche-le pour envoyer le shérif.`);
  } else {
    const house = pick(houses);
    const two = s.people.slice().sort(() => Math.random() - .5).slice(0, 2);
    s.incidents.push({ id: s.nextId++, kind, x: house.x, y: house.y, age: 0, ttl: 45, a: two[0].name, b: two[1].name });
    toast(`💢 ${two[0].name} et ${two[1].name} se disputent ! Touche l'icône pour intervenir.`);
  }
  return true;
}

function stealStep(inc) {
  const s = state;
  const ks = ['bois', 'pierre', 'poisson', 'ble'].filter(k => s.res[k] > 0);
  if (!ks.length) return;
  const k = pick(ks), n = Math.min(s.res[k], rint(1, 3));
  s.res[k] -= n;
  inc.loot[k] = (inc.loot[k] || 0) + n;
  floatText(inc.x + .5, inc.y, `−${n}${RES[k].e}`, '#ff8a80');
}

const lootText = loot => Object.entries(loot).map(([k, v]) => `${v}${RES[k].e}`).join(' ');

function expireIncident(inc) {
  const s = state;
  s.incidents.splice(s.incidents.indexOf(inc), 1);
  if (inc.kind === 'vol') {
    addMood(-4);
    toast(`🦹 Le voleur s'est enfui avec ${lootText(inc.loot) || 'un maigre butin'}…`);
  } else {
    addMood(-8);
    toast('💢 La dispute a dégénéré. Les habitants sont remontés.');
  }
}

function resolveIncident(inc, how) {
  const s = state;
  const i = s.incidents.indexOf(inc);
  if (i < 0) return;
  s.incidents.splice(i, 1);
  if (inc.kind === 'vol') {
    const ratio = how === 'prison' ? 1 : how === 'pardon' ? .5 : .6;
    const back = [];
    for (const [k, v] of Object.entries(inc.loot)) {
      const n = Math.round(v * ratio);
      if (n > 0) { s.res[k] += n; back.push(`${n}${RES[k].e}`); }
    }
    if (how === 'prison') addMood(-3);
    if (how === 'pardon') addMood(5);
    toast(`🦹 Voleur arrêté !${back.length ? ' Récupéré : ' + back.join(' ') : ''}`);
  } else {
    if (how === 'mediation') { addMood(6); toast('🕊️ Médiation réussie : tout le monde se réconcilie.'); }
    else if (how === 'amende') { give('pieces', 8, inc.x, inc.y); addMood(-4); toast('💰 Amende payée, mais ça jase…'); }
    else { addMood(2); toast('🐎 Le shérif calme la dispute.'); }
  }
  s.stats.resolved++;
  s.sheriff.task = { type: 'idle' };
  s.sheriff.pause = .8;
}

/* ---------- déplacement du shérif ---------- */
function bfs(sx, sy, isGoal) {
  const start = sy * COLS + sx;
  const prev = new Int16Array(COLS * ROWS).fill(-2);
  prev[start] = -1;
  const q = [start];
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
  for (let h = 0; h < q.length; h++) {
    const i = q[h], x = i % COLS, y = (i / COLS) | 0;
    if (i !== start && isGoal(x, y)) {
      const path = [];
      for (let k = i; k !== start; k = prev[k]) path.push([k % COLS, (k / COLS) | 0]);
      return path.reverse();
    }
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!walk(nx, ny)) continue;
      if (dx && dy && (!walk(x + dx, y) || !walk(x, y + dy))) continue;
      const ni = ny * COLS + nx;
      if (prev[ni] !== -2) continue;
      prev[ni] = i; q.push(ni);
    }
  }
  return null;
}

// va jusqu'à une case voisine de (tx,ty)
function pathNextTo(tx, ty) {
  const sh = state.sheriff, sx = Math.floor(sh.x), sy = Math.floor(sh.y);
  if (Math.max(Math.abs(sx - tx), Math.abs(sy - ty)) <= 1) return [];
  return bfs(sx, sy, (x, y) => Math.max(Math.abs(x - tx), Math.abs(y - ty)) <= 1) || [[tx, ty]];
}

function dispatchSheriff(inc) {
  const sh = state.sheriff;
  sh.task = { type: 'incident', incId: inc.id };
  sh.pause = 0;
  sh.path = pathNextTo(inc.x, inc.y);
  toast('🐎 Le shérif galope vers le lieu de l\'incident !');
  if (!sh.path.length) onSheriffArrive();
}

function nextPatrol() {
  const s = state, sh = s.sheriff;
  const list = s.buildings.filter(b => b.built);
  if (!list.length) {
    const sx = Math.floor(sh.x), sy = Math.floor(sh.y);
    const gx = rint(2, COLS - 3), gy = rint(2, ROWS - 3);
    sh.task = { type: 'wander' };
    sh.path = walk(gx, gy) ? (bfs(sx, sy, (x, y) => x === gx && y === gy) || []) : [];
    sh.pause = sh.path.length ? 0 : 1;
    return;
  }
  sh.patrolIdx = (sh.patrolIdx + 1) % list.length;
  const stop = list[sh.patrolIdx];
  sh.task = { type: 'patrol', stopId: stop.id };
  sh.path = pathNextTo(stop.x, stop.y);
  if (!sh.path.length) onSheriffArrive();
}

function onSheriffArrive() {
  const s = state, sh = s.sheriff, task = sh.task;
  sh.path = [];
  if (task.type === 'incident') {
    sh.task = { type: 'idle' }; sh.pause = .4;
    const inc = s.incidents.find(i => i.id === task.incId);
    if (inc) openIncidentModal(inc);
    return;
  }
  if (task.type === 'patrol') {
    const b = s.buildings.find(b => b.id === task.stopId);
    if (b) {
      // la règle « Impôts » n'est appliquée que si le shérif passe collecter
      if (s.rules.impots && b.type === 'maison' && s.t - b.lastTax > 25) {
        const idx = builtOf('maison').indexOf(b);
        const c = idx >= 0 ? occupantsOf(idx).length : 0;
        if (c > 0) { give('pieces', 2 * c, b.x, b.y); b.lastTax = s.t; }
      }
      const inc = s.incidents.find(i => i.x === b.x && i.y === b.y);
      if (inc) { toast('🐎 Le shérif intervient pendant sa tournée.'); resolveIncident(inc, 'auto'); }
    }
  }
  sh.task = { type: 'idle' };
  sh.pause = 1.3;
}

function updateSheriff(dt) {
  const sh = state.sheriff;
  if (sh.pause > 0) { sh.pause -= dt; return; }
  if (sh.path.length) {
    const [tx, ty] = sh.path[0];
    const gx = tx + .5, gy = ty + .5, dx = gx - sh.x, dy = gy - sh.y, d = Math.hypot(dx, dy);
    const sp = (sh.task.type === 'incident' ? 4.6 : 2.4) * dt;
    if (d <= sp) { sh.x = gx; sh.y = gy; sh.path.shift(); }
    else { sh.x += dx / d * sp; sh.y += dy / d * sp; }
    if (!sh.path.length) onSheriffArrive();
    return;
  }
  nextPatrol();
}

/* ==========================================================================
   BOUCLE DE MISE À JOUR
   ========================================================================== */
function update(dt) {
  const s = state;
  s.t += dt;
  s.voteCd = Math.max(0, s.voteCd - dt);

  // repousse des ressources
  for (const n of s.nodes) if (n.stock <= 0 && s.t >= n.regrow) n.stock = NODE[n.kind].max;

  // chantiers
  for (const b of s.buildings) if (!b.built) { b.left -= dt; if (b.left <= 0) finishBuilding(b); }

  // production
  const moodMult = s.mood < 30 ? .7 : s.mood >= 75 ? 1.15 : 1;
  const mult = (s.rules.entraide && s.entraideOk ? 1.25 : 1) * moodMult;
  for (const b of s.buildings) {
    const def = BUILDINGS[b.type];
    if (!b.built || !def.interval) continue;
    b.acc += dt * mult * (b.workerId != null ? 2 : 1) / def.interval;
    while (b.acc >= 1) {
      b.acc -= 1;
      if (def.out) give(def.out, 1, b.x, b.y);
      else marketSell(b);
    }
  }

  // chaque habitant ramasse du bois ou de la pierre
  s.gatherAcc += dt * s.people.length / 15;
  while (s.gatherAcc >= 1) {
    s.gatherAcc -= 1;
    const h = s.buildings.find(b => b.built && b.type === 'maison');
    if (h) give(Math.random() < .65 ? 'bois' : 'pierre', 1, h.x, h.y);
  }

  // repas
  s.timers.meal -= dt;
  if (s.timers.meal <= 0) { s.timers.meal = 20; meal(); }

  // fêtes
  if (s.rules.fetes) {
    s.timers.fete -= dt;
    if (s.timers.fete <= 0) {
      if (food() >= 4) {
        let n = 4;
        for (const k of ['poisson', 'ble']) { const q = Math.min(s.res[k], n); s.res[k] -= q; n -= q; }
        s.partyUntil = s.t + 25; s.timers.fete = 45;
        const m = builtOf('mairie')[0] || s.buildings[0];
        floatText(m.x + .5, m.y - .3, '🎉🎶');
        toast('🎉 Fête sur l\'île ! Le moral grimpe.');
      } else {
        s.timers.fete = 15;
        toast('🎉 Pas assez de nourriture pour la fête…');
      }
    }
  }

  // entraide : caisse commune
  if (s.rules.entraide) {
    s.timers.entraide -= dt;
    if (s.timers.entraide <= 0) {
      s.timers.entraide = 20;
      const cost = s.people.length;
      if (s.res.pieces >= cost) { s.res.pieces -= cost; s.entraideOk = true; }
      else { s.entraideOk = false; toast('🤝 Caisse commune vide : l\'entraide est suspendue.'); }
    }
  }

  // arrivées
  if (!s.arrival) {
    if (s.people.length < capacity() && s.mood >= 40) {
      s.timers.arrival -= dt;
      if (s.timers.arrival <= 0) spawnArrival();
    }
  } else {
    s.arrival.ttl -= dt;
    if (s.arrival.ttl <= 0) {
      toast(`⛵ Le bateau de ${s.arrival.name} a repris la mer.`);
      s.arrival = null; s.timers.arrival = rnd(20, 30);
    }
  }

  // incidents
  s.timers.incident -= dt;
  if (s.timers.incident <= 0) {
    const first = s.stats.resolved === 0 && s.incidents.length === 0 && !s.firstIncidentDone;
    const ok = spawnIncident(first ? 'vol' : undefined);
    if (ok) s.firstIncidentDone = true;
    s.timers.incident = ok ? rnd(40, 70) * (s.rules.entraide ? 2 : 1) : 10;
  }
  for (const inc of s.incidents.slice()) {
    inc.age += dt;
    if (inc.kind === 'vol') { inc.stealT -= dt; if (inc.stealT <= 0) { stealStep(inc); inc.stealT = 5; } }
    if (inc.age >= inc.ttl) expireIncident(inc);
  }

  updateSheriff(dt);

  // humeur : tend doucement vers la cible
  s.mood += (moodTarget() - s.mood) * (1 - Math.exp(-dt / 10));

  // sauvegarde auto
  saveTimer += dt;
  if (saveTimer > 4) { saveTimer = 0; save(); }
}

function marketSell(b) {
  const s = state;
  if (food() <= s.people.length * 2) return; // on garde de quoi manger
  const k = s.res.poisson >= s.res.ble ? 'poisson' : 'ble';
  if (s.res[k] <= 0) return;
  s.res[k] -= 1;
  give('pieces', 3, b.x, b.y);
}

function meal() {
  const s = state;
  let missing = s.people.length;
  for (const k of ['poisson', 'ble']) { const q = Math.min(s.res[k], missing); s.res[k] -= q; missing -= q; }
  s.fed = missing === 0;
  if (!s.fed) { addMood(-4); toast('😟 Pas assez à manger ! Il faut un Port ou une Ferme.'); }
}

/* ==========================================================================
   SAUVEGARDE
   ========================================================================== */
let saveTimer = 0;
function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch (e) { /* stockage indisponible */ } }
function load() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const d = JSON.parse(raw);
    if (!d || d.v !== 1 || !Array.isArray(d.buildings) || !Array.isArray(d.nodes)) return null;
    const base = newState();
    const st = Object.assign(base, d);
    st.res = Object.assign(base.res, d.res);
    st.rules = Object.assign(base.rules, d.rules);
    st.timers = Object.assign(base.timers, d.timers);
    st.stats = Object.assign(base.stats, d.stats);
    return st;
  } catch (e) { return null; }
}
function resetGame() {
  try { localStorage.removeItem(SAVE_KEY); } catch (e) { /* ignore */ }
  state = newState(); rebuildGrids(); assignJobs();
  placing = null; lastHarvest = null; fx.length = 0;
  closeModal(); renderHud(); renderHint();
  openIntro();
}

/* ==========================================================================
   INTERFACE : fenêtres, toasts, HUD
   ========================================================================== */
let modalOpen = false, modalOnClose = null, modalDismiss = true;

function openModal({ title, html, buttons = [], onclose = null, dismissable = true, onrender = null }) {
  $('#mTitle').textContent = title;
  $('#mBody').innerHTML = html || '';
  const foot = $('#mFoot'); foot.innerHTML = '';
  for (const b of buttons) {
    const el = document.createElement('button');
    el.type = 'button';
    el.className = 'btn ' + (b.cls || '');
    el.innerHTML = b.label;
    if (b.id) el.id = b.id;
    if (b.disabled) el.disabled = true;
    el.addEventListener('click', () => {
      if (b.keepOpen) { b.onclick && b.onclick(); return; }
      closeModal();
      b.onclick && b.onclick();
    });
    foot.appendChild(el);
  }
  $('#modal').hidden = false;
  modalOpen = true; modalOnClose = onclose; modalDismiss = dismissable;
  $('.sheet').scrollTop = 0;
  onrender && onrender($('#mBody'));
}
function closeModal() {
  if (!modalOpen) return;
  $('#modal').hidden = true;
  modalOpen = false;
  const f = modalOnClose; modalOnClose = null;
  f && f();
}

function toast(msg, ms = 3400) {
  const box = $('#toasts');
  const el = document.createElement('div');
  el.className = 'toast'; el.textContent = msg;
  box.appendChild(el);
  while (box.children.length > 2) box.firstChild.remove();
  setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 450); }, ms);
}

const hudEls = {};
function initHud() {
  const hud = $('#hud');
  for (const [k, r] of Object.entries(RES)) {
    const c = document.createElement('div');
    c.className = 'chip'; c.title = r.n;
    c.innerHTML = `${r.e}<b>0</b>`;
    hud.appendChild(c); hudEls[k] = c.lastChild;
  }
  const pop = document.createElement('div'); pop.className = 'chip'; pop.innerHTML = '👥<b>0/0</b>';
  const mood = document.createElement('div'); mood.className = 'chip'; mood.innerHTML = '🙂<b>0</b>';
  hud.appendChild(pop); hud.appendChild(mood);
  hudEls.pop = pop.lastChild; hudEls.mood = mood.lastChild; hudEls.moodIcon = mood;
}
function popChip(el) {
  const c = el.parentNode;
  c.classList.remove('pop'); void c.offsetWidth; c.classList.add('pop');
}
function renderHud() {
  const s = state;
  for (const k of Object.keys(RES)) {
    const el = hudEls[k], v = String(Math.floor(s.res[k]));
    if (el.textContent !== v) { if (+el.textContent < +v) popChip(el); el.textContent = v; }
  }
  hudEls.pop.textContent = `${s.people.length}/${capacity()}`;
  hudEls.mood.textContent = Math.round(s.mood);
  hudEls.moodIcon.firstChild.nodeValue = moodFace(s.mood);

  // pub « doubler la récolte »
  const btn = $('#adBtn');
  if (lastHarvest && s.t - lastHarvest.t < 8) {
    btn.hidden = false;
    btn.textContent = `📺 Doubler : +${lastHarvest.amt}${RES[lastHarvest.res].e}`;
  } else { btn.hidden = true; lastHarvest = null; }
}

function currentHint() {
  const s = state;
  if (s.incidents.length) {
    const i = s.incidents[0];
    return i.kind === 'vol' ? '🦹 Voleur ! Touche l\'icône pour envoyer le shérif.' : '💢 Dispute ! Touche l\'icône pour envoyer le shérif.';
  }
  if (s.arrival) return '⛵ Un bateau est arrivé : touche-le pour accueillir un habitant.';
  const has = t => s.buildings.some(b => b.type === t);
  if (!has('port')) return 'Tape les 🌲 et les 🪨 pour récolter, puis construis un Port ⚓ au bord de l\'eau.';
  if (!has('ferme')) return 'Construis une Ferme 🌾 : des habitants bien nourris sont des habitants heureux.';
  if (!has('marche')) return 'Construis un Marché 🏪 pour transformer le surplus de nourriture en 🪙.';
  if (!has('mairie')) return 'Construis la Mairie 🏛️ pour voter des règles de vie.';
  if (s.people.length >= capacity()) return 'Plus de place ! Construis une Maison 🏠 pour accueillir de nouveaux habitants.';
  if (!Object.values(s.rules).some(Boolean)) return 'Ouvre l\'Assemblée 🏛️ et propose une règle au vote.';
  return 'Garde l\'île heureuse : les bateaux ⛵ apportent des habitants, le shérif 🐎 règle les incidents.';
}
let lastHintKey = '';
function renderHint() {
  const el = $('#hint');
  const key = placing ? 'P' + placing : currentHint();
  if (key === lastHintKey) return;
  lastHintKey = key;
  if (placing) {
    el.innerHTML = `<span class="grow">${BUILDINGS[placing].e} Touche une case <b>verte</b> pour poser : <b>${BUILDINGS[placing].n}</b></span><button type="button" id="cancelPlace">Annuler</button>`;
    $('#cancelPlace').addEventListener('click', () => { placing = null; renderHint(); });
  } else {
    el.innerHTML = `<span class="grow">${key}</span>`;
  }
}

/* ---------- fenêtres du jeu ---------- */
function openIntro() {
  openModal({
    title: '🏝️ Bienvenue sur l\'Île Paradis',
    dismissable: false,
    html: `
      <p class="big">Fais prospérer ta petite île, en bonne entente avec ses habitants.</p>
      <p>🌲 <b>Récolte</b> bois, pierre et poisson en touchant la carte.</p>
      <p>🔨 <b>Construis</b> maisons, ferme, port, marché et mairie.</p>
      <p>⛵ <b>Accueille</b> des habitants : pêcheurs, fermiers, marchands.</p>
      <p>🏛️ <b>Vote</b> des règles de vie (impôts, fêtes, entraide).</p>
      <p>🐎 Ton <b>shérif</b> patrouille, fait respecter les règles et règle les incidents (vols, disputes).</p>
      <p class="muted">Pas de pay-to-win : les pubs récompensées sont facultatives et les cosmétiques n'ont aucun effet sur le jeu.</p>`,
    buttons: [{ label: 'C\'est parti !', cls: 'primary', onclick: () => { state.seenIntro = true; save(); } }],
  });
}

function openBuildMenu() {
  const rows = Object.entries(BUILDINGS).map(([id, d]) => {
    const exists = d.unique && state.buildings.some(b => b.type === id);
    const ok = !exists && canAfford(d.cost);
    return `<button type="button" class="row" data-b="${id}" ${ok ? '' : 'disabled'}>
      <span class="ico">${d.e}</span>
      <span class="grow"><span class="name">${d.n}${exists ? ' <span class="pill on">construite</span>' : ''}</span>
      <span class="desc">${d.desc}</span>
      <span class="cost">${costHtml(d.cost)}<span>⏱️ ${d.time} s</span></span></span></button>`;
  }).join('');
  openModal({
    title: '🔨 Construire', html: rows, buttons: [{ label: 'Fermer', cls: 'ghost' }],
    onrender: body => body.querySelectorAll('[data-b]').forEach(el =>
      el.addEventListener('click', () => { closeModal(); startPlacing(el.dataset.b); })),
  });
}

function openBuildingModal(b) {
  const def = BUILDINGS[b.type];
  if (!b.built) {
    openModal({
      title: `🚧 ${def.n} en construction`,
      html: `<p>Fin des travaux dans <b>${Math.ceil(b.left)} s</b>.</p><p class="muted">Tu peux accélérer en regardant une pub (facultatif).</p>`,
      buttons: [
        { label: '📺 Terminer maintenant (pub)', cls: 'ad', onclick: () => Ads.show('Terminer la construction instantanément.', () => { if (!b.built) finishBuilding(b); }) },
        { label: 'Fermer', cls: 'ghost' },
      ],
    });
    return;
  }
  if (b.type === 'mairie') { openAssembly(); return; }
  let body = `<p>${def.desc}</p>`;
  if (b.type === 'maison') {
    const occ = occupantsOf(builtOf('maison').indexOf(b));
    body += occ.length
      ? '<p><b>Habitants :</b></p>' + occ.map(p => `<div class="row"><span class="ico">${JOBS[p.type].e}</span><span class="grow"><span class="name">${p.name}</span><span class="desc">${jobLabel(p)}</span></span></div>`).join('')
      : '<p class="muted">Vide pour l\'instant. Un bateau ⛵ va bientôt arriver.</p>';
  } else {
    const w = state.people.find(p => p.id === b.workerId);
    body += w
      ? `<p>${JOBS[w.type].e} <b>${w.name}</b> (${jobLabel(w)}) y travaille : production ×2.</p>`
      : `<p class="muted">Aucun ${JOBS[def.job].m.toLowerCase()} n'y travaille : production normale. Accueille-en un pour la doubler !</p>`;
  }
  openModal({ title: `${def.e} ${def.n}`, html: body, buttons: [{ label: 'Fermer', cls: 'ghost' }] });
}

function openArrivalModal() {
  const a = state.arrival;
  if (!a) return;
  const j = JOBS[a.type], label = a.g === 'f' ? j.f : j.m;
  const slot = builtOf(j.building).length > state.people.filter(p => p.type === a.type).length;
  const bn = BUILDINGS[j.building];
  openModal({
    title: `⛵ ${a.name} arrive !`,
    html: `<p class="big">${j.e} <b>${a.name}</b>, ${label.toLowerCase()}, cherche une île où s'installer.</p>
      <p>${slot ? `Un poste l'attend : ${bn.e} ${bn.n} (production ×2).` : `Pas de ${bn.n} libre pour l'instant : il ou elle ramassera du bois en attendant.`}</p>
      <p class="muted">Logements : ${state.people.length}/${capacity()}</p>`,
    buttons: [
      { label: 'Accueillir 🤗', cls: 'primary', onclick: acceptArrival },
      { label: 'Refuser', cls: 'ghost', onclick: () => { state.arrival = null; state.timers.arrival = rnd(20, 30); } },
      { label: 'Plus tard', cls: 'ghost' },
    ],
  });
}

function openIncidentModal(inc) {
  if (inc.kind === 'vol') {
    openModal({
      title: '🦹 Voleur rattrapé !',
      html: `<p>Le shérif a coincé le voleur. Butin volé : <b>${lootText(inc.loot) || 'rien pour le moment'}</b>.</p><p>Que décides-tu ?</p>`,
      buttons: [
        { label: '⛓️ Prison — récupère tout · bonheur −3', cls: 'primary', onclick: () => resolveIncident(inc, 'prison') },
        { label: '🤝 Pardon — récupère la moitié · bonheur +5', onclick: () => resolveIncident(inc, 'pardon') },
        { label: 'Plus tard', cls: 'ghost' },
      ],
    });
  } else {
    openModal({
      title: '💢 Dispute de voisinage',
      html: `<p><b>${inc.a}</b> et <b>${inc.b}</b> se disputent à propos d'une clôture. Le shérif attend ta décision.</p>`,
      buttons: [
        { label: '🕊️ Médiation — bonheur +6', cls: 'primary', onclick: () => resolveIncident(inc, 'mediation') },
        { label: '💰 Amende — +8 🪙 · bonheur −4', onclick: () => resolveIncident(inc, 'amende') },
        { label: 'Plus tard', cls: 'ghost' },
      ],
    });
  }
}

function openAssembly() {
  if (!hasMairie()) { toast('Construis d\'abord la Mairie 🏛️ pour voter des règles.'); return; }
  const s = state;
  const cd = Math.ceil(s.voteCd);
  let html = `<p class="muted">Les habitants votent à la majorité simple (égalité : rien ne change). Leur humeur et leur métier comptent. Prochain vote possible ${cd > 0 ? `dans <b>${cd} s</b>` : '<b>maintenant</b>'}.</p>`;
  if (s.lastVote) {
    const v = s.lastVote, r = RULES[v.ruleId];
    html += `<div class="row" style="display:block"><b>Dernier vote : ${r.e} ${r.n} (${v.turningOn ? 'adopter' : 'abroger'})</b>
      <div class="voters">${v.votes.map(x => `<span class="voter ${x.yes ? 'yes' : 'no'}">${x.e} ${x.name} ${x.yes ? '👍' : '👎'}</span>`).join('')}</div>
      <b>${v.yes} pour · ${v.no} contre → ${v.passed ? (v.turningOn ? '✅ adoptée' : '✅ abrogée') : v.yes === v.no ? '🤷 égalité, rien ne change' : '❌ rejetée'}</b></div>`;
  }
  for (const [id, r] of Object.entries(RULES)) {
    const on = s.rules[id];
    html += `<div class="row"><span class="ico">${r.e}</span><span class="grow"><span class="name">${r.n} <span class="pill ${on ? 'on' : ''}">${on ? 'en vigueur' : 'inactive'}</span></span>
      <span class="desc">${r.desc}</span></span>
      <button type="button" class="btn sm" data-rule="${id}" ${cd > 0 ? 'disabled' : ''}>${on ? 'Abroger' : 'Proposer'}</button></div>`;
  }
  openModal({
    title: '🏛️ Assemblée', html, buttons: [{ label: 'Fermer', cls: 'ghost' }],
    onrender: body => body.querySelectorAll('[data-rule]').forEach(el =>
      el.addEventListener('click', () => { propose(el.dataset.rule); openAssembly(); })),
  });
}

function openPeople() {
  const s = state;
  const factors = moodFactors();
  let html = `<p class="big">${moodFace(s.mood)} Bonheur : <b>${Math.round(s.mood)}</b>/100</p>
    <ul class="factors">${factors.map(([n, v]) => `<li><span>${n}</span><span class="${v >= 0 ? 'pos' : 'neg'}">${v > 0 ? '+' : ''}${v}</span></li>`).join('')}</ul>
    <p class="muted">Le bonheur tend doucement vers ce total. En dessous de 40, plus aucun bateau n'accoste ; sous 30, la production baisse.</p>
    <p><b>Habitants (${s.people.length}/${capacity()})</b></p>`;
  html += s.people.length ? s.people.map(p => {
    const b = s.buildings.find(b => b.workerId === p.id);
    return `<div class="row"><span class="ico">${JOBS[p.type].e}</span><span class="grow"><span class="name">${p.name}</span>
      <span class="desc">${jobLabel(p)} · ${b ? `travaille au ${BUILDINGS[b.type].n} ${BUILDINGS[b.type].e}` : `sans poste (cherche un ${BUILDINGS[JOBS[p.type].building].n})`}</span></span></div>`;
  }).join('') : '<p class="muted">Personne… pour l\'instant.</p>';
  html += `<p class="muted">Incidents réglés par le shérif : <b>${s.stats.resolved}</b></p>`;
  openModal({
    title: '👥 Habitants & bonheur', html,
    buttons: [
      { label: 'Fermer', cls: 'ghost' },
      { label: 'Nouvelle partie', cls: 'ghost', onclick: openResetConfirm },
    ],
  });
}

function openResetConfirm() {
  openModal({
    title: 'Recommencer à zéro ?',
    html: '<p>Ta partie en cours (île, habitants, règles) sera effacée.</p>',
    buttons: [
      { label: 'Oui, nouvelle partie', cls: 'primary', onclick: resetGame },
      { label: 'Annuler', cls: 'ghost' },
    ],
  });
}

function openStable() {
  const s = state;
  const rows = SKINS.map(k => `<button type="button" class="row ${s.skin === k.id ? 'sel' : ''}" data-skin="${k.id}">
      <span class="ico">${k.e}</span><span class="grow"><span class="name">${k.n}</span>
      <span class="desc">${s.skin === k.id ? 'Équipé' : 'Toucher pour équiper'}</span></span></button>`).join('');
  openModal({
    title: '🐎 Écurie du shérif',
    html: `${rows}<p class="muted">Aperçu des cosmétiques. Dans la version finale : skins de cheval, décors et bâtiments, achetables — <b>sans aucun avantage de jeu</b> pour garder la communauté soudée. D'autres arrivent bientôt.</p>`,
    buttons: [{ label: 'Fermer', cls: 'ghost' }],
    onrender: body => body.querySelectorAll('[data-skin]').forEach(el =>
      el.addEventListener('click', () => { s.skin = el.dataset.skin; save(); openStable(); })),
  });
}

/* ==========================================================================
   PUBLICITÉS RÉCOMPENSÉES (simulation)
   Remplace `Ads.show` par le SDK de ton choix (AdMob, Google H5 Games Ads,
   etc.) : appelle `onReward()` uniquement si la pub a été regardée en entier.
   ========================================================================== */
const Ads = {
  show(reason, onReward) {
    const total = 3;
    let left = total;
    const iv = setInterval(() => {
      left = Math.max(0, left - .1);
      const bar = $('.adbar i'), txt = $('.adtxt b'), ok = $('#adOk');
      if (!bar) return;
      bar.style.width = `${(1 - left / total) * 100}%`;
      txt.textContent = Math.ceil(left);
      if (left <= 0 && ok) { ok.disabled = false; $('.adtxt').textContent = 'Merci ! Ta récompense est prête.'; clearInterval(iv); }
    }, 100);
    openModal({
      title: '📺 Publicité (simulation)', dismissable: false,
      html: `<div class="adbox"><div class="tv">📺</div><p>${reason}</p>
        <div class="adbar"><i></i></div><p class="adtxt muted">Récompense dans <b>3</b> s…</p></div>
        <p class="muted">Facultatif : le jeu reste entièrement jouable sans pub.</p>`,
      onclose: () => clearInterval(iv),
      buttons: [
        { label: 'Récupérer la récompense', cls: 'ad', id: 'adOk', disabled: true, onclick: () => { if (left <= 0) onReward(); } },
        { label: 'Passer sans récompense', cls: 'ghost' },
      ],
    });
  },
};

/* ==========================================================================
   RENDU
   ========================================================================== */
const canvas = $('#c'), ctx = canvas.getContext('2d');
const terrain = document.createElement('canvas'), tctx = terrain.getContext('2d');
let W = 0, H = 0, ts = 24, ox = 0, oy = 0, dpr = 1;
let foam = [], sparkles = [];
let clock = 0;

function resize() {
  const r = canvas.getBoundingClientRect();
  dpr = Math.min(window.devicePixelRatio || 1, 2.5);
  W = Math.max(1, r.width); H = Math.max(1, r.height);
  canvas.width = terrain.width = Math.round(W * dpr);
  canvas.height = terrain.height = Math.round(H * dpr);
  ts = Math.max(8, Math.floor(Math.min(W / COLS, H / ROWS)));
  ox = Math.floor((W - ts * COLS) / 2); oy = Math.floor((H - ts * ROWS) / 2);
  paintTerrain();
}

function rr(c, x, y, w, h, r) {
  const [tl, tr, br, bl] = typeof r === 'number' ? [r, r, r, r] : r;
  c.beginPath();
  c.moveTo(x + tl, y);
  c.lineTo(x + w - tr, y); c.arcTo(x + w, y, x + w, y + tr, tr);
  c.lineTo(x + w, y + h - br); c.arcTo(x + w, y + h, x + w - br, y + h, br);
  c.lineTo(x + bl, y + h); c.arcTo(x, y + h, x, y + h - bl, bl);
  c.lineTo(x, y + tl); c.arcTo(x, y, x + tl, y, tl);
  c.closePath();
}

function landPath(c, x, y, off) {
  const X = ox + x * ts, Y = oy + y * ts + off, r = ts * .5;
  const w = (dx, dy) => !isLand(x + dx, y + dy);
  const radii = [
    w(-1, 0) && w(0, -1) ? r : 0, w(1, 0) && w(0, -1) ? r : 0,
    w(1, 0) && w(0, 1) ? r : 0, w(-1, 0) && w(0, 1) ? r : 0,
  ];
  rr(c, X, Y, ts + .6, ts + .6, radii);
}

function paintTerrain() {
  const c = tctx;
  c.setTransform(dpr, 0, 0, dpr, 0, 0);
  c.fillStyle = '#2386ad'; c.fillRect(0, 0, W, H);

  // eau : plus claire près des côtes
  for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
    if (isLand(x, y)) continue;
    let d = 9;
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++)
      if (isLand(x + dx, y + dy)) d = Math.min(d, Math.max(Math.abs(dx), Math.abs(dy)));
    c.fillStyle = d <= 1 ? '#4cb8d2' : d === 2 ? '#37a4c6' : (hash2(x, y) < .5 ? '#2386ad' : '#2890b6');
    c.fillRect(ox + x * ts, oy + y * ts, ts + .6, ts + .6);
  }
  // bord de l'écran (hors grille)
  c.fillStyle = '#2386ad';
  c.fillRect(0, 0, W, oy); c.fillRect(0, oy + ts * ROWS, W, H);
  c.fillRect(0, 0, ox, H); c.fillRect(ox + ts * COLS, 0, W, H);

  // épaisseur de l'île
  c.fillStyle = '#c4a96c';
  for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) if (isLand(x, y)) { landPath(c, x, y, ts * .16); c.fill(); }
  // terre
  for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
    if (!isLand(x, y)) continue;
    const t = MAP.type[y * COLS + x], h = hash2(x, y);
    c.fillStyle = t === 1 ? '#f5e2aa' : h < .33 ? '#8cc86f' : h < .66 ? '#84c168' : '#92cd76';
    landPath(c, x, y, 0); c.fill();
    if (t === 2 && hash2(y, x) < .12) { // petites fleurs
      c.fillStyle = hash2(x + 3, y) < .5 ? '#fff' : '#ffb3c7';
      c.beginPath(); c.arc(ox + (x + .3) * ts, oy + (y + .65) * ts, ts * .05, 0, 7); c.fill();
      c.beginPath(); c.arc(ox + (x + .7) * ts, oy + (y + .35) * ts, ts * .05, 0, 7); c.fill();
    }
  }

  // écume sur les bords (animée au rendu)
  foam = [];
  for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
    if (isLand(x, y)) continue;
    const ph = hash2(x, y) * 6.28;
    if (isLand(x + 1, y)) foam.push({ x1: x + 1, y1: y, x2: x + 1, y2: y + 1, nx: 1, ny: 0, ph });
    if (isLand(x - 1, y)) foam.push({ x1: x, y1: y, x2: x, y2: y + 1, nx: -1, ny: 0, ph });
    if (isLand(x, y + 1)) foam.push({ x1: x, y1: y + 1, x2: x + 1, y2: y + 1, nx: 0, ny: 1, ph });
    if (isLand(x, y - 1)) foam.push({ x1: x, y1: y, x2: x + 1, y2: y, nx: 0, ny: -1, ph });
  }
  sparkles = [];
  for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++)
    if (!isLand(x, y) && hash2(x + 9, y + 4) < .13) sparkles.push({ x: x + hash2(y, x), y: y + hash2(x, y + 7), ph: hash2(x, y) * 6.28 });
}

function emoji(ch, cx, cy, size, alpha = 1) {
  ctx.globalAlpha = alpha;
  ctx.font = `${size}px ${EMOJI_FONT}`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(ch, cx, cy + size * .06);
  ctx.globalAlpha = 1;
}
const px = x => ox + x * ts;
const py = y => oy + y * ts;

function floatText(x, y, text, color = '#fff') {
  fx.push({ x, y, text, color, age: 0, life: 1.3 });
  if (fx.length > 30) fx.shift();
}

function render(dt) {
  clock += dt;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.drawImage(terrain, 0, 0, W, H);

  // écume + scintillements
  ctx.lineWidth = Math.max(1.5, ts * .07); ctx.lineCap = 'round';
  for (const f of foam) {
    const w = Math.sin(clock * 1.6 + f.ph);
    const off = ts * (.06 + .05 * w);
    ctx.strokeStyle = `rgba(255,255,255,${.4 + .25 * w})`;
    ctx.beginPath();
    ctx.moveTo(px(f.x1) + f.nx * off, py(f.y1) + f.ny * off);
    ctx.lineTo(px(f.x2) + f.nx * off, py(f.y2) + f.ny * off);
    ctx.stroke();
  }
  ctx.lineWidth = 1.5;
  for (const sp of sparkles) {
    const a = .5 + .5 * Math.sin(clock * 2 + sp.ph);
    if (a < .55) continue;
    ctx.strokeStyle = `rgba(255,255,255,${a * .55})`;
    ctx.beginPath(); ctx.moveTo(px(sp.x), py(sp.y)); ctx.lineTo(px(sp.x) + ts * .22, py(sp.y)); ctx.stroke();
  }

  if (!state) return;
  const s = state;

  // grille de pose
  if (placing) {
    const pulse = .28 + .12 * Math.sin(clock * 5);
    for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
      if (!isLand(x, y)) continue;
      const ok = !canPlace(placing, x, y);
      ctx.fillStyle = ok ? `rgba(80,220,120,${pulse + .1})` : 'rgba(0,0,0,.18)';
      rr(ctx, px(x) + 1.5, py(y) + 1.5, ts - 3, ts - 3, ts * .2); ctx.fill();
    }
    if (hover && !canPlace(placing, hover.x, hover.y)) emoji(BUILDINGS[placing].e, px(hover.x) + ts / 2, py(hover.y) + ts * .45, ts * .85, .7);
  }

  // objets triés par profondeur
  const items = [];
  for (const n of s.nodes) items.push({ y: n.y + .5, f: () => drawNode(n) });
  for (const b of s.buildings) items.push({ y: b.y + .6, f: () => drawBuilding(b) });
  items.push({ y: s.sheriff.y + .3, f: drawSheriff });
  for (const inc of s.incidents) items.push({ y: inc.y + 2, f: () => drawIncident(inc) });
  if (s.arrival) items.push({ y: s.arrival.y + 2, f: drawArrival });
  items.sort((a, b) => a.y - b.y);
  for (const it of items) it.f();

  // textes flottants
  for (let i = fx.length - 1; i >= 0; i--) {
    const f = fx[i];
    f.age += dt;
    if (f.age > f.life) { fx.splice(i, 1); continue; }
    const k = f.age / f.life;
    ctx.globalAlpha = 1 - k * k;
    ctx.font = `800 ${Math.max(12, ts * .46)}px ${EMOJI_FONT}`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(0,0,0,.55)';
    const X = px(f.x), Y = py(f.y) - k * ts * .9;
    ctx.strokeText(f.text, X, Y);
    ctx.fillStyle = f.color; ctx.fillText(f.text, X, Y);
    ctx.globalAlpha = 1;
  }
}

function drawNode(n) {
  const def = NODE[n.kind], X = px(n.x) + ts / 2, Y = py(n.y) + ts / 2;
  const alive = n.stock > 0;
  if (n.kind === 'fish') {
    // remous + poisson qui saute
    const w = clock * 2 + n.id;
    ctx.strokeStyle = `rgba(255,255,255,${alive ? .55 : .2})`; ctx.lineWidth = 1.5;
    for (let k = 0; k < 2; k++) {
      const r = ts * (.18 + ((w * .25 + k * .5) % 1) * .3);
      ctx.beginPath(); ctx.ellipse(X, Y + ts * .1, r, r * .55, 0, 0, 7); ctx.stroke();
    }
    if (alive) emoji('🐟', X, Y - Math.abs(Math.sin(w)) * ts * .12, ts * .55);
    return;
  }
  if (alive) {
    ctx.fillStyle = 'rgba(30,60,20,.22)';
    ctx.beginPath(); ctx.ellipse(X, Y + ts * .3, ts * .34, ts * .1, 0, 0, 7); ctx.fill();
    emoji(def.emojis[n.v] || def.emojis[0], X, Y - ts * .1, n.kind === 'tree' ? ts * 1.0 : ts * .8);
    // pastilles de stock
    ctx.fillStyle = 'rgba(0,0,0,.35)';
    for (let k = 0; k < n.stock; k++) { ctx.beginPath(); ctx.arc(X - (n.stock - 1) * ts * .07 + k * ts * .14, Y + ts * .42, ts * .04, 0, 7); ctx.fill(); }
  } else {
    emoji(n.kind === 'tree' ? '🌱' : '🪨', X, Y, ts * .45, .5);
  }
}

function drawBuilding(b) {
  const def = BUILDINGS[b.type], X = px(b.x), Y = py(b.y);
  ctx.fillStyle = 'rgba(0,0,0,.18)';
  rr(ctx, X + ts * .08, Y + ts * .16, ts * .86, ts * .82, ts * .2); ctx.fill();
  ctx.fillStyle = b.built ? def.plate : '#cdbb9d';
  rr(ctx, X + ts * .05, Y + ts * .1, ts * .9, ts * .82, ts * .2); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,.22)'; ctx.lineWidth = 1.5; ctx.stroke();
  if (b.built) {
    emoji(def.e, X + ts / 2, Y + ts * .42, ts * .78);
    if (b.type === 'maison') {
      const occ = occupantsOf(builtOf('maison').indexOf(b));
      occ.forEach((p, i) => emoji(moodFace(state.mood), X + ts * (.3 + i * .4), Y + ts * .9, ts * .3));
    } else if (def.job) {
      const w = state.people.find(p => p.id === b.workerId);
      if (w) emoji(JOBS[w.type].e, X + ts * .82, Y + ts * .88, ts * .38);
    }
  } else {
    emoji('🚧', X + ts / 2, Y + ts * .4, ts * .7);
    const k = 1 - b.left / def.time;
    ctx.fillStyle = 'rgba(0,0,0,.35)'; rr(ctx, X + ts * .12, Y + ts * .8, ts * .76, ts * .13, ts * .06); ctx.fill();
    ctx.fillStyle = '#f4b73e'; rr(ctx, X + ts * .12, Y + ts * .8, Math.max(ts * .1, ts * .76 * k), ts * .13, ts * .06); ctx.fill();
  }
}

function drawSheriff() {
  const sh = state.sheriff, X = px(sh.x), Y = py(sh.y);
  const moving = sh.path.length > 0 && sh.pause <= 0;
  const bob = moving ? Math.abs(Math.sin(clock * 12)) * ts * .09 : 0;
  ctx.fillStyle = 'rgba(0,0,0,.22)';
  ctx.beginPath(); ctx.ellipse(X, Y + ts * .32, ts * .34, ts * .11, 0, 0, 7); ctx.fill();
  const skin = SKINS.find(k => k.id === state.skin) || SKINS[0];
  // jeton clair à liseré doré : le shérif reste lisible sur l'herbe
  ctx.fillStyle = 'rgba(255,250,235,.92)'; ctx.strokeStyle = '#e0a526'; ctx.lineWidth = Math.max(2, ts * .07);
  ctx.beginPath(); ctx.arc(X, Y - bob - ts * .02, ts * .46, 0, 7); ctx.fill(); ctx.stroke();
  emoji(skin.e, X, Y - bob + ts * .03, ts * .72);
  emoji('🤠', X, Y - bob - ts * .46, ts * .46);
  emoji('⭐', X + ts * .34, Y - bob + ts * .24, ts * .24);
  // trajet prévu vers un incident
  if (sh.task.type === 'incident' && sh.path.length) {
    ctx.setLineDash([4, 5]); ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(X, Y);
    for (const [tx, ty] of sh.path) ctx.lineTo(px(tx + .5), py(ty + .5));
    ctx.stroke(); ctx.setLineDash([]);
  }
}

function drawIncident(inc) {
  const X = px(inc.x) + ts / 2, Y = py(inc.y) - ts * .12 - Math.abs(Math.sin(clock * 5)) * ts * .12;
  const k = inc.age / inc.ttl;
  ctx.fillStyle = 'rgba(255,255,255,.9)';
  ctx.beginPath(); ctx.arc(X, Y, ts * .5, 0, 7); ctx.fill();
  ctx.strokeStyle = k > .7 ? '#e53935' : '#ff7a59'; ctx.lineWidth = Math.max(2.5, ts * .09);
  ctx.beginPath(); ctx.arc(X, Y, ts * .5, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (1 - k)); ctx.stroke();
  emoji(inc.kind === 'vol' ? '🦹' : '💢', X, Y, ts * .62);
}

function drawArrival() {
  const a = state.arrival, X = px(a.x) + ts / 2, Y = py(a.y) + ts / 2 + Math.sin(clock * 2) * ts * .06;
  emoji('⛵', X, Y, ts * .9);
  const p = (clock * .8) % 1;
  ctx.strokeStyle = `rgba(255,255,255,${.7 * (1 - p)})`; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(X, Y, ts * (.5 + p * .45), 0, 7); ctx.stroke();
  emoji('❗', X + ts * .38, Y - ts * .45, ts * .38);
}

/* ==========================================================================
   ENTRÉES (toucher / souris)
   ========================================================================== */
function onTap(clientX, clientY) {
  if (modalOpen || !state) return;
  const r = canvas.getBoundingClientRect();
  const fx_ = (clientX - r.left - ox) / ts, fy_ = (clientY - r.top - oy) / ts;
  const tx = Math.floor(fx_), ty = Math.floor(fy_);
  const s = state;

  if (placing) {
    if (tx < 0 || ty < 0 || tx >= COLS || ty >= ROWS) return;
    placeBuilding(placing, tx, ty);
    return;
  }

  // 1) incidents (zone de toucher généreuse)
  let best = null, bd = 1.0;
  for (const inc of s.incidents) {
    const d = Math.hypot(fx_ - (inc.x + .5), fy_ - (inc.y + .3));
    if (d < bd) { bd = d; best = inc; }
  }
  if (best) { dispatchSheriff(best); return; }

  // 2) bateau
  if (s.arrival && Math.hypot(fx_ - (s.arrival.x + .5), fy_ - (s.arrival.y + .5)) < 1.0) { openArrivalModal(); return; }

  // 3) bâtiments
  const b = buildingAt(tx, ty);
  if (b) { openBuildingModal(b); return; }

  // 4) ressources (le plus proche du doigt)
  let nn = null, nd = .75;
  for (const n of s.nodes) {
    const d = Math.hypot(fx_ - (n.x + .5), fy_ - (n.y + .5));
    if (d < nd) { nd = d; nn = n; }
  }
  if (nn) harvest(nn);
}

canvas.addEventListener('pointerdown', e => { e.preventDefault(); onTap(e.clientX, e.clientY); });
canvas.addEventListener('pointermove', e => {
  if (!placing) return;
  const r = canvas.getBoundingClientRect();
  hover = { x: Math.floor((e.clientX - r.left - ox) / ts), y: Math.floor((e.clientY - r.top - oy) / ts) };
});
canvas.addEventListener('contextmenu', e => e.preventDefault());

$('#modal').addEventListener('pointerdown', e => { if (e.target.id === 'modal' && modalDismiss) closeModal(); });
$('#bBuild').addEventListener('click', () => { if (!modalOpen) { placing = null; openBuildMenu(); } });
$('#bRules').addEventListener('click', () => { if (!modalOpen) openAssembly(); });
$('#bPeople').addEventListener('click', () => { if (!modalOpen) openPeople(); });
$('#bStable').addEventListener('click', () => { if (!modalOpen) openStable(); });
$('#adBtn').addEventListener('click', () => {
  if (modalOpen || !lastHarvest) return;
  const h = lastHarvest;
  Ads.show('Doubler ta dernière récolte.', () => {
    state.res[h.res] += h.amt;
    floatText(h.x + .5, h.y, `+${h.amt}${RES[h.res].e} ×2`, '#ffd56a');
    toast(`📺 Récolte doublée : +${h.amt}${RES[h.res].e}`);
    lastHarvest = null;
  });
});
window.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  if (modalOpen && modalDismiss) closeModal(); else if (placing) { placing = null; renderHint(); }
});
window.addEventListener('resize', resize);
window.addEventListener('orientationchange', () => setTimeout(resize, 150));
document.addEventListener('visibilitychange', () => { if (document.hidden && state) save(); });
window.addEventListener('pagehide', () => { if (state) save(); });

/* ==========================================================================
   DÉMARRAGE
   ========================================================================== */
let lastT = performance.now(), hudT = 0;
function frame(now) {
  const dt = Math.min(.1, (now - lastT) / 1000);
  lastT = now;
  if (!modalOpen) update(dt);
  render(dt);
  hudT += dt;
  if (hudT > .2) { hudT = 0; renderHud(); renderHint(); }
  requestAnimationFrame(frame);
}

function init() {
  MAP = genMap();
  state = load() || newState();
  rebuildGrids();
  assignJobs();
  initHud();
  resize();
  renderHud(); renderHint();
  if (!state.seenIntro) openIntro();
  requestAnimationFrame(frame);
}
init();

// Accès pour les tests / le débogage depuis la console : window.__ile
window.__ile = {
  get state() { return state; },
  get map() { return MAP; },
  get view() { return { ts, ox, oy, W, H }; },
  update, propose, spawnIncident, spawnArrival, acceptArrival, placeBuilding, startPlacing, finishBuilding,
  harvest, resolveIncident, dispatchSheriff, openModal, closeModal, save, resetGame,
  get modalOpen() { return modalOpen; },
};

})();
