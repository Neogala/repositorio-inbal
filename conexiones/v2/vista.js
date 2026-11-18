(() => {
  const get = id => document.getElementById(id);
  const graph = window.GRAFO_INBAL;
  if (!graph?.nodes?.length || !Array.isArray(graph.edges)) {
    get('status').textContent = 'No se pudieron cargar las fichas del acervo. Comprueba que la carpeta conexiones acompaña al archivo.';
    return;
  }
  const entities = new Map(graph.nodes.map(node => [node.id, node]));
  const neighbors = new Map(graph.nodes.map(node => [node.id, []]));
  for (const edge of graph.edges) {
    neighbors.get(edge.source).push(entities.get(edge.target));
    neighbors.get(edge.target).push(entities.get(edge.source));
  }
  const requested = 'obra:' + new URLSearchParams(location.search).get('obra');
  const path = [entities.has(requested) ? requested : 'obra:MAM_13157'];
  const mobile = matchMedia('(max-width:720px)');
  let cy;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let paused = reducedMotion.matches;
  let hovering = false;
  let frame = 0;
  let lastTime = null;
  let phase = 0;
  let satellites;

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
    get('orbitToggle').textContent = paused ? 'Reanudar giro' : 'Pausar giro';
    if (cy && satellites.length && !paused && !hovering && !document.hidden) {
      frame = requestAnimationFrame(animateOrbit);
    }
  }
  get('orbitToggle').onclick = () => { paused = !paused; syncOrbit(); };
  reducedMotion.addEventListener('change', () => { paused = reducedMotion.matches; syncOrbit(); });
  document.addEventListener('visibilitychange', syncOrbit);
  const element = (tag, text) => {
    const el = document.createElement(tag);
    if (text !== undefined) el.textContent = text;
    return el;
  };
  const queryInput = get('catalogQuery');
  const resultList = get('matches');
  const normalize = text => String(text ?? '').normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  const index = graph.nodes.map(node => {
    const attributes = node.type === 'obra' ? neighbors.get(node.id).map(item => item.label) : [];
    const fields = [node.label, node.type, node.artist, node.year, node.collection,
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
      const context = node.type === 'obra' ? [node.type, node.artist, node.collection, node.year].filter(Boolean).join(' · ') : node.type;
      button.append(element('strong', node.label), element('small', context));
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

  function thumbnail(node) {
    const img = element('img');
    img.src = node.image;
    img.alt = '';
    img.loading = 'lazy';
    return img;
  }
  function visit(id) {
    path.push(id);
    render();
    get('focus').focus();
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
      return {classes:i ? 'explorable' : 'central', data:{id:item.id, label:item.label}, position:i
        ? {x:220 * Math.cos(angle), y:140 * Math.sin(angle)} : {x:0,y:0}};
    });
    cy = cytoscape({
      container:get('map'),
      elements:[...nodes, ...visible.map(item => ({data:{source:current.id,target:item.id}}))],
      layout:{name:'preset',padding:30}, userZoomingEnabled:false, autoungrabify:true,
      style:[
        {selector:'node',style:{label:'data(label)','background-color':'#1e5b4f',
          'font-size':13,'text-wrap':'wrap','text-max-width':105,'text-margin-y':-5}},
        {selector:'.explorable',style:{
          'border-width':2, 'border-color':'#1e5b4f', 'background-color':'#e4f1ec',
          'overlay-color':'#1e5b4f', 'overlay-padding':6, 'overlay-opacity':0,
          'text-events':'yes',
          'transition-property':'overlay-opacity, background-color',
          'transition-duration':matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 140
        }},
        {selector:'.explorable.highlight',style:{
          'overlay-opacity':0.16, 'background-color':'#9acdbd', 'font-weight':'bold'
        }},
        {selector:'.explorable:active',style:{'background-color':'#1e5b4f','overlay-opacity':0.24}},
        {selector:'edge',style:{width:1,'line-color':'#a2afa6'}},
        {selector:'edge.highlight',style:{width:2,'line-color':'#1e5b4f'}}
      ]
    });
    // Fit the full orbit even when only one or two neighbors are visible.
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
  function render() {
    const node = entities.get(path[path.length - 1]);
    const items = neighbors.get(node.id);
    const trail = get('trail');
    trail.replaceChildren();
    path.forEach((id,i) => {
      if (i) trail.append(' › ');
      const label = entities.get(id).label;
      if (i === path.length - 1) return trail.append(element('strong',label));
      const button = element('button',label);
      button.onclick = () => { path.splice(i + 1); render(); get('focus').focus(); };
      trail.append(button);
    });
    const panel = get('focus');
    panel.replaceChildren();
    if (node.image) panel.append(thumbnail(node));
    panel.append(element('small',node.type.toUpperCase()),element('h2',node.label));
    if (node.type === 'obra') {
      panel.append(element('p',[node.artist,node.year ?? 'Sin fecha',node.collection].join(' · ')));
      const link = element('a','Ver ficha completa →');
      link.href = 'detalle-obra.html?obra=' + encodeURIComponent(node.identifiers.local);
      panel.append(link);
    }
    get('related').textContent = node.type === 'obra' ? 'Explora sus atributos' : 'Obras vinculadas';
    const links = get('links');
    links.replaceChildren();
    for (const item of items) {
      const button = element('button');
      if (item.image) button.append(thumbnail(item));
      button.append(element('small',item.type === 'obra' ? item.collection : item.type),
        element('strong',item.label));
      button.onclick = () => visit(item.id);
      links.append(button);
    }
    draw(node,items);
    get('status').textContent = items.length
      ? items.length + ' conexiones disponibles.' + (!get('map').hidden && items.length > 8 ? ' El grafo muestra ocho. Todas están en la lista.' : '')
      : 'Esta entidad aún no tiene conexiones registradas.';
  }
  mobile.addEventListener('change',render);
  render();
})();
