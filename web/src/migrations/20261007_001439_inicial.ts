import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_obras_periodo" AS ENUM('Arte Colonial', 'Siglo XIX', 'Arte Moderno', 'Arte Contemporáneo', 'Sin fecha');
  CREATE TYPE "public"."enum_obras_tipo" AS ENUM('Pintura', 'Fotografía', 'Grabado', 'Escultura', 'Dibujo', 'Artes decorativas');
  CREATE TYPE "public"."enum_obras_derechos" AS ENUM('libre', 'autorizada', 'restringida', 'por-confirmar');
  CREATE TYPE "public"."enum_obras_museo" AS ENUM('MUNAL', 'MAM', 'MUNAE', 'MNSC', 'MPBA', 'MNARQ', 'MMDR', 'SAPS', 'MTAC', 'MCEDRFK', 'SPM', 'MACG', 'MACJ', 'CAPILLA', 'CENCROPAM', 'ICC', 'IAGO', 'MAMGP', 'MCDR', 'MCA', 'MJLC');
  CREATE TYPE "public"."enum_obras_origen" AS ENUM('prototipo', 'excel', 'arca');
  CREATE TYPE "public"."enum__obras_v_version_periodo" AS ENUM('Arte Colonial', 'Siglo XIX', 'Arte Moderno', 'Arte Contemporáneo', 'Sin fecha');
  CREATE TYPE "public"."enum__obras_v_version_tipo" AS ENUM('Pintura', 'Fotografía', 'Grabado', 'Escultura', 'Dibujo', 'Artes decorativas');
  CREATE TYPE "public"."enum__obras_v_version_derechos" AS ENUM('libre', 'autorizada', 'restringida', 'por-confirmar');
  CREATE TYPE "public"."enum__obras_v_version_museo" AS ENUM('MUNAL', 'MAM', 'MUNAE', 'MNSC', 'MPBA', 'MNARQ', 'MMDR', 'SAPS', 'MTAC', 'MCEDRFK', 'SPM', 'MACG', 'MACJ', 'CAPILLA', 'CENCROPAM', 'ICC', 'IAGO', 'MAMGP', 'MCDR', 'MCA', 'MJLC');
  CREATE TYPE "public"."enum__obras_v_version_origen" AS ENUM('prototipo', 'excel', 'arca');
  CREATE TYPE "public"."enum_acervos_clave_obras" AS ENUM('MUNAL', 'MAM', 'MUNAE', 'MNSC', 'MPBA', 'MNARQ', 'MMDR', 'SAPS', 'MTAC', 'MCEDRFK', 'SPM', 'MACG', 'MACJ', 'CAPILLA', 'CENCROPAM', 'ICC', 'IAGO', 'MAMGP', 'MCDR', 'MCA', 'MJLC');
  CREATE TYPE "public"."enum_acervos_color" AS ENUM('155,34,71', '39,64,96', '30,91,79', '165,127,44', '176,83,47', '217,192,122', '138,131,119', '38,32,31', '30,92,59', '141,194,183', '219,211,182');
  CREATE TYPE "public"."enum_curadurias_capitulos_interludio_tipo" AS ENUM('ninguno', 'cita', 'contexto');
  CREATE TYPE "public"."enum_curadurias_acervo" AS ENUM('MUNAL', 'MAM', 'MUNAE', 'San Carlos', 'Cruzada');
  CREATE TYPE "public"."enum_users_rol" AS ENUM('admin', 'editor');
  CREATE TYPE "public"."enum_inicio_accesos_color" AS ENUM('155,34,71', '39,64,96', '30,91,79', '165,127,44', '176,83,47', '217,192,122', '138,131,119', '38,32,31', '30,92,59', '141,194,183', '219,211,182');
  CREATE TYPE "public"."enum_inicio_destacadas_alto" AS ENUM('alta', 'media');
  CREATE TABLE "obras" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"publicada" boolean DEFAULT true,
  	"titulo" varchar NOT NULL,
  	"autor" varchar NOT NULL,
  	"fecha_texto" varchar,
  	"anio_inicio" numeric,
  	"anio_fin" numeric,
  	"fecha_aproximada" boolean DEFAULT false,
  	"periodo" "enum_obras_periodo",
  	"tipo" "enum_obras_tipo",
  	"tecnica" varchar,
  	"alto_cm" numeric,
  	"ancho_cm" numeric,
  	"profundidad_cm" numeric,
  	"imagen_id" integer,
  	"derechos" "enum_obras_derechos" DEFAULT 'por-confirmar',
  	"autor_muerte" numeric,
  	"museo" "enum_obras_museo" NOT NULL,
  	"sigropam" varchar NOT NULL,
  	"origen" "enum_obras_origen" DEFAULT 'excel',
  	"localizacion" varchar,
  	"observaciones" varchar,
  	"original_autor" varchar,
  	"original_fecha" varchar,
  	"original_tecnica" varchar,
  	"original_medida" varchar,
  	"original_disciplina" varchar,
  	"original_acervo" varchar,
  	"busqueda" varchar,
  	"editado_por_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_obras_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_publicada" boolean DEFAULT true,
  	"version_titulo" varchar NOT NULL,
  	"version_autor" varchar NOT NULL,
  	"version_fecha_texto" varchar,
  	"version_anio_inicio" numeric,
  	"version_anio_fin" numeric,
  	"version_fecha_aproximada" boolean DEFAULT false,
  	"version_periodo" "enum__obras_v_version_periodo",
  	"version_tipo" "enum__obras_v_version_tipo",
  	"version_tecnica" varchar,
  	"version_alto_cm" numeric,
  	"version_ancho_cm" numeric,
  	"version_profundidad_cm" numeric,
  	"version_imagen_id" integer,
  	"version_derechos" "enum__obras_v_version_derechos" DEFAULT 'por-confirmar',
  	"version_autor_muerte" numeric,
  	"version_museo" "enum__obras_v_version_museo" NOT NULL,
  	"version_sigropam" varchar NOT NULL,
  	"version_origen" "enum__obras_v_version_origen" DEFAULT 'excel',
  	"version_localizacion" varchar,
  	"version_observaciones" varchar,
  	"version_original_autor" varchar,
  	"version_original_fecha" varchar,
  	"version_original_tecnica" varchar,
  	"version_original_medida" varchar,
  	"version_original_disciplina" varchar,
  	"version_original_acervo" varchar,
  	"version_busqueda" varchar,
  	"version_editado_por_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_miniatura_url" varchar,
  	"sizes_miniatura_width" numeric,
  	"sizes_miniatura_height" numeric,
  	"sizes_miniatura_mime_type" varchar,
  	"sizes_miniatura_filesize" numeric,
  	"sizes_miniatura_filename" varchar,
  	"sizes_ficha_url" varchar,
  	"sizes_ficha_width" numeric,
  	"sizes_ficha_height" numeric,
  	"sizes_ficha_mime_type" varchar,
  	"sizes_ficha_filesize" numeric,
  	"sizes_ficha_filename" varchar
  );
  
  CREATE TABLE "acervos" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nombre" varchar NOT NULL,
  	"siglas" varchar NOT NULL,
  	"zona" varchar,
  	"semblanza" varchar NOT NULL,
  	"direccion" varchar,
  	"total_obras" numeric,
  	"digitalizadas" numeric,
  	"fundacion" numeric,
  	"imagen_id" integer,
  	"curaduria_titulo" varchar,
  	"curaduria_intro" varchar,
  	"curaduria_autoria" varchar,
  	"curaduria_num_obras" numeric,
  	"curaduria_imagen_id" integer,
  	"slug" varchar NOT NULL,
  	"clave_obras" "enum_acervos_clave_obras",
  	"color" "enum_acervos_color" DEFAULT '30,91,79',
  	"orden" numeric DEFAULT 100,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "acervos_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "curadurias_capitulos_paradas_detalles" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"x" numeric DEFAULT 50 NOT NULL,
  	"y" numeric DEFAULT 50 NOT NULL,
  	"zoom" numeric DEFAULT 1 NOT NULL,
  	"caption" varchar NOT NULL,
  	"nota" varchar
  );
  
  CREATE TABLE "curadurias_capitulos_paradas" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"obra_id" integer NOT NULL,
  	"titulo" varchar,
  	"autor" varchar,
  	"anio" numeric,
  	"texto" varchar NOT NULL
  );
  
  CREATE TABLE "curadurias_capitulos" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"num" varchar NOT NULL,
  	"titulo" varchar NOT NULL,
  	"interludio_tipo" "enum_curadurias_capitulos_interludio_tipo" DEFAULT 'ninguno',
  	"interludio_titulo" varchar,
  	"interludio_texto" varchar,
  	"interludio_por" varchar
  );
  
  CREATE TABLE "curadurias" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"titulo" varchar NOT NULL,
  	"intro" varchar NOT NULL,
  	"acervo" "enum_curadurias_acervo" NOT NULL,
  	"tema" varchar,
  	"num_obras" numeric,
  	"curador" varchar,
  	"portada_id" integer NOT NULL,
  	"portada_secundaria_id" integer,
  	"subtitulo" varchar,
  	"fecha" varchar,
  	"nota_sala_titulo" varchar,
  	"nota_sala_texto" varchar,
  	"cierre_titulo" varchar,
  	"cierre_texto" varchar,
  	"cierre_firma" varchar,
  	"creditos_textos" varchar,
  	"creditos_musica" varchar,
  	"creditos_imagenes" varchar,
  	"musica_id" integer,
  	"audioguia_id" integer,
  	"publicada" boolean DEFAULT true,
  	"destacada" boolean,
  	"slug" varchar NOT NULL,
  	"orden" numeric DEFAULT 100,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "curadurias_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"curadurias_id" integer
  );
  
  CREATE TABLE "audios" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"titulo" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nombre" varchar,
  	"rol" "enum_users_rol" DEFAULT 'editor' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"reset_password_requested_at" timestamp(3) with time zone,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"obras_id" integer,
  	"media_id" integer,
  	"acervos_id" integer,
  	"curadurias_id" integer,
  	"audios_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "inicio_accesos" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"titulo" varchar NOT NULL,
  	"enlace" varchar,
  	"color" "enum_inicio_accesos_color",
  	"descripcion" varchar,
  	"imagen_id" integer NOT NULL
  );
  
  CREATE TABLE "inicio_destacadas" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"obra_id" integer NOT NULL,
  	"columnas" numeric DEFAULT 4,
  	"alto" "enum_inicio_destacadas_alto" DEFAULT 'media'
  );
  
  CREATE TABLE "inicio_recursos" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icono" varchar,
  	"titulo" varchar NOT NULL,
  	"enlace" varchar,
  	"texto" varchar
  );
  
  CREATE TABLE "inicio_cifras" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"valor" numeric NOT NULL,
  	"texto" varchar NOT NULL
  );
  
  CREATE TABLE "inicio" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"portada_inicial_id" integer,
  	"curaduria_inaugural_id" integer,
  	"curaduria_imagen_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "inicio_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer,
  	"acervos_id" integer
  );
  
  ALTER TABLE "obras" ADD CONSTRAINT "obras_imagen_id_media_id_fk" FOREIGN KEY ("imagen_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "obras" ADD CONSTRAINT "obras_editado_por_id_users_id_fk" FOREIGN KEY ("editado_por_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_obras_v" ADD CONSTRAINT "_obras_v_parent_id_obras_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."obras"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_obras_v" ADD CONSTRAINT "_obras_v_version_imagen_id_media_id_fk" FOREIGN KEY ("version_imagen_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_obras_v" ADD CONSTRAINT "_obras_v_version_editado_por_id_users_id_fk" FOREIGN KEY ("version_editado_por_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acervos" ADD CONSTRAINT "acervos_imagen_id_media_id_fk" FOREIGN KEY ("imagen_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acervos" ADD CONSTRAINT "acervos_curaduria_imagen_id_media_id_fk" FOREIGN KEY ("curaduria_imagen_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "acervos_rels" ADD CONSTRAINT "acervos_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."acervos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "acervos_rels" ADD CONSTRAINT "acervos_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "curadurias_capitulos_paradas_detalles" ADD CONSTRAINT "curadurias_capitulos_paradas_detalles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."curadurias_capitulos_paradas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "curadurias_capitulos_paradas" ADD CONSTRAINT "curadurias_capitulos_paradas_obra_id_obras_id_fk" FOREIGN KEY ("obra_id") REFERENCES "public"."obras"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "curadurias_capitulos_paradas" ADD CONSTRAINT "curadurias_capitulos_paradas_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."curadurias_capitulos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "curadurias_capitulos" ADD CONSTRAINT "curadurias_capitulos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."curadurias"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "curadurias" ADD CONSTRAINT "curadurias_portada_id_media_id_fk" FOREIGN KEY ("portada_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "curadurias" ADD CONSTRAINT "curadurias_portada_secundaria_id_media_id_fk" FOREIGN KEY ("portada_secundaria_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "curadurias" ADD CONSTRAINT "curadurias_musica_id_audios_id_fk" FOREIGN KEY ("musica_id") REFERENCES "public"."audios"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "curadurias" ADD CONSTRAINT "curadurias_audioguia_id_audios_id_fk" FOREIGN KEY ("audioguia_id") REFERENCES "public"."audios"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "curadurias_rels" ADD CONSTRAINT "curadurias_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."curadurias"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "curadurias_rels" ADD CONSTRAINT "curadurias_rels_curadurias_fk" FOREIGN KEY ("curadurias_id") REFERENCES "public"."curadurias"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_obras_fk" FOREIGN KEY ("obras_id") REFERENCES "public"."obras"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_acervos_fk" FOREIGN KEY ("acervos_id") REFERENCES "public"."acervos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_curadurias_fk" FOREIGN KEY ("curadurias_id") REFERENCES "public"."curadurias"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_audios_fk" FOREIGN KEY ("audios_id") REFERENCES "public"."audios"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "inicio_accesos" ADD CONSTRAINT "inicio_accesos_imagen_id_media_id_fk" FOREIGN KEY ("imagen_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "inicio_accesos" ADD CONSTRAINT "inicio_accesos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."inicio"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "inicio_destacadas" ADD CONSTRAINT "inicio_destacadas_obra_id_obras_id_fk" FOREIGN KEY ("obra_id") REFERENCES "public"."obras"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "inicio_destacadas" ADD CONSTRAINT "inicio_destacadas_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."inicio"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "inicio_recursos" ADD CONSTRAINT "inicio_recursos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."inicio"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "inicio_cifras" ADD CONSTRAINT "inicio_cifras_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."inicio"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "inicio" ADD CONSTRAINT "inicio_portada_inicial_id_media_id_fk" FOREIGN KEY ("portada_inicial_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "inicio" ADD CONSTRAINT "inicio_curaduria_inaugural_id_curadurias_id_fk" FOREIGN KEY ("curaduria_inaugural_id") REFERENCES "public"."curadurias"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "inicio" ADD CONSTRAINT "inicio_curaduria_imagen_id_media_id_fk" FOREIGN KEY ("curaduria_imagen_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "inicio_rels" ADD CONSTRAINT "inicio_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."inicio"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "inicio_rels" ADD CONSTRAINT "inicio_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "inicio_rels" ADD CONSTRAINT "inicio_rels_acervos_fk" FOREIGN KEY ("acervos_id") REFERENCES "public"."acervos"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "obras_publicada_idx" ON "obras" USING btree ("publicada");
  CREATE INDEX "obras_autor_idx" ON "obras" USING btree ("autor");
  CREATE INDEX "obras_anio_inicio_idx" ON "obras" USING btree ("anio_inicio");
  CREATE INDEX "obras_anio_fin_idx" ON "obras" USING btree ("anio_fin");
  CREATE INDEX "obras_periodo_idx" ON "obras" USING btree ("periodo");
  CREATE INDEX "obras_tipo_idx" ON "obras" USING btree ("tipo");
  CREATE INDEX "obras_tecnica_idx" ON "obras" USING btree ("tecnica");
  CREATE INDEX "obras_imagen_idx" ON "obras" USING btree ("imagen_id");
  CREATE INDEX "obras_museo_idx" ON "obras" USING btree ("museo");
  CREATE UNIQUE INDEX "obras_sigropam_idx" ON "obras" USING btree ("sigropam");
  CREATE INDEX "obras_busqueda_idx" ON "obras" USING btree ("busqueda");
  CREATE INDEX "obras_editado_por_idx" ON "obras" USING btree ("editado_por_id");
  CREATE INDEX "obras_updated_at_idx" ON "obras" USING btree ("updated_at");
  CREATE INDEX "obras_created_at_idx" ON "obras" USING btree ("created_at");
  CREATE INDEX "_obras_v_parent_idx" ON "_obras_v" USING btree ("parent_id");
  CREATE INDEX "_obras_v_version_version_publicada_idx" ON "_obras_v" USING btree ("version_publicada");
  CREATE INDEX "_obras_v_version_version_autor_idx" ON "_obras_v" USING btree ("version_autor");
  CREATE INDEX "_obras_v_version_version_anio_inicio_idx" ON "_obras_v" USING btree ("version_anio_inicio");
  CREATE INDEX "_obras_v_version_version_anio_fin_idx" ON "_obras_v" USING btree ("version_anio_fin");
  CREATE INDEX "_obras_v_version_version_periodo_idx" ON "_obras_v" USING btree ("version_periodo");
  CREATE INDEX "_obras_v_version_version_tipo_idx" ON "_obras_v" USING btree ("version_tipo");
  CREATE INDEX "_obras_v_version_version_tecnica_idx" ON "_obras_v" USING btree ("version_tecnica");
  CREATE INDEX "_obras_v_version_version_imagen_idx" ON "_obras_v" USING btree ("version_imagen_id");
  CREATE INDEX "_obras_v_version_version_museo_idx" ON "_obras_v" USING btree ("version_museo");
  CREATE INDEX "_obras_v_version_version_sigropam_idx" ON "_obras_v" USING btree ("version_sigropam");
  CREATE INDEX "_obras_v_version_version_busqueda_idx" ON "_obras_v" USING btree ("version_busqueda");
  CREATE INDEX "_obras_v_version_version_editado_por_idx" ON "_obras_v" USING btree ("version_editado_por_id");
  CREATE INDEX "_obras_v_version_version_updated_at_idx" ON "_obras_v" USING btree ("version_updated_at");
  CREATE INDEX "_obras_v_version_version_created_at_idx" ON "_obras_v" USING btree ("version_created_at");
  CREATE INDEX "_obras_v_created_at_idx" ON "_obras_v" USING btree ("created_at");
  CREATE INDEX "_obras_v_updated_at_idx" ON "_obras_v" USING btree ("updated_at");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_miniatura_sizes_miniatura_filename_idx" ON "media" USING btree ("sizes_miniatura_filename");
  CREATE INDEX "media_sizes_ficha_sizes_ficha_filename_idx" ON "media" USING btree ("sizes_ficha_filename");
  CREATE INDEX "acervos_imagen_idx" ON "acervos" USING btree ("imagen_id");
  CREATE INDEX "acervos_curaduria_curaduria_imagen_idx" ON "acervos" USING btree ("curaduria_imagen_id");
  CREATE UNIQUE INDEX "acervos_slug_idx" ON "acervos" USING btree ("slug");
  CREATE INDEX "acervos_updated_at_idx" ON "acervos" USING btree ("updated_at");
  CREATE INDEX "acervos_created_at_idx" ON "acervos" USING btree ("created_at");
  CREATE INDEX "acervos_rels_order_idx" ON "acervos_rels" USING btree ("order");
  CREATE INDEX "acervos_rels_parent_idx" ON "acervos_rels" USING btree ("parent_id");
  CREATE INDEX "acervos_rels_path_idx" ON "acervos_rels" USING btree ("path");
  CREATE INDEX "acervos_rels_media_id_idx" ON "acervos_rels" USING btree ("media_id");
  CREATE INDEX "curadurias_capitulos_paradas_detalles_order_idx" ON "curadurias_capitulos_paradas_detalles" USING btree ("_order");
  CREATE INDEX "curadurias_capitulos_paradas_detalles_parent_id_idx" ON "curadurias_capitulos_paradas_detalles" USING btree ("_parent_id");
  CREATE INDEX "curadurias_capitulos_paradas_order_idx" ON "curadurias_capitulos_paradas" USING btree ("_order");
  CREATE INDEX "curadurias_capitulos_paradas_parent_id_idx" ON "curadurias_capitulos_paradas" USING btree ("_parent_id");
  CREATE INDEX "curadurias_capitulos_paradas_obra_idx" ON "curadurias_capitulos_paradas" USING btree ("obra_id");
  CREATE INDEX "curadurias_capitulos_order_idx" ON "curadurias_capitulos" USING btree ("_order");
  CREATE INDEX "curadurias_capitulos_parent_id_idx" ON "curadurias_capitulos" USING btree ("_parent_id");
  CREATE INDEX "curadurias_portada_idx" ON "curadurias" USING btree ("portada_id");
  CREATE INDEX "curadurias_portada_secundaria_idx" ON "curadurias" USING btree ("portada_secundaria_id");
  CREATE INDEX "curadurias_musica_idx" ON "curadurias" USING btree ("musica_id");
  CREATE INDEX "curadurias_audioguia_idx" ON "curadurias" USING btree ("audioguia_id");
  CREATE UNIQUE INDEX "curadurias_slug_idx" ON "curadurias" USING btree ("slug");
  CREATE INDEX "curadurias_updated_at_idx" ON "curadurias" USING btree ("updated_at");
  CREATE INDEX "curadurias_created_at_idx" ON "curadurias" USING btree ("created_at");
  CREATE INDEX "curadurias_rels_order_idx" ON "curadurias_rels" USING btree ("order");
  CREATE INDEX "curadurias_rels_parent_idx" ON "curadurias_rels" USING btree ("parent_id");
  CREATE INDEX "curadurias_rels_path_idx" ON "curadurias_rels" USING btree ("path");
  CREATE INDEX "curadurias_rels_curadurias_id_idx" ON "curadurias_rels" USING btree ("curadurias_id");
  CREATE INDEX "audios_updated_at_idx" ON "audios" USING btree ("updated_at");
  CREATE INDEX "audios_created_at_idx" ON "audios" USING btree ("created_at");
  CREATE UNIQUE INDEX "audios_filename_idx" ON "audios" USING btree ("filename");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_obras_id_idx" ON "payload_locked_documents_rels" USING btree ("obras_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_acervos_id_idx" ON "payload_locked_documents_rels" USING btree ("acervos_id");
  CREATE INDEX "payload_locked_documents_rels_curadurias_id_idx" ON "payload_locked_documents_rels" USING btree ("curadurias_id");
  CREATE INDEX "payload_locked_documents_rels_audios_id_idx" ON "payload_locked_documents_rels" USING btree ("audios_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "inicio_accesos_order_idx" ON "inicio_accesos" USING btree ("_order");
  CREATE INDEX "inicio_accesos_parent_id_idx" ON "inicio_accesos" USING btree ("_parent_id");
  CREATE INDEX "inicio_accesos_imagen_idx" ON "inicio_accesos" USING btree ("imagen_id");
  CREATE INDEX "inicio_destacadas_order_idx" ON "inicio_destacadas" USING btree ("_order");
  CREATE INDEX "inicio_destacadas_parent_id_idx" ON "inicio_destacadas" USING btree ("_parent_id");
  CREATE INDEX "inicio_destacadas_obra_idx" ON "inicio_destacadas" USING btree ("obra_id");
  CREATE INDEX "inicio_recursos_order_idx" ON "inicio_recursos" USING btree ("_order");
  CREATE INDEX "inicio_recursos_parent_id_idx" ON "inicio_recursos" USING btree ("_parent_id");
  CREATE INDEX "inicio_cifras_order_idx" ON "inicio_cifras" USING btree ("_order");
  CREATE INDEX "inicio_cifras_parent_id_idx" ON "inicio_cifras" USING btree ("_parent_id");
  CREATE INDEX "inicio_portada_inicial_idx" ON "inicio" USING btree ("portada_inicial_id");
  CREATE INDEX "inicio_curaduria_inaugural_idx" ON "inicio" USING btree ("curaduria_inaugural_id");
  CREATE INDEX "inicio_curaduria_imagen_idx" ON "inicio" USING btree ("curaduria_imagen_id");
  CREATE INDEX "inicio_rels_order_idx" ON "inicio_rels" USING btree ("order");
  CREATE INDEX "inicio_rels_parent_idx" ON "inicio_rels" USING btree ("parent_id");
  CREATE INDEX "inicio_rels_path_idx" ON "inicio_rels" USING btree ("path");
  CREATE INDEX "inicio_rels_media_id_idx" ON "inicio_rels" USING btree ("media_id");
  CREATE INDEX "inicio_rels_acervos_id_idx" ON "inicio_rels" USING btree ("acervos_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "obras" CASCADE;
  DROP TABLE "_obras_v" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "acervos" CASCADE;
  DROP TABLE "acervos_rels" CASCADE;
  DROP TABLE "curadurias_capitulos_paradas_detalles" CASCADE;
  DROP TABLE "curadurias_capitulos_paradas" CASCADE;
  DROP TABLE "curadurias_capitulos" CASCADE;
  DROP TABLE "curadurias" CASCADE;
  DROP TABLE "curadurias_rels" CASCADE;
  DROP TABLE "audios" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "inicio_accesos" CASCADE;
  DROP TABLE "inicio_destacadas" CASCADE;
  DROP TABLE "inicio_recursos" CASCADE;
  DROP TABLE "inicio_cifras" CASCADE;
  DROP TABLE "inicio" CASCADE;
  DROP TABLE "inicio_rels" CASCADE;
  DROP TYPE "public"."enum_obras_periodo";
  DROP TYPE "public"."enum_obras_tipo";
  DROP TYPE "public"."enum_obras_derechos";
  DROP TYPE "public"."enum_obras_museo";
  DROP TYPE "public"."enum_obras_origen";
  DROP TYPE "public"."enum__obras_v_version_periodo";
  DROP TYPE "public"."enum__obras_v_version_tipo";
  DROP TYPE "public"."enum__obras_v_version_derechos";
  DROP TYPE "public"."enum__obras_v_version_museo";
  DROP TYPE "public"."enum__obras_v_version_origen";
  DROP TYPE "public"."enum_acervos_clave_obras";
  DROP TYPE "public"."enum_acervos_color";
  DROP TYPE "public"."enum_curadurias_capitulos_interludio_tipo";
  DROP TYPE "public"."enum_curadurias_acervo";
  DROP TYPE "public"."enum_users_rol";
  DROP TYPE "public"."enum_inicio_accesos_color";
  DROP TYPE "public"."enum_inicio_destacadas_alto";`)
}
