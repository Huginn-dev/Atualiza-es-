# SITREP Manaus/RMM — Dashboard de Georreferência (OpenStreetMap)

Mapa operacional das ocorrências do SITREP usando **exclusivamente soluções gratuitas e sem
chave de API**: geocodificação via **Nominatim/OpenStreetMap**, tiles do **OpenStreetMap** e
renderização com **Leaflet.js** + agrupamento de marcadores.

> Nenhum serviço que exija chave, cartão ou faturamento é utilizado (sem Google Maps, sem Mapbox).
> **© OpenStreetMap contributors.**

## Estrutura

```
SITREP-dashboard/
├── index.html                  # dashboard (Leaflet + OSM), tema SITREP
├── data/
│   ├── events.js               # as 15 ocorrências + query de geocodificação + criticidade
│   ├── geocoding-cache.json    # cache de coordenadas (formato exigido)
│   └── geocoding-cache.js      # espelho do cache p/ o navegador (carregado via <script>)
├── scripts/
│   └── geocode.mjs             # geocodificador Nominatim (Node 18+)
└── README.md
```

## Como abrir

Abra `index.html` no navegador (requer internet para os tiles e para a biblioteca Leaflet).
O mapa já vem plotado a partir do `geocoding-cache.json`.

## Geocodificação real (recomendado)

O cache vem **pré-semeado com coordenadas aproximadas feitas à mão** (marcadas como
`fonte: "seed-local"` e `aproximada: true`) só para o mapa já funcionar. Para obter as
coordenadas oficiais do OpenStreetMap, rode o geocodificador:

```bash
node scripts/geocode.mjs           # consulta apenas o que ainda não é do OSM
node scripts/geocode.mjs --refresh # reconsulta tudo
```

Isso reescreve `data/geocoding-cache.json` (e `.js`) com dados reais do Nominatim.
Também há o botão **“Atualizar via Nominatim”** no próprio dashboard (geocodificação no
navegador, best-effort — sujeito a CORS; o script Node é o caminho autoritativo).

### Regras atendidas pela geocodificação

- **User-Agent** identificando o projeto SITREP em toda requisição;
- **máximo 1 requisição por segundo** (intervalo de 1,1 s);
- **cache local** em `data/geocoding-cache.json`;
- **nunca repete** consultas já resolvidas pelo OSM;
- **registra quando a coordenada é aproximada** (`aproximada: true` + `precisao`);
- **não inventa coordenadas**: sem resultado confiável, grava `status: "nao_encontrado"` sem lat/lon
  (e o evento não é plotado no mapa).

### Endpoint usado

```
https://nominatim.openstreetmap.org/search
  ?q=<local>&format=json&limit=1&countrycodes=br&addressdetails=1
```

### Formato de cada registro do cache

```json
{
  "local_pesquisado": "Compensa, Manaus, Amazonas, Brasil",
  "nome_retornado": "Compensa, Manaus, Região Geográfica ...",
  "latitude": -3.09xx,
  "longitude": -60.05xx,
  "precisao": "bairro",
  "aproximada": false,
  "data_consulta": "2026-08-24",
  "fonte": "OpenStreetMap/Nominatim",
  "osm": { "osm_type": "relation", "osm_id": 000, "place_id": 000, "class": "...", "type": "..." },
  "link_osm": "https://www.openstreetmap.org/relation/000",
  "status": "ok"
}
```

## Mapa (dashboard)

- **Leaflet.js** + **tiles do OpenStreetMap**;
- **marcadores coloridos por criticidade**: 🔴 ALTO · 🟠 MÉDIO · 🔵 BAIXO · 🟢 ACOMPANHAR;
- **agrupamento** de marcadores próximos (Leaflet.markercluster);
- **popup** com título, data, resumo, fonte, precisão geográfica e link para a notícia;
- **enquadramento automático** de todos os eventos (`fitBounds`);
- **legenda** com contagem por criticidade;
- link **“Abrir no OpenStreetMap”** em cada popup;
- atribuição **© OpenStreetMap contributors** sempre visível.

## Rotas / distâncias rodoviárias (opcional)

Se for necessário calcular rotas ou distâncias por rodovia, use o **OSRM** (também gratuito e
sem chave):

```
https://router.project-osrm.org/route/v1/driving/{lon1},{lat1};{lon2},{lat2}?overview=full&geometries=geojson
```

Ex.: distância Manaus → eixo BR-174 ou Manaus → Novo Airão para os eventos da RMM.

## Observações

- Eventos “agregados” (ex.: 180 atendimentos, desligamento em 9 bairros) usam a coordenada do
  município de Manaus e ficam agrupados no centro — é a granularidade disponível na fonte.
- Eventos fora da carta urbana (Novo Airão, BR-174) são geocodificados no município/rodovia
  correspondente e o `fitBounds` amplia o enquadramento para incluí-los.
