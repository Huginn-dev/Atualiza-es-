# SITREP Manaus/RMM — Dashboard de Georreferência (OpenStreetMap)

Mapa operacional das ocorrências do SITREP usando **exclusivamente soluções gratuitas e sem
chave de API**: geocodificação via **Nominatim/OpenStreetMap**, tiles do **OpenStreetMap** e
renderização com **Leaflet.js** + agrupamento de marcadores.

> Nenhum serviço que exija chave, cartão ou faturamento é utilizado (sem Google Maps, sem Mapbox).
> **© OpenStreetMap contributors.**

## Memória multi-dia (histórico acumulado)

O dashboard mantém as ocorrências de **todos os dias já processados**, não apenas a janela atual.
Cada ocorrência é registrada **uma única vez** (identificada pela URL da notícia) e carrega o campo
`dias` — a lista dos SITREP (por data de fechamento da janela) em que apareceu. Assim, um fato que
reaparece em janelas de 48 h consecutivas fica marcado nos dois dias, sem duplicar no mapa.

Na barra superior, o seletor **JANELA** permite ver:

- **Histórico — todos os dias** (padrão): toda a memória acumulada;
- **25 AGO (atual)**, **24 AGO**, … : apenas a janela escolhida.

O painel lateral mostra a linha **MEMÓRIA** com a contagem por dia e quantas ocorrências foram
**reconfirmadas** entre janelas. Marcadores de janelas anteriores que não constam do dia atual
aparecem levemente esmaecidos. Exportações (GeoJSON/CSV) e a caixa de rota respeitam o filtro de dia.

### Como adicionar um novo dia (`data/events.js`)

1. acrescente uma entrada em `SITREP_DAYS` (topo, mais recente primeiro);
2. para fatos que se repetem, adicione a nova data ao array `dias` do evento;
3. para fatos novos, adicione um objeto novo com `dias:["AAAA-MM-DD"]`;
4. atualize `atual` em `SITREP_META`;
5. (opcional) rode o geocodificador para os locais novos.

## Estrutura

```
SITREP-dashboard/
├── index.html                  # dashboard (Leaflet + OSM), tema SITREP, filtro por dia + memória
├── data/
│   ├── events.js               # base cumulativa de ocorrências (campo `dias`) + criticidade
│   ├── geocoding-cache.json    # cache de coordenadas (formato exigido)
│   └── geocoding-cache.js      # espelho do cache p/ o navegador (carregado via <script>)
├── scripts/
│   └── geocode.mjs             # geocodificador Nominatim (Node 18+)
└── README.md
```

## Como abrir

Abra `index.html` no navegador (requer internet para os tiles e para a biblioteca Leaflet).
O mapa já vem plotado a partir do `geocoding-cache.json`.

## Criticidade

- 🔴 **ALTO** · 🟠 **MÉDIO** · 🔵 **BAIXO** · 🟢 **ACOMPANHAR** · 🟣 **INDICAÇÃO**
  (não confirmado — não repassar como fato).

## Geocodificação real (recomendado)

O cache vem **pré-semeado com coordenadas aproximadas feitas à mão** (marcadas como
`fonte: "seed-local"` e `aproximada: true`) só para o mapa já funcionar. Para obter as
coordenadas oficiais do OpenStreetMap, rode o geocodificador:

```bash
node scripts/geocode.mjs           # consulta apenas o que ainda não é do OSM
node scripts/geocode.mjs --refresh # reconsulta tudo
```

Isso reescreve `data/geocoding-cache.json` (e `.js`) com dados reais do Nominatim.
Também há o botão **“NOMINATIM”** no próprio dashboard (geocodificação no navegador,
best-effort — sujeito a CORS; o script Node é o caminho autoritativo).

### Regras atendidas pela geocodificação

- **User-Agent** identificando o projeto SITREP em toda requisição;
- **máximo 1 requisição por segundo** (intervalo de 1,1 s);
- **cache local** em `data/geocoding-cache.json`;
- **nunca repete** consultas já resolvidas pelo OSM;
- **registra quando a coordenada é aproximada** (`aproximada: true` + `precisao`);
- **não inventa coordenadas**: sem resultado confiável, grava `status: "nao_encontrado"` sem lat/lon.

### Endpoint usado

```
https://nominatim.openstreetmap.org/search
  ?q=<local>&format=json&limit=1&countrycodes=br&addressdetails=1
```

## Observações

- Eventos “agregados” (ex.: homicídio com bairro não recuperado) usam a coordenada do
  município de Manaus e ficam agrupados no centro — é a granularidade disponível na fonte.
- Eventos fora da carta urbana (Novo Airão, Iranduba/AM-070, BR-174) são geocodificados no
  município/rodovia correspondente e o `fitBounds` amplia o enquadramento para incluí-los.
- **© OpenStreetMap contributors** sempre visível.
