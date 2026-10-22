import type { CollectionConfig } from 'payload'

import { soloAdmin } from '../access/roles'
import { limitarConsultasPublicas } from '../hooks/limitar-consultas-publicas'

// Música y audioguías de las curadurías.
export const Audios: CollectionConfig = {
  slug: 'audios',
  labels: { singular: 'Audio', plural: 'Audios' },
  admin: {
    group: 'Contenido',
    useAsTitle: 'titulo',
    hideAPIURL: true,
    defaultColumns: ['titulo', 'filename', 'updatedAt'],
  },
  access: { read: () => true, delete: soloAdmin },
  hooks: { beforeOperation: [limitarConsultasPublicas()] },
  upload: { mimeTypes: ['audio/mpeg', 'audio/mp4', 'audio/aac', 'audio/ogg', 'audio/wav'] },
  fields: [{ name: 'titulo', label: 'Título', type: 'text', required: true }],
}
