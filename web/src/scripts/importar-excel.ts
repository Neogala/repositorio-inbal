/**
 * Importa obras desde un Excel exportado de SIGROPAM. Actualiza por No. SIGROPAM,
 * así que se puede correr las veces que haga falta.
 *
 * Uso:
 *   npm run importar:excel -- [archivo.xlsx] [escribir] [publicar]
 *
 *   archivo    por omisión ../datos/9_grandes_SIGROPAM.xlsx
 *   escribir   guarda en la base; sin esta palabra solo valida y deja el reporte
 *   publicar   publica las obras nuevas (si no, quedan ocultas para revisarlas);
 *              las del CENCROPAM nunca se publican solas
 *
 *   Son palabras sueltas y no --opciones: `payload run` se come las opciones.
 *
 * Deja un reporte CSV por fila (errores, avisos y descartadas) en web/reportes/.
 *
 * Reglas al actualizar una obra que ya existe:
 * - Si vino del Excel y nadie la ha editado en el panel, se reemplaza su ficha.
 * - Si vino del prototipo o alguien la editó, solo se completan los datos que
 *   faltan y los internos (medidas, localización, observaciones, originales).
 * - Nunca se cambian la imagen, los derechos ni si está publicada.
 */
import ExcelJS from 'exceljs'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getPayload } from 'payload'

import {
  COLUMNAS,
  normalizarFila,
  type ObraImportada,
  type Problema,
} from '../lib/importar/sigropam'
import config from '../payload.config'
import type { Obra } from '../payload-types'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const web = path.resolve(dirname, '../..')

const args = process.argv.slice(2)
const prueba = !args.includes('escribir')
const publicar = args.includes('publicar')
const archivo = path.resolve(
  process.cwd(),
  args.find((a) => /\.xlsx$/i.test(a)) ?? path.join(web, '../datos/9_grandes_SIGROPAM.xlsx'),
)

const sinAcentos = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()

// Valor de una celda de exceljs como texto o número.
function valor(v: ExcelJS.CellValue): unknown {
  if (v == null) return ''
  if (v instanceof Date) {
    const d = String(v.getUTCDate()).padStart(2, '0')
    const m = String(v.getUTCMonth() + 1).padStart(2, '0')
    return `${d}/${m}/${v.getUTCFullYear()}`
  }
  if (typeof v === 'object') {
    if ('richText' in v) return v.richText.map((t) => t.text).join('')
    if ('result' in v) return valor(v.result as ExcelJS.CellValue)
    if ('text' in v) return v.text
    return ''
  }
  return v
}

type Linea = {
  fila: number
  sigropam: string
  nivel: 'error' | 'aviso' | 'descartada' | 'duplicada'
  campo: string
  mensaje: string
}

const csv = (s: unknown) => `"${String(s ?? '').replace(/"/g, '""')}"`

async function leerExcel() {
  const libro = new ExcelJS.Workbook()
  await libro.xlsx.readFile(archivo)
  const hoja = libro.worksheets[0]

  // La fila de encabezados es la que trae "No_Sigropam" (entre las primeras).
  let filaEnc = 0
  const indices: Partial<Record<keyof typeof COLUMNAS, number>> = {}
  for (let r = 1; r <= Math.min(10, hoja.rowCount) && !filaEnc; r++) {
    const fila = hoja.getRow(r)
    fila.eachCell((celda, col) => {
      const t = sinAcentos(String(valor(celda.value)))
      for (const [campo, nombre] of Object.entries(COLUMNAS)) {
        if (t === sinAcentos(nombre)) indices[campo as keyof typeof COLUMNAS] = col
      }
    })
    if (indices.sigropam) filaEnc = r
  }
  const faltan = Object.keys(COLUMNAS).filter((c) => !indices[c as keyof typeof COLUMNAS])
  if (!filaEnc || faltan.length) {
    throw new Error(
      `Faltan columnas en el Excel: ${faltan.map((c) => COLUMNAS[c as keyof typeof COLUMNAS]).join(', ')}`,
    )
  }

  const filas: { fila: number; datos: Record<string, unknown> }[] = []
  for (let r = filaEnc + 1; r <= hoja.rowCount; r++) {
    const fila = hoja.getRow(r)
    if (!fila.hasValues) continue
    const datos: Record<string, unknown> = {}
    for (const [campo, col] of Object.entries(indices))
      datos[campo] = valor(fila.getCell(col!).value)
    filas.push({ fila: r, datos })
  }
  return filas
}

// Datos que se escriben en la base para una obra nueva o del Excel sin editar.
function ficha(o: ObraImportada) {
  return {
    sigropam: o.sigropam,
    titulo: o.titulo,
    autor: o.autor,
    autorMuerte: o.autorMuerte,
    fechaTexto: o.fechaTexto,
    anioInicio: o.anioInicio,
    anioFin: o.anioFin,
    fechaAproximada: o.fechaAproximada,
    periodo: o.periodo,
    tipo: o.tipo,
    tecnica: o.tecnica,
    altoCm: o.altoCm,
    anchoCm: o.anchoCm,
    profundidadCm: o.profundidadCm,
    museo: o.museo,
    ...internos(o),
  }
}

function internos(o: ObraImportada) {
  return { localizacion: o.localizacion, observaciones: o.observaciones, original: o.original }
}

// Para obras del prototipo o editadas: solo lo que falta.
function complemento(o: ObraImportada, actual: Obra) {
  const vacio = (v: unknown) => v == null || v === ''
  const datos: Record<string, unknown> = { ...internos(o) }
  const candidatos = {
    autorMuerte: o.autorMuerte,
    tecnica: o.tecnica,
    tipo: o.tipo,
    altoCm: o.altoCm,
    anchoCm: o.anchoCm,
    profundidadCm: o.profundidadCm,
  }
  for (const [k, v] of Object.entries(candidatos)) {
    if (vacio(actual[k as keyof Obra]) && !vacio(v)) datos[k] = v
  }
  // Una fecha mejor que "S/F".
  if (actual.anioInicio == null && o.anioInicio != null) {
    Object.assign(datos, {
      fechaTexto: o.fechaTexto,
      anioInicio: o.anioInicio,
      anioFin: o.anioFin,
      fechaAproximada: o.fechaAproximada,
      periodo: o.periodo,
    })
  }
  return datos
}

async function main() {
  console.log(
    `${prueba ? 'Prueba sin escribir (agrega "escribir" para guardar)' : 'Importación'}: ${path.relative(process.cwd(), archivo)}`,
  )
  const filas = await leerExcel()
  const reporte: Linea[] = []
  const anota = (fila: number, sigropam: string, nivel: Linea['nivel'], ps: Problema[]) =>
    ps.forEach((p) => reporte.push({ fila, sigropam, nivel, campo: p.campo, mensaje: p.mensaje }))

  // Validar y normalizar todo antes de escribir.
  const validas: { fila: number; obra: ObraImportada }[] = []
  const vistos = new Map<string, number>()
  let errores = 0
  let descartadas = 0
  for (const { fila, datos } of filas) {
    const r = normalizarFila(datos)
    if (r.estado === 'error') {
      errores++
      anota(fila, r.sigropam, 'error', r.errores)
    } else if (r.estado === 'descartada') {
      descartadas++
      anota(fila, r.sigropam, 'descartada', [{ campo: 'acervo', mensaje: r.motivo }])
    } else if (vistos.has(r.obra.sigropam)) {
      anota(fila, r.obra.sigropam, 'duplicada', [
        { campo: 'sigropam', mensaje: `Repetido; se usa la fila ${vistos.get(r.obra.sigropam)}` },
      ])
    } else {
      vistos.set(r.obra.sigropam, fila)
      anota(fila, r.obra.sigropam, 'aviso', r.avisos)
      validas.push({ fila, obra: r.obra })
    }
  }

  const payload = await getPayload({ config })
  const { docs: existentes } = await payload.find({
    collection: 'obras',
    pagination: false,
    depth: 0,
    where: { sigropam: { in: validas.map((v) => v.obra.sigropam) } },
  })
  const porSigropam = new Map(existentes.map((d) => [d.sigropam, d]))

  let creadas = 0
  let reemplazadas = 0
  let completadas = 0
  for (const { fila, obra } of validas) {
    const actual = porSigropam.get(obra.sigropam)
    try {
      if (!actual) {
        creadas++
        if (!prueba) {
          await payload.create({
            collection: 'obras',
            data: {
              ...ficha(obra),
              derechos: obra.derechos,
              origen: 'excel',
              publicada: publicar && obra.museo !== 'CENCROPAM',
            },
          })
        }
      } else if (actual.origen === 'excel' && !actual.editadoPor) {
        reemplazadas++
        if (!prueba) await payload.update({ collection: 'obras', id: actual.id, data: ficha(obra) })
      } else {
        completadas++
        if (!prueba)
          await payload.update({
            collection: 'obras',
            id: actual.id,
            data: complemento(obra, actual),
          })
      }
    } catch (err) {
      errores++
      reporte.push({
        fila,
        sigropam: obra.sigropam,
        nivel: 'error',
        campo: '',
        mensaje: (err as Error).message,
      })
    }
  }

  // Reporte por fila.
  const dirReportes = path.join(web, 'reportes')
  fs.mkdirSync(dirReportes, { recursive: true })
  const sello = new Date().toISOString().slice(0, 16).replace(/[-:T]/g, '')
  const salida = path.join(dirReportes, `importacion-${sello}${prueba ? '-prueba' : ''}.csv`)
  fs.writeFileSync(
    salida,
    '﻿' +
      [
        'fila,sigropam,nivel,campo,mensaje',
        ...reporte.map((l) => [l.fila, l.sigropam, l.nivel, l.campo, l.mensaje].map(csv).join(',')),
      ].join('\n'),
  )

  const avisos = reporte.filter((l) => l.nivel === 'aviso')
  const porCampo = new Map<string, number>()
  avisos.forEach((a) => porCampo.set(a.campo, (porCampo.get(a.campo) ?? 0) + 1))

  console.log(`Filas leídas: ${filas.length}`)
  console.log(
    `  ${prueba ? 'Se crearían' : 'Creadas'}: ${creadas}${publicar ? '' : ' (ocultas hasta revisarlas)'}`,
  )
  console.log(`  ${prueba ? 'Se reemplazarían' : 'Reemplazadas'}: ${reemplazadas}`)
  console.log(
    `  ${prueba ? 'Se completarían' : 'Completadas'} (prototipo o editadas en el panel): ${completadas}`,
  )
  console.log(`  Descartadas (bajas): ${descartadas}`)
  console.log(
    `  Duplicadas en el archivo: ${reporte.filter((l) => l.nivel === 'duplicada').length}`,
  )
  console.log(`  Con error: ${errores}`)
  console.log(
    `  Avisos: ${avisos.length} (${[...porCampo].map(([c, n]) => `${c} ${n}`).join(', ') || 'ninguno'})`,
  )
  console.log(`Reporte: ${path.relative(process.cwd(), salida)}`)
  process.exit(errores ? 1 : 0)
}

// `payload run` cierra el proceso al terminar de importar este módulo,
// así que hay que esperar aquí mismo.
try {
  await main()
} catch (err) {
  console.error((err as Error).message)
  process.exit(1)
}
