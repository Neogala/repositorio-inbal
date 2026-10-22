import { createReadStream } from 'fs'
import fs from 'fs/promises'
import path from 'path'
import { Readable } from 'stream'

import {
  headersWithCors,
  type CollectionAfterChangeHook,
  type CollectionAfterDeleteHook,
  type CollectionConfig,
  type PayloadRequest,
} from 'payload'

// Una imagen es privada si pertenece a una obra que no se puede mostrar: oculta o
// con derechos restringidos. La colección Media la esconde del público (también el
// archivo en /api/media/file), así que nadie la baja por la API. Las imágenes del
// contenido (acervos, curadurías, inicio) no son de ninguna obra y quedan públicas.

type ConImagen = { imagen?: number | { id: number } | null }

const idDe = (imagen: ConImagen['imagen']) =>
  (typeof imagen === 'object' ? imagen?.id : imagen) ?? null

async function sincronizar(mediaId: number, req: PayloadRequest) {
  const { docs } = await req.payload.find({
    collection: 'obras',
    where: { imagen: { equals: mediaId } },
    select: { publicada: true, derechos: true },
    pagination: false,
    depth: 0,
    req,
  })
  // Desvincular o borrar una obra no autoriza a publicar su archivo anterior.
  // Sin obras asociadas conservamos el estado, incluidas las imágenes del contenido.
  if (docs.length === 0) return
  // Si la comparten varias obras basta con que una la pueda mostrar.
  const privada = !docs.some((o) => o.publicada && o.derechos !== 'restringida')
  await req.payload.update({
    collection: 'media',
    id: mediaId,
    data: { privada },
    depth: 0,
    req,
  })
}

export const privacidadDespuesDeGuardar: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  req,
}) => {
  const ids = new Set([
    idDe((doc as ConImagen).imagen),
    idDe((previousDoc as ConImagen | undefined)?.imagen),
  ])
  for (const id of ids) if (id != null) await sincronizar(id, req)
  return doc
}

export const privacidadDespuesDeBorrar: CollectionAfterDeleteHook = async ({ doc, req }) => {
  const id = idDe((doc as ConImagen).imagen)
  if (id != null) await sincronizar(id, req)
  return doc
}

// Archivo de una imagen privada en /api/media/file: solo lo recibe quien tiene sesión
// (la regla de acceso de Media ya lo esconde del público), pero ninguna caché, ni la
// del navegador ni la de un CDN, debe guardarlo. Payload no deja cambiar los
// encabezados según el documento en su respuesta normal, así que esta función la
// sirve ella misma; las imágenes públicas siguen el camino de siempre.
type ManejadorArchivo = NonNullable<
  Exclude<CollectionConfig['upload'], boolean | undefined>['handlers']
>[number]

type DocMedia = {
  privada?: boolean | null
  filename?: string | null
  mimeType?: string | null
  sizes?: Record<string, { filename?: string | null; mimeType?: string | null } | undefined>
}

async function servirSinCache(req: PayloadRequest, media: DocMedia, filename: string) {
  // Mismo directorio y misma defensa contra rutas con ../ que Payload.
  const dir = path.resolve('media')
  const ruta = path.resolve(dir, filename)
  if (!ruta.startsWith(dir + path.sep)) return new Response(null, { status: 400 })
  const stats = await fs.stat(ruta).catch(() => null)
  if (!stats) return new Response(null, { status: 404 })
  const tamano = Object.values(media.sizes ?? {}).find((s) => s?.filename === filename)
  const headers = new Headers({
    'Content-Type': (tamano ?? media).mimeType || 'application/octet-stream',
    'Content-Length': String(stats.size),
    'Cache-Control': 'private, no-store',
  })
  const flujo = Readable.toWeb(createReadStream(ruta)) as ReadableStream
  return new Response(flujo, { headers: headersWithCors({ headers, req }) })
}

// Payload solo pasa el documento cuando la regla de acceso filtra (público); con
// sesión la regla es `true` y no lo busca, así que aquí se busca por nombre de archivo.
async function buscarPorArchivo(req: PayloadRequest, filename: string) {
  const { docs } = await req.payload.find({
    collection: 'media',
    where: {
      or: [
        { filename: { equals: filename } },
        { 'sizes.miniatura.filename': { equals: filename } },
        { 'sizes.ficha.filename': { equals: filename } },
        { 'sizes.zoom.filename': { equals: filename } },
      ],
    },
    limit: 1,
    depth: 0,
    pagination: false,
    req,
  })
  return docs[0] as DocMedia | undefined
}

export const archivoPrivadoSinCache: ManejadorArchivo = async (req, { doc, headers, params }) => {
  const media = (doc as DocMedia | undefined) ?? (await buscarPorArchivo(req, params.filename))
  if (media?.privada) {
    // En la nube el archivo está en Supabase Storage: lo sirve el adaptador de S3, que
    // copia estos encabezados en su respuesta.
    if (process.env.S3_BUCKET) {
      headers?.set('Cache-Control', 'private, no-store')
      return undefined as unknown as Response
    }
    return servirSinCache(req, media, params.filename)
  }
  // Sin respuesta propia: Payload sirve el archivo como siempre.
  return undefined as unknown as Response
}
