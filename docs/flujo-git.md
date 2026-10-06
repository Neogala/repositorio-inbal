# Flujo de ramas (Git Flow)

| Rama | Sale de | Vuelve a | Para qué |
|---|---|---|---|
| `main` | | | Lo entregado. Solo recibe `release/*` y `hotfix/*`, cada una con tag `vX.Y.Z` |
| `develop` | `main` | | Integración de etapas terminadas |
| `feature/<tema>` | `develop` | `develop` | Una etapa o tema: `feature/obras`, `feature/importador-excel`… |
| `release/<X.Y.Z>` | `develop` | `main` y `develop` | Preparar una entrega: ajustes finales y versión |
| `hotfix/<tema>` | `main` | `main` y `develop` | Arreglo urgente sobre lo entregado |

## Reglas

- Los merges a `develop` y `main` son con `--no-ff` para que se vea cada etapa.
- Commits en español, en presente ("Agrega…", "Corrige…"), uno por paso que funcione.
- Antes de cada commit: `npm run lint`, `npx tsc --noEmit` y las pruebas que apliquen.
- Ningún secreto en el repositorio: todo va en `web/.env` (ignorado).

## Remotos

| Remoto | Repositorio | Uso |
|---|---|---|
| `origin` | `forozco/coleccion-inbal` (privado) | Trabajo diario y respaldo. Rama por defecto: `develop` |
| `neogala` | `neogala/repositorio-inbal` (público, GitHub Pages) | Solo lectura; el push está desactivado hasta la entrega |

Para entregar: `git remote set-url --push neogala https://github.com/neogala/repositorio-inbal.git`
y abrir el pull request desde la rama de release.

## Versiones previstas

- `v0.x`: avances internos de la Fase 1.
- `v1.0.0`: lanzamiento de diciembre (Fase 1).
- `v1.1.0` en adelante: conexión con ARCA (Fase 2).
