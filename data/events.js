/* SITREP Manaus/RMM — BASE CUMULATIVA DE OCORRÊNCIAS (memória multi-dia).
   Cada evento é ÚNICO (identificado pela URL da notícia) e carrega o campo
   `dias`: lista dos SITREP (por data de fechamento da janela) em que apareceu.
   Isso preserva o histórico: um mesmo fato que reaparece em janelas de 48h
   consecutivas fica registrado uma única vez, marcado nos dois dias.

   criticidade: ALTO | MEDIO | BAIXO | ACOMPANHAR | INDICACAO
   `query` é usada para geocodificar no Nominatim/OpenStreetMap.
   Consumido pelo dashboard (index.html) e pelo geocodificador (scripts/geocode.mjs).

   COMO ADICIONAR UM NOVO DIA:
   1. acrescente uma entrada em SITREP_DAYS (topo, mais recente primeiro);
   2. para fatos que se repetem, adicione a nova data ao array `dias` do evento;
   3. para fatos novos, adicione um objeto novo com `dias:["AAAA-MM-DD"]`;
   4. atualize `atual` em SITREP_META.                                          */

window.SITREP_META = {
  titulo: "SITREP MANAUS/RMM",
  atual:  "2026-08-25",
  fonte:  "Fontes abertas · America/Sao_Paulo"
};

/* Janelas já cobertas (mais recente primeiro). */
window.SITREP_DAYS = [
  { dia:"2026-08-25", codigo:"OSINT-MNS-20260825", janela:"23 AGO 09:00 → 25 AGO 09:00 BRT", rotulo:"25 AGO", atencao:"LOCALIZADA",
    leitura:"Violência letal e sinistralidade viária dominam a janela; sem evidência de crise coordenada." },
  { dia:"2026-08-24", codigo:"OSINT-MNS-20260824", janela:"22 AGO 09:00 → 24 AGO 09:00 BRT", rotulo:"24 AGO", atencao:"LOCALIZADA",
    leitura:"Predomínio de violência letal e de sinistralidade viária; atenção localizada." }
];

window.SITREP_EVENTS = [
  /* ===== Aparecem em 24 AGO e reconfirmados em 25 AGO ===== */
  { id:1,  criticidade:"ALTO", dias:["2026-08-24","2026-08-25"],
    titulo:"Homem é morto por populares após suspeita de furto no Tarumã",
    data:"2026-08-22", fonte:"D24AM", zona:"Zona Oeste",
    resumo:"Homem é morto por populares sob suspeita de furto no Tarumã. Violência letal e linchamento.",
    url:"https://d24am.com/policia/homem-e-morto-por-populares-por-suspeita-de-furto-de-ventilador-no-taruma/",
    query:"Tarumã, Manaus, Amazonas, Brasil", fora:false },

  { id:2,  criticidade:"ALTO", dias:["2026-08-24","2026-08-25"],
    titulo:"Homem é morto a facadas pelo irmão durante briga em Manaus",
    data:"2026-08-23", fonte:"D24AM", zona:"Manaus (bairro não recuperado)",
    resumo:"Homem é morto a facadas pelo próprio irmão durante briga. Homicídio interpessoal; bairro não recuperado na coleta.",
    url:"https://d24am.com/policia/homem-e-morto-a-facadas-pelo-proprio-irmao-durante-briga-em-manaus/",
    query:"Manaus, Amazonas, Brasil", fora:false, agregado:true },

  { id:3,  criticidade:"ACOMPANHAR", dias:["2026-08-24","2026-08-25"],
    titulo:"Homem é resgatado com vida após incêndio em residência",
    data:"2026-08-23", fonte:"D24AM", zona:"Zona Sul",
    resumo:"Homem é resgatado com vida após incêndio em residência na Cachoeirinha. Emergência com desfecho positivo.",
    url:"https://d24am.com/amazonas/video-homem-e-resgatado-com-vida-apos-incendio-em-casa-no-bairro-cachoeirinha/",
    query:"Cachoeirinha, Manaus, Amazonas, Brasil", fora:false },

  { id:4,  criticidade:"MEDIO", dias:["2026-08-24","2026-08-25"],
    titulo:"Colisão deixa veículos destruídos na estrada para Novo Airão",
    data:"2026-08-23", fonte:"D24AM", zona:"RMM — eixo Novo Airão",
    resumo:"Colisão deixa veículos destruídos no eixo rodoviário de Novo Airão. Sinistralidade em rodovia da RMM.",
    url:"https://d24am.com/amazonas/video-colisao-entre-veiculos-deixa-carros-destruidos-na-estrada-para-novo-airao/",
    query:"Novo Airão, Amazonas, Brasil", fora:true },

  /* ===== Somente 24 AGO ===== */
  { id:5,  criticidade:"ALTO", dias:["2026-08-24"],
    titulo:"Adolescente morre após ser arrastado por caminhão na Compensa",
    data:"2026-08-22", fonte:"Em Tempo", zona:"Zona Oeste",
    resumo:"Adolescente de 17 anos morre após ser arrastado por um caminhão na Compensa. Violência viária com vítima fatal.",
    url:"https://emtempo.com.br/489461/amazonas/adolescente-de-17-anos-morre-apos-ser-arrastado-por-caminhao-na-compensa/",
    query:"Compensa, Manaus, Amazonas, Brasil", fora:false },

  { id:6,  criticidade:"ACOMPANHAR", dias:["2026-08-24"],
    titulo:"Rua Ferreira Pena será interditada para polo gastronômico",
    data:"2026-08-22", fonte:"Em Tempo", zona:"Centro / Zona Sul",
    resumo:"Rua Ferreira Pena, no Centro, será interditada para implantação de polo gastronômico. Impacto na mobilidade.",
    url:"https://emtempo.com.br/489408/amazonas/rua-do-sarara-ferreira-pena-sera-interditada-nesta-segunda-para-virar-espaco-gastronomico-em-manaus/",
    query:"Rua Ferreira Pena, Centro, Manaus, Amazonas, Brasil", fora:false },

  { id:7,  criticidade:"ACOMPANHAR", dias:["2026-08-24"],
    titulo:"Desligamento programado de energia alcança nove bairros",
    data:"2026-08-24", fonte:"Em Tempo", zona:"Manaus (agregado)",
    resumo:"Desligamento programado de energia atinge nove bairros de Manaus. Serviço essencial; impacto distribuído.",
    url:"https://emtempo.com.br/489604/amazonas/vai-faltar-energia-em-9-bairros-de-manaus-neste-domingo-veja-a-lista/",
    query:"Manaus, Amazonas, Brasil", fora:false, agregado:true },

  { id:8,  criticidade:"ALTO", dias:["2026-08-24"],
    titulo:"Motociclista morre após colisão contra muro no Adrianópolis",
    data:"2026-08-23", fonte:"g1 Amazonas", zona:"Zona Centro-Sul",
    resumo:"Motociclista, assessor parlamentar, morre ao colidir contra muro de escola. Segurança viária; vítima fatal.",
    url:"https://g1.globo.com/am/amazonas/noticia/2026/08/23/assessor-parlamentar-morre-apos-colisao-de-moto-com-muro-de-escola-em-manaus.ghtml",
    query:"Adrianópolis, Manaus, Amazonas, Brasil", fora:false },

  { id:9,  criticidade:"ALTO", dias:["2026-08-24"],
    titulo:"Manaus registra 180 atendimentos por acidentes; motos 68%",
    data:"2026-08-24", fonte:"g1 Amazonas", zona:"Manaus (agregado)",
    resumo:"180 atendimentos por acidentes no fim de semana; motociclistas concentram 68%. Carga sobre a urgência hospitalar.",
    url:"https://g1.globo.com/am/amazonas/noticia/2026/08/24/manaus-registra-180-atendimentos-por-acidentes-de-transito-motos-concentram-68percent-no-quarto-fim-de-semana-de-agosto.ghtml",
    query:"Manaus, Amazonas, Brasil", fora:false, agregado:true },

  { id:10, criticidade:"MEDIO", dias:["2026-08-24"],
    titulo:"Caso Geovana: réus irão a júri popular em Manaus",
    data:"2026-08-22", fonte:"g1 Amazonas", zona:"Foro judicial",
    resumo:"No caso Geovana, os réus irão a júri popular em Manaus. Acompanhamento judicial de repercussão.",
    url:"https://g1.globo.com/am/amazonas/noticia/2026/08/22/caso-geovana-reus-vao-a-juri-popular-pela-morte-de-baba-que-era-explorada-sexualmente-pela-patroa-em-manaus.ghtml",
    query:"Fórum Ministro Henoch Reis, Manaus, Amazonas, Brasil", fora:false },

  { id:11, criticidade:"BAIXO", dias:["2026-08-24"],
    titulo:"TJAM recebe queixa-crime contra promotor aposentado",
    data:"2026-08-23", fonte:"g1 Amazonas", zona:"Tribunal de Justiça",
    resumo:"TJAM recebe queixa-crime contra promotor aposentado por ofensa durante júri. Acompanhamento institucional.",
    url:"https://g1.globo.com/am/amazonas/noticia/2026/08/23/tjam-recebe-queixa-crime-contra-promotor-aposentado-que-comparou-advogada-a-cadela-durante-juri.ghtml",
    query:"Tribunal de Justiça do Amazonas, Manaus, Amazonas, Brasil", fora:false },

  { id:12, criticidade:"BAIXO", dias:["2026-08-24"],
    titulo:"TRE-AM fiscaliza propaganda eleitoral em Manaus",
    data:"2026-08-23", fonte:"A Crítica", zona:"Áreas de grande circulação",
    resumo:"TRE do Amazonas fiscaliza propaganda eleitoral em áreas de grande circulação. Contexto eleitoral.",
    url:"https://www.acritica.com/politica/tre-am-fiscaliza-propaganda-eleitoral-em-areas-de-grande-circulac-o-de-manaus-1.413051",
    query:"Tribunal Regional Eleitoral do Amazonas, Manaus, Amazonas, Brasil", fora:false },

  { id:13, criticidade:"ACOMPANHAR", dias:["2026-08-24"],
    titulo:"Homem retira GPS de carro alugado e desaparece em Manaus",
    data:"2026-08-23", fonte:"D24AM", zona:"Manaus (bairro não informado)",
    resumo:"Homem retira o GPS de carro alugado e desaparece. Possível estelionato; localização não informada.",
    url:"https://d24am.com/policia/homem-retira-gps-de-carro-alugado-e-desaparece-em-manaus/",
    query:"Manaus, Amazonas, Brasil", fora:false, agregado:true },

  { id:14, criticidade:"MEDIO", dias:["2026-08-24"],
    titulo:"Motorista atinge carros, foge e cai em igarapé no Alvorada",
    data:"2026-08-23", fonte:"D24AM", zona:"Zona Centro-Oeste",
    resumo:"Motorista atinge carros, tenta fugir e cai com o veículo em igarapé. Sinistralidade viária com fuga.",
    url:"https://d24am.com/policia/motorista-bate-em-carros-tenta-fugir-e-cai-com-veiculo-em-igarape-no-alvorada/",
    query:"Alvorada, Manaus, Amazonas, Brasil", fora:false },

  { id:15, criticidade:"ALTO", dias:["2026-08-24"],
    titulo:"Colisão entre dois carros deixa quatro feridos na BR-174",
    data:"2026-08-22", fonte:"Em Tempo", zona:"RMM — BR-174 Manaus/P. Figueiredo",
    resumo:"Colisão entre dois carros deixa quatro feridos na BR-174. Múltiplas vítimas em rodovia; impacto no fluxo.",
    url:"https://emtempo.com.br/489569/amazonas/video-acidente-entre-dois-carros-deixa-quatro-feridos-na-br-174/",
    query:"BR-174, Presidente Figueiredo, Amazonas, Brasil", fora:true },

  /* ===== Novos em 25 AGO ===== */
  { id:16, criticidade:"ALTO", dias:["2026-08-25"],
    titulo:"PM apreende 341 quilos de drogas na comunidade Monte Horebe",
    data:"2026-08-25", fonte:"g1 Amazonas", zona:"Zona Norte",
    resumo:"Polícia apreende 341 quilos de drogas (skunk) enterrados em cova na comunidade Monte Horebe. Repressão ao tráfico.",
    url:"https://g1.globo.com/am/amazonas/noticia/2026/08/25/policia-apreende-mais-de-300-tabletes-de-skunk-enterrados-em-cova-na-zona-norte-de-manaus.ghtml",
    query:"Monte Horebe, Manaus, Amazonas, Brasil", fora:false },

  { id:17, criticidade:"MEDIO", dias:["2026-08-25"],
    titulo:"Homem é preso por suspeita de estelionato no Japiim",
    data:"2026-08-24", fonte:"Em Tempo", zona:"Zona Sul",
    resumo:"Homem é preso por suspeita de estelionato ao se passar por falso servidor, no Japiim. Crime patrimonial.",
    url:"https://emtempo.com.br/490973/policia/homem-preso-manaus-falso-servidor-estelionato/",
    query:"Japiim, Manaus, Amazonas, Brasil", fora:false },

  { id:18, criticidade:"ALTO", dias:["2026-08-25"],
    titulo:"Condenado por latrocínio e estupro é preso no Tarumã",
    data:"2026-08-24", fonte:"Em Tempo", zona:"Zona Oeste",
    resumo:"Condenado por latrocínio e estupro é preso no Tarumã. Cumprimento de mandado.",
    url:"https://emtempo.com.br/491014/policia/homem-preso-manaus-latrocinio-estupro-2007/",
    query:"Tarumã, Manaus, Amazonas, Brasil", fora:false },

  { id:19, criticidade:"MEDIO", dias:["2026-08-25"],
    titulo:"Incêndio atinge vegetação diante do HUGV na Praça 14",
    data:"2026-08-24", fonte:"A Crítica", zona:"Zona Sul",
    resumo:"Incêndio atinge área de vegetação diante do Hospital Universitário Getúlio Vargas, na Praça 14. Incêndio em vegetação urbana.",
    url:"https://www.acritica.com/geral/incendio-atinge-area-de-vegetac-o-na-praca-14-em-manaus-1.413127",
    query:"Praça 14 de Janeiro, Manaus, Amazonas, Brasil", fora:false },

  { id:20, criticidade:"MEDIO", dias:["2026-08-25"],
    titulo:"Carro capota e bloqueia parcialmente a AM-070 no Ariaú",
    data:"2026-08-24", fonte:"D24AM", zona:"RMM — Iranduba / AM-070",
    resumo:"Carro capota e fica tombado, bloqueando parcialmente a AM-070, na comunidade do Ariaú (Iranduba). Sinistralidade em rodovia da RMM.",
    url:"https://d24am.com/amazonas/video-carro-capota-e-fica-tombado-no-meio-da-am-070/",
    query:"Ariaú, Iranduba, Amazonas, Brasil", fora:true },

  { id:21, criticidade:"INDICACAO", dias:["2026-08-25"], indicacao:true,
    titulo:"Denúncia aponta cobrança para facilitar acesso ao Bolsa Família",
    data:"2026-08-25", fonte:"g1 Amazonas", zona:"CRAS Alvorada — Zona Centro-Oeste",
    resumo:"Servidor é denunciado por cobrar para facilitar acesso ao Bolsa Família, no CRAS do Alvorada. INDICAÇÃO — não repassar como fato; corroboração independente ainda necessária.",
    url:"https://g1.globo.com/am/amazonas/noticia/2026/08/25/servidor-da-prefeitura-de-manaus-e-denunciado-por-cobrar-para-facilitar-acesso-ao-bolsa-familia-r-180-e-so-um-filho.ghtml",
    query:"Alvorada, Manaus, Amazonas, Brasil", fora:false }
];

/* Coordenadas-semente (APROXIMADAS, feitas à mão) para a query, usadas apenas
   como fallback enquanto o Nominatim não é executado. O geocodificador substitui
   estas por coordenadas reais do OpenStreetMap. NUNCA tratadas como precisas. */
window.SITREP_SEEDS = {
  "Compensa, Manaus, Amazonas, Brasil":                         [-3.0965, -60.0553],
  "Rua Ferreira Pena, Centro, Manaus, Amazonas, Brasil":        [-3.1345, -60.0175],
  "Manaus, Amazonas, Brasil":                                   [-3.1190, -60.0217],
  "Adrianópolis, Manaus, Amazonas, Brasil":                     [-3.1010, -60.0100],
  "Tarumã, Manaus, Amazonas, Brasil":                           [-3.0389, -60.0908],
  "Cachoeirinha, Manaus, Amazonas, Brasil":                     [-3.1268, -60.0130],
  "Novo Airão, Amazonas, Brasil":                               [-2.6212, -60.9430],
  "Fórum Ministro Henoch Reis, Manaus, Amazonas, Brasil":       [-3.0866, -59.9899],
  "Tribunal de Justiça do Amazonas, Manaus, Amazonas, Brasil":  [-3.0932, -59.9878],
  "Tribunal Regional Eleitoral do Amazonas, Manaus, Amazonas, Brasil":[-3.1010, -60.0150],
  "Alvorada, Manaus, Amazonas, Brasil":                         [-3.0855, -60.0470],
  "BR-174, Presidente Figueiredo, Amazonas, Brasil":            [-2.7500, -60.0100],
  "Monte Horebe, Manaus, Amazonas, Brasil":                     [-2.9930, -60.0010],
  "Japiim, Manaus, Amazonas, Brasil":                           [-3.1040, -59.9950],
  "Praça 14 de Janeiro, Manaus, Amazonas, Brasil":              [-3.1290, -60.0060],
  "Ariaú, Iranduba, Amazonas, Brasil":                          [-3.2856, -60.1889]
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = { EVENTS: window.SITREP_EVENTS, SEEDS: window.SITREP_SEEDS, META: window.SITREP_META, DAYS: window.SITREP_DAYS };
}
