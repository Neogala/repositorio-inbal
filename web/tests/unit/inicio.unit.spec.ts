import { beforeEach, describe, expect, it, vi } from 'vitest'

const findGlobal = vi.hoisted(() => vi.fn())
vi.mock('@/payload.config', () => ({ default: {} }))
vi.mock('payload', () => ({ getPayload: async () => ({ findGlobal }) }))

import { obtenerInicio } from '@/lib/inicio'

const media = (filename: string, extra: Record<string, unknown> = {}) => ({
  id: 1,
  filename,
  url: `/api/media/file/${filename}`,
  alt: `alt ${filename}`,
  ...extra,
})

const completo = {
  portadaObras: [
    media('MAM_10252.jpg', { sizes: { ficha: { url: '/ficha/MAM_10252.webp' } } }),
    media('MUNAL_1.png'),
    7,
  ],
  portadaInicial: media('MUNAL_1.png'),
  accesos: [
    { titulo: 'Obras', descripcion: null, enlace: '', imagen: media('a.jpg'), color: null },
    { titulo: 'Sin imagen', imagen: null },
  ],
  curaduriaInaugural: {
    titulo: 'Paisaje',
    intro: 'Intro',
    slug: 'paisaje',
    publicada: true,
    capitulos: [{}],
    portada: media('portada.jpg'),
  },
  curaduriaImagen: null,
  destacadas: [
    { obra: { sigropam: '1', publicada: true }, columnas: null, alto: null },
    { obra: { sigropam: '2', publicada: false } },
    { obra: 3 },
  ],
  acervosGaleria: [
    {
      slug: 'munal',
      nombre: 'Museo Nacional de Arte',
      siglas: 'MUNAL',
      semblanza: '',
      zona: 'Centro',
      totalObras: 12345,
    },
    4,
  ],
  recursos: [{ icono: null, titulo: 'Guía', texto: null, enlace: '' }],
  cifras: [{ valor: '9,000', texto: 'obras' }],
}

beforeEach(() => {
  findGlobal.mockReset().mockResolvedValue(completo)
})

describe('obtenerInicio', () => {
  it('lee el global como visitante', async () => {
    await obtenerInicio()
    expect(findGlobal).toHaveBeenCalledWith({ slug: 'inicio', depth: 2, overrideAccess: false })
  })

  it('la portada usa el tamaño ficha si existe y el prefijo del archivo como id', async () => {
    const { portada, inicial } = await obtenerInicio()
    expect(portada).toEqual([
      { id: 'MAM_10252', src: '/ficha/MAM_10252.webp', alt: 'alt MAM_10252.jpg' },
      { id: 'MUNAL_1', src: '/api/media/file/MUNAL_1.png', alt: 'alt MUNAL_1.png' },
    ])
    expect(inicial).toBe('MUNAL_1')
  })

  it('sin imagen inicial arranca con la primera de la portada', async () => {
    findGlobal.mockResolvedValue({ ...completo, portadaInicial: null })
    expect((await obtenerInicio()).inicial).toBe('MAM_10252')
    findGlobal.mockResolvedValue({ ...completo, portadaInicial: null, portadaObras: [] })
    expect((await obtenerInicio()).inicial).toBe('')
  })

  it('omite los accesos sin imagen y rellena enlace, texto y color', async () => {
    expect((await obtenerInicio()).accesos).toEqual([
      {
        titulo: 'Obras',
        descripcion: '',
        href: null,
        imagen: '/api/media/file/a.jpg',
        alt: 'alt a.jpg',
        rgb: '30,91,79',
      },
    ])
  })

  it('la curaduría inaugural enlaza su recorrido y toma su portada si no hay otra imagen', async () => {
    expect((await obtenerInicio()).curaduria).toEqual({
      titulo: 'Paisaje',
      intro: 'Intro',
      href: '/curadurias/paisaje',
      imagen: { src: '/api/media/file/portada.jpg', alt: 'alt portada.jpg' },
    })
  })

  it('una curaduría sin recorrido lleva a la lista y una sin publicar no se muestra', async () => {
    const c = completo.curaduriaInaugural
    findGlobal.mockResolvedValue({
      ...completo,
      curaduriaInaugural: { ...c, capitulos: [], portada: null },
    })
    expect((await obtenerInicio()).curaduria).toMatchObject({ href: '/curadurias', imagen: null })
    findGlobal.mockResolvedValue({ ...completo, curaduriaInaugural: { ...c, publicada: false } })
    expect((await obtenerInicio()).curaduria).toBeNull()
    findGlobal.mockResolvedValue({ ...completo, curaduriaInaugural: 5 })
    expect((await obtenerInicio()).curaduria).toBeNull()
  })

  it('solo destaca obras publicadas y pobladas, con tamaño por omisión', async () => {
    const { destacadas } = await obtenerInicio()
    expect(destacadas).toEqual([{ obra: completo.destacadas[0].obra, columnas: 4, alto: 'media' }])
  })

  it('la galería de acervos formatea el número de obras como en México', async () => {
    expect((await obtenerInicio()).acervos).toEqual([
      {
        slug: 'munal',
        nombre: 'Museo Nacional de Arte',
        clave: 'MUNAL',
        zona: 'Centro',
        obras: '12,345',
        imagen: '',
      },
    ])
  })

  it('recursos sin enlace llevan a Investigación; las cifras pasan tal cual', async () => {
    const r = await obtenerInicio()
    expect(r.recursos).toEqual([{ icono: '', titulo: 'Guía', texto: '', href: '/investigacion' }])
    expect(r.cifras).toEqual([{ valor: '9,000', texto: 'obras' }])
  })

  it('un global vacío no truena', async () => {
    findGlobal.mockResolvedValue({})
    expect(await obtenerInicio()).toEqual({
      portada: [],
      inicial: '',
      accesos: [],
      curaduria: null,
      destacadas: [],
      acervos: [],
      recursos: [],
      cifras: [],
    })
  })
})
