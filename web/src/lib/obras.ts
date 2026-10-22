// Fuente de obras para el sitio. Las páginas solo usan buscar, obtener y facetas;
// en la Fase 2 ARCA se sincroniza a la misma colección y esto no cambia.
import { sql } from '@payloadcms/db-postgres/drizzle'
import { unstable_cache } from 'next/cache'
import { getPayload, type Where } from 'payload'
import { cache } from 'react'

import { MUSEOS, PERIODOS, TIPOS } from '@/collections/Obras'
import { ETIQUETA_OBRAS } from '@/hooks/revalidar'
import { normalizar } from '@/lib/normalizar'
import { drizzleDe } from '@/lib/sql'
import type { FiltrosObras, Orden } from '@/lib/filtros-obras'
import config from '@/payload.config'
import type { Media, Obra } from '@/payload-types'

export const POR_PAGINA = 24

const ORDEN_PAYLOAD: Record<Orden, string> = {
  artista: 'autor',
  'anio-asc': 'anioInicio',
  'anio-desc': '-anioInicio',
  recientes: '-createdAt',
}

// Lo único que piden las tarjetas de obra: sin el resto de la ficha, sin el usuario
// que la editó y de la imagen solo URL, medidas y tamaños.
export const SELECT_TARJETA = {
  sigropam: true,
  titulo: true,
  autor: true,
  museo: true,
  tipo: true,
  fechaTexto: true,
  derechos: true,
  imagen: true,
} as const
// Payload arma url a partir de filename, así que hay que pedir los dos.
export const POPULATE_IMAGEN = {
  media: { url: true, filename: true, alt: true, width: true, height: true, sizes: true },
} as const
export type ObraResumen = Pick<Obra, 'id' | keyof typeof SELECT_TARJETA>

async function cliente() {
  return getPayload({ config })
}

function construirWhere(f: FiltrosObras): Where {
  const and: Where[] = [{ publicada: { equals: true } }]

  if (f.q) {
    and.push({
      or: [{ busqueda: { like: normalizar(f.q) } }, { sigropam: { equals: f.q } }],
    })
  }
  if (f.periodos.length) and.push({ periodo: { in: f.periodos } })
  if (f.tipos.length) and.push({ tipo: { in: f.tipos } })
  if (f.museos.length) and.push({ museo: { in: f.museos } })
  if (f.artistas.length) and.push({ autor: { in: f.artistas } })
  if (f.tecnicas.length) and.push({ tecnica: { in: f.tecnicas } })
  // Una obra entra al rango si su periodo de fechas se cruza con él.
  if (f.desde != null) and.push({ anioFin: { greater_than_equal: f.desde } })
  if (f.hasta != null) and.push({ anioInicio: { less_than_equal: f.hasta } })
  if (f.conImagen) {
    and.push({ imagen: { exists: true } }, { derechos: { not_equals: 'restringida' } })
  }

  return { and }
}

export async function buscar(f: FiltrosObras) {
  const payload = await cliente()
  return payload.find({
    collection: 'obras',
    where: construirWhere(f),
    // El id desempata (muchas obras comparten autor) para que la paginación sea estable.
    sort: [ORDEN_PAYLOAD[f.orden], 'id'],
    page: f.pagina,
    limit: POR_PAGINA,
    depth: 1,
    select: SELECT_TARJETA,
    populate: POPULATE_IMAGEN,
    overrideAccess: false,
  })
}

export const obtener = cache(async (sigropam: string): Promise<Obra | null> => {
  const payload = await cliente()
  const r = await payload.find({
    collection: 'obras',
    where: { and: [{ sigropam: { equals: sigropam } }, { publicada: { equals: true } }] },
    limit: 1,
    depth: 1,
    overrideAccess: false,
  })
  return r.docs[0] ?? null
})

export type Opcion = { valor: string; etiqueta: string; total: number }

export type Facetas = {
  periodos: Opcion[]
  tipos: Opcion[]
  museos: Opcion[]
  artistas: Opcion[]
  tecnicas: Opcion[]
  anioMin: number | null
  anioMax: number | null
  total: number
  conImagen: number
}

type Conteo = {
  campo: 'periodo' | 'tipo' | 'museo' | 'autor' | 'tecnica'
  valor: string
  total: number
}
type Resumen = {
  anio_min: number | null
  anio_max: number | null
  total: number
  con_imagen: number
}

// Conteos del catálogo publicado con GROUP BY en Postgres. Se guarda en la caché de
// Next con la etiqueta "obras", que los hooks invalidan al guardar o importar.
const contarCatalogo = unstable_cache(
  async () => {
    const payload = await cliente()
    const db = drizzleDe(payload)
    const porCampo = (campo: Conteo['campo']) => sql`
      SELECT ${sql.raw(`'${campo}'`)} AS campo, ${sql.identifier(campo)}::text AS valor, count(*)::int AS total
      FROM obras WHERE publicada AND ${sql.identifier(campo)} IS NOT NULL
      GROUP BY ${sql.identifier(campo)}`
    const [conteos, resumen] = await Promise.all([
      db.execute(
        sql.join(
          (['periodo', 'tipo', 'museo', 'autor', 'tecnica'] as const).map(porCampo),
          sql` UNION ALL `,
        ),
      ),
      db.execute(sql`
        SELECT min(least(anio_inicio, anio_fin))::float8 AS anio_min,
               max(greatest(anio_inicio, anio_fin))::float8 AS anio_max,
               count(*)::int AS total,
               count(imagen_id) FILTER (WHERE derechos IS DISTINCT FROM 'restringida')::int AS con_imagen
        FROM obras WHERE publicada`),
    ])
    return { conteos: conteos.rows as Conteo[], resumen: resumen.rows[0] as Resumen }
  },
  ['catalogo-obras'],
  { tags: [ETIQUETA_OBRAS] },
)

// Opciones de filtro con su conteo sobre todo el catálogo publicado.
export const facetas = cache(async (): Promise<Facetas> => {
  const { conteos, resumen } = await contarCatalogo()
  const de = (campo: Conteo['campo']) =>
    new Map(conteos.filter((c) => c.campo === campo).map((c) => [c.valor, c.total]))
  const ordenadas = (m: Map<string, number>): Opcion[] =>
    [...m.entries()]
      .sort(([a], [b]) => a.localeCompare(b, 'es'))
      .map(([valor, total]) => ({ valor, etiqueta: valor, total }))
  const enOrden = (lista: readonly string[], m: Map<string, number>): Opcion[] =>
    lista.filter((v) => m.has(v)).map((v) => ({ valor: v, etiqueta: v, total: m.get(v)! }))

  const porMuseo = de('museo')
  return {
    periodos: enOrden(PERIODOS, de('periodo')),
    tipos: enOrden(TIPOS, de('tipo')),
    museos: MUSEOS.filter((m) => porMuseo.has(m.value)).map((m) => ({
      valor: m.value,
      etiqueta: etiquetaCortaMuseo(m.value),
      total: porMuseo.get(m.value)!,
    })),
    artistas: ordenadas(de('autor')),
    tecnicas: ordenadas(de('tecnica')),
    anioMin: resumen.anio_min,
    anioMax: resumen.anio_max,
    total: resumen.total,
    conImagen: resumen.con_imagen,
  }
})

// Las n opciones con más obras (en orden alfabético) más las ya elegidas.
export function masFrecuentes(opciones: Opcion[], elegidas: string[], n = 30): Opcion[] {
  const top = new Set(
    [...opciones]
      .sort((a, b) => b.total - a.total)
      .slice(0, n)
      .map((o) => o.valor),
  )
  return opciones.filter((o) => top.has(o.valor) || elegidas.includes(o.valor))
}

// Nombre corto para filtros y tarjetas; las siglas cuando son conocidas.
const CORTAS: Record<string, string> = {
  MNSC: 'San Carlos',
  CAPILLA: 'Capilla Alfonsina',
  MCEDRFK: 'Casa Estudio DR y FK',
  MCDR: 'Casa Diego Rivera',
  MNARQ: 'Arquitectura',
}

export function etiquetaCortaMuseo(clave: string): string {
  return CORTAS[clave] ?? clave
}

export function nombreMuseo(clave: string): string {
  return MUSEOS.find((m) => m.value === clave)?.label ?? clave
}

// Imagen a mostrar, o null si no hay o si los derechos no lo permiten.
export function imagenDe(
  obra: Pick<Obra, 'titulo' | 'autor' | 'derechos' | 'imagen'>,
  tamano: 'miniatura' | 'ficha',
): { src: string; width: number; height: number; alt: string } | null {
  if (obra.derechos === 'restringida') return null
  const media = obra.imagen as Media | null | undefined
  if (!media || typeof media !== 'object' || !media.url) return null
  const t = media.sizes?.[tamano]
  const src = t?.url ?? media.url
  const width = t?.width ?? media.width ?? 800
  const height = t?.height ?? media.height ?? 600
  return { src, width, height, alt: media.alt || `${obra.titulo}, ${obra.autor}` }
}
