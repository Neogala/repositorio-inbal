import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "media" ADD COLUMN "privada" boolean DEFAULT false;
  CREATE INDEX "media_privada_idx" ON "media" USING btree ("privada");`)

  // Marca las imágenes que ya existen: privadas si ninguna obra que las usa se puede
  // mostrar (oculta o con derechos restringidos). Mismo criterio que hooks/privacidad-media.ts.
  await db.execute(sql`
  UPDATE "media" m SET "privada" = true
  WHERE EXISTS (SELECT 1 FROM "obras" o WHERE o."imagen_id" = m."id")
    AND NOT EXISTS (
      SELECT 1 FROM "obras" o
      WHERE o."imagen_id" = m."id" AND o."publicada" AND o."derechos" IS DISTINCT FROM 'restringida'
    );`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "media_privada_idx";
  ALTER TABLE "media" DROP COLUMN "privada";`)
}
