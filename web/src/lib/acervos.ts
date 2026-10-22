// Acervos desde el CMS (colección "acervos").
import { getPayload } from 'payload'
import { cache } from 'react'

import config from '@/payload.config'
import type { Acervo as AcervoDoc, Media } from '@/payload-types'

export type Acervo = {
  slug: string
  nombre: string
  siglas: string
  rgb: string
  zona: string
  totalObras: number
  digitalizadas: number
  fundacion: number
  imagen: string | null
  semblanza: string
  direccion: string
  // Clave del acervo en la colección Obras (MUNAL, MAM, MUNAE, MNSC) o null si aún no tiene obras cargadas.
  claveObras: string | null
  curaduria: {
    titulo: string
    intro: string
    autoria: string
    numObras: number
    imagen: { src: string; alt: string } | null
    extras: { src: string; alt: string }[]
  }
}

const url = (m: unknown): string | null => (m && typeof m === 'object' ? ((m as Media).url ?? null) : null)
const conAlt = (m: unknown) =>
  m && typeof m === 'object' && (m as Media).url ? { src: (m as Media).url!, alt: (m as Media).alt } : null

export function aAcervo(d: AcervoDoc): Acervo {
  return {
    slug: d.slug,
    nombre: d.nombre,
    siglas: d.siglas,
    rgb: d.color ?? '30,91,79',
    zona: d.zona ?? '',
    totalObras: d.totalObras ?? 0,
    digitalizadas: d.digitalizadas ?? 0,
    fundacion: d.fundacion ?? 0,
    imagen: url(d.imagen),
    semblanza: d.semblanza,
    direccion: d.direccion ?? '',
    claveObras: d.claveObras ?? null,
    curaduria: {
      titulo: d.curaduria?.titulo ?? '',
      intro: d.curaduria?.intro ?? '',
      autoria: d.curaduria?.autoria ?? '',
      numObras: d.curaduria?.numObras ?? 0,
      imagen: conAlt(d.curaduria?.imagen),
      extras: (d.curaduria?.extras ?? []).map(conAlt).filter((x): x is { src: string; alt: string } => Boolean(x)),
    },
  }
}

export const listarAcervos = cache(async (): Promise<Acervo[]> => {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'acervos',
    sort: 'orden',
    pagination: false,
    depth: 1,
    overrideAccess: false,
  })
  return docs.map(aAcervo)
})

export async function acervoPorSlug(slug: string): Promise<Acervo | undefined> {
  return (await listarAcervos()).find((a) => a.slug === slug)
}

export async function acervoPorClave(clave: string): Promise<Acervo | undefined> {
  return (await listarAcervos()).find((a) => a.claveObras === clave)
}
