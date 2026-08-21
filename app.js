/* SITREP-AM: dashboard estático, sem credenciais e sem backend. */
(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const esc = value => String(value ?? 'Sem dados disponíveis').replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
  const text = value => value === undefined || value === null || value === '' ? 'Sem dados disponíveis' : String(value);
  const dateTime = value => {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? 'Data inválida' : new Intl.DateTimeFormat('pt-BR',{dateStyle:'short',timeStyle:'short',timeZone:'America/Sao_Paulo'}).format(d);
  };
  const pretty = value => text(value).replaceAll('-', ' ').replace(/\b\w/g, c => c.toUpperCase());
  let report = null;
  let map = null;
  let markerLayer = null;

  function validate(data) {
    const errors = [];
    const required = ['metadata','resumoExecutivo','indicadores','eventos','fronteiraColombia','radarTematico','acompanhamento','historico30Dias','fontes'];
    required.forEach(k => { if (!(k in (data || {}))) errors.push(`Campo obrigatório ausente: ${k}`); });
    if (!data?.metadata) return errors;
    ['atualizadoEm','periodoInicio','periodoFim'].forEach(k => { if (Number.isNaN(new Date(data.metadata[k]).getTime())) errors.push(`Data inválida: metadata.${k}`); });
    const ids = new Set();
    (data.eventos || []).forEach((e,i) => {
      ['id','titulo','dataHora','localizacao','classificacao','criticidade','categoria','fonte'].forEach(k => { if (!e[k]) errors.push(`Evento ${i+1} sem ${k}`); });
      if (ids.has(e.id)) errors.push(`ID duplicado: ${e.id}`); ids.add(e.id);
      if (e.fonte && !/^https?:\/\//i.test(e.fonte.url || '')) errors.push(`Evento ${e.id || i+1} com URL inválida`);
      if (e.coordenadas) {
        const {lat,lon} = e.coordenadas;
        if (!Number.isFinite(lat) || lat < -90 || lat > 90 || !Number.isFinite(lon) || lon < -180 || lon > 180) errors.push(`Evento ${e.id || i+1} com coordenadas inválidas`);
      }
      if (e.impacto && (e.impacto < 1 || e.impacto > 5)) errors.push(`Evento ${e.id || i+1} com impacto incompatível`);
    });
    return errors;
  }

  async function loadData() {
    // Em abertura local/standalone, evita a espera e o bloqueio de fetch do protocolo file:.
    if (location.protocol === 'file:' && window.SITREP_DATA) {
      return {data: window.SITREP_DATA, mode:'fallback'};
    }
    try {
      const response = await fetch('sitrep-current.json', {cache:'no-store'});
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return {data: await response.json(), mode:'json'};
    } catch (error) {
      if (window.SITREP_DATA) return {data: window.SITREP_DATA, mode:'fallback', error};
      throw error;
    }
  }

  function syncStatus(metadata, mode, hasErrors) {
    const el = $('#sync-status'), detail = $('#sync-detail');
    if (hasErrors) { el.textContent='FALHA NA SINCRONIZAÇÃO'; el.className='sync error'; detail.textContent='Dados carregados com inconsistências'; return; }
    const age = (Date.now() - new Date(metadata.atualizadoEm).getTime()) / 36e5;
    if (!Number.isFinite(age)) { el.textContent='FALHA NA SINCRONIZAÇÃO'; el.className='sync error'; detail.textContent='Data de atualização inválida'; return; }
    if (age <= 24) { el.textContent='ATUALIZADO'; el.className='sync ok'; }
    else if (age <= 48) { el.textContent='ATENÇÃO'; el.className='sync warn'; }
    else { el.textContent='RELATÓRIO DESATUALIZADO'; el.className='sync stale'; }
    detail.textContent = `${Math.max(0,Math.round(age))}h desde a atualização · ${mode === 'fallback' ? 'modo local' : 'JSON sincronizado'}`;
  }

  function renderHeader(data, mode, errors) {
    $('#report-title').textContent = text(data.metadata.titulo);
    $('#report-subtitle').innerHTML = `${esc(data.metadata.subtitulo || 'SITREP-AM | AMAZÔNIA').replace('|','<span>|</span>')}`;
    $('#report-period').textContent = `${dateTime(data.metadata.periodoInicio)} → ${dateTime(data.metadata.periodoFim)} · ${text(data.metadata.fusoHorario)}`;
    $('#update-line').textContent = `Atualização: ${dateTime(data.metadata.atualizadoEm)} · ${text(data.metadata.distribuicao)}`;
    syncStatus(data.metadata, mode, errors.length > 0);
    if (errors.length) { const box=$('#data-warning'); box.classList.remove('hidden'); box.innerHTML=`<strong>Validação do JSON:</strong><ul>${errors.map(e=>`<li>${esc(e)}</li>`).join('')}</ul>`; }
  }

  function renderIndicators(data) {
    const i=data.indicadores||{}, items=[
      ['◉',i.termometro,'Termômetro operacional',true],['Σ',i.totalEventos,'Total de eventos'],['!',i.eventosCriticos,'Eventos críticos'],['↻',i.eventosAcompanhamento,'Em acompanhamento'],['⇄',i.eventosFronteira,'Eventos de fronteira'],['⌁',i.fontesUtilizadas,'Fontes utilizadas'],['◷',dateTime(data.metadata.atualizadoEm),'Última atualização']
    ];
    $('#indicator-grid').innerHTML=items.map(([icon,val,label,primary])=>`<article class="indicator ${primary?'primary':''}"><span class="icon">${icon}</span><strong>${esc(val)}</strong><span>${esc(label)}</span></article>`).join('');
  }

  function renderSummary(data) {
    const r=data.resumoExecutivo||{};
    $('#summary-grid').innerHTML=[['SITUAÇÃO',r.situacao],['IMPACTO',r.impacto],['PERSPECTIVA 24–48H',r.perspectiva]].map(([h,p])=>`<article class="summary-card"><h3>${h}</h3><p>${esc(p)}</p></article>`).join('');
  }

  function eventCard(e) {
    return `<article class="event-card" data-category="${esc(e.categoria)}" data-severity="${esc(e.criticidade)}"><div class="tag-row"><span class="tag severity">${esc(e.criticidade)}</span><span class="tag">${esc(e.categoria)}</span><span class="tag">${esc(e.classificacao)}</span></div><h3>${esc(e.titulo)}</h3><div class="event-meta"><span>◷ ${esc(dateTime(e.dataHora))}</span><span>⌖ ${esc(e.localizacao)}</span><span>↗ ${esc(e.tendencia)}</span></div><p class="event-summary">${esc(e.resumo)}</p><p class="event-impact"><b>Impacto operacional:</b> ${esc(e.impactoOperacional)}</p><div class="event-stats"><div><small>Impacto</small><b>${esc(e.impacto)}/5</b></div><div><small>Agravamento</small><b>${esc(e.probabilidadeAgravamento)}/5</b></div><div><small>Confiança</small><b>${esc(e.confianca)}</b></div><div><small>Fonte / info</small><b>${esc(e.confiabilidadeFonte)}${esc(e.credibilidadeInformacao)}</b></div></div><a class="source-link" href="${esc(e.fonte?.url)}" target="_blank" rel="noopener noreferrer">${esc(e.fonte?.nome)} ↗</a><div class="source-trace">Publicação: ${esc(dateTime(e.publicadoEm))} · coleta: ${esc(dateTime(e.coletadoEm))} · última verificação: ${esc(dateTime(e.ultimaVerificacao))}<br>${esc(e.fonte?.tipo)} · ${esc(e.fonte?.confirmacoes)} fonte(s) · ${esc(e.fonte?.evidencia)}</div></article>`;
  }

  function renderEvents(data) {
    const categories=[...new Set((data.eventos||[]).map(e=>e.categoria))].sort();
    $('#category-filter').insertAdjacentHTML('beforeend',categories.map(c=>`<option value="${esc(c)}">${esc(pretty(c))}</option>`).join(''));
    const update=()=>{const cat=$('#category-filter').value,sev=$('#severity-filter').value;const filtered=(data.eventos||[]).filter(e=>(cat==='all'||e.categoria===cat)&&(sev==='all'||e.criticidade===sev));$('#event-grid').innerHTML=filtered.length?filtered.map(eventCard).join(''):'<p class="empty-state">Sem dados disponíveis para os filtros selecionados.</p>';$('#event-count').textContent=`${filtered.length} de ${(data.eventos||[]).length} eventos`;};
    $('#category-filter').addEventListener('change',update);$('#severity-filter').addEventListener('change',update);$('#clear-filters').addEventListener('click',()=>{$('#category-filter').value='all';$('#severity-filter').value='all';update();});update();
  }

  function markerIcon(e) {
    const approx=e.coordenadas?.precisao?.toLowerCase().includes('aproximada')?'approx':'';
    return L.divIcon({className:'',html:`<span class="custom-marker ${esc(e.criticidade)} ${approx}" aria-label="${esc(e.titulo)}"></span>`,iconSize:[30,30],iconAnchor:[15,15]});
  }
  function mapDetail(e) {
    $('#map-detail').innerHTML=`<div class="tag-row"><span class="tag severity">${esc(e.criticidade)}</span><span class="tag">${esc(e.classificacao)}</span></div><h3>${esc(e.titulo)}</h3><dl><dt>Local</dt><dd>${esc(e.localizacao)}</dd><dt>Precisão</dt><dd>${esc(e.coordenadas?.precisao || 'Sem coordenadas publicáveis')}</dd><dt>Impacto</dt><dd>${esc(e.impactoOperacional)}</dd><dt>Fonte</dt><dd><a class="source-link" href="${esc(e.fonte?.url)}" target="_blank" rel="noopener noreferrer">${esc(e.fonte?.nome)} ↗</a></dd></dl>`;
  }
  function renderMap(data) {
    const withCoords=(data.eventos||[]).filter(e=>e.coordenadas&&Number.isFinite(e.coordenadas.lat)&&Number.isFinite(e.coordenadas.lon));
    if (!window.L) { $('#operational-map').classList.add('hidden');$('#map-fallback').classList.remove('hidden');$('#map-detail').innerHTML=withCoords.map(e=>`<button class="map-list-button">${esc(e.localizacao)} · ${esc(e.titulo)}</button>`).join('')||'<p class="empty-state">Sem dados disponíveis.</p>';return; }
    map=L.map('operational-map',{zoomControl:true,minZoom:3}).setView([-3.15,-60.15],8);
    const primaryTiles=L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
      maxZoom:14,
      attribution:'&copy; OpenStreetMap',
      crossOrigin:true
    }).addTo(map);
    let switchedTiles=false;
    primaryTiles.on('tileerror',()=>{
      if(switchedTiles) return;
      switchedTiles=true;
      map.removeLayer(primaryTiles);
      L.tileLayer('https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',{
        maxZoom:14,
        attribution:'&copy; OpenStreetMap contributors · HOT',
        crossOrigin:true
      }).addTo(map);
    });
    markerLayer=L.featureGroup().addTo(map);
    withCoords.forEach(e=>{const marker=L.marker([e.coordenadas.lat,e.coordenadas.lon],{icon:markerIcon(e)}).addTo(markerLayer);marker.bindTooltip(esc(e.titulo));marker.on('click',()=>mapDetail(e));if(e.coordenadas.precisao?.toLowerCase().includes('aproximada'))L.circle([e.coordenadas.lat,e.coordenadas.lon],{radius:18000,color:'#62b5e5',weight:1,dashArray:'5 7',fillOpacity:.04}).addTo(markerLayer);});
    if(withCoords.length) { map.fitBounds(markerLayer.getBounds().pad(.8)); mapDetail(withCoords[0]); }
    setTimeout(()=>map.invalidateSize(),200);
  }

  const dl=(pairs)=>pairs.map(([k,v])=>`<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('');
  function renderBorder(data) {
    const b=(data.fronteiraColombia||[])[0]; if(!b){$('#border-status').textContent='Sem dados disponíveis';return;}
    $('#border-status').textContent=b.status;
    $('#colombia-data').innerHTML=dl([['Grupo envolvido',b.grupo],['Departamento',b.departamento],['Local do confronto',b.localConfronto],['Operação governamental',b.operacaoGovernamental],['Tendência',b.tendencia]]);
    $('#brazil-impact-data').innerHTML=dl([['Municípios citados',b.municipioBrasil],['Escala territorial',b.distanciaFronteira],['Bacia hidrográfica',b.bacia],['Eixo logístico',b.eixoLogistico],['Impacto potencial',b.impactoPotencial],['Risco de transbordamento',b.riscoTransbordamento]]);
  }
  function renderRadar(data){$('#radar-grid').innerHTML=(data.radarTematico||[]).map(r=>`<article class="radar-item"><h3>${esc(r.tema)}</h3><div class="radar-track"><div class="radar-fill" style="width:${Math.max(0,Math.min(5,Number(r.nivel)||0))*20}%"></div></div><span class="radar-value">${esc(r.nivel)}/5</span></article>`).join('')||'<p class="empty-state">Sem dados disponíveis.</p>';$('#briefing-grid').innerHTML=(data.briefingDiario||[]).map(b=>`<article class="briefing-card"><h4>${esc(b.titulo)}</h4><p>${esc(b.tema)} · ${esc(b.situacao)} · confiança ${esc(b.confianca)}</p><a href="${esc(b.fonte)}" target="_blank" rel="noopener noreferrer">Consulta de origem ↗</a></article>`).join('')||'<p class="empty-state">Sem dados disponíveis.</p>';}
  function renderTimeline(data){const categories=[...new Set((data.historico30Dias||[]).map(x=>x.categoria))].sort();$('#timeline-filter').insertAdjacentHTML('beforeend',categories.map(c=>`<option value="${esc(c)}">${esc(pretty(c))}</option>`).join(''));const update=()=>{const cat=$('#timeline-filter').value,items=(data.historico30Dias||[]).filter(x=>cat==='all'||x.categoria===cat);$('#timeline').innerHTML=items.map(x=>`<article class="timeline-item" data-severity="${esc(x.criticidade)}"><span class="timeline-dot" style="transform:scale(${.75+(Number(x.impacto)||1)*.08})"></span><time>${esc(x.data)}</time><h3>${esc(x.titulo)}</h3><p>${esc(pretty(x.categoria))} · impacto ${esc(x.impacto)}/5</p></article>`).join('')||'<p class="empty-state">Sem dados disponíveis.</p>';};$('#timeline-filter').addEventListener('change',update);update();}
  function renderWatch(data){$('#watch-grid').innerHTML=(data.acompanhamento||[]).map(w=>`<article class="watch-card"><span class="horizon">${esc(w.horizonte)}</span><h3>${esc(w.tema)}</h3><p>${esc(w.acao)}</p></article>`).join('')||'<p class="empty-state">Sem dados disponíveis.</p>';}
  function renderFooter(data){$('#footer-version').textContent=`Versão ${text(data.metadata.versao)} · geração ${dateTime(data.metadata.geradoEm)}`;$('#footer-sources').textContent=(data.fontes||[]).map(f=>f.nome).join(' · ')||'Sem dados disponíveis';$('#method-warning').textContent=text(data.metodologia?.aviso);}

  async function init(){
    try{const loaded=await loadData();report=loaded.data;const errors=validate(report);renderHeader(report,loaded.mode,errors);renderIndicators(report);renderSummary(report);renderEvents(report);renderMap(report);renderBorder(report);renderRadar(report);renderTimeline(report);renderWatch(report);renderFooter(report);$('#print-button').addEventListener('click',()=>window.print());document.documentElement.dataset.ready='true';window.SITREP_APP={report,errors,map};}
    catch(error){console.error('SITREP: falha fatal',error);$('#sync-status').textContent='FALHA NA SINCRONIZAÇÃO';$('#sync-status').className='sync error';const box=$('#data-warning');box.classList.remove('hidden');box.textContent='Falha ao carregar o relatório. Verifique sitrep-current.json e data/sitrep-current.js.';}
  }
  document.addEventListener('DOMContentLoaded',init);
})();

/* Extensao reconciliada: historico clicavel e georreferenciado. */
(()=>{const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));const valid=u=>/^https?:\/\//i.test(u||'');
function start(){if(!window.SITREP_APP?.report)return setTimeout(start,50);const d=window.SITREP_APP.report,m=window.SITREP_APP.map,byId=new Map((d.eventos||[]).map(e=>[e.id,e])),markers=new Map(),layer=window.L&&m?L.featureGroup().addTo(m):null;
const detail=e=>{document.querySelectorAll('.timeline-item').forEach(x=>x.classList.toggle('selected',x.dataset.eventId===e.id));const box=document.querySelector('#map-detail');box.innerHTML='<div class="tag-row"><span class="tag severity">'+esc(e.criticidade)+'</span><span class="tag">'+esc(e.classificacao||e.categoria)+'</span></div><h3>'+esc(e.titulo)+'</h3><dl><dt>Local</dt><dd>'+esc(e.localizacao)+'</dd><dt>Precisao</dt><dd>'+esc(e.coordenadas?.precisao||'Sem coordenadas publicaveis')+'</dd><dt>Fonte</dt><dd>'+(valid(e.fonte?.url)?'<a class="source-link" href="'+esc(e.fonte.url)+'" target="_blank" rel="noopener noreferrer">Abrir noticia original &#8599;</a>':'Fonte original nao recuperada')+'</dd></dl>'};
if(layer){const operationalLayers=Object.values(m._layers).filter(x=>x instanceof L.Marker||x instanceof L.Circle);for(const e of d.eventos||[]){if(!Number.isFinite(e.coordenadas?.lat)||!Number.isFinite(e.coordenadas?.lon))continue;const icon=L.divIcon({className:'linked-marker',html:'<span aria-hidden="true"></span>',iconSize:[8,8],iconAnchor:[4,4]});const mk=L.marker([e.coordenadas.lat,e.coordenadas.lon],{keyboard:true,title:e.titulo,icon}).addTo(layer).bindTooltip('<strong>'+esc(e.titulo)+'</strong><br>'+esc(e.coordenadas.precisao||'posição aproximada'));mk.on('click',()=>detail(e));markers.set(e.id,mk)}layer.remove();const controls=document.createElement('div');controls.className='map-data-controls';controls.innerHTML='<strong id="map-coverage">22 notícias no mapa / 22 notícias totais — 100%</strong><label><input type="checkbox" id="layer-48h" checked> 48h</label><label><input type="checkbox" id="layer-contexto" checked> Contexto</label><label><input type="checkbox" id="layer-30d" checked> 30d</label><button type="button" id="map-overview">Visao geral</button><span>Sem localizacao suficiente: item sem marcador.</span>';document.querySelector('#operational-map').before(controls);const toggle=()=>{const on=document.querySelector('#layer-48h').checked||document.querySelector('#layer-contexto').checked||document.querySelector('#layer-30d').checked;operationalLayers.forEach(x=>on?(!m.hasLayer(x)&&m.addLayer(x)):(m.hasLayer(x)&&m.removeLayer(x)))};document.querySelector('#layer-48h').onchange=toggle;document.querySelector('#layer-contexto').onchange=toggle;document.querySelector('#layer-30d').onchange=toggle;const bounds=L.featureGroup([...markers.values()]).getBounds();document.querySelector('#map-overview').onclick=()=>bounds.isValid()&&m.fitBounds(bounds.pad(.8));}
const select=id=>{const e=byId.get(id)||(d.historico30Dias||[]).find(x=>x.id===id);if(!e)return;detail(e);const mk=markers.get(id);if(mk&&m){m.flyTo(mk.getLatLng(),11,{duration:.6});mk.openTooltip();document.querySelector('#mapa').scrollIntoView({behavior:'smooth'});setTimeout(()=>mk.closeTooltip(),5000)}};
const filter=document.querySelector('#timeline-filter'),timeline=document.querySelector('#timeline');const render=()=>{const cat=filter.value,items=(d.historico30Dias||[]).filter(x=>cat==='all'||x.categoria===cat);timeline.innerHTML=items.map(x=>{const u=valid(x.fonte?.url)?x.fonte.url:null;return '<article class="timeline-item" tabindex="0" role="button" data-event-id="'+esc(x.id)+'" data-severity="'+esc(x.criticidade)+'"><span class="timeline-dot"></span><time>'+esc(x.data)+'</time><h3>'+(u?'<a href="'+esc(u)+'" target="_blank" rel="noopener noreferrer">'+esc(x.titulo)+'</a>':esc(x.titulo))+'</h3><p>'+esc(x.categoria)+' · impacto '+esc(x.impacto)+'/5</p>'+(u?'<a class="source-link" href="'+esc(u)+'" target="_blank" rel="noopener noreferrer">Abrir noticia original &#8599;</a>':'<span class="source-unavailable">Fonte original nao recuperada</span>')+(x.coordenadas?'':'<p class="location-warning">Sem marcador: localizacao insuficiente.</p>')+'</article>'}).join('');timeline.querySelectorAll('.timeline-item').forEach(el=>{el.onclick=ev=>{if(!ev.target.closest('a'))select(el.dataset.eventId)};el.onkeydown=ev=>{if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();select(el.dataset.eventId)}}})};filter.addEventListener('change',render);render();window.SITREP_APP.selectEvent=select;window.SITREP_APP.markersById=markers;}
start()})();
