// Normalización de una fila del Excel de SIGROPAM a una obra del catálogo.
// Funciones puras (sin base de datos) para poder probarlas; las reglas salen de
// docs/analisis-datos.md.
import { z } from 'zod'

import type { MUSEOS, PERIODOS, TIPOS } from '../../collections/Obras'
import type { Medidas } from '../medidas'

export { textoMedidas, type Medidas } from '../medidas'

type Clave = (typeof MUSEOS)[number]['value']
type Periodo = (typeof PERIODOS)[number]
type Tipo = (typeof TIPOS)[number]

const limpiar = (v: unknown) =>
  String(v ?? '')
    .replace(/\s+/g, ' ')
    .trim()
const sinAcentos = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '')
const clave = (s: string) => sinAcentos(limpiar(s)).toUpperCase()

// ---------- Fila cruda ----------

// Columnas del Excel (se buscan sin importar acentos ni mayúsculas).
export const COLUMNAS = {
  sigropam: 'No_Sigropam',
  titulo: 'Título',
  autor: 'Autor(es)',
  fecha: 'Fecha',
  tecnica: 'Técnica',
  medida: 'Medida',
  localizacion: 'Localización',
  disciplina: 'Disciplina',
  acervo: 'Acervo',
  observaciones: 'Observaciones',
} as const

const texto = z.preprocess(limpiar, z.string())

export const FilaSigropam = z.object({
  sigropam: z.preprocess(
    (v) => limpiar(v).replace(/\.0$/, ''),
    z.string().regex(/^\d+$/, 'El No. SIGROPAM debe ser un número'),
  ),
  titulo: texto.pipe(z.string().min(1, 'Falta el título')),
  autor: texto.pipe(z.string().min(1, 'Falta el autor')),
  fecha: texto,
  tecnica: texto,
  medida: texto,
  localizacion: texto,
  disciplina: texto,
  acervo: texto.pipe(z.string().min(1, 'Falta el acervo')),
  observaciones: texto,
})
export type FilaSigropam = z.infer<typeof FilaSigropam>

// ---------- Autor ----------

const MINUSCULAS = new Set(['de', 'del', 'la', 'las', 'los', 'y', 'e'])

// "ALFARO SIQUEIROS" -> "Alfaro Siqueiros"; respeta partículas ("de la").
export function nombrePropio(s: string): string {
  return limpiar(s)
    .toLowerCase()
    .split(' ')
    .map((p, i) => (i > 0 && MINUSCULAS.has(p) ? p : p.charAt(0).toUpperCase() + p.slice(1)))
    .join(' ')
}

// "OROZCO, JOSÉ CLEMENTE, 1883-1949" -> José Clemente Orozco, 1883, 1949.
// El Excel a veces repite el autor dentro del mismo campo; se toma el primero.
export function leerAutor(v: string): {
  nombre: string
  nacimiento: number | null
  muerte: number | null
} {
  const [apellidos, nombres, vida = ''] = limpiar(v).split(',')
  if (!nombres) return { nombre: nombrePropio(v), nacimiento: null, muerte: null }
  const m = vida.match(/(\d{4})?\s*-\s*(\d{4})?/)
  return {
    nombre: `${nombrePropio(nombres)} ${nombrePropio(apellidos)}`,
    nacimiento: m?.[1] ? Number(m[1]) : null,
    muerte: m?.[2] ? Number(m[2]) : null,
  }
}

// ---------- Fecha ----------

export type Fecha = {
  texto: string
  anioInicio: number | null
  anioFin: number | null
  aproximada: boolean
  siglo: number | null
}

const MESES =
  /^(ENERO|FEBRERO|MARZO|ABRIL|MAYO|JUNIO|JULIO|AGOSTO|SEPTIEMBRE|OCTUBRE|NOVIEMBRE|DICIEMBRE|ENE|FEB|MAR|ABR|MAY|JUN|JUL|AGO|SEP|OCT|NOV|DIC)\b/

const ROMANOS: Record<string, number> = { XVI: 16, XVII: 17, XVIII: 18, XIX: 19, XX: 20, XXI: 21 }

const SIN_FECHA: Fecha = {
  texto: 'S/F',
  anioInicio: null,
  anioFin: null,
  aproximada: false,
  siglo: null,
}

// Años de dos dígitos ("38-39"): el siglo en que vivía el autor; si no se sabe, 1900.
function completarAnio(n: number, vida?: { nacimiento: number | null; muerte: number | null }) {
  if (n >= 100) return n
  for (const siglo of [1900, 1800]) {
    const anio = siglo + n
    if (vida?.nacimiento && vida.muerte && anio >= vida.nacimiento && anio <= vida.muerte)
      return anio
  }
  return 1900 + n
}

export function leerFecha(
  v: string,
  vida?: { nacimiento: number | null; muerte: number | null },
): Fecha | null {
  const original = limpiar(v)
  const t = clave(original)
  if (!t || t === 'S/F' || t === 'SIN FECHA' || t === 'SF') return SIN_FECHA

  // Siglo: "S XIX", "Siglo  XX", "S/F (S. XIX)".
  const s = t.match(/^(?:S\/F\s*\()?\s*(?:SIGLO|S\.?)\s*(XVIII|XVII|XVI|XIX|XXI|XX)\)?$/)
  if (s) {
    const n = ROMANOS[s[1]]
    return {
      texto: t.startsWith('S/F') ? `S/F (siglo ${s[1]})` : `Siglo ${s[1]}`,
      anioInicio: (n - 1) * 100 + 1,
      anioFin: n * 100,
      aproximada: true,
      siglo: n,
    }
  }

  // Aproximada: "ca1945", "ca. 1925", "CA. 1910-1915", "c1969".
  const ca = t.match(/^CA?\.?\s*(.+)$/)
  if (ca && /^\d/.test(ca[1])) {
    const r = leerFecha(ca[1], vida)
    if (r?.anioInicio) return { ...r, texto: `ca. ${r.texto}`, aproximada: true }
  }

  // Año o rango: "1940", "1938-1939", "1952L1956" (la L es un guion), "38-39", "1932 1934",
  // "1913 y 1915", "1945 o 1925".
  const r = t.match(/^(\d{2}|\d{4})(?:\s*(?:-|L|Y|O|\s)\s*(\d{2}|\d{4}))?$/)
  if (r) {
    const a = completarAnio(Number(r[1]), vida)
    let b = r[2] ? Number(r[2]) : a
    if (r[2]?.length === 2) b = Math.floor(a / 100) * 100 + b
    const [inicio, fin] = a <= b ? [a, b] : [b, a]
    const dudosa = /\sO\s/.test(t)
    return {
      texto: inicio === fin ? String(inicio) : dudosa ? original : `${inicio}-${fin}`,
      anioInicio: inicio,
      anioFin: fin,
      aproximada: dudosa,
      siglo: null,
    }
  }

  // Fecha completa: "21/11/1943", "01-10-1952", "JUL/1939", "JULIO DE 1906", "17 JULIO DE 1905".
  const anio = t.match(/(?:^|\D)(\d{4})$/)
  if (anio && (/^[\d/\-\s]+$/.test(t) || MESES.test(t.replace(/^\d{1,2}\s+(DE\s+)?/, '')))) {
    const n = Number(anio[1])
    const textoFecha = /^[\d/\-]+$/.test(t)
      ? original
      : original.charAt(0).toUpperCase() + original.slice(1).toLowerCase()
    return { texto: textoFecha, anioInicio: n, anioFin: n, aproximada: false, siglo: null }
  }

  return null
}

// ---------- Medidas ----------

// "Obra Alto 39.5 CM Obra Ancho 48.0 CM Marco Alto ...": solo las de la obra; si no
// hay, las del soporte (el papel en obra gráfica). Base y marco no se publican.
export function leerMedidas(v: string): Medidas | null {
  const t = limpiar(v)
  const de = (parte: string) => {
    const valor = (dim: string) => {
      const m = t.match(new RegExp(`${parte} ${dim} ([\\d.,]+) CM`, 'i'))
      return m ? Number(m[1].replace(',', '.')) : null
    }
    const diametro = valor('Di[aá]metro')
    return {
      altoCm: valor('Alto') ?? diametro,
      anchoCm: valor('Ancho') ?? diametro,
      profundidadCm: valor('Profundidad'),
    }
  }
  for (const parte of ['Obra', 'Soporte']) {
    const m = de(parte)
    if (m.altoCm != null || m.anchoCm != null) return m
  }
  return null
}

// ---------- Técnica ----------

const ACENTOS: Record<string, string> = {
  litografia: 'litografía',
  fotografia: 'fotografía',
  serigrafia: 'serigrafía',
  xilografia: 'xilografía',
  carton: 'cartón',
  acrilico: 'acrílico',
  oleo: 'óleo',
  lapiz: 'lápiz',
  carbon: 'carbón',
  crayon: 'crayón',
  grafica: 'gráfica',
  tipomovil: 'tipomóvil',
}

// "LÁPIZ/PAPEL" y "LÁPIZ SOBRE PAPEL" -> "Lápiz sobre papel".
export function normalizarTecnica(v: string): string {
  const t = limpiar(v)
    .toLowerCase()
    .replace(/\s*\/\s*/g, ' sobre ')
    .replace(/[a-záéíóúüñ]+/g, (p) => ACENTOS[p] ?? p)
  return t.charAt(0).toUpperCase() + t.slice(1)
}

// ---------- Disciplina -> tipo de obra ----------

const TIPO_POR_DISCIPLINA: Record<string, Tipo> = {
  'OBRA GRAFICA': 'Grabado',
  'ARTES GRAFICAS': 'Grabado',
  ESTAMPA: 'Grabado',
  IMPRESION: 'Grabado',
  'GRAFICA (PLACA)': 'Grabado',
  GRABADO: 'Grabado',
  DIBUJO: 'Dibujo',
  PINTURA: 'Pintura',
  'OBRA DE CABALLETE': 'Pintura',
  'OBRA MURAL': 'Pintura',
  'OBRA ESCULTORICA': 'Escultura',
  ESCULTURA: 'Escultura',
  FOTOGRAFIA: 'Fotografía',
}

const GRABADO =
  /AGUAFUERTE|AGUATINTA|PUNTA SECA|LITOGRAF|XILOGRAF|SERIGRAF|GRABADO|LINOLEO|OFFSET|TIPOMOVIL|HUECOGRABADO|MEZZOTINTA|ESTARCIDO|IMPRESION/
const DIBUJO =
  /LAPIZ|CARBON|GRAFITO|TINTA|TEMPLE|ACUARELA|GOUACHE|CRAYON|PASTEL|SANGUINA|CONTE|PLUMA|DIBUJO/

// SIGROPAM llama "obra gráfica" también a dibujos: si la técnica es de dibujo y no
// de estampa, cuenta como Dibujo.
export function tipoDeDisciplina(v: string, tecnica = ''): Tipo | null {
  const tipo = TIPO_POR_DISCIPLINA[clave(v)] ?? null
  const t = clave(tecnica)
  if (tipo === 'Grabado' && DIBUJO.test(t) && !GRABADO.test(t)) return 'Dibujo'
  return tipo
}

// ---------- Acervo ----------

// Acervo del Excel -> clave del catálogo y slug de su página en /acervos.
const ACERVOS: [RegExp, Clave, string][] = [
  [/MUSEO NACIONAL DE ARTE$/, 'MUNAL', 'munal'],
  [/MUSEO (DE )?ARTE MODERNO DE GOMEZ PALACIO/, 'MAMGP', 'mam-gomez-palacio'],
  [/MUSEO DE ARTE MODERNO$/, 'MAM', 'mam'],
  [/ESTAMPA/, 'MUNAE', 'munae'],
  [/SAN CARLOS/, 'MNSC', 'san-carlos'],
  [/PALACIO DE BELLAS ARTES/, 'MPBA', 'bellas-artes'],
  [/ARQUITECTURA/, 'MNARQ', 'arquitectura'],
  [/MURAL DIEGO RIVERA/, 'MMDR', 'mural-diego-rivera'],
  [/SIQUEIROS/, 'SAPS', 'saps'],
  [/TAMAYO/, 'MTAC', 'tamayo'],
  [/CASA ESTUDIO DIEGO RIVERA/, 'MCEDRFK', 'casa-estudio'],
  [/PLASTICA MEXICANA/, 'SPM', 'plastica-mexicana'],
  [/CARRILLO GIL/, 'MACG', 'carrillo-gil'],
  [/CIUDAD JUAREZ/, 'MACJ', 'ciudad-juarez'],
  [/CAPILLA ALFONSINA/, 'CAPILLA', 'capilla-alfonsina'],
  [/CENTRO NACIONAL DE CONSERVACION|CENCROPAM/, 'CENCROPAM', 'cencropam'],
  [/CABA[NÑ]AS/, 'ICC', 'cabanas'],
  [/ARTES GRAFICAS DE OAXACA/, 'IAGO', 'iago'],
  [/CASA DIEGO RIVERA/, 'MCDR', 'casa-diego-rivera-gto'],
  [/CIUDAD DE AGUASCALIENTES/, 'MCA', 'ciudad-aguascalientes'],
  [/JOSE LUIS CUEVAS/, 'MJLC', 'jose-luis-cuevas'],
]

export function leerAcervo(v: string): { clave: Clave; slug: string } | 'baja' | null {
  const t = clave(v).replace(/^INBA\//, '')
  if (/BAJA DEL ACERVO/.test(t)) return 'baja'
  const a = ACERVOS.find(([re]) => re.test(t))
  return a ? { clave: a[1], slug: a[2] } : null
}

// ---------- Periodo y derechos ----------

export function periodoDe(fecha: Fecha, vida?: { nacimiento: number | null }): Periodo {
  // Para "Siglo XX" se toma la madurez del autor (40 años) dentro del siglo.
  let anio = fecha.anioInicio
  if (fecha.siglo && fecha.anioInicio && fecha.anioFin) {
    anio = vida?.nacimiento
      ? Math.min(Math.max(vida.nacimiento + 40, fecha.anioInicio), fecha.anioFin)
      : fecha.anioInicio
  }
  if (anio == null) return 'Sin fecha'
  if (anio < 1821) return 'Arte Colonial'
  if (anio <= 1900) return 'Siglo XIX'
  if (anio <= 1950) return 'Arte Moderno'
  return 'Arte Contemporáneo'
}

// En México el derecho patrimonial dura la vida del autor más 100 años. Lo demás
// queda restringido hasta que el INBAL confirme sus autorizaciones.
export function derechosPorAutor(muerte: number | null, hoy = new Date()): 'libre' | 'restringida' {
  return muerte != null && muerte + 100 < hoy.getFullYear() ? 'libre' : 'restringida'
}

// ---------- Fila completa ----------

export type Problema = { campo: string; mensaje: string }

export type ObraImportada = {
  sigropam: string
  titulo: string
  autor: string
  autorMuerte: number | null
  fechaTexto: string
  anioInicio: number | null
  anioFin: number | null
  fechaAproximada: boolean
  periodo: Periodo
  tipo: Tipo | null
  tecnica: string
  altoCm: number | null
  anchoCm: number | null
  profundidadCm: number | null
  museo: Clave
  acervoSlug: string
  derechos: 'libre' | 'restringida'
  localizacion: string
  observaciones: string
  original: {
    autor: string
    fecha: string
    tecnica: string
    medida: string
    disciplina: string
    acervo: string
  }
}

export type Resultado =
  | { estado: 'ok'; obra: ObraImportada; avisos: Problema[] }
  | { estado: 'error'; sigropam: string; errores: Problema[] }
  | { estado: 'descartada'; sigropam: string; motivo: string }

export function normalizarFila(cruda: Record<string, unknown>, hoy = new Date()): Resultado {
  const p = FilaSigropam.safeParse(cruda)
  if (!p.success) {
    return {
      estado: 'error',
      sigropam: limpiar(cruda.sigropam),
      errores: p.error.issues.map((i) => ({ campo: String(i.path[0] ?? ''), mensaje: i.message })),
    }
  }
  const f = p.data
  const avisos: Problema[] = []

  const acervo = leerAcervo(f.acervo)
  if (acervo === 'baja')
    return { estado: 'descartada', sigropam: f.sigropam, motivo: 'Baja del acervo INBAL' }
  if (!acervo) {
    return {
      estado: 'error',
      sigropam: f.sigropam,
      errores: [{ campo: 'acervo', mensaje: `Acervo desconocido: "${f.acervo}"` }],
    }
  }

  const autor = leerAutor(f.autor)
  if (autor.muerte == null)
    avisos.push({ campo: 'autor', mensaje: 'Sin fechas de vida: derechos restringidos' })

  let fecha = leerFecha(f.fecha, autor)
  if (!fecha) {
    avisos.push({
      campo: 'fecha',
      mensaje: `Fecha no reconocida, se guarda como texto: "${f.fecha}"`,
    })
    fecha = { ...SIN_FECHA, texto: f.fecha }
  }

  const medidas = leerMedidas(f.medida)
  if (!medidas) avisos.push({ campo: 'medida', mensaje: 'Sin medidas de la obra ni del soporte' })

  const tipo = tipoDeDisciplina(f.disciplina, f.tecnica)
  if (!tipo)
    avisos.push({
      campo: 'disciplina',
      mensaje: `Sin tipo de obra equivalente: "${f.disciplina || 'vacía'}"`,
    })

  return {
    estado: 'ok',
    avisos,
    obra: {
      sigropam: f.sigropam,
      titulo: f.titulo,
      autor: autor.nombre,
      autorMuerte: autor.muerte,
      fechaTexto: fecha.texto,
      anioInicio: fecha.anioInicio,
      anioFin: fecha.anioFin,
      fechaAproximada: fecha.aproximada,
      periodo: periodoDe(fecha, autor),
      tipo,
      tecnica: f.tecnica ? normalizarTecnica(f.tecnica) : '',
      altoCm: medidas?.altoCm ?? null,
      anchoCm: medidas?.anchoCm ?? null,
      profundidadCm: medidas?.profundidadCm ?? null,
      museo: acervo.clave,
      acervoSlug: acervo.slug,
      derechos: derechosPorAutor(autor.muerte, hoy),
      localizacion: f.localizacion,
      observaciones: f.observaciones,
      original: {
        autor: f.autor,
        fecha: f.fecha,
        tecnica: f.tecnica,
        medida: f.medida,
        disciplina: f.disciplina,
        acervo: f.acervo,
      },
    },
  }
}
