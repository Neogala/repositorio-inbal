import { describe, expect, it } from 'vitest'

import {
  derechosPorAutor,
  leerAcervo,
  leerAutor,
  leerFecha,
  leerMedidas,
  normalizarFila,
  normalizarTecnica,
  periodoDe,
  textoMedidas,
  tipoDeDisciplina,
} from '@/lib/importar/sigropam'

const orozco = { nacimiento: 1883, muerte: 1949 }
const velasco = { nacimiento: 1840, muerte: 1912 }

describe('leerAutor', () => {
  it('separa nombre y fechas de vida', () => {
    expect(leerAutor('OROZCO, JOSÉ CLEMENTE, 1883-1949')).toEqual({
      nombre: 'José Clemente Orozco',
      nacimiento: 1883,
      muerte: 1949,
    })
  })
  it('apellidos compuestos y seudónimos', () => {
    expect(leerAutor('ALFARO SIQUEIROS, DAVID, 1896-1974').nombre).toBe('David Alfaro Siqueiros')
    expect(leerAutor('ATL, DR., 1875-1964').nombre).toBe('Dr. Atl')
  })
  it('autor repetido en el mismo campo', () => {
    expect(leerAutor('VELASCO, JOSÉ MARÍA, 1840-1912   VELASCO, JOSÉ MARÍA, 1840-1912')).toEqual({
      nombre: 'José María Velasco',
      nacimiento: 1840,
      muerte: 1912,
    })
  })
})

describe('leerFecha', () => {
  const f = (v: string, vida = orozco) => leerFecha(v, vida)

  it('año simple', () => {
    expect(f('1940')).toMatchObject({
      texto: '1940',
      anioInicio: 1940,
      anioFin: 1940,
      aproximada: false,
    })
  })
  it('sin fecha', () => {
    for (const v of ['S/F', 'SIN FECHA', '', '  '])
      expect(f(v)).toMatchObject({ texto: 'S/F', anioInicio: null })
  })
  it('rangos, con la L como guion y años de dos dígitos', () => {
    expect(f('1938-1939')).toMatchObject({ texto: '1938-1939', anioInicio: 1938, anioFin: 1939 })
    expect(f('1952L1956')).toMatchObject({ texto: '1952-1956', anioInicio: 1952, anioFin: 1956 })
    expect(f('1938L39')).toMatchObject({ anioInicio: 1938, anioFin: 1939 })
    expect(f('1932-34')).toMatchObject({ anioInicio: 1932, anioFin: 1934 })
    expect(f('38-39')).toMatchObject({ texto: '1938-1939', anioInicio: 1938, anioFin: 1939 })
    expect(f('1932 1934')).toMatchObject({ anioInicio: 1932, anioFin: 1934 })
    expect(f('1913 y 1915')).toMatchObject({ anioInicio: 1913, anioFin: 1915 })
  })
  it('dos dígitos según la vida del autor', () => {
    expect(f('65-66', velasco)).toMatchObject({ anioInicio: 1865, anioFin: 1866 })
  })
  it('alternativa dudosa', () => {
    expect(f('1945 o 1925')).toMatchObject({
      texto: '1945 o 1925',
      anioInicio: 1925,
      anioFin: 1945,
      aproximada: true,
    })
  })
  it('aproximadas', () => {
    expect(f('ca1945')).toMatchObject({ texto: 'ca. 1945', anioInicio: 1945, aproximada: true })
    expect(f('ca. 1925')).toMatchObject({ texto: 'ca. 1925', aproximada: true })
    expect(f('CA. 1910-1915')).toMatchObject({
      texto: 'ca. 1910-1915',
      anioInicio: 1910,
      anioFin: 1915,
    })
    expect(f('c1969')).toMatchObject({ anioInicio: 1969, aproximada: true })
    expect(f('ca1960L1964')).toMatchObject({ anioInicio: 1960, anioFin: 1964, aproximada: true })
  })
  it('siglos', () => {
    expect(f('S XIX')).toMatchObject({
      texto: 'Siglo XIX',
      anioInicio: 1801,
      anioFin: 1900,
      siglo: 19,
    })
    expect(f('Siglo  XX')).toMatchObject({ texto: 'Siglo XX', anioInicio: 1901, anioFin: 2000 })
    expect(f('S/F (S. XIX)')).toMatchObject({ texto: 'S/F (siglo XIX)', siglo: 19 })
  })
  it('fechas completas', () => {
    expect(f('JULIO DE 1906')).toMatchObject({ texto: 'Julio de 1906', anioInicio: 1906 })
    expect(f('21/11/1943')).toMatchObject({ texto: '21/11/1943', anioInicio: 1943 })
    expect(f('JUL/1939')).toMatchObject({ anioInicio: 1939 })
    expect(f('17 JULIO DE 1905')).toMatchObject({ anioInicio: 1905 })
    expect(f('AGOSTO 19 DE 1903')).toMatchObject({ anioInicio: 1903 })
    expect(f('01-10-1952')).toMatchObject({ anioInicio: 1952 })
  })
  it('lo que no reconoce devuelve null', () => {
    expect(f('31/05')).toBeNull()
    expect(f('PRIMAVERA')).toBeNull()
  })
})

describe('leerMedidas', () => {
  it('toma las de la obra e ignora marco y base', () => {
    const m = leerMedidas(
      'Obra Alto 29.3 CM Marco Alto 55.9 CM Obra Ancho 48.5 CM Marco Ancho 74.9 CM Obra Profundidad 2.0 CM',
    )
    expect(m).toEqual({ altoCm: 29.3, anchoCm: 48.5, profundidadCm: 2 })
    expect(textoMedidas(m!)).toBe('29.3 × 48.5 × 2 cm')
  })
  it('sin "Obra" usa el soporte', () => {
    expect(leerMedidas('Soporte Alto 31.2 CM Soporte Ancho 47.8 CM')).toEqual({
      altoCm: 31.2,
      anchoCm: 47.8,
      profundidadCm: null,
    })
  })
  it('sin medidas de obra ni soporte', () => {
    expect(leerMedidas('Base Alto 29.6 CM Marco Alto 52 CM')).toBeNull()
    expect(leerMedidas('')).toBeNull()
  })
})

describe('técnica, disciplina y acervo', () => {
  it('normaliza la diagonal y los acentos', () => {
    expect(normalizarTecnica('LÁPIZ/PAPEL')).toBe('Lápiz sobre papel')
    expect(normalizarTecnica('LÁPIZ SOBRE PAPEL')).toBe('Lápiz sobre papel')
    expect(normalizarTecnica('LITOGRAFIA A COLOR/PAPEL')).toBe('Litografía a color sobre papel')
    expect(normalizarTecnica('ACRÍLICO SOBRE CARTON')).toBe('Acrílico sobre cartón')
  })
  it('disciplina a tipo de obra', () => {
    expect(tipoDeDisciplina('OBRA GRÁFICA')).toBe('Grabado')
    expect(tipoDeDisciplina('ARTES GRÁFICAS')).toBe('Grabado')
    expect(tipoDeDisciplina('OBRA DE CABALLETE')).toBe('Pintura')
    expect(tipoDeDisciplina('DIBUJO')).toBe('Dibujo')
    expect(tipoDeDisciplina('DOCUMENTAL')).toBeNull()
  })
  it('obra gráfica con técnica de dibujo es Dibujo', () => {
    expect(tipoDeDisciplina('OBRA GRÁFICA', 'LÁPIZ/PAPEL CALCA')).toBe('Dibujo')
    expect(tipoDeDisciplina('OBRA GRÁFICA', 'AGUAFUERTE SOBRE PAPEL')).toBe('Grabado')
    expect(tipoDeDisciplina('OBRA GRÁFICA', 'LITOGRAFIA, LÁPIZ GRASO/PAPEL')).toBe('Grabado')
    expect(tipoDeDisciplina('PINTURA', 'TINTA SOBRE PAPEL ARROZ')).toBe('Pintura')
  })
  it('acervos del Excel', () => {
    expect(leerAcervo('Museo Nacional de Arte')).toEqual({ clave: 'MUNAL', slug: 'munal' })
    expect(leerAcervo('Museo de Arte Moderno')).toEqual({ clave: 'MAM', slug: 'mam' })
    expect(leerAcervo('INBA/MUSEO ARTE MODERNO DE GOMEZ PALACIO, DGO.')).toMatchObject({
      clave: 'MAMGP',
    })
    expect(leerAcervo('MUSEO CASA DIEGO RIVERA, GTO.')).toMatchObject({ clave: 'MCDR' })
    expect(leerAcervo('Museo Casa Estudio Diego Rivera')).toMatchObject({ clave: 'MCEDRFK' })
    expect(
      leerAcervo('Centro Nacional de Conservación y Registro del Patrimonio Artístico Mueble'),
    ).toMatchObject({
      clave: 'CENCROPAM',
    })
    expect(leerAcervo('BAJA DEL ACERVO INBAL')).toBe('baja')
    expect(leerAcervo('Museo Inventado')).toBeNull()
  })
})

describe('periodo y derechos', () => {
  it('periodo por año', () => {
    expect(periodoDe(leerFecha('1790')!)).toBe('Arte Colonial')
    expect(periodoDe(leerFecha('1865')!)).toBe('Siglo XIX')
    expect(periodoDe(leerFecha('1940')!)).toBe('Arte Moderno')
    expect(periodoDe(leerFecha('1960')!)).toBe('Arte Contemporáneo')
    expect(periodoDe(leerFecha('S/F')!)).toBe('Sin fecha')
  })
  it('"Siglo XX" toma la madurez del autor', () => {
    expect(periodoDe(leerFecha('Siglo XX')!, { nacimiento: 1883 })).toBe('Arte Moderno')
    expect(periodoDe(leerFecha('Siglo XX')!, { nacimiento: 1920 })).toBe('Arte Contemporáneo')
  })
  it('dominio público: muerte + 100 años', () => {
    const hoy = new Date('2026-10-06')
    expect(derechosPorAutor(1912, hoy)).toBe('libre')
    expect(derechosPorAutor(1949, hoy)).toBe('restringida')
    expect(derechosPorAutor(null, hoy)).toBe('restringida')
  })
})

describe('normalizarFila', () => {
  const fila = {
    sigropam: 13061,
    titulo: 'NATURALEZA MUERTA (CON CEPILLO DE DIENTES)',
    autor: 'IZQUIERDO, MARÍA, 1902-1955',
    fecha: 'S/F',
    tecnica: 'ÓLEO SOBRE TELA',
    medida: 'Obra Alto 29.3 CM Obra Ancho 48.5 CM',
    localizacion: 'Museo de Arte Moderno',
    disciplina: 'PINTURA',
    acervo: 'Museo de Arte Moderno',
    observaciones: '10-607816 COMPRADO POR LA SEP',
  }

  it('fila válida', () => {
    const r = normalizarFila(fila, new Date('2026-10-06'))
    expect(r.estado).toBe('ok')
    if (r.estado !== 'ok') return
    expect(r.obra).toMatchObject({
      sigropam: '13061',
      autor: 'María Izquierdo',
      autorMuerte: 1955,
      fechaTexto: 'S/F',
      periodo: 'Sin fecha',
      tipo: 'Pintura',
      tecnica: 'Óleo sobre tela',
      altoCm: 29.3,
      museo: 'MAM',
      derechos: 'restringida',
      observaciones: '10-607816 COMPRADO POR LA SEP',
    })
    expect(r.obra.original.autor).toBe(fila.autor)
    expect(r.avisos).toEqual([])
  })
  it('errores por campo', () => {
    const r = normalizarFila({ ...fila, sigropam: 'ABC', titulo: '' })
    expect(r.estado).toBe('error')
    if (r.estado !== 'error') return
    expect(r.errores.map((e) => e.campo).sort()).toEqual(['sigropam', 'titulo'])
  })
  it('las bajas se descartan', () => {
    expect(normalizarFila({ ...fila, acervo: 'BAJA DEL ACERVO INBAL' }).estado).toBe('descartada')
  })
  it('avisos que no impiden importar', () => {
    const r = normalizarFila({ ...fila, fecha: '31/05', disciplina: '', medida: '' })
    expect(r.estado).toBe('ok')
    if (r.estado !== 'ok') return
    expect(r.avisos.map((a) => a.campo)).toEqual(['fecha', 'medida', 'disciplina'])
    expect(r.obra.fechaTexto).toBe('31/05')
  })
})
