// Genera ambas distribuciones a partir de una única selección pública.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
global.window = {};
require(path.join(root, 'conexiones/datos.js'));
const nodes = new Map();
const edges = [];
const relations = [
  ['autor', 'autor', 'creada_por'],
  ['tecnica', 'técnica', 'realizada_con'],
  ['tipo', 'disciplina', 'tiene_disciplina'],
  ['museo', 'acervo', 'pertenece_a'],
  ['anio', 'década', 'fechada_en']
];
const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
for (const work of window.CONEXIONES_DATA) {
  const id = 'obra:' + work.file;
  nodes.set(id, {id, type:'obra', label:work.titulo, artist:work.autor, year:work.anio,
    collection:work.museo, image:work.img, description:work.descripcion,
    identifiers:{local:work.file, sigropam:work.file.split('_')[1], omekaS:null}});
  for (const [field, type, relation] of relations) {
    let label = work[field];
    if (field === 'anio') {
      if (!Number.isInteger(label)) continue;
      const start = Math.floor(label / 10) * 10;
      label = start + '–' + (start + 9);
    }
    if (!label || /sin identificar|sin especificar|desconocid|anonim|sin dato/.test(normalize(label))) continue;
    if (field === 'tecnica' && normalize(label) === normalize(work.tipo)) continue;
    const target = type + ':' + encodeURIComponent(normalize(label));
    if (!nodes.has(target)) {
      const entity = {id:target, type, label};
      if (type === 'autor') entity.authorities = {wikidata:null, ulan:null};
      if (type === 'técnica') entity.authorities = {wikidata:null, aat:null};
      nodes.set(target, entity);
    }
    edges.push({id:id+'|'+relation+'|'+target, source:id, target, type:relation, sourceField:field});
  }
}
const json = JSON.stringify({version:1, nodes:[...nodes.values()], edges}, null, 2);
const dir = path.join(root, 'conexiones/v2');
fs.writeFileSync(path.join(dir,'grafo.json'), json+'\n');
fs.writeFileSync(path.join(dir,'grafo.local.js'), 'window.GRAFO_INBAL = '+json+';\n');
