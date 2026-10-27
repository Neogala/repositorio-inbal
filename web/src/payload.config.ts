import { postgresAdapter } from '@payloadcms/db-postgres'
import { index } from '@payloadcms/db-postgres/drizzle/pg-core'
import { es } from '@payloadcms/translations/languages/es'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Obras } from './collections/Obras'
import { Acervos } from './collections/Acervos'
import { Audios } from './collections/Audios'
import { Curadurias } from './collections/Curadurias'
import { Inicio } from './globals/Inicio'
import { migrations } from './migrations'

function requiredEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Falta la variable de entorno ${name} (ver .env.example)`)
  return value
}

// En la nube (Vercel) no hay disco permanente: imágenes y audios van a Supabase
// Storage, que habla el protocolo de S3. Sin S3_BUCKET se guardan en disco, como en
// local. Los archivos siguen pasando por /api/<colección>/file, así que las reglas
// de acceso (imágenes privadas) se aplican igual. alwaysInsertFields deja la columna
// del adaptador en el esquema aunque esté apagado: local, CI y nube comparten las
// mismas migraciones.
const enNube = Boolean(process.env.S3_BUCKET)
const almacenamiento = s3Storage({
  enabled: enNube,
  alwaysInsertFields: true,
  collections: { media: true, audios: true },
  bucket: process.env.S3_BUCKET ?? '',
  config: enNube
    ? {
        endpoint: requiredEnv('S3_ENDPOINT'),
        region: requiredEnv('S3_REGION'),
        forcePathStyle: true,
        credentials: {
          accessKeyId: requiredEnv('S3_ACCESS_KEY_ID'),
          secretAccessKey: requiredEnv('S3_SECRET_ACCESS_KEY'),
        },
      }
    : {},
})

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    // Pantalla de acceso con la identidad del sitio: tema claro y logo propio (estilos en
    // app/(payload)/custom.scss). El resto del panel llega con la identidad completa.
    theme: 'light',
    meta: {
      titleSuffix: ' · Colección digital INBAL',
      icons: [{ rel: 'icon', type: 'image/png', url: '/img/admin/favicon.png' }],
    },
    components: {
      graphics: {
        Logo: '/components/admin/Logo#Logo',
      },
    },
  },
  i18n: {
    supportedLanguages: { es },
    fallbackLanguage: 'es',
  },
  collections: [Obras, Media, Acervos, Curadurias, Audios, Users],
  globals: [Inicio],
  editor: lexicalEditor(),
  secret: requiredEnv('PAYLOAD_SECRET'),
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    // En Vercel cada función abre su propio pool y el pooler de Supabase admite 200
    // clientes en total: un home con decenas de imágenes lo llenaba. Pocas conexiones
    // por función y que las ociosas se cierren pronto. Pero no menos de 3: al guardar,
    // Payload retiene una en la transacción y pide otras; con 2 el guardado se quedaba
    // esperando hasta que Vercel cortaba la función a los 300 s.
    pool: {
      connectionString: requiredEnv('DATABASE_URL'),
      ...(process.env.VERCEL ? { max: 5, idleTimeoutMillis: 5_000 } : {}),
    },
    // En desarrollo el esquema se sincroniza solo (push). En producción no: ahí las
    // migraciones de src/migrations corren al arrancar el servidor, nunca durante
    // next build (cada proceso del build las correría a la vez). Tras cambiar una
    // colección: npm run migrate:create <nombre>.
    prodMigrations: process.env.NEXT_PHASE === 'phase-production-build' ? undefined : migrations,
    // Con PAYLOAD_DB_PUSH=false el esquema solo cambia por migraciones también fuera de
    // producción (CI, pruebas contra un build). Si una base ya migrada recibe el push de
    // desarrollo, payload migrate se detiene a preguntar y el proceso se cuelga.
    push: process.env.PAYLOAD_DB_PUSH !== 'false',
    // Búsqueda por texto parcial (ILIKE '%palabra%'): sin trigramas, Postgres recorre
    // toda la tabla en cada búsqueda. Se declaran aquí para que el push de desarrollo
    // y las migraciones los conozcan.
    extensions: ['pg_trgm'],
    afterSchemaInit: [
      ({ schema, extendTable }) => {
        extendTable({
          table: schema.tables.obras,
          extraConfig: (t) => ({
            // Columna con .op() y no una expresión sql``: con expresión, el push de
            // desarrollo no la reconoce y recrea los índices en cada arranque.
            busquedaTrgm: index('obras_busqueda_trgm_idx').using(
              'gin',
              t.busqueda.op('gin_trgm_ops'),
            ),
            autorTrgm: index('obras_autor_trgm_idx').using('gin', t.autor.op('gin_trgm_ops')),
            tecnicaTrgm: index('obras_tecnica_trgm_idx').using('gin', t.tecnica.op('gin_trgm_ops')),
          }),
        })
        return schema
      },
    ],
  }),
  sharp,
  plugins: [almacenamiento],
})
