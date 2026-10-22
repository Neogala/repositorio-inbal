import type { CollectionConfig } from 'payload'

import { soloAdmin } from '../access/roles'
import { limitarConsultasPublicas } from '../hooks/limitar-consultas-publicas'
import { revalidarAlBorrar, revalidarAlGuardar } from '../hooks/revalidar'

export const Curadurias: CollectionConfig = {
  slug: 'curadurias',
  labels: { singular: 'Curaduría', plural: 'Curadurías' },
  admin: {
    group: 'Contenido',
    useAsTitle: 'titulo',
    hideAPIURL: true,
    defaultColumns: ['titulo', 'acervo', 'tema', 'orden'],
    preview: (doc) => (doc?.slug ? `${process.env.NEXT_PUBLIC_SITE_URL || ''}/curadurias/${doc.slug}` : null),
    components: {
      views: { list: { Component: '/components/admin/galeria/GaleriaContenido#GaleriaCuradurias' } },
    },
  },
  access: {
    read: ({ req: { user } }) => (user ? true : { publicada: { equals: true } }),
    delete: soloAdmin,
  },
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
          label: 'Presentación',
          fields: [
            { name: 'titulo', label: 'Título', type: 'text', required: true },
            {
              name: 'intro',
              label: 'Descripción corta',
              type: 'textarea',
              required: true,
              admin: { description: 'Aparece en la tarjeta del listado de curadurías.' },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'acervo',
                  label: 'Acervo',
                  type: 'select',
                  required: true,
                  options: ['MUNAL', 'MAM', 'MUNAE', 'San Carlos', 'Cruzada'],
                  admin: { width: '34%' },
                },
                { name: 'tema', label: 'Tema', type: 'text', admin: { width: '33%' } },
                { name: 'numObras', label: 'Número de obras', type: 'number', admin: { width: '33%' } },
              ],
            },
            { name: 'curador', label: 'Curaduría a cargo de', type: 'text' },
            {
              type: 'row',
              fields: [
                { name: 'portada', label: 'Portada', type: 'upload', relationTo: 'media', required: true, admin: { width: '50%' } },
                {
                  name: 'portadaSecundaria',
                  label: 'Imagen secundaria (collage)',
                  type: 'upload',
                  relationTo: 'media',
                  admin: { width: '50%' },
                },
              ],
            },
          ],
        },
        {
          label: 'Recorrido',
          description: 'Si lo dejas vacío, la curaduría aparece como "Próximamente".',
          fields: [
            { name: 'subtitulo', label: 'Subtítulo de la portada', type: 'textarea' },
            { name: 'fecha', label: 'Año', type: 'text' },
            {
              name: 'notaSala',
              label: 'Nota de sala',
              type: 'group',
              fields: [
                { name: 'titulo', label: 'Título', type: 'text' },
                { name: 'texto', label: 'Texto', type: 'textarea' },
              ],
            },
            {
              name: 'capitulos',
              label: 'Capítulos',
              type: 'array',
              labels: { singular: 'Capítulo', plural: 'Capítulos' },
              admin: { initCollapsed: true },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'num', label: 'Número', type: 'text', required: true, admin: { width: '20%', placeholder: 'I' } },
                    { name: 'titulo', label: 'Título', type: 'text', required: true, admin: { width: '80%' } },
                  ],
                },
                {
                  name: 'paradas',
                  label: 'Obras del capítulo',
                  type: 'array',
                  labels: { singular: 'Obra', plural: 'Obras' },
                  minRows: 1,
                  admin: { initCollapsed: true },
                  fields: [
                    { name: 'obra', label: 'Obra', type: 'relationship', relationTo: 'obras', required: true },
                    {
                      type: 'row',
                      fields: [
                        {
                          name: 'titulo',
                          label: 'Título a mostrar',
                          type: 'text',
                          admin: { width: '40%', description: 'Vacío: el de la obra.' },
                        },
                        {
                          name: 'autor',
                          label: 'Autor a mostrar',
                          type: 'text',
                          admin: { width: '40%', description: 'Vacío: el de la obra.' },
                        },
                        { name: 'anio', label: 'Año', type: 'number', admin: { width: '20%' } },
                      ],
                    },
                    { name: 'texto', label: 'Texto curatorial', type: 'textarea', required: true },
                    {
                      name: 'detalles',
                      label: 'Detalles (acercamientos)',
                      type: 'array',
                      labels: { singular: 'Detalle', plural: 'Detalles' },
                      admin: {
                        initCollapsed: true,
                        description:
                          'El primero es la vista completa. X y Y van de 0 a 100 (% de la imagen); zoom 1 es sin acercar.',
                      },
                      fields: [
                        {
                          type: 'row',
                          fields: [
                            { name: 'x', type: 'number', required: true, min: 0, max: 100, defaultValue: 50, admin: { width: '25%' } },
                            { name: 'y', type: 'number', required: true, min: 0, max: 100, defaultValue: 50, admin: { width: '25%' } },
                            { name: 'zoom', type: 'number', required: true, min: 1, max: 4, defaultValue: 1, admin: { width: '25%' } },
                          ],
                        },
                        { name: 'caption', label: 'Leyenda', type: 'text', required: true },
                        { name: 'nota', label: 'Nota', type: 'textarea' },
                      ],
                    },
                  ],
                },
                {
                  name: 'interludio',
                  label: 'Interludio al final del capítulo',
                  type: 'group',
                  fields: [
                    {
                      name: 'tipo',
                      label: 'Tipo',
                      type: 'select',
                      defaultValue: 'ninguno',
                      options: [
                        { value: 'ninguno', label: 'Ninguno' },
                        { value: 'cita', label: 'Cita' },
                        { value: 'contexto', label: 'Contexto' },
                      ],
                    },
                    {
                      name: 'titulo',
                      label: 'Título (contexto)',
                      type: 'text',
                      admin: { condition: (_, s) => s?.tipo === 'contexto' },
                    },
                    {
                      name: 'texto',
                      label: 'Texto',
                      type: 'textarea',
                      admin: { condition: (_, s) => s?.tipo && s.tipo !== 'ninguno' },
                    },
                    {
                      name: 'por',
                      label: 'Atribución (cita)',
                      type: 'text',
                      admin: { condition: (_, s) => s?.tipo === 'cita' },
                    },
                  ],
                },
              ],
            },
            {
              name: 'cierre',
              label: 'Cierre',
              type: 'group',
              fields: [
                { name: 'titulo', label: 'Título', type: 'text' },
                { name: 'texto', label: 'Texto', type: 'textarea' },
                { name: 'firma', label: 'Firma', type: 'text' },
              ],
            },
            {
              name: 'creditos',
              label: 'Créditos',
              type: 'group',
              fields: [
                { name: 'textos', label: 'Textos', type: 'text' },
                { name: 'musica', label: 'Sonido', type: 'text' },
                { name: 'imagenes', label: 'Imágenes', type: 'text' },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'musica', label: 'Música', type: 'upload', relationTo: 'audios', admin: { width: '50%' } },
                { name: 'audioguia', label: 'Audioguía', type: 'upload', relationTo: 'audios', admin: { width: '50%' } },
              ],
            },
            {
              name: 'relacionadas',
              label: 'Otras curadurías',
              type: 'relationship',
              relationTo: 'curadurias',
              hasMany: true,
            },
          ],
        },
      ],
    },
    // ---------- Lateral ----------
    {
      name: 'publicada',
      label: 'Publicada en el sitio',
      type: 'checkbox',
      defaultValue: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'destacada',
      label: 'Curaduría destacada',
      type: 'checkbox',
      admin: { position: 'sidebar', description: 'Encabeza el listado de curadurías.' },
    },
    {
      name: 'slug',
      label: 'Dirección (slug)',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { position: 'sidebar', description: 'Parte de la URL: /curadurias/<slug>.' },
    },
    { name: 'orden', label: 'Orden', type: 'number', defaultValue: 100, admin: { position: 'sidebar' } },
  ],
}
