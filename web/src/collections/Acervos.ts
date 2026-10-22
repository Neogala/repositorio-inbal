import type { CollectionConfig } from 'payload'

import { soloAdmin } from '../access/roles'
import { limitarConsultasPublicas } from '../hooks/limitar-consultas-publicas'
import { revalidarAlBorrar, revalidarAlGuardar } from '../hooks/revalidar'
import { MUSEOS } from './Obras'

// Colores de acento de las tarjetas de acervo (los del prototipo).
export const COLORES_ACERVO = [
  { value: '155,34,71', label: 'Guinda' },
  { value: '39,64,96', label: 'Añil' },
  { value: '30,91,79', label: 'Verde' },
  { value: '165,127,44', label: 'Ocre' },
  { value: '176,83,47', label: 'Terracota' },
  { value: '217,192,122', label: 'Arena' },
  { value: '138,131,119', label: 'Piedra' },
  { value: '38,32,31', label: 'Tinta' },
  { value: '30,92,59', label: 'Verde bosque' },
  { value: '141,194,183', label: 'Agua' },
  { value: '219,211,182', label: 'Arena clara' },
]

export const Acervos: CollectionConfig = {
  slug: 'acervos',
  labels: { singular: 'Acervo', plural: 'Acervos' },
  admin: {
    group: 'Contenido',
    useAsTitle: 'nombre',
    hideAPIURL: true,
    defaultColumns: ['nombre', 'zona', 'orden'],
    preview: (doc) => (doc?.slug ? `${process.env.NEXT_PUBLIC_SITE_URL || ''}/acervos/${doc.slug}` : null),
    components: {
      views: { list: { Component: '/components/admin/galeria/GaleriaContenido#GaleriaAcervos' } },
    },
  },
  access: { read: () => true, delete: soloAdmin },
  defaultSort: 'orden',
  hooks: {
    beforeOperation: [limitarConsultasPublicas()],
    afterChange: [revalidarAlGuardar],
    afterDelete: [revalidarAlBorrar],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Museo',
          fields: [
            { name: 'nombre', label: 'Nombre', type: 'text', required: true },
            {
              type: 'row',
              fields: [
                { name: 'siglas', label: 'Siglas', type: 'text', required: true, admin: { width: '30%' } },
                { name: 'zona', label: 'Zona', type: 'text', admin: { width: '70%', placeholder: 'Centro Histórico, CDMX' } },
              ],
            },
            { name: 'semblanza', label: 'Semblanza', type: 'textarea', required: true },
            { name: 'direccion', label: 'Dirección', type: 'text' },
            {
              type: 'row',
              fields: [
                { name: 'totalObras', label: 'Obras del acervo', type: 'number', admin: { width: '33%' } },
                { name: 'digitalizadas', label: 'Digitalizadas', type: 'number', admin: { width: '33%' } },
                { name: 'fundacion', label: 'Fundación', type: 'number', admin: { width: '34%' } },
              ],
            },
            { name: 'imagen', label: 'Fotografía del recinto', type: 'upload', relationTo: 'media' },
          ],
        },
        {
          label: 'Curaduría del museo',
          fields: [
            {
              name: 'curaduria',
              type: 'group',
              label: false,
              fields: [
                { name: 'titulo', label: 'Título', type: 'text' },
                { name: 'intro', label: 'Introducción', type: 'textarea' },
                {
                  type: 'row',
                  fields: [
                    { name: 'autoria', label: 'Autoría', type: 'text', admin: { width: '60%' } },
                    { name: 'numObras', label: 'Número de obras', type: 'number', admin: { width: '40%' } },
                  ],
                },
                { name: 'imagen', label: 'Imagen principal', type: 'upload', relationTo: 'media' },
                {
                  name: 'extras',
                  label: 'Imágenes de "Obra comentada" y "Colección fundacional"',
                  type: 'upload',
                  relationTo: 'media',
                  hasMany: true,
                  maxRows: 2,
                },
              ],
            },
          ],
        },
      ],
    },
    // ---------- Lateral ----------
    {
      name: 'slug',
      label: 'Dirección (slug)',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { position: 'sidebar', description: 'Parte de la URL: /acervos/<slug>.' },
    },
    {
      name: 'claveObras',
      label: 'Acervo en el catálogo de obras',
      type: 'select',
      options: MUSEOS.map((m) => ({ ...m })),
      admin: {
        position: 'sidebar',
        description: 'Para mostrar sus obras. Vacío si aún no hay obras cargadas.',
      },
    },
    { name: 'color', label: 'Color de acento', type: 'select', options: COLORES_ACERVO, defaultValue: '30,91,79', admin: { position: 'sidebar' } },
    { name: 'orden', label: 'Orden', type: 'number', defaultValue: 100, admin: { position: 'sidebar' } },
  ],
}
