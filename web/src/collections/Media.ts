import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Archivo', plural: 'Archivos' },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
  ],
  upload: {
    // Miniaturas para la grilla y tamaño mediano para la ficha.
    imageSizes: [
      { name: 'miniatura', width: 480 },
      { name: 'ficha', width: 1400 },
    ],
    mimeTypes: ['image/*'],
  },
}
