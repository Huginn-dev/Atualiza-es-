#!/usr/bin/env node
/* SITREP — Geocodificador Nominatim/OpenStreetMap
 * Uso:   node scripts/geocode.mjs            (só consulta o que ainda não é do OSM)
 *        node scripts/geocode.mjs --refresh  (reconsulta tudo)
 *
 * Regras atendidas:
 *  - User-Agent identificando o projeto SITREP
 *  - máximo 1 requisição por segundo
 *  - cache local em data/geocoding-cache.json (e espelho .js para o navegador)
 *  - nunca repete consultas já resolvidas pelo OSM
 *  - registra quando a coordenada é aproximada
 *  - NÃO inventa coordenadas: sem resultado confiável -> status "nao_encontrado"
 *
 * Requer Node 18+ (fetch nativo).  © OpenStreetMap contributors.
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const DIR  = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(DIR, "..");
const DATA = path.join(ROOT, "data");
const CACHE_JSON = path.join(DATA, "geocoding-cache.json");
const CACHE_JS   = path.join(DATA, "geocoding-cache.js");

const USER_AGENT = "SITREP-Manaus-Dashboard/1.0 (OSINT fontes abertas; contato: projeto SITREP)";
const ENDPOINT   = "https://nominatim.openstreetmap.org/search";
const RATE_MS    = 1100;            // > 1 req/s (política de uso do Nominatim)
const REFRESH    = process.argv.includes("--refresh");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* carrega data/events.js (UMD) sem precisar de window real */
async function loadEvents() {
  const txt = await readFile(path.join(DATA, "events.js"), "utf8");
  const win = {};
  // eslint-disable-next-line no-new-func
  const fn = new Function("window", "module", "exports", txt + "\nreturn window;");
  fn(win, { exports: {} }, {});
  return { events: win.SITREP_EVENTS || [], seeds: win.SITREP_SEEDS || {} };
}

function classifyPrecision(r) {
  const t = (r.type || "").toLowerCase();
  const c = (r.class || "").toLowerCase();
  const at = (r.addresstype || "").toLowerCase();
  if (["house", "building", "residential"].includes(t) || at === "road" || c === "highway")
    return { precisao: "endereço/via", aproximada: false };
  if (["suburb", "neighbourhood", "quarter", "city_district"].includes(t) || at === "suburb" || at === "neighbourhood")
    return { precisao: "bairro", aproximada: false };
  if (["city", "town", "municipality", "administrative"].includes(t) || at === "city" || at === "municipality")
    return { precisao: "município (aproximada)", aproximada: true };
  return { precisao: "aproximada", aproximada: true };
}

function osmLink(r) {
  if (r && r.osm_type && r.osm_id) {
    const kind = { node: "node", way: "way", relation: "relation" }[r.osm_type] || "node";
    return `https://www.openstreetmap.org/${kind}/${r.osm_id}`;
  }
  return null;
}

async function geocode(q) {
  const url = `${ENDPOINT}?q=${encodeURIComponent(q)}&format=json&limit=1&countrycodes=br&addressdetails=1`;
  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT, "Accept-Language": "pt-BR" } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const arr = await res.json();
  return Array.isArray(arr) && arr.length ? arr[0] : null;
}

async function main() {
  if (!existsSync(DATA)) await mkdir(DATA, { recursive: true });
  const { events } = await loadEvents();

  let cache = {};
  if (existsSync(CACHE_JSON)) {
    try { cache = JSON.parse(await readFile(CACHE_JSON, "utf8")); } catch { cache = {}; }
  }

  const queries = [...new Set(events.map((e) => e.query))];
  const today = new Date().toISOString().slice(0, 10);
  let done = 0, approx = 0, missing = 0, skipped = 0;

  for (const q of queries) {
    const cached = cache[q];
    const isReal = cached && cached.fonte === "OpenStreetMap/Nominatim";
    if (isReal && !REFRESH) { skipped++; continue; }   // nunca repete o que já é do OSM

    process.stdout.write(`geocodificando: ${q} … `);
    try {
      const r = await geocode(q);
      if (!r) {
        cache[q] = {
          local_pesquisado: q, nome_retornado: null, latitude: null, longitude: null,
          precisao: "não encontrado", aproximada: null, data_consulta: today,
          fonte: "OpenStreetMap/Nominatim", osm: null, link_osm: null, status: "nao_encontrado"
        };
        missing++; console.log("SEM RESULTADO (não inventado)");
      } else {
        const { precisao, aproximada } = classifyPrecision(r);
        cache[q] = {
          local_pesquisado: q,
          nome_retornado: r.display_name,
          latitude: Number(r.lat),
          longitude: Number(r.lon),
          precisao, aproximada,
          data_consulta: today,
          fonte: "OpenStreetMap/Nominatim",
          osm: { osm_type: r.osm_type, osm_id: r.osm_id, place_id: r.place_id, class: r.class, type: r.type },
          link_osm: osmLink(r),
          status: "ok"
        };
        done++; if (aproximada) approx++;
        console.log(`ok (${precisao})${aproximada ? " ~aprox" : ""}`);
      }
    } catch (err) {
      console.log(`ERRO: ${err.message} — mantendo semente/cache`);
    }
    await sleep(RATE_MS); // respeita 1 req/s
  }

  await writeFile(CACHE_JSON, JSON.stringify(cache, null, 2), "utf8");
  await writeFile(CACHE_JS,
    "/* Gerado por scripts/geocode.mjs — © OpenStreetMap contributors */\n" +
    "window.SITREP_GEOCACHE = " + JSON.stringify(cache, null, 2) + ";\n", "utf8");

  console.log(`\nresumo: ${done} resolvidos (${approx} aproximados), ${missing} sem resultado, ${skipped} já em cache.`);
  console.log(`cache salvo em: ${path.relative(process.cwd(), CACHE_JSON)}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
