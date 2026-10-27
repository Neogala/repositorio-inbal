import { describe, expect, it } from 'vitest'

import { limitarConsultasPublicas, TOPE_PUBLICO } from '@/hooks/limitar-consultas-publicas'

type Hook = ReturnType<typeof limitarConsultasPublicas>
type Args = { id?: unknown; limit?: unknown; pagination?: boolean; sort?: string | string[] }

const REST = { payloadAPI: 'REST' }

function correr(
  hook: Hook,
  args: Args,
  { operation = 'read', req = REST as Record<string, unknown> } = {},
): Args {
  return hook({ args, operation, req } as unknown as Parameters<Hook>[0]) as Args
}

describe('limitarConsultasPublicas', () => {
  const hook = limitarConsultasPublicas()

  it('al visitante por REST le baja a 100 los límites grandes, cero o negativos', () => {
    for (const limit of [101, 5000, 0, -1]) {
      expect(correr(hook, { limit }).limit).toBe(TOPE_PUBLICO)
    }
  })

  it('también corrige un límite que no es número', () => {
    expect(correr(hook, { limit: 'todo' }).limit).toBe(TOPE_PUBLICO)
    expect(correr(hook, { limit: Number.POSITIVE_INFINITY }).limit).toBe(TOPE_PUBLICO)
  })

  it('respeta los límites razonables y el que no pidió límite', () => {
    expect(correr(hook, { limit: 24 }).limit).toBe(24)
    expect(correr(hook, { limit: TOPE_PUBLICO }).limit).toBe(TOPE_PUBLICO)
    expect(correr(hook, {}).limit).toBeUndefined()
  })

  it('siempre pagina, aunque pidan pagination=false', () => {
    expect(correr(hook, { pagination: false }).pagination).toBe(true)
  })

  it('aplica igual a readDistinct', () => {
    expect(correr(hook, { limit: 0 }, { operation: 'readDistinct' }).limit).toBe(TOPE_PUBLICO)
  })

  it('no toca un documento suelto (findByID)', () => {
    const args = { id: 5, limit: 0, pagination: false }
    expect(correr(hook, args)).toEqual({ id: 5, limit: 0, pagination: false })
  })

  it('no limita a quien tiene sesión, ni a la Local API, ni a GraphQL', () => {
    const casos = [
      { payloadAPI: 'REST', user: { id: 1 } },
      { payloadAPI: 'local' },
      { payloadAPI: 'GraphQL' },
    ]
    for (const req of casos) {
      expect(correr(hook, { limit: 0, pagination: false }, { req })).toEqual({
        limit: 0,
        pagination: false,
      })
    }
  })

  it('no toca operaciones que no son de lectura', () => {
    for (const operation of ['create', 'update', 'delete']) {
      expect(correr(hook, { limit: 0 }, { operation }).limit).toBe(0)
    }
  })

  it('devuelve el mismo objeto de argumentos que recibe', () => {
    const args = { limit: 9999 }
    expect(correr(hook, args)).toBe(args)
  })
})

describe('orden por campos internos', () => {
  const hook = limitarConsultasPublicas({ camposInternos: ['localizacion', 'original'] })

  it('quita los campos internos y sus subcampos, en ambas direcciones', () => {
    const args = correr(hook, { sort: '-localizacion,titulo,original.autor,-anioInicio' })
    expect(args.sort).toEqual(['titulo', '-anioInicio'])
  })

  it('acepta el orden como lista y tolera espacios', () => {
    expect(correr(hook, { sort: [' localizacion', 'autor'] }).sort).toEqual(['autor'])
  })

  it('no confunde un campo público que empieza igual que uno interno', () => {
    expect(correr(hook, { sort: 'originalidad,localizaciones' }).sort).toEqual([
      'originalidad',
      'localizaciones',
    ])
  })

  it('si solo pedían campos internos, se queda sin orden', () => {
    expect(correr(hook, { sort: 'localizacion,-original' }).sort).toBeUndefined()
  })

  it('sin campos internos declarados no reescribe el orden', () => {
    const args = correr(limitarConsultasPublicas(), { sort: '-localizacion' })
    expect(args.sort).toBe('-localizacion')
  })

  it('a quien tiene sesión le deja ordenar por campos internos', () => {
    const args = correr(
      hook,
      { sort: 'localizacion' },
      { req: { payloadAPI: 'REST', user: { id: 1 } } },
    )
    expect(args.sort).toBe('localizacion')
  })
})
