// ══════════════════════════════════════════
//  DEMO MODE SWITCH
// ══════════════════════════════════════════
export const DEMO_MODE = false;

// ══════════════════════════════════════════
//  TOUR AMOUNTS (official)
// ══════════════════════════════════════════
export const TRI_TOURS = [
  { tour:1, offert:21,   recu:63,   prochain:63,   avoir:0 },
  { tour:2, offert:63,   recu:189,  prochain:100,  avoir:89 },
  { tour:3, offert:100,  recu:300,  prochain:200,  avoir:100 },
  { tour:4, offert:200,  recu:600,  prochain:500,  avoir:100 },
  { tour:5, offert:500,  recu:1500, prochain:1000, avoir:500 },
  { tour:6, offert:1000, recu:3000, prochain:2000, avoir:1000 },
  { tour:7, offert:2000, recu:6000, prochain:null, avoir:6000 },
];
export const PLE_TOURS = [
  { tour:1, offert:21,     recu:147,     prochain:100,    avoir:47 },
  { tour:2, offert:100,    recu:700,     prochain:500,    avoir:200 },
  { tour:3, offert:500,    recu:3500,    prochain:2000,   avoir:1500 },
  { tour:4, offert:2000,   recu:14000,   prochain:10000,  avoir:4000 },
  { tour:5, offert:10000,  recu:70000,   prochain:50000,  avoir:20000 },
  { tour:6, offert:50000,  recu:350000,  prochain:200000, avoir:150000 },
  { tour:7, offert:200000, recu:1400000, prochain:null,   avoir:1400000 },
];
export const TRI_GAIN = "7'789 €";
export const PLE_GAIN = "1'575'747 €";

export function tourTable(type) { return type === 'triangulum' ? TRI_TOURS : PLE_TOURS; }
export function tourRow(type, tour) { return tourTable(type).find(t => t.tour === tour) || tourTable(type)[0]; }
export function maxMembers(type) { return type === 'triangulum' ? 3 : 7; }
export function fmtEuro(v) { if (v === null || v === undefined) return 'FIN'; return v.toLocaleString('fr-CH') + ' €'; }

// ══════════════════════════════════════════
//  STATIC LISTS
// ══════════════════════════════════════════
export const COUNTRIES = [
  "France","Suisse","Belgique","Canada","Côte d'Ivoire","Sénégal","Cameroun",
  "Mali","Guinée","Burkina Faso","Togo","Bénin","Niger","Congo","Gabon",
  "Madagascar","Haïti","Tunisie","Maroc","Algérie","Luxembourg","Monaco",
];
export const PAY_METHODS = ["Carte bancaire (Stripe)", "PayPal", "TWINT"];
export const TOUR_COLORS = ['#ff4444','#ff8c00','#ffd700','#00c853','#2196f3','#7c4dff','#e040fb'];

// ══════════════════════════════════════════
//  MAP POINTS
// ══════════════════════════════════════════
export const MAP_POINTS = [
  { id:1,  country:"France",        lat:46.6,  lng:2.2 },
  { id:2,  country:"Côte d'Ivoire", lat:7.5,   lng:-5.5 },
  { id:3,  country:"Suisse",        lat:46.8,  lng:8.2 },
  { id:4,  country:"Belgique",      lat:50.8,  lng:4.4 },
  { id:5,  country:"Canada",        lat:56.1,  lng:-106.3 },
  { id:6,  country:"Sénégal",       lat:14.5,  lng:-14.5 },
  { id:7,  country:"Cameroun",      lat:5.9,   lng:12.4 },
  { id:8,  country:"Mali",          lat:17.6,  lng:-4.0 },
  { id:9,  country:"Madagascar",    lat:-18.8, lng:46.9 },
  { id:10, country:"Tunisie",       lat:33.9,  lng:9.5 },
  { id:11, country:"Maroc",         lat:31.8,  lng:-7.1 },
  { id:12, country:"Guinée",        lat:9.9,   lng:-11.8 },
  { id:13, country:"Haïti",         lat:19.0,  lng:-72.4 },
  { id:14, country:"Gabon",         lat:-0.8,  lng:11.6 },
  { id:15, country:"Togo",          lat:8.6,   lng:1.2 },
];

export function mapPointStats(id) {
  if (!DEMO_MODE) return { total:0, complets:0, manque1:0, manque2:0, manque3:0 };
  const demos = {
    1:  { total:245, complets:215, manque1:15, manque2:10, manque3:5 },
    2:  { total:180, complets:140, manque1:20, manque2:12, manque3:8 },
    3:  { total:95,  complets:82,  manque1:8,  manque2:3,  manque3:2 },
    4:  { total:60,  complets:50,  manque1:6,  manque2:3,  manque3:1 },
    5:  { total:45,  complets:38,  manque1:4,  manque2:2,  manque3:1 },
    6:  { total:120, complets:90,  manque1:15, manque2:10, manque3:5 },
    7:  { total:85,  complets:65,  manque1:10, manque2:6,  manque3:4 },
    8:  { total:55,  complets:42,  manque1:7,  manque2:4,  manque3:2 },
    9:  { total:30,  complets:22,  manque1:4,  manque2:3,  manque3:1 },
    10: { total:40,  complets:32,  manque1:5,  manque2:2,  manque3:1 },
    11: { total:65,  complets:52,  manque1:7,  manque2:4,  manque3:2 },
    12: { total:35,  complets:28,  manque1:4,  manque2:2,  manque3:1 },
    13: { total:25,  complets:18,  manque1:4,  manque2:2,  manque3:1 },
    14: { total:15,  complets:12,  manque1:2,  manque2:1,  manque3:0 },
    15: { total:20,  complets:15,  manque1:3,  manque2:1,  manque3:1 },
  };
  return demos[id] || { total:0, complets:0, manque1:0, manque2:0, manque3:0 };
}

// ══════════════════════════════════════════
//  §3 SEARCH RESULTS
//  §1 FIX: placesExact = STRICT equality filter
// ══════════════════════════════════════════
export function searchResults(type, filters = {}) {
  if (!DEMO_MODE) return [];

  const all = type === 'triangulum' ? [
    { id:'s1',  owner:'Marie_CH',    pays:'Suisse',        ville:'Lausanne',  tour:1, filled:2, max:3 },
    { id:'s2',  owner:'Pierre_FR',   pays:'France',        ville:'Lyon',      tour:1, filled:1, max:3 },
    { id:'s3',  owner:'Fatou_SN',    pays:'Sénégal',       ville:'Dakar',     tour:1, filled:0, max:3 },
    { id:'s4',  owner:'Omar_CI',     pays:"Côte d'Ivoire", ville:'Abidjan',   tour:2, filled:1, max:3 },
    { id:'s5',  owner:'Alice_BE',    pays:'Belgique',      ville:'Bruxelles', tour:1, filled:2, max:3 },
    { id:'s6',  owner:'Kofi_CM',     pays:'Cameroun',      ville:'Douala',    tour:3, filled:2, max:3 },
    { id:'s7',  owner:'Yves_CH',     pays:'Suisse',        ville:'Genève',    tour:1, filled:1, max:3 },
    { id:'s8',  owner:'Nadia_MA',    pays:'Maroc',         ville:'Casablanca',tour:2, filled:0, max:3 },
    { id:'s9',  owner:'Luc_FR',      pays:'France',        ville:'Paris',     tour:1, filled:1, max:3 },
    { id:'s10', owner:'Aminata_ML',  pays:'Mali',          ville:'Bamako',    tour:1, filled:0, max:3 },
    { id:'s11', owner:'Jean_CA',     pays:'Canada',        ville:'Montréal',  tour:1, filled:2, max:3 },
  ] : [
    { id:'p1', owner:'Marie_CH',   pays:'Suisse',        ville:'Lausanne',  tour:1, filled:4, max:7 },
    { id:'p2', owner:'Fatou_ML',   pays:'Mali',          ville:'Bamako',    tour:1, filled:5, max:7 },
    { id:'p3', owner:'Jean_FR',    pays:'France',        ville:'Marseille', tour:2, filled:3, max:7 },
    { id:'p4', owner:'Awa_SN',     pays:'Sénégal',       ville:'Dakar',     tour:1, filled:6, max:7 },
    { id:'p5', owner:'Clara_BE',   pays:'Belgique',      ville:'Bruxelles', tour:1, filled:2, max:7 },
    { id:'p6', owner:'Moussa_CI',  pays:"Côte d'Ivoire", ville:'Abidjan',   tour:1, filled:4, max:7 },
  ];

  let results = all.filter(r => r.filled < r.max);

  // §1 FIX: STRICT equality — exact number of places
  if (filters.placesExact) {
    results = results.filter(r => (r.max - r.filled) === filters.placesExact);
  }
  if (filters.pays) {
    results = results.filter(r => r.pays === filters.pays);
  }
  // §2: Global search (pseudo, pays, ville)
  if (filters.globalSearch) {
    const q = filters.globalSearch.toLowerCase();
    results = results.filter(r =>
      r.owner.toLowerCase().includes(q) ||
      r.pays.toLowerCase().includes(q) ||
      r.ville.toLowerCase().includes(q)
    );
  }

  return results;
}

// §3: Tension stats — how many constellations need 1, 2, 3 places
export function tensionStats() {
  if (!DEMO_MODE) return { tri: { need1:0, need2:0, need3:0 }, ple: { need1:0, need2:0, need3:0 } };
  const triAll = searchResults('triangulum');
  const pleAll = searchResults('pleiade');
  const count = (arr, n) => arr.filter(r => (r.max - r.filled) === n).length;
  return {
    tri: { need1: count(triAll, 1), need2: count(triAll, 2), need3: count(triAll, 3) },
    ple: { need1: count(pleAll, 1), need2: count(pleAll, 2), need3: count(pleAll, 3) },
  };
}
