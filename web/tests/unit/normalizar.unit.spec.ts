import { describe, expect, it } from 'vitest'

import { normalizar } from '@/lib/normalizar'

describe('normalizar', () => {
  it('quita acentos y mayúsculas para que la búsqueda no dependa de ellos', () => {
    expect(normalizar('Velázquez')).toBe('velazquez')
    expect(normalizar('JOSÉ MARÍA VELASCO')).toBe('jose maria velasco')
    expect(normalizar('Pingüino')).toBe('pinguino')
  })

  it('la eñe pierde la tilde, igual que en el índice de búsqueda', () => {
    // Obras.ts guarda el campo busqueda con esta misma función, así que "año" y "ano"
    // se encuentran entre sí.
    expect(normalizar('Año')).toBe('ano')
    expect(normalizar('Peña')).toBe(normalizar('PENA'))
  })

  it('acepta texto ya descompuesto (NFD) y compuesto (NFC) por igual', () => {
    const nfd = 'Frida Kahlo Calderón'.normalize('NFD')
    const nfc = 'Frida Kahlo Calderón'.normalize('NFC')
    expect(normalizar(nfd)).toBe(normalizar(nfc))
  })

  it('junta los espacios repetidos, tabuladores y saltos y recorta los extremos', () => {
    expect(normalizar('  Diego \t  Rivera\n')).toBe('diego rivera')
  })

  it('deja intactos números y signos', () => {
    expect(normalizar('Retrato #3, 1945-1950')).toBe('retrato #3, 1945-1950')
  })

  it('el texto vacío o de solo espacios queda vacío', () => {
    expect(normalizar('')).toBe('')
    expect(normalizar('   ')).toBe('')
  })
})
