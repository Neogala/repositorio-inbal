import type { GlobalConfig } from 'payload'

import { conSesion } from '../access/roles'
import { revalidarGlobal } from '../hooks/revalidar'
import { COLORES_ACERVO } from '../collections/Acervos'

// Contenido editable del home.
export const Inicio: GlobalConfig = {
  slug: 'inicio',
  label: 'Página de inicio',
  admin: { group: 'Contenido', hideAPIURL: true },
  access: { read: () => true, update: conSesion },
  hooks: { afterChange: [revalidarGlobal] },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Portada',
          fields: [
            {
              name: 'portadaObras',
              label: 'Obras de la portada animada',
              type: 'upload',
              relationTo: 'media',
              hasMany: true,
              minRows: 8,
              maxRows: 30,
              admin: { description: 'Entre 8 y 30 imágenes; se acomodan en círculo y luego en arco.' },
            },
            {
              name: 'portadaInicial',
              label: 'Imagen de fondo al cargar',
              type: 'upload',
              relationTo: 'media',
            },
          ],
        },
        {
          label: 'Accesos',
          fields: [
            {
              name: 'accesos',
              label: 'Tarjetas "Recorre las obras"',
              type: 'array',
              maxRows: 4,
              labels: { singular: 'Tarjeta', plural: 'Tarjetas' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'titulo', label: 'Título', type: 'text', required: true, admin: { width: '40%' } },
                    {
                      name: 'enlace',
                      label: 'Enlace',
                      type: 'text',
                      admin: { width: '40%', description: 'Vacío: "Próximamente".', placeholder: '/obras' },
                    },
                    { name: 'color', label: 'Color', type: 'select', options: COLORES_ACERVO, admin: { width: '20%' } },
                  ],
                },
                { name: 'descripcion', label: 'Descripción', type: 'textarea' },
                { name: 'imagen', label: 'Imagen', type: 'upload', relationTo: 'media', required: true },
              ],
            },
          ],
        },
        {
          label: 'Curaduría y destacadas',
          fields: [
            {
              name: 'curaduriaInaugural',
              label: 'Curaduría de la banda',
              type: 'relationship',
              relationTo: 'curadurias',
            },
            {
              name: 'curaduriaImagen',
              label: 'Imagen de la banda',
              type: 'upload',
              relationTo: 'media',
            },
            {
              name: 'destacadas',
              label: 'Obras destacadas',
              type: 'array',
              labels: { singular: 'Obra', plural: 'Obras' },
              maxRows: 8,
              admin: { description: 'La retícula tiene 12 columnas: usa 4+4+4 y 5+7 como en el prototipo.' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'obra', label: 'Obra', type: 'relationship', relationTo: 'obras', required: true, admin: { width: '50%' } },
                    { name: 'columnas', label: 'Columnas', type: 'number', min: 2, max: 12, defaultValue: 4, admin: { width: '25%' } },
                    {
                      name: 'alto',
                      label: 'Alto',
                      type: 'select',
                      defaultValue: 'media',
                      options: [
                        { value: 'alta', label: 'Alta' },
                        { value: 'media', label: 'Media' },
                      ],
                      admin: { width: '25%' },
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Acervos y recursos',
          fields: [
            {
              name: 'acervosGaleria',
              label: 'Acervos de la galería "Explora por acervo"',
              type: 'relationship',
              relationTo: 'acervos',
              hasMany: true,
            },
            {
              name: 'recursos',
              label: 'Recursos para investigación',
              type: 'array',
              maxRows: 3,
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'icono', label: 'Ícono', type: 'text', admin: { width: '20%' } },
                    { name: 'titulo', label: 'Título', type: 'text', required: true, admin: { width: '40%' } },
                    { name: 'enlace', label: 'Enlace', type: 'text', admin: { width: '40%' } },
                  ],
                },
                { name: 'texto', label: 'Texto', type: 'textarea' },
              ],
            },
            {
              name: 'cifras',
              label: 'Cifras',
              type: 'array',
              maxRows: 4,
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'valor', label: 'Valor', type: 'number', required: true, admin: { width: '40%' } },
                    { name: 'texto', label: 'Texto', type: 'text', required: true, admin: { width: '60%' } },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
