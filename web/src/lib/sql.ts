import type { PostgresAdapter } from '@payloadcms/db-postgres'
import type { Payload } from 'payload'

// Drizzle de Payload para consultas agregadas (GROUP BY, FILTER) que la API de
// Payload no expone. payload.db está tipado como el adaptador genérico; aquí se
// sabe que es Postgres (payload.config.ts), así que la conversión vive en un solo lugar.
export function drizzleDe(payload: Payload) {
  return (payload.db as unknown as PostgresAdapter).drizzle
}
