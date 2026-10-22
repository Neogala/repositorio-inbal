import type { CollectionConfig } from 'payload'

import { soloAdmin } from '../access/roles'
import { limitarConsultasPublicas } from '../hooks/limitar-consultas-publicas'
import { archivoPrivadoSinCache } from '../hooks/privacidad-media'
import { revalidarAlBorrar, revalidarAlGuardar } from '../hooks/revalidar'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Imagen', plural: 'Imágenes' },
  admin: {
    group: 'Colección',
    description: 'Imágenes de las obras y del sitio.',
    defaultColumns: ['filename', 'alt', 'updatedAt'],
    pagination: { defaultLimit: 25 },
    hideAPIURL: true,
    components: {
      views: { list: { Component: '/components/admin/galeria/GaleriaImagenes#GaleriaImagenes' } },
    },
  },
  access: {
    // El público no ve las imágenes privadas (de obras ocultas o restringidas);
    // la regla también aplica al archivo en /api/media/file.
    read: ({ req: { user } }) => (user ? true : { privada: { not_equals: true } }),
    delete: soloAdmin,
  },
  // Un cambio de texto alternativo o de archivo se ve en todo el sitio.
  hooks: {
    beforeOperation: [limitarConsultasPublicas()],
    afterChange: [revalidarAlGuardar],
    afterDelete: [revalidarAlBorrar],
  },
  fields: [
    {
      name: 'alt',
      label: 'Texto alternativo',
      type: 'text',
      admin: { description: 'Describe la imagen para lectores de pantalla y buscadores.' },
      required: true,
    },
    {
      name: 'privada',
      type: 'checkbox',
      defaultValue: false,
      index: true,
      // Lo calcula el hook de Obras (hooks/privacidad-media.ts); nadie lo edita a mano.
      admin: { hidden: true },
      access: { create: () => false, update: () => false },
    },
  ],
  upload: {
    // Miniaturas para la grilla, tamaño mediano para la ficha y uno grande para el zoom
    // (así el zoom no le pide al servidor redimensionar el original completo).
    imageSizes: [
      { name: 'miniatura', width: 480 },
      { name: 'ficha', width: 1400 },
      { name: 'zoom', width: 2800, withoutEnlargement: true },
    ],
    // Lista cerrada: image/* incluiría SVG, que puede llevar código.
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/tiff'],
    // Miniatura en las listas del panel.
    adminThumbnail: 'miniatura',
    // El archivo de una imagen privada sale con Cache-Control: private, no-store.
    handlers: [archivoPrivadoSinCache],
  },
}
