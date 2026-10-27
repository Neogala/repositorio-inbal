import path from 'path'
import { Readable } from 'stream'

import { beforeEach, describe, expect, it, vi } from 'vitest'

const fsMock = vi.hoisted(() => ({ stat: vi.fn(), createReadStream: vi.fn() }))
vi.mock('fs/promises', () => ({ default: { stat: fsMock.stat } }))
vi.mock('fs', () => ({ createReadStream: fsMock.createReadStream }))

import {
  archivoPrivadoSinCache,
  privacidadDespuesDeBorrar,
  privacidadDespuesDeGuardar,
} from '@/hooks/privacidad-media'

type ObraFalsa = { publicada?: boolean; derechos?: string }

// req con una Local API falsa: find devuelve lo que se le pida, update se registra.
function reqFalso({ obras = [] as ObraFalsa[], media = [] as unknown[] } = {}) {
  const find = vi.fn(async ({ collection }: { collection: string }) => ({
    docs: collection === 'obras' ? obras : media,
  }))
  const update = vi.fn(async (_args: { id: number; data: unknown }) => ({}))
  return {
    req: { payload: { find, update, config: {} }, headers: new Headers() },
    find,
    update,
  }
}

const guardar = (doc: unknown, previousDoc: unknown, req: unknown) =>
  privacidadDespuesDeGuardar({ doc, previousDoc, req } as never)

describe('privacidad de la imagen al guardar una obra', () => {
  it('una imagen sin obras conserva su privacidad', async () => {
    const { req, update } = reqFalso()
    await guardar({ imagen: 3 }, undefined, req)
    expect(update).not.toHaveBeenCalled()
  })

  it('es privada si su obra está oculta o tiene derechos restringidos', async () => {
    for (const obra of [
      { publicada: false, derechos: 'libre' },
      { publicada: true, derechos: 'restringida' },
    ]) {
      const { req, update } = reqFalso({ obras: [obra] })
      await guardar({ imagen: 3 }, undefined, req)
      expect(update.mock.calls[0]).toEqual([expect.objectContaining({ data: { privada: true } })])
    }
  })

  it('si la comparten varias obras basta con que una se pueda mostrar', async () => {
    const { req, update } = reqFalso({
      obras: [
        { publicada: false, derechos: 'libre' },
        { publicada: true, derechos: 'libre' },
      ],
    })
    await guardar({ imagen: 3 }, undefined, req)
    expect(update).toHaveBeenCalledWith(expect.objectContaining({ data: { privada: false } }))
  })

  it('busca las obras de esa imagen con la misma petición (misma transacción)', async () => {
    const { req, find } = reqFalso()
    await guardar({ imagen: { id: 8 } }, undefined, req)
    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({ collection: 'obras', where: { imagen: { equals: 8 } }, req }),
    )
  })

  it('al cambiar de imagen recalcula la nueva y la que dejó', async () => {
    const { req, update } = reqFalso({ obras: [{ publicada: false }] })
    await guardar({ imagen: { id: 8 } }, { imagen: 5 }, req)
    expect(update.mock.calls.map(([a]) => a.id).sort()).toEqual([5, 8])
  })

  it('con la misma imagen antes y después la recalcula una sola vez', async () => {
    const { req, update } = reqFalso({ obras: [{ publicada: false }] })
    await guardar({ imagen: 8 }, { imagen: { id: 8 } }, req)
    expect(update).toHaveBeenCalledTimes(1)
  })

  it('sin imagen no hace nada y devuelve el documento', async () => {
    const { req, find, update } = reqFalso()
    const doc = { imagen: null }
    expect(await guardar(doc, { imagen: undefined }, req)).toBe(doc)
    expect(find).not.toHaveBeenCalled()
    expect(update).not.toHaveBeenCalled()
  })

  it('al borrar la última obra no publica la imagen huérfana', async () => {
    const { req, update } = reqFalso()
    await privacidadDespuesDeBorrar({ doc: { imagen: 4 }, req } as never)
    expect(update).not.toHaveBeenCalled()
    update.mockClear()
    await privacidadDespuesDeBorrar({ doc: {}, req } as never)
    expect(update).not.toHaveBeenCalled()
  })

  it('al sustituir una imagen privada conserva la anterior y calcula la nueva', async () => {
    const { req, find, update } = reqFalso()
    find.mockResolvedValueOnce({ docs: [{ publicada: true, derechos: 'libre' }] })
    find.mockResolvedValueOnce({ docs: [] })
    await guardar({ imagen: 8 }, { imagen: 5 }, req)
    expect(update).toHaveBeenCalledTimes(1)
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({ id: 8, data: { privada: false } }),
    )
  })

  it('al quitar la imagen de una obra conserva la privacidad del archivo', async () => {
    const { req, update } = reqFalso()
    await guardar({ imagen: null }, { imagen: 5 }, req)
    expect(update).not.toHaveBeenCalled()
  })

  it('al borrar una obra recalcula según las obras restantes', async () => {
    const { req, update } = reqFalso({ obras: [{ publicada: false }] })
    await privacidadDespuesDeBorrar({ doc: { imagen: 4 }, req } as never)
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({ id: 4, data: { privada: true } }),
    )
  })
})

describe('archivo de una imagen privada', () => {
  // Sin respuesta propia el manejador devuelve undefined; aquí se tipa como opcional.
  const servir = async (req: unknown, doc: unknown, filename: string) =>
    (await archivoPrivadoSinCache(req as never, { doc, params: { filename } } as never)) as
      Response | undefined
  const respuesta = async (req: unknown, doc: unknown, filename: string) => {
    const r = await servir(req, doc, filename)
    if (!r) throw new Error('Se esperaba una respuesta propia')
    return r
  }

  beforeEach(() => {
    fsMock.stat.mockReset().mockResolvedValue({ size: 3 })
    fsMock.createReadStream
      .mockReset()
      .mockImplementation(() => Readable.from([Buffer.from('abc')]))
  })

  it('una imagen pública sigue el camino normal de Payload', async () => {
    const { req } = reqFalso()
    expect(await servir(req, { privada: false, filename: 'a.jpg' }, 'a.jpg')).toBeUndefined()
    expect(fsMock.stat).not.toHaveBeenCalled()
  })

  it('en la nube deja el archivo al adaptador de S3, marcado sin caché', async () => {
    vi.stubEnv('S3_BUCKET', 'media')
    const { req } = reqFalso()
    const headers = new Headers()
    const r = await archivoPrivadoSinCache(
      req as never,
      { doc: { privada: true, filename: 'a.jpg' }, headers, params: { filename: 'a.jpg' } } as never,
    )
    vi.unstubAllEnvs()
    expect(r).toBeUndefined()
    expect(headers.get('Cache-Control')).toBe('private, no-store')
    expect(fsMock.stat).not.toHaveBeenCalled()
  })

  it('una privada sale sin caché, con su tipo y su tamaño', async () => {
    const { req } = reqFalso()
    const r = await respuesta(
      req,
      { privada: true, filename: 'a.jpg', mimeType: 'image/jpeg' },
      'a.jpg',
    )
    expect(r.status).toBe(200)
    expect(r.headers.get('Cache-Control')).toBe('private, no-store')
    expect(r.headers.get('Content-Type')).toBe('image/jpeg')
    expect(r.headers.get('Content-Length')).toBe('3')
    expect(await r.text()).toBe('abc')
    expect(fsMock.createReadStream).toHaveBeenCalledWith(path.resolve('media', 'a.jpg'))
  })

  it('usa el tipo del tamaño pedido y, si no hay, uno genérico', async () => {
    const { req } = reqFalso()
    const media = {
      privada: true,
      mimeType: null,
      sizes: { miniatura: { filename: 'a-300.webp', mimeType: 'image/webp' } },
    }
    expect((await respuesta(req, media, 'a-300.webp')).headers.get('Content-Type')).toBe(
      'image/webp',
    )
    expect((await respuesta(req, media, 'otro.bin')).headers.get('Content-Type')).toBe(
      'application/octet-stream',
    )
  })

  it('rechaza nombres que salen de la carpeta media', async () => {
    const { req } = reqFalso()
    for (const nombre of ['../.env', '../../etc/passwd', '']) {
      const r = await respuesta(req, { privada: true }, nombre)
      expect(r.status).toBe(400)
    }
    expect(fsMock.stat).not.toHaveBeenCalled()
  })

  it('responde 404 si el archivo no está en disco', async () => {
    fsMock.stat.mockRejectedValue(Object.assign(new Error('ENOENT'), { code: 'ENOENT' }))
    const { req } = reqFalso()
    expect((await respuesta(req, { privada: true }, 'falta.jpg')).status).toBe(404)
  })

  it('con sesión Payload no pasa el documento: lo busca por el nombre del archivo', async () => {
    const { req, find } = reqFalso({ media: [{ privada: true, mimeType: 'image/png' }] })
    const r = await respuesta(req, undefined, 'b-zoom.png')
    expect(r.headers.get('Cache-Control')).toBe('private, no-store')
    const consulta = find.mock.calls[0][0] as unknown as { collection: string; where: unknown }
    expect(consulta.collection).toBe('media')
    expect(consulta.where).toEqual({
      or: [
        { filename: { equals: 'b-zoom.png' } },
        { 'sizes.miniatura.filename': { equals: 'b-zoom.png' } },
        { 'sizes.ficha.filename': { equals: 'b-zoom.png' } },
        { 'sizes.zoom.filename': { equals: 'b-zoom.png' } },
      ],
    })
  })

  it('si no encuentra la imagen deja que Payload responda', async () => {
    const { req } = reqFalso()
    expect(await servir(req, undefined, 'nada.jpg')).toBeUndefined()
  })
})
