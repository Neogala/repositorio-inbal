(() => {
  const get = id => document.getElementById(id);
  const graph = window.GRAFO_INBAL;
  if (!graph?.nodes?.length || !Array.isArray(graph.edges)) {
    get('status').textContent = 'No se pudieron cargar las fichas del acervo. Comprueba que la carpeta conexiones acompaña al archivo.';
    return;
  }
  const FALLBACK = 'Img/obras/_sin-imagen.svg';
  const TYPES = {
    obra:{label:'Obra', plural:'Obras', color:'#1e5b4f'},
    autor:{label:'Artista', plural:'Artistas', color:'#b5543c'},
    'técnica':{label:'Técnica', plural:'Técnicas', color:'#c8962e'},
    disciplina:{label:'Disciplina', plural:'Disciplinas', color:'#5b6fa6'},
    acervo:{label:'Acervo', plural:'Acervos', color:'#7a4e7e'},
    'década':{label:'Década', plural:'Décadas', color:'#4f8f84'}
  };
  const obras = n => n + (n === 1 ? ' obra' : ' obras');
  const typeInfo = type => TYPES[type] ?? {label:type, plural:type, color:'#6f6a66'};

  const entities = new Map(graph.nodes.map(node => [node.id, node]));
  const neighbors = new Map(graph.nodes.map(node => [node.id, []]));
  for (const edge of graph.edges) {
    neighbors.get(edge.source).push(entities.get(edge.target));
    neighbors.get(edge.target).push(entities.get(edge.source));
  }
  const requested = 'obra:' + new URLSearchParams(location.search).get('obra');
  const path = [entities.has(requested) ? requested : 'obra:MAM_13157'];
  const mobile = matchMedia('(max-width:720px)');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let cy;
  let paused = reducedMotion.matches;
  let hovering = false;
  let frame = 0;
  let lastTime = null;
  let phase = 0;
  let satellites;

  const element = (tag, text, className) => {
    const el = document.createElement(tag);
    if (text !== undefined && text !== null) el.textContent = text;
    if (className) el.className = className;
    return el;
  };
  const tag = type => {
    const span = element('span', typeInfo(type).label, 'tag');
    span.dataset.type = type;
    return span;
  };
  function thumbnail(node) {
    const img = element('img');
    img.src = node.image || FALLBACK;
    img.alt = '';
    img.loading = 'lazy';
    img.onerror = () => { img.onerror = null; img.src = FALLBACK; };
    return img;
  }

  /* ---------- Órbita animada ---------- */
  function animateOrbit(time) {
    if (lastTime !== null) {
      phase += Math.min(time - lastTime, 80) * Math.PI / 30000;
      cy.batch(() => satellites.forEach((node, index) => {
        const angle = phase + index * 2 * Math.PI / satellites.length;
        node.position({x:220 * Math.cos(angle), y:140 * Math.sin(angle)});
      }));
    }
    lastTime = time;
    frame = requestAnimationFrame(animateOrbit);
  }
  function syncOrbit() {
    cancelAnimationFrame(frame);
    lastTime = null;
    get('orbitToggle').textContent = paused ? '▶ Reanudar giro' : '❚❚ Pausar giro';
    if (cy && satellites.length && !paused && !hovering && !document.hidden) {
      frame = requestAnimationFrame(animateOrbit);
    }
  }
  get('orbitToggle').onclick = () => { paused = !paused; syncOrbit(); };
  reducedMotion.addEventListener('change', () => { paused = reducedMotion.matches; syncOrbit(); });
  document.addEventListener('visibilitychange', syncOrbit);

  /* ---------- Búsqueda ---------- */
  const queryInput = get('catalogQuery');
  const resultList = get('matches');
  const normalize = text => String(text ?? '').normalize('NFD')
    .replace(/[̀-ͯ]/g, '').toLowerCase().trim();
  const index = graph.nodes.map(node => {
    const attributes = node.type === 'obra' ? neighbors.get(node.id).map(item => item.label) : [];
    const fields = [node.label, node.type, typeInfo(node.type).label, node.artist, node.year, node.collection,
      node.description, node.identifiers?.local, node.identifiers?.sigropam, ...attributes];
    return {node, label:normalize(node.label), text:normalize(fields.join(' '))};
  });

  function closeSearch() {
    queryInput.value = '';
    resultList.replaceChildren();
    resultList.hidden = true;
    get('searchCount').textContent = '';
  }
  function search() {
    const query = normalize(queryInput.value);
    if (!query) {
      closeSearch();
      return;
    }
    const terms = query.split(/\s+/);
    const rank = entry => entry.label === query ? 0 : entry.label.startsWith(query) ? 1 :
      entry.label.includes(query) ? 2 : 3;
    const matches = index.filter(entry => terms.every(term => entry.text.includes(term)))
      .sort((a, b) => rank(a) - rank(b) || a.node.label.localeCompare(b.node.label, 'es'));
    const rows = document.createDocumentFragment();
    for (const {node} of matches) {
      const row = element('li');
      const button = element('button');
      button.type = 'button';
      const text = element('span');
      const context = node.type === 'obra'
        ? [node.artist, node.collection, node.year].filter(Boolean).join(' · ')
        : obras(neighbors.get(node.id).length) + (neighbors.get(node.id).length === 1 ? ' vinculada' : ' vinculadas');
      text.append(tag(node.type), element('strong', node.label), element('small', context));
      button.append(text);
      button.onclick = () => {
        closeSearch();
        path.length = 0;
        visit(node.id);
      };
      row.append(button);
      rows.append(row);
    }
    resultList.replaceChildren(rows);
    resultList.hidden = !matches.length;
    resultList.scrollTop = 0;
    get('searchCount').textContent = matches.length
      ? matches.length + (matches.length === 1 ? ' coincidencia' : ' coincidencias')
      : 'Sin coincidencias. Prueba con otro nombre o término.';
  }
  queryInput.disabled = false;
  queryInput.addEventListener('input', search);
  get('catalogSearch').onsubmit = event => {
    event.preventDefault();
    resultList.querySelector('button')?.click();
  };
  get('catalogSearch').onkeydown = event => {
    if (event.key === 'Escape') {
      closeSearch();
      queryInput.focus();
    }
  };
  document.addEventListener('click', event => {
    if (!get('catalogSearch').contains(event.target)) {
      resultList.hidden = true;
    }
  });
  queryInput.addEventListener('focus', () => { if (resultList.children.length) resultList.hidden = false; });

  /* ---------- Navegación ---------- */
  function visit(id) {
    path.push(id);
    render();
    const top = get('trail').getBoundingClientRect().top + scrollY - 90;
    if (scrollY > top) scrollTo({top, behavior:reducedMotion.matches ? 'auto' : 'smooth'});
    get('focus').focus({preventScroll:true});
  }

  function draw(current, items) {
    get('map').style.cursor = '';
    cancelAnimationFrame(frame);
    hovering = false;
    phase = 0;
    cy?.destroy();
    cy = null;
    get('map').hidden = !window.cytoscape || mobile.matches;
    get('orbitToggle').hidden = get('map').hidden || !items.length;
    if (get('map').hidden) return;
    const visible = items.slice(0, 8);
    const nodes = [current, ...visible].map((item, i) => {
      const angle = (i - 1) * 2 * Math.PI / visible.length;
      return {classes:i ? 'explorable' : 'central',
        data:{id:item.id, label:item.label, color:typeInfo(item.type).color},
        position:i ? {x:220 * Math.cos(angle), y:140 * Math.sin(angle)} : {x:0, y:0}};
    });
    cy = cytoscape({
      container:get('map'),
      elements:[...nodes, ...visible.map(item => ({data:{source:current.id, target:item.id}}))],
      layout:{name:'preset', padding:30}, userZoomingEnabled:false, userPanningEnabled:false, autoungrabify:true,
      style:[
        {selector:'node', style:{label:'data(label)', 'font-family':'Noto Sans, system-ui, sans-serif',
          'font-size':12, color:'#211a1c', 'text-wrap':'wrap', 'text-max-width':110, 'text-margin-y':-6,
          'text-background-color':'#faf7f2', 'text-background-opacity':.85, 'text-background-padding':2,
          'text-background-shape':'roundrectangle'}},
        {selector:'.central', style:{width:42, height:42, 'background-color':'data(color)',
          'border-width':6, 'border-color':'#8DC2B7', 'border-opacity':.55,
          'font-family':'Fraunces, Georgia, serif', 'font-size':15, 'font-weight':500, 'text-max-width':160}},
        {selector:'.explorable', style:{
          width:22, height:22, 'border-width':2, 'border-color':'data(color)', 'background-color':'#ffffff',
          'overlay-color':'data(color)', 'overlay-padding':6, 'overlay-opacity':0,
          'text-events':'yes',
          'transition-property':'overlay-opacity, background-color, width, height',
          'transition-duration':reducedMotion.matches ? 0 : 160
        }},
        {selector:'.explorable.highlight', style:{
          'overlay-opacity':0.14, 'background-color':'data(color)', width:28, height:28, 'font-weight':'bold'
        }},
        {selector:'edge', style:{width:1.2, 'line-color':'#cfc8ba', 'curve-style':'straight'}},
        {selector:'edge.highlight', style:{width:2.4, 'line-color':'#1e5b4f'}}
      ]
    });
    cy.fit({x1:-290, y1:-210, x2:290, y2:200}, 10);
    satellites = cy.nodes('.explorable');
    syncOrbit();
    function highlight(node, enabled) {
      hovering = enabled;
      syncOrbit();
      node.union(node.connectedEdges()).toggleClass('highlight', enabled);
      get('map').style.cursor = enabled ? 'pointer' : '';
    }
    cy.on('mouseover', 'node.explorable', event => highlight(event.target, true));
    cy.on('mouseout', 'node.explorable', event => highlight(event.target, false));
    cy.on('tap', 'node.explorable', event => {
      const id = event.target.id();
      if (id !== current.id) visit(id);
    });
  }

  function renderTrail() {
    const trail = get('trail');
    trail.replaceChildren(element('span', 'Recorrido:', 'trail-lbl'));
    path.forEach((id, i) => {
      if (i) trail.append(element('span', '›', 'sep'));
      const label = entities.get(id).label;
      if (i === path.length - 1) return trail.append(element('strong', label));
      const button = element('button', label);
      button.type = 'button';
      button.onclick = () => { path.splice(i + 1); render(); get('focus').focus({preventScroll:true}); };
      trail.append(button);
    });
  }

  function renderFocus(node, items) {
    const panel = get('focus');
    panel.dataset.type = node.type;
    panel.replaceChildren();
    if (node.type === 'obra') {
      const box = element('div', null, 'f-img');
      box.append(thumbnail(node));
      panel.append(box);
    } else {
      const box = element('div', null, 'f-icon');
      box.dataset.type = node.type;
      box.append(element('span', node.label.charAt(0)));
      panel.append(box);
    }
    const body = element('div', null, 'f-body');
    body.append(tag(node.type), element('h2', node.label));
    if (node.type === 'obra') {
      const meta = element('p', null, 'f-meta');
      meta.append(element('b', node.artist || 'Autor desconocido'),
        ' · ' + (node.year ?? 'Sin fecha') + ' · ' + node.collection);
      body.append(meta);
      const link = element('a', 'Ver ficha completa →', 'btn');
      link.href = 'detalle-obra.html?obra=' + encodeURIComponent(node.identifiers.local);
      body.append(link);
    } else {
      body.append(element('p', items.length + (items.length === 1 ? ' obra comparte' : ' obras comparten') +
        ' este atributo en el acervo.', 'f-count'));
    }
    panel.append(body);
  }

  function renderLinks(items) {
    const links = get('links');
    links.replaceChildren();
    for (const item of items) {
      const button = element('button');
      button.type = 'button';
      button.dataset.type = item.type;
      const body = element('span', null, 'l-body');
      if (item.type === 'obra') {
        const box = element('span', null, 'l-img');
        box.append(thumbnail(item));
        button.append(box);
        body.append(element('strong', item.label),
          element('small', [item.artist, item.year].filter(Boolean).join(' · ')));
      } else {
        button.classList.add('attr');
        body.append(tag(item.type), element('strong', item.label),
          element('small', obras(neighbors.get(item.id).length)));
      }
      button.append(body);
      button.onclick = () => visit(item.id);
      links.append(button);
    }
  }

  function renderLegend(items) {
    const legend = get('legend');
    legend.replaceChildren();
    for (const type of new Set(items.slice(0, 8).map(item => item.type))) legend.append(tag(type));
  }

  function render() {
    const node = entities.get(path[path.length - 1]);
    const items = neighbors.get(node.id);
    renderTrail();
    renderFocus(node, items);
    get('related').textContent = node.type === 'obra' ? 'Explora sus atributos' : 'Obras vinculadas';
    get('linksTitle').textContent = node.type === 'obra' ? 'Atributos de la obra' : 'Todas las obras';
    renderLinks(items);
    draw(node, items);
    renderLegend(get('map').hidden ? [] : items);
    get('status').textContent = items.length
      ? items.length + (items.length === 1 ? ' conexión' : ' conexiones') +
        (!get('map').hidden && items.length > 8 ? ' · el mapa muestra ocho' : '')
      : 'Aún sin conexiones registradas.';
  }
  mobile.addEventListener('change', render);
  render();
})();
