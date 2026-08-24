/* SITREP Manaus/RMM — eventos da janela 22–24 AGO 2026 (fontes abertas).
   Cada evento tem uma "query" usada para geocodificar no Nominatim/OpenStreetMap.
   criticidade: ALTO | MEDIO | BAIXO | ACOMPANHAR
   Este arquivo é consumido tanto pelo dashboard (index.html) quanto pelo
   geocodificador (scripts/geocode.mjs).                                        */
window.SITREP_META = {
  titulo: "SITREP MANAUS/RMM",
  janela: "22 AGO 09:00 → 24 AGO 09:00 BRT",
  codigo: "OSINT-MNS-20260824",
  fonte: "Fontes abertas · America/Sao_Paulo"
};

window.SITREP_EVENTS = [
  { id:1,  criticidade:"ALTO",
    titulo:"Adolescente morre após ser arrastado por caminhão na Compensa",
    data:"2026-08-22", fonte:"Em Tempo", zona:"Zona Oeste",
    resumo:"Adolescente de 17 anos morre após ser arrastado por um caminhão na Compensa. Violência viária com vítima fatal.",
    url:"https://emtempo.com.br/489461/amazonas/adolescente-de-17-anos-morre-apos-ser-arrastado-por-caminhao-na-compensa/",
    query:"Compensa, Manaus, Amazonas, Brasil", fora:false },

  { id:2,  criticidade:"ACOMPANHAR",
    titulo:"Rua Ferreira Pena será interditada para polo gastronômico",
    data:"2026-08-22", fonte:"Em Tempo", zona:"Centro / Zona Sul",
    resumo:"Rua Ferreira Pena, no Centro, será interditada para implantação de polo gastronômico. Impacto na mobilidade.",
    url:"https://emtempo.com.br/489408/amazonas/rua-do-sarara-ferreira-pena-sera-interditada-nesta-segunda-para-virar-espaco-gastronomico-em-manaus/",
    query:"Rua Ferreira Pena, Centro, Manaus, Amazonas, Brasil", fora:false },

  { id:3,  criticidade:"ACOMPANHAR",
    titulo:"Desligamento programado de energia alcança nove bairros",
    data:"2026-08-24", fonte:"Em Tempo", zona:"Manaus (agregado)",
    resumo:"Desligamento programado de energia atinge nove bairros de Manaus. Serviço essencial; impacto distribuído.",
    url:"https://emtempo.com.br/489604/amazonas/vai-faltar-energia-em-9-bairros-de-manaus-neste-domingo-veja-a-lista/",
    query:"Manaus, Amazonas, Brasil", fora:false, agregado:true },

  { id:4,  criticidade:"ALTO",
    titulo:"Motociclista morre após colisão contra muro no Adrianópolis",
    data:"2026-08-23", fonte:"g1 Amazonas", zona:"Zona Centro-Sul",
    resumo:"Motociclista, assessor parlamentar, morre ao colidir contra muro de escola. Segurança viária; vítima fatal.",
    url:"https://g1.globo.com/am/amazonas/noticia/2026/08/23/assessor-parlamentar-morre-apos-colisao-de-moto-com-muro-de-escola-em-manaus.ghtml",
    query:"Adrianópolis, Manaus, Amazonas, Brasil", fora:false },

  { id:5,  criticidade:"ALTO",
    titulo:"Homem é morto por populares após suspeita de furto no Tarumã",
    data:"2026-08-22", fonte:"D24AM", zona:"Zona Oeste",
    resumo:"Homem é morto por populares sob suspeita de furto no Tarumã. Violência letal e linchamento.",
    url:"https://d24am.com/policia/homem-e-morto-por-populares-por-suspeita-de-furto-de-ventilador-no-taruma/",
    query:"Tarumã, Manaus, Amazonas, Brasil", fora:false },

  { id:6,  criticidade:"ALTO",
    titulo:"Homem é morto a facadas pelo irmão durante briga em Manaus",
    data:"2026-08-23", fonte:"D24AM", zona:"Manaus (bairro não recuperado)",
    resumo:"Homem é morto a facadas pelo próprio irmão durante briga. Homicídio interpessoal; bairro não recuperado na coleta.",
    url:"https://d24am.com/policia/homem-e-morto-a-facadas-pelo-proprio-irmao-durante-briga-em-manaus/",
    query:"Manaus, Amazonas, Brasil", fora:false, agregado:true },

  { id:7,  criticidade:"ACOMPANHAR",
    titulo:"Homem é resgatado com vida após incêndio em residência",
    data:"2026-08-23", fonte:"D24AM", zona:"Zona Sul",
    resumo:"Homem é resgatado com vida após incêndio em residência na Cachoeirinha. Emergência com desfecho positivo.",
    url:"https://d24am.com/amazonas/video-homem-e-resgatado-com-vida-apos-incendio-em-casa-no-bairro-cachoeirinha/",
    query:"Cachoeirinha, Manaus, Amazonas, Brasil", fora:false },

  { id:8,  criticidade:"MEDIO",
    titulo:"Colisão deixa veículos destruídos na estrada para Novo Airão",
    data:"2026-08-23", fonte:"D24AM", zona:"RMM — eixo Novo Airão",
    resumo:"Colisão deixa veículos destruídos no eixo rodoviário de Novo Airão. Sinistralidade em rodovia da RMM.",
    url:"https://d24am.com/amazonas/video-colisao-entre-veiculos-deixa-carros-destruidos-na-estrada-para-novo-airao/",
    query:"Novo Airão, Amazonas, Brasil", fora:true },

  { id:9,  criticidade:"ALTO",
    titulo:"Manaus registra 180 atendimentos por acidentes; motos 68%",
    data:"2026-08-24", fonte:"g1 Amazonas", zona:"Manaus (agregado)",
    resumo:"180 atendimentos por acidentes no fim de semana; motociclistas concentram 68%. Carga sobre a urgência hospitalar.",
    url:"https://g1.globo.com/am/amazonas/noticia/2026/08/24/manaus-registra-180-atendimentos-por-acidentes-de-transito-motos-concentram-68percent-no-quarto-fim-de-semana-de-agosto.ghtml",
    query:"Manaus, Amazonas, Brasil", fora:false, agregado:true },

  { id:10, criticidade:"MEDIO",
    titulo:"Caso Geovana: réus irão a júri popular em Manaus",
    data:"2026-08-22", fonte:"g1 Amazonas", zona:"Foro judicial",
    resumo:"No caso Geovana, os réus irão a júri popular em Manaus. Acompanhamento judicial de repercussão.",
    url:"https://g1.globo.com/am/amazonas/noticia/2026/08/22/caso-geovana-reus-vao-a-juri-popular-pela-morte-de-baba-que-era-explorada-sexualmente-pela-patroa-em-manaus.ghtml",
    query:"Fórum Ministro Henoch Reis, Manaus, Amazonas, Brasil", fora:false },

  { id:11, criticidade:"BAIXO",
    titulo:"TJAM recebe queixa-crime contra promotor aposentado",
    data:"2026-08-23", fonte:"g1 Amazonas", zona:"Tribunal de Justiça",
    resumo:"TJAM recebe queixa-crime contra promotor aposentado por ofensa durante júri. Acompanhamento institucional.",
    url:"https://g1.globo.com/am/amazonas/noticia/2026/08/23/tjam-recebe-queixa-crime-contra-promotor-aposentado-que-comparou-advogada-a-cadela-durante-juri.ghtml",
    query:"Tribunal de Justiça do Amazonas, Manaus, Amazonas, Brasil", fora:false },

  { id:12, criticidade:"BAIXO",
    titulo:"TRE-AM fiscaliza propaganda eleitoral em Manaus",
    data:"2026-08-23", fonte:"A Crítica", zona:"Áreas de grande circulação",
    resumo:"TRE do Amazonas fiscaliza propaganda eleitoral em áreas de grande circulação. Contexto eleitoral.",
    url:"https://www.acritica.com/politica/tre-am-fiscaliza-propaganda-eleitoral-em-areas-de-grande-circulac-o-de-manaus-1.413051",
    query:"Tribunal Regional Eleitoral do Amazonas, Manaus, Amazonas, Brasil", fora:false },

  { id:13, criticidade:"ACOMPANHAR",
    titulo:"Homem retira GPS de carro alugado e desaparece em Manaus",
    data:"2026-08-23", fonte:"D24AM", zona:"Manaus (bairro não informado)",
    resumo:"Homem retira o GPS de carro alugado e desaparece. Possível estelionato; localização não informada.",
    url:"https://d24am.com/policia/homem-retira-gps-de-carro-alugado-e-desaparece-em-manaus/",
    query:"Manaus, Amazonas, Brasil", fora:false, agregado:true },

  { id:14, criticidade:"MEDIO",
    titulo:"Motorista atinge carros, foge e cai em igarapé no Alvorada",
    data:"2026-08-23", fonte:"D24AM", zona:"Zona Centro-Oeste",
    resumo:"Motorista atinge carros, tenta fugir e cai com o veículo em igarapé. Sinistralidade viária com fuga.",
    url:"https://d24am.com/policia/motorista-bate-em-carros-tenta-fugir-e-cai-com-veiculo-em-igarape-no-alvorada/",
    query:"Alvorada, Manaus, Amazonas, Brasil", fora:false },

  { id:15, criticidade:"ALTO",
    titulo:"Colisão entre dois carros deixa quatro feridos na BR-174",
    data:"2026-08-22", fonte:"Em Tempo", zona:"RMM — BR-174 Manaus/P. Figueiredo",
    resumo:"Colisão entre dois carros deixa quatro feridos na BR-174. Múltiplas vítimas em rodovia; impacto no fluxo.",
    url:"https://emtempo.com.br/489569/amazonas/video-acidente-entre-dois-carros-deixa-quatro-feridos-na-br-174/",
    query:"BR-174, Presidente Figueiredo, Amazonas, Brasil", fora:true }
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
  "BR-174, Presidente Figueiredo, Amazonas, Brasil":            [-2.7500, -60.0100]
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = { EVENTS: window.SITREP_EVENTS, SEEDS: window.SITREP_SEEDS, META: window.SITREP_META };
}
