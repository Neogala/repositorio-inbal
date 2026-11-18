const fs=require('fs'),vm=require('vm');
const html=fs.readFileSync('detalle-obra.html','utf8');
const records=vm.runInNewContext(html.match(/const DATA=(\[[\s\S]*?\n  \]);/)[1]);
const dump=fs.readFileSync('outputs/mam_integracion/Obras_MAM.xlsx.inspect.ndjson','utf8').trim().split('\n').map(l=>JSON.parse(l));
const table=dump.find(x=>x.kind==='table'&&x.sheet==='Obras');
const descriptions=new Map((table?.values.slice(1)||[]).map(r=>[String(r[0]),r[11]]));
fs.writeFileSync('conexiones/datos.js','window.CONEXIONES_DATA='+JSON.stringify(records.map(r=>({...r,descripcion:r.museo==='MAM'?(descriptions.get(r.file.split('_')[1])||''):'',img:r.img||(['webp','jpg'].map(ext=>`Img/obras/${r.file}.${ext}`).find(p=>fs.existsSync(p)))||'Img/obras/_sin-imagen.svg'})))+';\n');
console.log(records.length+' obras; '+records.filter(r=>r.museo==='MAM'&&descriptions.has(r.file.split('_')[1])).length+' descripciones');
