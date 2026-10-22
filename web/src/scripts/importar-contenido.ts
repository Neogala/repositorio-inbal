/**
 * Pasa el contenido editorial del prototipo (acervos, curadurías con sus
 * recorridos, audios y la página de inicio) del código a la base del CMS.
 * Es idempotente: actualiza por slug y no duplica imágenes.
 *
 * Uso: npm run importar:contenido   (después de importar:prototipo)
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getPayload, type Payload } from 'payload'

import { avisarAlSitio } from '../lib/avisar-sitio'
import config from '../payload.config'
import acervosDatos from './datos/acervos.json'
import curaduriasDatos from './datos/curadurias.json'
import mujer from './datos/recorridos/la-mujer-en-el-arte-mexicano.json'
import paisaje from './datos/recorridos/paisaje-y-territorio.json'
import { ACCESOS, CIFRAS, DESTACADAS, ACERVOS_GALERIA, OBRAS_HERO, RECURSOS } from './datos/contenido-home'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const web = path.resolve(dirname, '../..')
const prototipo = path.resolve(web, '../prototipo')
// Archivos originales del contenido editorial. No se sirven ni se despliegan: solo
// los lee este script para subirlos al CMS.
const semillas = path.resolve(web, 'semillas')

const payload: Payload = await getPayload({ config })
const opciones = { overrideAccess: true, depth: 0 } as const

// ---------- Imágenes ----------
const cacheMedia = new Map<string, number>()

// "MAM_13157" -> imagen de la obra en el catálogo, si existe.
async function imagenDeObra(archivo: string): Promise<number | null> {
  const sigropam = archivo.match(/^[A-Za-z]+_(\d+)$/)?.[1]
  if (!sigropam) return null
  const { docs } = await payload.find({ collection: 'obras', where: { sigropam: { equals: sigropam } }, limit: 1, ...opciones })
  const img = docs[0]?.imagen
  return typeof img === 'number' ? img : null
}

// Busca o sube una imagen. `ruta` puede ser "/img/..." (semillas/) o un nombre de obra.
async function imagen(ruta: string, alt: string): Promise<number | null> {
  const nombre = path.basename(ruta).replace(/\.[^.]+$/, '')
  if (cacheMedia.has(nombre)) return cacheMedia.get(nombre)!
  const deObra = await imagenDeObra(nombre)
  if (deObra) {
    cacheMedia.set(nombre, deObra)
    return deObra
  }
  const candidatos = [
    path.join(semillas, ruta),
    path.join(prototipo, 'Img/obras', `${nombre}.jpg`),
    path.join(prototipo, 'img_heroe', `${nombre}.jpg`),
    path.join(semillas, 'img/home/hero', `${nombre}.jpg`),
  ]
  const archivo = candidatos.find((c) => fs.existsSync(c) && fs.statSync(c).isFile())
  if (!archivo) {
    console.log(`Aviso: no se encontró la imagen ${ruta}`)
    return null
  }
  const existente = await payload.find({
    collection: 'media',
    where: { filename: { equals: path.basename(archivo) } },
    limit: 1,
    ...opciones,
  })
  const id =
    existente.docs[0]?.id ?? (await payload.create({ collection: 'media', data: { alt }, filePath: archivo, ...opciones })).id
  cacheMedia.set(nombre, id)
  return id
}

async function audio(ruta: string | null, titulo: string): Promise<number | null> {
  if (!ruta) return null
  const archivo = path.join(semillas, ruta)
  if (!fs.existsSync(archivo)) return null
  const filename = `${path.basename(path.dirname(archivo))}-${path.basename(archivo)}`
  const existente = await payload.find({ collection: 'audios', where: { titulo: { equals: titulo } }, limit: 1, ...opciones })
  if (existente.docs[0]) return existente.docs[0].id
  const temporal = path.join(path.dirname(archivo), filename)
  fs.copyFileSync(archivo, temporal)
  try {
    return (await payload.create({ collection: 'audios', data: { titulo }, filePath: temporal, ...opciones })).id
  } finally {
    fs.rmSync(temporal, { force: true })
  }
}

async function upsert<T extends 'acervos' | 'curadurias'>(coleccion: T, slug: string, data: Record<string, unknown>) {
  const previa = await payload.find({ collection: coleccion, where: { slug: { equals: slug } }, limit: 1, ...opciones })
  if (previa.docs[0]) {
    await payload.update({ collection: coleccion, id: previa.docs[0].id, data: data as never, ...opciones })
    return previa.docs[0].id as number
  }
  return (await payload.create({ collection: coleccion, data: data as never, ...opciones })).id as number
}

async function obraPorArchivo(archivo: string): Promise<number | null> {
  const sigropam = archivo.split('_')[1]
  const { docs } = await payload.find({ collection: 'obras', where: { sigropam: { equals: sigropam } }, limit: 1, ...opciones })
  return docs[0]?.id ?? null
}

// ---------- Acervos ----------
const idsAcervo = new Map<string, number>()
for (const [i, a] of acervosDatos.entries()) {
  const id = await upsert('acervos', a.slug, {
    slug: a.slug,
    nombre: a.nombre,
    siglas: a.siglas,
    zona: a.zona,
    semblanza: a.semblanza,
    direccion: a.direccion,
    totalObras: a.totalObras,
    digitalizadas: a.digitalizadas,
    fundacion: a.fundacion,
    color: a.rgb,
    claveObras: a.claveObras,
    orden: (i + 1) * 10,
    imagen: a.imagen ? await imagen(a.imagen, a.nombre) : null,
    curaduria: {
      titulo: a.curaduria.titulo,
      intro: a.curaduria.intro,
      autoria: a.curaduria.autoria,
      numObras: a.curaduria.numObras,
      imagen: a.curaduria.imagen ? await imagen(a.curaduria.imagen.src, a.curaduria.imagen.alt) : null,
      extras: (await Promise.all(a.curaduria.extras.map((e) => imagen(e.src, e.alt)))).filter(Boolean),
    },
  })
  idsAcervo.set(a.slug, id)
}
console.log(`Acervos: ${idsAcervo.size}`)

// ---------- Curadurías ----------
type Recorrido = typeof mujer
const RECORRIDOS: Record<string, Recorrido> = {
  'la-mujer-en-el-arte-mexicano': mujer,
  'paisaje-y-territorio': paisaje as unknown as Recorrido,
}

const idsCuraduria = new Map<string, number>()
for (const [i, c] of curaduriasDatos.entries()) {
  const slug = c.slug ?? c.id
  const r = c.slug ? RECORRIDOS[c.slug] : undefined
  const recorrido = r
    ? {
        subtitulo: r.subtitulo,
        fecha: r.fecha,
        notaSala: { titulo: r.intro.titulo, texto: r.intro.texto },
        capitulos: await Promise.all(
          r.chapters.map(async (ch) => ({
            num: ch.num,
            titulo: ch.titulo,
            paradas: await Promise.all(
              ch.stops.map(async (s) => ({
                obra: await obraPorArchivo(s.file),
                titulo: s.titulo,
                autor: s.autor,
                anio: s.anio,
                texto: s.texto,
                detalles: s.beats.map((b: { x: number; y: number; zoom: number; caption: string; nota?: string }) => ({
                  x: b.x,
                  y: b.y,
                  zoom: b.zoom,
                  caption: b.caption,
                  nota: b.nota ?? null,
                })),
              })),
            ),
            interludio: !('outro' in ch) || !ch.outro
              ? { tipo: 'ninguno' }
              : ch.outro.type === 'quote'
                ? { tipo: 'cita', texto: (ch.outro as { text: string }).text, por: (ch.outro as { by: string }).by }
                : {
                    tipo: 'contexto',
                    titulo: (ch.outro as { titulo: string }).titulo,
                    texto: (ch.outro as { texto: string }).texto,
                  },
          })),
        ),
        cierre: { titulo: r.closing.titulo, texto: r.closing.texto, firma: r.closing.sig },
        creditos: { textos: r.credits.textos, musica: r.credits.musica, imagenes: r.credits.imagenes },
        musica: await audio(r.audio.musica, `${c.titulo} · música`),
        audioguia: await audio(r.audio.audioguia, `${c.titulo} · audioguía`),
      }
    : {}
  const id = await upsert('curadurias', slug, {
    slug,
    titulo: c.titulo,
    intro: c.intro,
    acervo: c.acervo,
    tema: c.tema,
    curador: c.curador,
    numObras: c.numObras,
    destacada: c.destacada,
    publicada: true,
    orden: (i + 1) * 10,
    portada: await imagen(c.portada, c.titulo),
    portadaSecundaria: c.portadaHero ? await imagen(c.portadaHero, c.titulo) : null,
    ...recorrido,
  })
  idsCuraduria.set(slug, id)
}
// Relacionadas: se resuelven cuando ya existen todas.
for (const [slug, r] of Object.entries(RECORRIDOS)) {
  const relacionadas = r.relacionadas
    .map((rel) => curaduriasDatos.find((c) => c.titulo === rel.titulo))
    .map((c) => (c ? idsCuraduria.get(c.slug ?? c.id) : undefined))
    .filter(Boolean)
  await payload.update({ collection: 'curadurias', id: idsCuraduria.get(slug)!, data: { relacionadas } as never, ...opciones })
}
console.log(`Curadurías: ${idsCuraduria.size}`)

// ---------- Inicio ----------
const portadaObras = (await Promise.all(OBRAS_HERO.map((o) => imagen(o.src, o.alt)))).filter(Boolean)
await payload.updateGlobal({
  slug: 'inicio',
  ...opciones,
  data: {
    portadaObras,
    portadaInicial: await imagen('/img/home/hero/MAM_13154.jpg', 'Los cocos, Frida Kahlo'),
    accesos: await Promise.all(
      ACCESOS.map(async (a) => ({
        titulo: a.titulo,
        descripcion: a.descripcion,
        enlace: a.href,
        color: a.rgb,
        imagen: await imagen(a.imagen, a.alt),
      })),
    ),
    curaduriaInaugural: idsCuraduria.get('la-mujer-en-el-arte-mexicano') ?? null,
    curaduriaImagen: await imagen('/img/home/mujer-arte-mexicano.jpg', 'La mujer en el arte mexicano'),
    destacadas: (
      await Promise.all(
        DESTACADAS.map(async (d) => {
          const { docs } = await payload.find({ collection: 'obras', where: { sigropam: { equals: d.sigropam } }, limit: 1, ...opciones })
          return docs[0] ? { obra: docs[0].id, columnas: d.columnas, alto: d.alto } : null
        }),
      )
    ).filter(Boolean),
    acervosGaleria: ACERVOS_GALERIA.map((a) => idsAcervo.get(a.slug)).filter(Boolean),
    recursos: RECURSOS.map((r) => ({ icono: r.icono, titulo: r.titulo, texto: r.texto, enlace: r.href })),
    cifras: CIFRAS,
  } as never,
})
console.log(`Inicio: ${portadaObras.length} obras de portada`)
await avisarAlSitio()
process.exit(0)
