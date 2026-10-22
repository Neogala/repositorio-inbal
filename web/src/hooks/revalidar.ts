import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, GlobalAfterChangeHook } from 'payload'

// Regenera el sitio público al guardar en el panel. Las páginas cruzan datos (el home
// muestra obras, acervos y curadurías; Investigación usa obras y acervos), así que se
// invalida todo el sitio: son pocas páginas y Next solo rehace las que alguien pide.
// La etiqueta "obras" invalida además las consultas guardadas en caché (facetas).
// Fuera de Next (scripts de importación) no hay caché que invalidar; esos scripts
// avisan al sitio por /api/revalidar al terminar.

export const ETIQUETA_OBRAS = 'obras'

export async function revalidarSitio() {
  try {
    const { revalidatePath, revalidateTag } = await import('next/cache')
    revalidatePath('/', 'layout')
    revalidateTag(ETIQUETA_OBRAS, { expire: 0 })
  } catch {
    // Sin contexto de Next: no hay nada que regenerar.
  }
}

export const revalidarAlGuardar: CollectionAfterChangeHook = async ({ doc }) => {
  await revalidarSitio()
  return doc
}

export const revalidarAlBorrar: CollectionAfterDeleteHook = async ({ doc }) => {
  await revalidarSitio()
  return doc
}

export const revalidarGlobal: GlobalAfterChangeHook = async ({ doc }) => {
  await revalidarSitio()
  return doc
}
