// Contenido del home desde el global "inicio" del CMS.
import { getPayload } from 'payload'

import type { AcervoGaleria } from '@/components/home/GaleriaAcervos'
import type { ObraHero } from '@/components/home/HeroMorph'
import { aAcervo } from '@/lib/acervos'
import config from '@/payload.config'
import type { Acervo, Curaduria, Media, Obra } from '@/payload-types'

const media = (m: unknown): Media | null =>
  m && typeof m === 'object' && (m as Media).url ? (m as Media) : null

// "MAM_10252.jpg" -> "MAM_10252"; la portada usa el prefijo como etiqueta del museo.
const idDe = (m: Media) => (m.filename ?? String(m.id)).replace(/\.[^.]+$/, '')

export async function obtenerInicio() {
  const payload = await getPayload({ config })
  const g = await payload.findGlobal({ slug: 'inicio', depth: 2, overrideAccess: false })

  const portada: ObraHero[] = (g.portadaObras ?? []).flatMap((x) => {
    const m = media(x)
    return m ? [{ id: idDe(m), src: m.sizes?.ficha?.url ?? m.url!, alt: m.alt }] : []
  })
  const inicial = media(g.portadaInicial)

  const accesos = (g.accesos ?? []).flatMap((a) => {
    const m = media(a.imagen)
    return m
      ? [
          {
            titulo: a.titulo,
            descripcion: a.descripcion ?? '',
            href: a.enlace || null,
            imagen: m.sizes?.ficha?.url ?? m.url!,
            alt: m.alt,
            rgb: a.color ?? '30,91,79',
          },
        ]
      : []
  })

  const c = g.curaduriaInaugural && typeof g.curaduriaInaugural === 'object' ? (g.curaduriaInaugural as Curaduria) : null
  const imagenCuraduria = media(g.curaduriaImagen) ?? media(c?.portada)
  const curaduria = c?.publicada
    ? {
        titulo: c.titulo,
        intro: c.intro,
        href: c.capitulos?.length ? `/curadurias/${c.slug}` : '/curadurias',
        imagen: imagenCuraduria ? { src: imagenCuraduria.url!, alt: imagenCuraduria.alt } : null,
      }
    : null

  const destacadas = (g.destacadas ?? []).flatMap((d) => {
    const obra = d.obra && typeof d.obra === 'object' ? (d.obra as Obra) : null
    return obra?.publicada ? [{ obra, columnas: d.columnas ?? 4, alto: d.alto ?? 'media' }] : []
  })

  const acervos: AcervoGaleria[] = (g.acervosGaleria ?? []).flatMap((x) => {
    if (!x || typeof x !== 'object') return []
    const a = aAcervo(x as Acervo)
    return [
      {
        slug: a.slug,
        nombre: a.nombre,
        clave: a.siglas,
        zona: a.zona,
        obras: a.totalObras.toLocaleString('es-MX'),
        imagen: a.imagen ?? '',
      },
    ]
  })

  return {
    portada,
    inicial: inicial ? idDe(inicial) : (portada[0]?.id ?? ''),
    accesos,
    curaduria,
    destacadas,
    acervos,
    recursos: (g.recursos ?? []).map((r) => ({
      icono: r.icono ?? '',
      titulo: r.titulo,
      texto: r.texto ?? '',
      href: r.enlace || '/investigacion',
    })),
    cifras: (g.cifras ?? []).map((x) => ({ valor: x.valor, texto: x.texto })),
  }
}
