import type { CollectionBeforeOperationHook } from 'payload'

// Tope de las consultas anónimas a la API REST: nadie sin sesión baja la colección
// entera de una sola vez (limit=0 o pagination=false) ni pide miles de registros por
// página. Las páginas del sitio usan la Local API desde el servidor y no pasan por aquí.
export const TOPE_PUBLICO = 100

type Opciones = {
  // Campos que el público no puede leer: tampoco se deja ordenar por ellos, porque el
  // orden de los resultados delataría su valor.
  camposInternos?: string[]
}

const esInterno = (campo: string, internos: string[]) => {
  const ruta = campo.trim().replace(/^-/, '')
  return internos.some((c) => ruta === c || ruta.startsWith(`${c}.`))
}

export const limitarConsultasPublicas =
  ({ camposInternos = [] }: Opciones = {}): CollectionBeforeOperationHook =>
  ({ args, operation, req }) => {
    if (req.user || req.payloadAPI !== 'REST') return args
    if (operation !== 'read' && operation !== 'readDistinct') return args

    const a = args as {
      id?: unknown
      limit?: number
      pagination?: boolean
      sort?: string | string[]
    }
    // Un documento suelto (findByID) no tiene páginas ni orden.
    if (a.id != null) return args
    const limite = Number(a.limit)
    if (a.limit != null && (!Number.isFinite(limite) || limite <= 0 || limite > TOPE_PUBLICO)) {
      a.limit = TOPE_PUBLICO
    }
    a.pagination = true

    if (a.sort && camposInternos.length) {
      const campos = (Array.isArray(a.sort) ? a.sort : a.sort.split(',')).filter(
        (c) => c && !esInterno(c, camposInternos),
      )
      a.sort = campos.length ? campos : undefined
    }
    return args
  }
