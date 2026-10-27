import { describe, expect, it } from 'vitest'

import { textoMedidas } from '@/lib/medidas'

describe('textoMedidas', () => {
  it('une alto, ancho y profundidad en ese orden', () => {
    expect(textoMedidas({ altoCm: 39.5, anchoCm: 48, profundidadCm: 12 })).toBe('39.5 × 48 × 12 cm')
  })

  it('omite las medidas que faltan sin dejar separadores sueltos', () => {
    expect(textoMedidas({ altoCm: 30, anchoCm: null, profundidadCm: 5 })).toBe('30 × 5 cm')
    expect(textoMedidas({ anchoCm: 20 })).toBe('20 cm')
  })

  it('el cero es una medida, no un hueco', () => {
    expect(textoMedidas({ altoCm: 0, anchoCm: 10 })).toBe('0 × 10 cm')
  })

  it('sin medidas devuelve texto vacío para que la ficha no muestre "cm" solo', () => {
    expect(textoMedidas({})).toBe('')
    expect(textoMedidas({ altoCm: null, anchoCm: null, profundidadCm: null })).toBe('')
  })

  it('redondea a un decimal y separa miles como en México', () => {
    expect(textoMedidas({ altoCm: 12.345, anchoCm: 1250.06 })).toBe('12.3 × 1,250.1 cm')
  })
})
