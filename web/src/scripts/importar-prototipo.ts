/**
 * Importa las 152 obras del prototipo (arreglo DATA de colecciones.html) con
 * sus imágenes de prototipo/Img/obras. Es idempotente: actualiza por No. SIGROPAM.
 *
 * Uso: npm run importar:prototipo
 *
 * Es un paso provisional para tener datos reales en pantalla; el importador
 * definitivo lee el Excel de SIGROPAM (semana 2 del plan).
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getPayload } from 'payload'

import config from '../payload.config'
import { MUSEOS, PERIODOS, TIPOS } from '../collections/Obras'

type ObraPrototipo = {
  id: number
  file: string
  museo: string
  titulo: string
  autor: string
  anio: number | null
  periodo: string
  tipo: string
  tecnica: string
  conImagen?: boolean
}

const dirname = path.dirname(fileURLToPath(import.meta.url))
const raiz = path.resolve(dirname, '../../..')
const html = path.join(raiz, 'prototipo/colecciones.html')
const dirImagenes = path.join(raiz, 'prototipo/Img/obras')

function leerDatos(): ObraPrototipo[] {
  const src = fs.readFileSync(html, 'utf8')
  const inicio = src.indexOf('const DATA = [')
  if (inicio < 0) throw new Error('No se encontró el arreglo DATA en prototipo/colecciones.html')
  const desde = src.indexOf('[', inicio)
  const hasta = src.indexOf('];', desde) + 1
  // El arreglo es un literal de JS del propio repositorio, no entrada externa.
  return new Function(`return ${src.slice(desde, hasta)}`)() as ObraPrototipo[]
}

const museosValidos = new Set<string>(MUSEOS.map((m) => m.value))
const periodosValidos = new Set<string>(PERIODOS)
const tiposValidos = new Set<string>(TIPOS)

async function main() {
  const payload = await getPayload({ config })
  const datos = leerDatos()
  let creadas = 0
  let actualizadas = 0
  const avisos: string[] = []

  for (const o of datos) {
    const [clave, sigropam] = o.file.split('_')
    if (!sigropam || !museosValidos.has(clave)) {
      avisos.push(`${o.file}: nombre de archivo inesperado, se omite`)
      continue
    }

    let imagenId: number | undefined
    const conImagen = o.conImagen !== false
    const archivo = path.join(dirImagenes, `${o.file}.jpg`)
    if (conImagen && fs.existsSync(archivo)) {
      const existente = await payload.find({
        collection: 'media',
        where: { filename: { equals: `${o.file}.jpg` } },
        limit: 1,
        depth: 0,
      })
      imagenId =
        existente.docs[0]?.id ??
        (
          await payload.create({
            collection: 'media',
            data: { alt: `${o.titulo}, ${o.autor}` },
            filePath: archivo,
          })
        ).id
    } else if (conImagen) {
      avisos.push(`${o.file}: falta ${o.file}.jpg`)
    }

    const data = {
      sigropam,
      titulo: o.titulo,
      autor: o.autor,
      fechaTexto: o.anio != null ? String(o.anio) : 'S/F',
      anioInicio: o.anio ?? null,
      anioFin: o.anio ?? null,
      periodo: periodosValidos.has(o.periodo) ? (o.periodo as (typeof PERIODOS)[number]) : null,
      tipo: tiposValidos.has(o.tipo) ? (o.tipo as (typeof TIPOS)[number]) : null,
      museo: clave as (typeof MUSEOS)[number]['value'],
      tecnica: o.tecnica,
      imagen: imagenId ?? null,
      origen: 'prototipo' as const,
      publicada: true,
    }

    const previa = await payload.find({
      collection: 'obras',
      where: { sigropam: { equals: sigropam } },
      limit: 1,
      depth: 0,
    })
    if (previa.docs[0]) {
      await payload.update({ collection: 'obras', id: previa.docs[0].id, data })
      actualizadas++
    } else {
      await payload.create({ collection: 'obras', data })
      creadas++
    }
  }

  console.log(`Obras: ${creadas} creadas, ${actualizadas} actualizadas, ${datos.length} leídas`)
  avisos.forEach((a) => console.log(`Aviso: ${a}`))
  process.exit(0)
}

// `payload run` cierra el proceso al terminar de importar este módulo,
// así que hay que esperar aquí mismo.
try {
  await main()
} catch (err) {
  console.error(err)
  process.exit(1)
}
