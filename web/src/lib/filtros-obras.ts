// Filtros de /obras y su traducción desde y hacia la URL.
// Se usa en el servidor (para consultar) y en el navegador (para actualizar la URL),
// así que no debe importar nada de Payload.

export const ORDENES = {
  artista: 'Artista (A–Z)',
  'anio-asc': 'Año ↑',
  'anio-desc': 'Año ↓',
  recientes: 'Añadidas recientemente',
} as const

export type Orden = keyof typeof ORDENES

export type FiltrosObras = {
  q: string
  periodos: string[]
  tipos: string[]
  museos: string[]
  artistas: string[]
  tecnicas: string[]
  desde: number | null
  hasta: number | null
  conImagen: boolean
  orden: Orden
  pagina: number
}

type Params = Record<string, string | string[] | undefined> | URLSearchParams

// Nombre del parámetro en la URL para cada filtro de lista.
const LISTAS = {
  periodos: 'periodo',
  tipos: 'tipo',
  museos: 'museo',
  artistas: 'artista',
  tecnicas: 'tecnica',
} as const

function todos(params: Params, key: string): string[] {
  if (params instanceof URLSearchParams) return params.getAll(key).filter(Boolean)
  const v = params[key]
  if (Array.isArray(v)) return v.filter(Boolean)
  return v ? [v] : []
}

function uno(params: Params, key: string): string | undefined {
  return todos(params, key)[0]
}

function entero(v: string | undefined): number | null {
  if (!v) return null
  const n = Number.parseInt(v, 10)
  return Number.isFinite(n) ? n : null
}

export function leerFiltros(params: Params): FiltrosObras {
  const orden = uno(params, 'orden')
  return {
    q: (uno(params, 'q') ?? '').trim().slice(0, 120),
    periodos: todos(params, LISTAS.periodos),
    tipos: todos(params, LISTAS.tipos),
    museos: todos(params, LISTAS.museos),
    artistas: todos(params, LISTAS.artistas),
    tecnicas: todos(params, LISTAS.tecnicas),
    desde: entero(uno(params, 'desde')),
    hasta: entero(uno(params, 'hasta')),
    conImagen: uno(params, 'imagen') === '1',
    // hasOwn y no "in": ?orden=toString no debe pasar como un orden válido.
    orden: orden && Object.hasOwn(ORDENES, orden) ? (orden as Orden) : 'artista',
    pagina: Math.max(1, entero(uno(params, 'pagina')) ?? 1),
  }
}

export function escribirFiltros(f: Partial<FiltrosObras>): URLSearchParams {
  const p = new URLSearchParams()
  if (f.q) p.set('q', f.q)
  for (const [campo, key] of Object.entries(LISTAS)) {
    for (const v of (f[campo as keyof typeof LISTAS] as string[] | undefined) ?? []) p.append(key, v)
  }
  if (f.desde != null) p.set('desde', String(f.desde))
  if (f.hasta != null) p.set('hasta', String(f.hasta))
  if (f.conImagen) p.set('imagen', '1')
  if (f.orden && f.orden !== 'artista') p.set('orden', f.orden)
  if (f.pagina && f.pagina > 1) p.set('pagina', String(f.pagina))
  return p
}

export function hayFiltros(f: FiltrosObras): boolean {
  return Boolean(
    f.q ||
      f.periodos.length ||
      f.tipos.length ||
      f.museos.length ||
      f.artistas.length ||
      f.tecnicas.length ||
      f.desde != null ||
      f.hasta != null ||
      f.conImagen,
  )
}
