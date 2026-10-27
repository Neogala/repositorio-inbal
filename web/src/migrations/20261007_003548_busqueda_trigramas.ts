import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // El adaptador ya crea la extensión al conectar; aquí por si la migración corre sola.
  await db.execute(sql`CREATE EXTENSION IF NOT EXISTS pg_trgm;`)
  await db.execute(sql`
   CREATE INDEX "obras_busqueda_trgm_idx" ON "obras" USING gin ("busqueda" gin_trgm_ops);
  CREATE INDEX "obras_autor_trgm_idx" ON "obras" USING gin ("autor" gin_trgm_ops);
  CREATE INDEX "obras_tecnica_trgm_idx" ON "obras" USING gin ("tecnica" gin_trgm_ops);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "obras_busqueda_trgm_idx";
  DROP INDEX "obras_autor_trgm_idx";
  DROP INDEX "obras_tecnica_trgm_idx";`)
}
