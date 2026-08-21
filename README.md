# SITREP-AM — Manaus e Região Metropolitana

Dashboard estático, responsivo e orientado à decisão para Manaus, Amazonas, interior, fronteiras e fatos regionais com possíveis reflexos na Amazônia brasileira.

## Referência visual

O caminho temporário informado para o modelo de 03/08/2026 já não existia no momento da implementação. Foi utilizada a cópia preservada e verificável:

`deliverables/2026-08-03_0900/SITREP_AM_Dashboard_2026-08-03_ESTILO_APROVADO.zip`

A identidade aprovada foi preservada: fundo quase preto esverdeado, verde-fósforo como destaque, tipografia monoespaçada, imagem de onça/coruja e linguagem de centro de operações. O layout fixo de 1600 px, a imagem base64 e o CRT intenso foram substituídos por uma arquitetura responsiva e editável.

## Estrutura

```text
/
├── index.html
├── assets/
│   ├── css/
│   │   ├── style.css
│   │   └── print.css
│   ├── js/
│   │   └── app.js
│   └── images/
│       └── sitrep-am-onca-verde-fosforo.png
├── data/
│   ├── sitrep-current.json
│   ├── sitrep-current.js
│   ├── sitrep-schema.json
│   └── archive/
│       └── 2026-08-21.json
├── README.md
└── .gitignore
```

## Atualização do relatório

1. Edite `data/sitrep-current.json` conforme `data/sitrep-schema.json`.
2. Preserve a distinção entre fato, informação preliminar, avaliação e hipótese.
3. Não inclua coordenadas quando a precisão não puder ser sustentada.
4. Atualize a cópia de fallback para abertura por `file:///`:

```powershell
node -e "const fs=require('fs');const j=JSON.parse(fs.readFileSync('data/sitrep-current.json','utf8'));fs.writeFileSync('data/sitrep-current.js','window.SITREP_DATA = '+JSON.stringify(j,null,2)+';\n')"
```

No GitHub Pages, o dashboard carrega o JSON. Ao abrir diretamente por `file:///`, navegadores bloqueiam `fetch()` local; nesse caso, `sitrep-current.js` funciona como fallback com os mesmos dados.

## Teste local

Abrir diretamente:

```text
file:///C:/Users/empresa/Documents/GitHub/sitrep-am/index.html
```

Ou iniciar um servidor local, recomendado para validar o JSON:

```powershell
cd C:\Users\empresa\Documents\GitHub\sitrep-am
python -m http.server 8000
```

Depois acesse <http://localhost:8000>.

## Git e GitHub Pages

Os comandos abaixo apenas preparam o repositório. Execute o `push` somente após revisar o conteúdo e escolher um repositório.

```powershell
cd C:\Users\empresa\Documents\GitHub\sitrep-am
git init
git add .
git commit -m "Publica dashboard SITREP-AM"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/sitrep-am.git
git push -u origin main
```

No GitHub: `Settings` → `Pages` → `Deploy from a branch` → `main` → `/ (root)`.

## Melhorias implementadas

- estrutura separada em HTML, CSS, JavaScript e dados;
- grid responsivo para desktop, tablet e celular;
- indicador automático de atualização;
- filtros de eventos e histórico;
- mapa Leaflet/OpenStreetMap sem chave de API, com fallback;
- painel permanente Brasil–Colômbia;
- radar temático e briefing diário integrados;
- rastreabilidade de fonte, coleta e verificação;
- validação defensiva do JSON e tratamento de campos ausentes;
- folha de impressão A4 com CRT removido;
- links externos seguros e caminhos relativos;
- aviso permanente de fontes abertas e revisão de segurança.

## Segurança

Conteúdo elaborado exclusivamente com fontes abertas. Revisar antes da publicação. Não inserir dados pessoais sensíveis, posições ou rotinas operacionais, vulnerabilidades, credenciais, tokens ou informações provenientes de sistemas restritos.
