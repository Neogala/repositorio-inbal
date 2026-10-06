# Plan de trabajo - Fase 1 (lanzamiento de diciembre)

Rama: `feature/sitio-nextjs-payload` (local por ahora).
Objetivo: sitio en Next.js + Payload CMS + PostgreSQL con el diseño del
prototipo, obras cargadas desde Excel y CMS para home, acervos y curadurías.
ARCA queda para la Fase 2.

## Decisiones de arranque

| Tema | Decisión | Por qué |
|---|---|---|
| Ubicación del código | Carpeta `web/` en este repo | El prototipo sigue en la raíz y GitHub Pages lo sigue sirviendo mientras tanto |
| Versiones | Next 16.4, Payload 3.90, Node 22 | Payload 3.90 soporta Next >=16.3.3 |
| Gestor de paquetes | npm | Ya está instalado; evita sumar pnpm |
| Base de datos local | PostgreSQL en Docker (`docker compose`) | No hay psql instalado; igual al de producción |
| Estilos | CSS Modules + tokens de `guia-estilos-inbal.md` | Respeta el diseño sin rehacerlo |
| Imágenes en local | Carpeta local de Payload; R2 o S3 al publicar | No depender del hosting para empezar |

Pendientes de la llamada con Vania (7 oct): hosting y dominio, cuántas obras
salen en diciembre, quién limpia los datos, fecha exacta, Investigación,
acceso al repo como colaborador, IVA.

## Semana 0 - antes del 13 oct

- [ ] Estudio: Next.js App Router y Payload (plan de 8 días del anexo)
- [x] Revisar `recursos/9_grandes_SIGROPAM.xlsx` y `Fichas_obras_etiqueta_color.xlsx`: columnas, IDs, formatos de año y medidas
- [x] Listar los problemas de datos de la muestra: ver `docs/analisis-datos.md`
- [x] Commit del `.gitignore` con `.claude/`

## Semana 1 (13 oct) - base del proyecto

- [ ] `npx create-payload-app` en `web/` con plantilla en blanco y adaptador Postgres
- [ ] `docker-compose.yml` con PostgreSQL y `.env.example`
- [ ] Tokens de la guía de estilos como variables CSS; fuentes con `next/font`
- [ ] Layout compartido: encabezado y pie del prototipo como componentes
- [ ] ESLint, Prettier, Vitest y Playwright configurados
- [ ] GitHub Actions: lint + pruebas en cada pull request

## Semana 2 (20 oct) - modelo de datos e importador

- [ ] Colecciones: Obras, Artistas, Museos, Curadurías, Media, Usuarios; global Home
- [ ] Roles admin y editor con access control (lectura pública)
- [ ] Esquema Zod de una obra (años a número, medidas separadas, mayúsculas)
- [ ] Script de importación desde Excel con upsert por `sigropam` y reporte de errores por fila
- [ ] Importar las 145 obras del prototipo como primera prueba
- [ ] Pruebas Vitest de las normalizaciones

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
