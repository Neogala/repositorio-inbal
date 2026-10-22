# Plan de trabajo - Fase 1 (lanzamiento de diciembre)

Rama: `feature/sitio-nextjs-payload` (local por ahora).
Objetivo: sitio en Next.js + Payload CMS + PostgreSQL con el diseño del
prototipo, obras cargadas desde Excel y CMS para home, acervos y curadurías.
ARCA queda para la Fase 2.

## Decisiones de arranque

| Tema | Decisión | Por qué |
|---|---|---|
| Ubicación del código | Carpeta `web/`; el prototipo estático en `prototipo/` y los Excel en `datos/` | El prototipo queda como referencia de diseño hasta portar todas las páginas |
| Versiones | Next 16.3.3 (la que fija la plantilla de Payload), Payload 3.90.2, Node 22 | Payload 3.90 soporta Next >=16.3.3 |
| Gestor de paquetes | npm | Ya está instalado; evita sumar pnpm |
| Base de datos local | PostgreSQL en Docker (`docker compose`) | No hay psql instalado; igual al de producción |
| Estilos | CSS Modules + tokens del `:root` de `prototipo/index.html` | Es la versión aprobada; `prototipo/guia-estilos-inbal.md` trae la paleta guinda anterior |
| Imágenes en local | Carpeta local de Payload; R2 o S3 al publicar | No depender del hosting para empezar |

Pendientes de la llamada con Vania (7 oct): hosting y dominio, cuántas obras
salen en diciembre, quién limpia los datos, fecha exacta, Investigación,
acceso al repo como colaborador, IVA.

## Semana 0 - antes del 13 oct

- [ ] Estudio: Next.js App Router y Payload (plan de 8 días del anexo)
- [x] Revisar `datos/9_grandes_SIGROPAM.xlsx` y `Fichas_obras_etiqueta_color.xlsx`: columnas, IDs, formatos de año y medidas
- [x] Listar los problemas de datos de la muestra: ver `docs/analisis-datos.md`
- [x] Commit del `.gitignore` con `.claude/`

## Semana 1 (13 oct) - base del proyecto

- [x] `npx create-payload-app` en `web/` con plantilla en blanco y adaptador Postgres
- [x] `docker-compose.yml` con PostgreSQL y `.env.example`
- [x] Tokens de la guía de estilos como variables CSS; fuentes con `next/font`
- [x] Layout compartido: encabezado y pie del prototipo como componentes
- [x] ESLint, Prettier, Vitest y Playwright configurados
- [x] GitHub Actions: lint + pruebas en cada pull request

## Semana 2 (20 oct) - modelo de datos e importador

- [ ] Colecciones: Obras, Artistas, Museos, Curadurías, Media, Usuarios; global Home
- [ ] Roles admin y editor con access control (lectura pública)
- [x] Esquema Zod de una obra (años a número, medidas separadas; títulos en mayúsculas hasta que Vania decida)
- [x] Script de importación desde Excel con upsert por `sigropam` y reporte de errores por fila (ver `docs/importador.md`)
- [x] Importar las obras del prototipo como primera prueba (`npm run importar:prototipo`)
- [x] Pruebas Vitest de las normalizaciones

## Semanas 3 y 4 (27 oct a 7 nov) - Obras

- [ ] `/obras`: grilla, búsqueda, filtros en la URL, paginación, orden
- [ ] Facetas con conteo por periodo, tipo, técnica, artista, museo
- [ ] Rango de años que incluya obras antiguas y sin fecha
- [ ] Buscador del encabezado conectado a `/obras`
- [ ] `/obras/[sigropam]`: ficha, visor de imagen, metadatos para Google y redes
- [ ] Exportación CSV con los mismos filtros
- [ ] Extensiones `unaccent` y `pg_trgm` + índices por migración
- [ ] Obras sin derechos liberados: ficha sin imagen
- [ ] Pruebas Playwright: buscar, filtrar, abrir ficha

## Semanas 4 y 5 (3 a 14 nov) - Home, acervos y curadurías

- [ ] Home editable desde el global
- [ ] `/acervos` y `/acervos/[slug]` con las obras de cada museo
- [ ] `/curadurias` y `/curadurias/[slug]` como una sola plantilla (hoy son dos HTML casi iguales)
- [ ] Campo para elegir obras en curadurías y subir audio
- [ ] Revalidar páginas cuando un editor guarda
- [ ] Redirecciones de las URL del prototipo (`detalle-obra.html?id=...`)

**14 nov: fecha límite para Excel limpio e imágenes definitivas.**

## Semanas 6 y 7 (17 a 28 nov) - datos reales y pruebas

- [ ] Importar el catálogo definitivo y subir imágenes a R2 o S3
- [ ] Revisión con Vania en ambiente de pruebas (30% del pago)
- [ ] Accesibilidad: contraste, teclado, texto alternativo
- [ ] Rendimiento: Core Web Vitals en home, obras y ficha
- [ ] Sentry y respaldos de la base

## Semana 8 (1 dic) - publicación

- [ ] Despliegue en el hosting acordado y dominio
- [ ] Usuarios editores y una guía corta de uso del panel
- [ ] Ajustes finales y publicación (30% del pago)

## Fase 2 - ARCA (después)

- Sincronización ARCA -> Zod -> upsert por `sigropam` en la misma colección
- Campo `origen` para distinguir obras de Excel y de ARCA
- Credenciales solo en variables de entorno del servidor
