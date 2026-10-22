# Colección Digital INBAL: sitio y CMS

Sitio público y panel de administración en un solo proyecto: Next.js (App
Router) + Payload CMS 3 + PostgreSQL. El prototipo estático está en
`../prototipo/` como referencia de diseño.

## Requisitos

- Node 20.18 o superior (probado con Node 22)
- Docker, para la base de datos local

## Arranque local

```bash
cd web
cp .env.example .env      # llenar POSTGRES_PASSWORD, DATABASE_URL y PAYLOAD_SECRET
npm install
npm run db:up             # PostgreSQL en Docker
npm run dev               # http://localhost:3000 y panel en /admin
```

Para generar valores: `openssl rand -hex 32`. La primera vez que entras a
`/admin` te pide crear el usuario administrador.

El archivo `.env` nunca se sube al repositorio.

## Scripts

| Script | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` / `npm start` | Compilación y servidor de producción |
| `npm run lint` | ESLint |
| `npm run test:int` | Pruebas de integración (Vitest), necesitan la base levantada |
| `npm run test:e2e` | Pruebas de punta a punta (Playwright) |
| `npm run generate:types` | Regenera `src/payload-types.ts` al cambiar colecciones |
| `npm run db:up` / `npm run db:down` | Levanta o detiene PostgreSQL |

## Estructura

```
src/
  app/(frontend)/     sitio público
  app/(payload)/      panel /admin y API de Payload (generado)
  collections/        colecciones de Payload
  components/         componentes compartidos (encabezado, pie...)
  lib/                utilidades y navegación
tests/
  int/                Vitest
  e2e/                Playwright
```

El plan de trabajo está en `../docs/plan-de-trabajo.md` y el análisis de los
datos de SIGROPAM en `../docs/analisis-datos.md`.
