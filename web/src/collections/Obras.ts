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
// El importador del Excel reconoce estos acervos.
export const MUSEOS = [
  { value: 'MUNAL', label: 'Museo Nacional de Arte (MUNAL)' },
  { value: 'MAM', label: 'Museo de Arte Moderno (MAM)' },
  { value: 'MUNAE', label: 'Museo Nacional de la Estampa (MUNAE)' },
  { value: 'MNSC', label: 'Museo Nacional de San Carlos' },
  { value: 'MPBA', label: 'Museo del Palacio de Bellas Artes' },
  { value: 'MNARQ', label: 'Museo Nacional de Arquitectura' },
  { value: 'MMDR', label: 'Museo Mural Diego Rivera' },
  { value: 'SAPS', label: 'Sala de Arte Público Siqueiros' },
  { value: 'MTAC', label: 'Museo Tamayo Arte Contemporáneo' },
  { value: 'MCEDRFK', label: 'Museo Casa Estudio Diego Rivera y Frida Kahlo' },
  { value: 'SPM', label: 'Salón de la Plástica Mexicana' },
  { value: 'MACG', label: 'Museo de Arte Carrillo Gil' },
  { value: 'MACJ', label: 'Museo de Arte de Ciudad Juárez' },
  { value: 'CAPILLA', label: 'Capilla Alfonsina' },
  { value: 'CENCROPAM', label: 'Centro Nacional de Conservación (CENCROPAM)' },
  { value: 'ICC', label: 'Instituto Cultural Cabañas' },
  { value: 'IAGO', label: 'Instituto de Artes Gráficas de Oaxaca' },
  { value: 'MAMGP', label: 'Museo de Arte Moderno de Gómez Palacio' },
  { value: 'MCDR', label: 'Museo Casa Diego Rivera (Guanajuato)' },
  { value: 'MCA', label: 'Museo de la Ciudad de Aguascalientes' },
  { value: 'MJLC', label: 'Museo José Luis Cuevas' },
] as const

// Solo los usuarios del panel leen los datos internos (ubicación, observaciones, originales).
const soloPanel = { read: ({ req }: { req: { user?: unknown } }) => Boolean(req.user) }

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
  hooks: {
    beforeChange: [
      ({ data, req }) => {
        // Quién hizo el último cambio (el importador no tiene usuario).
        if (req.user) data.editadoPor = req.user.id
        return data
      },
    ],
  },
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
      name: 'fechaAproximada',
      label: 'Fecha aproximada (ca., siglo o rango dudoso)',
      type: 'checkbox',
      defaultValue: false,
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
      type: 'row',
      fields: [
        { name: 'altoCm', label: 'Alto (cm)', type: 'number', min: 0 },
        { name: 'anchoCm', label: 'Ancho (cm)', type: 'number', min: 0 },
        { name: 'profundidadCm', label: 'Profundidad (cm)', type: 'number', min: 0 },
      ],
    },
    {
      name: 'autorMuerte',
      label: 'Año de muerte del autor',
      type: 'number',
      min: 1000,
      max: 2100,
      admin: { description: 'Sirve para saber si la obra ya es de dominio público (muerte + 100 años).' },
    },
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
      name: 'localizacion',
      label: 'Localización',
      type: 'text',
      access: soloPanel,
      admin: { description: 'Interna: bodega, préstamo o sala. No se publica.' },
    },
    {
      name: 'observaciones',
      label: 'Observaciones',
      type: 'textarea',
      access: soloPanel,
      admin: { description: 'Interna: oficios, inventario, conservación. No se publica.' },
    },
    {
      name: 'original',
      label: 'Datos originales de SIGROPAM',
      type: 'group',
      access: soloPanel,
      admin: { description: 'Como venían en el Excel, antes de normalizar. Solo lectura.' },
      fields: [
        { name: 'autor', label: 'Autor', type: 'text', admin: { readOnly: true } },
        { name: 'fecha', label: 'Fecha', type: 'text', admin: { readOnly: true } },
        { name: 'tecnica', label: 'Técnica', type: 'text', admin: { readOnly: true } },
        { name: 'medida', label: 'Medida', type: 'textarea', admin: { readOnly: true } },
        { name: 'disciplina', label: 'Disciplina', type: 'text', admin: { readOnly: true } },
        { name: 'acervo', label: 'Acervo', type: 'text', admin: { readOnly: true } },
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
    {
      name: 'editadoPor',
      label: 'Último cambio por',
      type: 'relationship',
      relationTo: 'users',
      admin: { position: 'sidebar', readOnly: true },
    },
  ],
}
