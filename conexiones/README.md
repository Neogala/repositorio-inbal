# Conexiones del acervo

Abrir `conexiones.html` desde la raíz del sitio. No requiere servicios de IA ni dependencias externas.

## Datos

La selección procede de `DATA` en `detalle-obra.html` (152 registros). Las descripciones disponibles se unen exclusivamente por identificador SIGROPAM dentro del MAM desde `outputs/mam_integracion/Obras_MAM.xlsx.inspect.ndjson`. Son textos del archivo de origen: su inclusión no implica una nueva validación curatorial. No se exportan localizaciones operativas ni observaciones.

Para regenerar la selección, desde la raíz: `node scripts/preparar-conexiones.cjs`. Ambos archivos de origen deben estar disponibles. `conexiones/datos.js` es la copia pública que utiliza el navegador.

## Reglas

- Igualdad de autor, técnica, disciplina y acervo, ignorando acentos, mayúsculas y puntuación. No se fusionan identidades por nombres parecidos.
- No se conectan valores desconocidos. Se omite técnica cuando solo repite disciplina.
- Décadas calculadas únicamente para años enteros existentes. Fechas ausentes no se inventan.
- Búsqueda por título/autor o título/descripción pública, según el modo seleccionado.
- Nube hexagonal con todos los resultados, sin paginación. Zoom, ajuste para ver todas y desplazamiento táctil o arrastre sobre el fondo con mouse.
- Vista de lista completa y búsqueda en vivo con pausa de 220 ms.
- Un clic o toque cambia la obra central y actualiza su información. Se conserva el tipo de relación cuando existen coincidencias.
- Historial de exploración con regreso al paso anterior.
- Cada resultado explica su relación. La distancia no representa semejanza ni influencia artística.

## Integración

Los menús de Obras y Acervos enlazan al explorador. Las fichas enlazan mediante `conexiones.html?obra=IDENTIFICADOR`. Los resultados vuelven a `detalle-obra.html?obra=IDENTIFICADOR`.

Esta integración corresponde al proyecto HTML local. El despliegue en Vercel y la adaptación al catálogo de producción requieren el código de esa aplicación.
