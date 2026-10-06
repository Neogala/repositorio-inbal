import type { CollectionConfig } from 'payload'

// Catálogos de la Fase 1 tomados del prototipo (colecciones.html).
// Se ajustan cuando se acuerde el catálogo corto con el INBAL (ver docs/analisis-datos.md).
export const PERIODOS = [
  'Arte Colonial',
  'Siglo XIX',
  'Arte Moderno',
  'Arte Contemporáneo',
  'Sin fecha',
] as const

export const TIPOS = [
  'Pintura',
  'Fotografía',
  'Grabado',
  'Escultura',
  'Dibujo',
  'Artes decorativas',
] as const

// Clave que usan los nombres de imagen (<MUSEO>_<SIGROPAM>) y nombre para mostrar.
export const MUSEOS = [
  { value: 'MUNAL', label: 'Museo Nacional de Arte (MUNAL)' },
  { value: 'MAM', label: 'Museo de Arte Moderno (MAM)' },
  { value: 'MUNAE', label: 'Museo Nacional de la Estampa (MUNAE)' },
  { value: 'MNSC', label: 'Museo Nacional de San Carlos' },
] as const

export const Obras: CollectionConfig = {
  slug: 'obras',
  labels: { singular: 'Obra', plural: 'Obras' },
  admin: {
    useAsTitle: 'titulo',
    defaultColumns: ['titulo', 'autor', 'fechaTexto', 'museo', 'sigropam', 'publicada'],
    listSearchableFields: ['titulo', 'autor', 'sigropam'],
  },
  access: {
    // El público solo ve obras publicadas; los usuarios del panel ven todas.
    read: ({ req: { user } }) => (user ? true : { publicada: { equals: true } }),
  },
  defaultSort: 'autor',
  fields: [
    {
      name: 'sigropam',
      label: 'No. SIGROPAM',
      type: 'text',
      required: true,
      unique: true,
      index: true,
    },
    { name: 'titulo', label: 'Título', type: 'text', required: true },
    { name: 'autor', label: 'Autor', type: 'text', required: true, index: true },
    {
      type: 'row',
      fields: [
        {
          name: 'fechaTexto',
          label: 'Fecha (como se muestra)',
          type: 'text',
          admin: { description: 'Texto original: 1940, ca. 1925, S/F, Siglo XIX…' },
        },
        { name: 'anioInicio', label: 'Año inicial', type: 'number', index: true },
        { name: 'anioFin', label: 'Año final', type: 'number', index: true },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'periodo',
          label: 'Periodo',
          type: 'select',
          options: [...PERIODOS],
          index: true,
        },
        { name: 'tipo', label: 'Tipo de obra', type: 'select', options: [...TIPOS], index: true },
        {
          name: 'museo',
          label: 'Acervo',
          type: 'select',
          options: MUSEOS.map((m) => ({ ...m })),
          required: true,
          index: true,
        },
      ],
    },
    { name: 'tecnica', label: 'Técnica', type: 'text', index: true },
    {
      name: 'imagen',
      label: 'Imagen',
      type: 'upload',
      relationTo: 'media',
    },
    {
      type: 'row',
      fields: [
        {
          name: 'derechos',
          label: 'Derechos de imagen',
          type: 'select',
          defaultValue: 'por-confirmar',
          options: [
            { value: 'libre', label: 'Libre / dominio público' },
            { value: 'autorizada', label: 'Uso autorizado' },
            { value: 'restringida', label: 'Restringida (no mostrar imagen)' },
            { value: 'por-confirmar', label: 'Por confirmar' },
          ],
        },
        {
          name: 'origen',
          label: 'Origen del registro',
          type: 'select',
          defaultValue: 'excel',
          options: [
            { value: 'prototipo', label: 'Prototipo' },
            { value: 'excel', label: 'Excel SIGROPAM' },
            { value: 'arca', label: 'ARCA' },
          ],
          admin: { readOnly: true },
        },
      ],
    },
    {
      name: 'publicada',
      label: 'Publicada',
      type: 'checkbox',
      defaultValue: true,
      index: true,
      admin: { position: 'sidebar' },
    },
  ],
}
