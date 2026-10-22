import type { CollectionConfig } from 'payload'

import { soloAdmin } from '../access/roles'
import { limitarConsultasPublicas } from '../hooks/limitar-consultas-publicas'
import { privacidadDespuesDeBorrar, privacidadDespuesDeGuardar } from '../hooks/privacidad-media'
import { revalidarAlBorrar, revalidarAlGuardar } from '../hooks/revalidar'
import { normalizar } from '../lib/normalizar'

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
// Son los acervos de la colección Acervos; el importador del Excel los reconoce.
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

// Solo los usuarios del panel leen los datos internos (ubicación, observaciones,
// originales, muerte del autor y origen del registro).
const soloPanel = { read: ({ req }: { req: { user?: unknown } }) => Boolean(req.user) }

const SITIO = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export const Obras: CollectionConfig = {
  slug: 'obras',
  labels: { singular: 'Obra', plural: 'Obras' },
  admin: {
    useAsTitle: 'titulo',
    group: 'Colección',
    description:
      'Obras del catálogo. Lo que marques como publicado aparece en el sitio al guardar.',
    defaultColumns: ['imagen', 'titulo', 'autor', 'fechaTexto', 'museo', 'derechos', 'publicada'],
    listSearchableFields: ['busqueda'],
    pagination: { defaultLimit: 25, limits: [25, 50, 100] },
    hideAPIURL: true,
    // Galería visual en lugar de la tabla de Payload.
    components: {
      views: {
        list: { Component: '/components/admin/galeria/GaleriaObras#GaleriaObras' },
      },
      edit: {
        beforeDocumentControls: ['/components/admin/galeria/navegacion#NavObra'],
      },
    },
    // Botón "Vista previa": abre la ficha pública de la obra.
    preview: (doc) => (doc?.sigropam ? `${SITIO}/obras/${doc.sigropam}` : null),
  },
  access: {
    // El público solo ve obras publicadas; los usuarios del panel ven todas.
    read: ({ req: { user } }) => (user ? true : { publicada: { equals: true } }),
    // Borrar solo el administrador; un editor oculta la obra en lugar de borrarla.
    delete: soloAdmin,
  },
  defaultSort: 'autor',
  // Historial: cada guardado queda como versión que se puede comparar y restaurar.
  versions: { maxPerDoc: 30 },
  hooks: {
    beforeOperation: [
      limitarConsultasPublicas({
        camposInternos: [
          'localizacion',
          'observaciones',
          'original',
          'editadoPor',
          'autorMuerte',
          'origen',
        ],
      }),
    ],
    beforeChange: [
      ({ data, req, originalDoc }) => {
        // Índice de búsqueda sin acentos (título, autor, técnica y No. SIGROPAM).
        const doc = { ...originalDoc, ...data }
        data.busqueda = normalizar(
          [doc.titulo, doc.autor, doc.tecnica, doc.sigropam].filter(Boolean).join(' '),
        )
        // Un solo año: el año final es el mismo que el inicial.
        if (data.anioInicio != null && data.anioFin == null) data.anioFin = data.anioInicio
        // Quién hizo el último cambio (los importadores no tienen usuario).
        if (req.user) data.editadoPor = req.user.id
        return data
      },
    ],
    // Oculta del público la imagen de una obra oculta o restringida y regenera el sitio.
    afterChange: [privacidadDespuesDeGuardar, revalidarAlGuardar],
    afterDelete: [privacidadDespuesDeBorrar, revalidarAlBorrar],
  },
  fields: [
    // ---------- Panel lateral: visor con vista previa en vivo ----------
    {
      name: 'vistaImagen',
      type: 'ui',
      admin: {
        position: 'sidebar',
        components: { Field: '/components/admin/VistaImagen#VistaImagen' },
      },
    },
    // ---------- Contenido ----------
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Ficha',
          fields: [
            {
              name: 'publicada',
              label: 'Publicada en el sitio',
              type: 'checkbox',
              defaultValue: true,
              index: true,
              admin: {
                description: 'Desmárcala para ocultar la obra sin borrarla.',
                components: { Cell: '/components/admin/Celdas#CeldaEstado' },
              },
            },
            {
              name: 'titulo',
              label: 'Título',
              type: 'text',
              required: true,
              admin: { components: { Cell: '/components/admin/Celdas#CeldaTitulo' } },
            },
            {
              name: 'autor',
              label: 'Autor',
              type: 'text',
              required: true,
              index: true,
              admin: {
                description: 'Como debe aparecer en el sitio, por ejemplo: María Izquierdo.',
                components: { Field: '/components/admin/CampoSugerencias#CampoSugerencias' },
              },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'fechaTexto',
                  label: 'Fecha como se muestra',
                  type: 'text',
                  admin: { width: '40%', placeholder: '1940, ca. 1925, S/F, Siglo XIX…' },
                },
                {
                  name: 'anioInicio',
                  label: 'Año inicial',
                  type: 'number',
                  index: true,
                  min: 1000,
                  max: 2100,
                  admin: { width: '30%', description: 'Para el filtro por años.' },
                },
                {
                  name: 'anioFin',
                  label: 'Año final',
                  type: 'number',
                  index: true,
                  min: 1000,
                  max: 2100,
                  validate: (
                    v: number | null | undefined,
                    { siblingData }: { siblingData: { anioInicio?: number | null } },
                  ) =>
                    v == null || siblingData.anioInicio == null || v >= siblingData.anioInicio
                      ? true
                      : 'El año final no puede ser menor que el inicial.',
                  admin: { width: '30%', description: 'Si es un solo año, déjalo vacío.' },
                },
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
                  admin: { width: '50%', placeholder: 'Elige el periodo' },
                },
                {
                  name: 'tipo',
                  label: 'Tipo de obra',
                  type: 'select',
                  options: [...TIPOS],
                  index: true,
                  admin: { width: '50%', placeholder: 'Elige el tipo' },
                },
              ],
            },
            {
              name: 'tecnica',
              label: 'Técnica',
              type: 'text',
              index: true,
              admin: {
                placeholder: 'Óleo sobre tela',
                components: { Field: '/components/admin/CampoSugerencias#CampoSugerencias' },
              },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'altoCm',
                  label: 'Alto (cm)',
                  type: 'number',
                  min: 0,
                  admin: { width: '33%' },
                },
                {
                  name: 'anchoCm',
                  label: 'Ancho (cm)',
                  type: 'number',
                  min: 0,
                  admin: { width: '33%' },
                },
                {
                  name: 'profundidadCm',
                  label: 'Fondo (cm)',
                  type: 'number',
                  min: 0,
                  admin: { width: '34%' },
                },
              ],
            },
          ],
        },
        {
          label: 'Imagen y derechos',
          fields: [
            {
              name: 'imagen',
              label: 'Imagen',
              type: 'upload',
              relationTo: 'media',
              admin: {
                description:
                  'Imagen en alta resolución, sin marca de agua. Las miniaturas se generan solas.',
                components: { Cell: '/components/admin/Celdas#CeldaImagen' },
              },
            },

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
              admin: {
                description:
                  'Con "Restringida" la obra se publica sin imagen. En México los derechos duran la vida del autor más 100 años.',
                components: { Cell: '/components/admin/Celdas#CeldaDerechos' },
              },
            },
            {
              name: 'autorMuerte',
              label: 'Año de muerte del autor',
              type: 'number',
              min: 1000,
              max: 2100,
              // Dato de trabajo para revisar derechos; el sitio no lo muestra.
              access: soloPanel,
              admin: {
                description:
                  'Sirve para saber si la obra ya es de dominio público (muerte + 100 años).',
              },
            },
          ],
        },
        {
          label: 'Catálogo',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'museo',
                  label: 'Acervo',
                  type: 'select',
                  options: MUSEOS.map((m) => ({ ...m })),
                  required: true,
                  index: true,
                  admin: { width: '60%', placeholder: 'Elige el acervo' },
                },
                {
                  name: 'sigropam',
                  label: 'No. SIGROPAM',
                  type: 'text',
                  required: true,
                  unique: true,
                  index: true,
                  validate: (v: string | null | undefined) =>
                    !v || /^\d+$/.test(v) ? true : 'El No. SIGROPAM solo lleva números.',
                  admin: {
                    width: '40%',
                    description: 'Identificador único. También da nombre a su imagen.',
                  },
                },
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
              access: soloPanel,
              admin: { readOnly: true, description: 'Lo llena el importador; no se edita a mano.' },
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
              admin: {
                description: 'Como venían en el Excel, antes de normalizar. Solo lectura.',
                // En una obra nueva o capturada a mano solo serían cajas vacías.
                condition: (data) => Object.values(data?.original ?? {}).some(Boolean),
              },
              fields: [
                { name: 'autor', label: 'Autor', type: 'text', admin: { readOnly: true } },
                { name: 'fecha', label: 'Fecha', type: 'text', admin: { readOnly: true } },
                { name: 'tecnica', label: 'Técnica', type: 'text', admin: { readOnly: true } },
                { name: 'medida', label: 'Medida', type: 'textarea', admin: { readOnly: true } },
                {
                  name: 'disciplina',
                  label: 'Disciplina',
                  type: 'text',
                  admin: { readOnly: true },
                },
                { name: 'acervo', label: 'Acervo', type: 'text', admin: { readOnly: true } },
              ],
            },
            {
              name: 'busqueda',
              type: 'text',
              index: true,
              admin: { hidden: true },
            },
            {
              name: 'editadoPor',
              label: 'Último cambio por',
              type: 'relationship',
              relationTo: 'users',
              admin: { readOnly: true },
              access: soloPanel,
            },
          ],
        },
      ],
    },
  ],
}
