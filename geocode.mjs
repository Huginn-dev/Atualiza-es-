#!/usr/bin/env node
/* SITREP — Geocodificador Nominatim/OpenStreetMap
 * Uso:
 *   node scripts/geocode.mjs                 só consulta o que ainda não é do OSM
 *   node scripts/geocode.mjs --refresh       reconsulta tudo
 *   node scripts/geocode.mjs --only "Compensa"   reconsulta só as queries que contêm o texto
 *
 * Regras: User-Agent SITREP · máx. 1 req/s · cache local · nunca repete consulta já do OSM ·
 *         marca coordenada aproximada · NÃO inventa coordenadas · retry com backoff · log.
 * Requer Node 18+ (fetch nativo). © OpenStreetMap contributors.
 */
import { readFile, writeFile, mkdir, appendFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const DIR=path.dirname(fileURLToPath(import.meta.url));
const ROOT=path.resolve(DIR,"..");
const DATA=path.join(ROOT,"data");
const CACHE_JSON=path.join(DATA,"geocoding-cache.json");
const CACHE_JS=path.join(DATA,"geocoding-cache.js");
const LOG=path.join(DATA,"geocode.log");

const USER_AGENT="SITREP-Manaus-Dashboard/1.0 (OSINT fontes abertas; contato: projeto SITREP)";
const ENDPOINT="https://nominatim.openstreetmap.org/search";
const RATE_MS=1100, MAX_RETRY=3;
const REFRESH=process.argv.includes("--refresh");
const onlyIdx=process.argv.indexOf("--only");
const ONLY=onlyIdx>=0?(process.argv[onlyIdx+1]||"").toLowerCase():null;

const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function log(line){const s=`[${new Date().toISOString()}] ${line}\n`;process.stdout.write(s);try{await appendFile(LOG,s);}catch{}}

async function loadEvents(){
  const txt=await readFile(path.join(DATA,"events.js"),"utf8");
  const win={}; const fn=new Function("window","module","exports",txt+"\nreturn window;"); fn(win,{exports:{}},{});
  return {events:win.SITREP_EVENTS||[]};
}
function classify(r){const t=(r.type||"").toLowerCase(),c=(r.class||"").toLowerCase(),at=(r.addresstype||"").toLowerCase();
  if(["house","building","residential"].includes(t)||at==="road"||c==="highway")return{precisao:"endereço/via",aproximada:false};
  if(["suburb","neighbourhood","quarter","city_district"].includes(t)||at==="suburb"||at==="neighbourhood")return{precisao:"bairro",aproximada:false};
  if(["city","town","municipality","administrative"].includes(t)||at==="city"||at==="municipality")return{precisao:"município (aproximada)",aproximada:true};
  return{precisao:"aproximada",aproximada:true};}
function osmLink(r){if(r&&r.osm_type&&r.osm_id){const k={node:"node",way:"way",relation:"relation"}[r.osm_type]||"node";return `https://www.openstreetmap.org/${k}/${r.osm_id}`;}return null;}

async function geocode(q){
  const url=`${ENDPOINT}?q=${encodeURIComponent(q)}&format=json&limit=1&countrycodes=br&addressdetails=1`;
  let attempt=0, wait=2000;
  while(true){ attempt++;
    try{
      const res=await fetch(url,{headers:{"User-Agent":USER_AGENT,"Accept-Language":"pt-BR"}});
      if(res.status===429||res.status>=500){ if(attempt<=MAX_RETRY){await log(`  HTTP ${res.status} — retry ${attempt}/${MAX_RETRY} em ${wait}ms`);await sleep(wait);wait*=2;continue;} throw new Error(`HTTP ${res.status}`);}
      if(!res.ok) throw new Error(`HTTP ${res.status}`);
      const arr=await res.json(); return Array.isArray(arr)&&arr.length?arr[0]:null;
    }catch(err){ if(attempt<=MAX_RETRY){await log(`  erro rede (${err.message}) — retry ${attempt}/${MAX_RETRY} em ${wait}ms`);await sleep(wait);wait*=2;continue;} throw err; }
  }
}

async function main(){
  if(!existsSync(DATA))await mkdir(DATA,{recursive:true});
  const {events}=await loadEvents();
  let cache={}; if(existsSync(CACHE_JSON)){try{cache=JSON.parse(await readFile(CACHE_JSON,"utf8"));}catch{cache={};}}
  let queries=[...new Set(events.map(e=>e.query))];
  if(ONLY) queries=queries.filter(q=>q.toLowerCase().includes(ONLY));
  const today=new Date().toISOString().slice(0,10);
  let done=0,approx=0,missing=0,skipped=0;
  await log(`início — ${queries.length} query(s)${ONLY?` (filtro "--only ${ONLY}")`:""}${REFRESH?" [refresh]":""}`);

  for(const q of queries){
    const cached=cache[q], isReal=cached&&cached.fonte==="OpenStreetMap/Nominatim";
    if(isReal&&!REFRESH&&!ONLY){skipped++;continue;}
    try{
      const r=await geocode(q);
      if(!r){ cache[q]={local_pesquisado:q,nome_retornado:null,latitude:null,longitude:null,precisao:"não encontrado",aproximada:null,data_consulta:today,fonte:"OpenStreetMap/Nominatim",osm:null,link_osm:null,status:"nao_encontrado"}; missing++; await log(`SEM RESULTADO (não inventado): ${q}`); }
      else{ const {precisao,aproximada}=classify(r);
        cache[q]={local_pesquisado:q,nome_retornado:r.display_name,latitude:Number(r.lat),longitude:Number(r.lon),precisao,aproximada,data_consulta:today,fonte:"OpenStreetMap/Nominatim",osm:{osm_type:r.osm_type,osm_id:r.osm_id,place_id:r.place_id,class:r.class,type:r.type},link_osm:osmLink(r),status:"ok"};
        done++; if(aproximada)approx++; await log(`ok (${precisao})${aproximada?" ~aprox":""}: ${q}`);
      }
    }catch(err){ await log(`FALHA definitiva (${err.message}) — mantém cache: ${q}`); }
    await sleep(RATE_MS);
  }
  await writeFile(CACHE_JSON,JSON.stringify(cache,null,2),"utf8");
  await writeFile(CACHE_JS,"/* Gerado por scripts/geocode.mjs — © OpenStreetMap contributors */\nwindow.SITREP_GEOCACHE = "+JSON.stringify(cache,null,2)+";\n","utf8");
  await log(`fim — ${done} resolvidos (${approx} aprox), ${missing} sem resultado, ${skipped} já em cache. Cache: ${path.relative(process.cwd(),CACHE_JSON)}`);
}
main().catch(e=>{console.error(e);process.exit(1);});
