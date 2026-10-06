# Importador del Excel de SIGROPAM

```bash
cd web
npm run importar:excel                      # prueba: valida y deja el reporte, no escribe
npm run importar:excel -- escribir          # guarda en la base; las obras nuevas quedan ocultas
npm run importar:excel -- escribir publicar # además publica las nuevas (menos CENCROPAM)
npm run importar:excel -- otro.xlsx escribir
```

Las opciones son palabras sueltas, sin `--`: `payload run` se come las opciones.
Por omisión lee `datos/9_grandes_SIGROPAM.xlsx`. Cada corrida deja un CSV en
`web/reportes/` (ignorado por git) con una fila por error, aviso, duplicado o
baja.

## Qué hace con cada fila

Las reglas están en `web/src/lib/importar/sigropam.ts` y sus pruebas en
`web/tests/int/sigropam.int.spec.ts`.

| Campo | Regla |
|---|---|
| No. SIGROPAM | Llave. Si se repite en el archivo, gana la primera fila |
| Autor | `OROZCO, JOSÉ CLEMENTE, 1883-1949` pasa a `José Clemente Orozco`; el año de muerte se guarda |
| Título | Tal cual (en mayúsculas) hasta que Vania decida si se corrigen |
| Fecha | Texto para mostrar y años para filtrar: rangos (`1952L1956`, `38-39`), `ca.`, siglos (`S XIX` = 1801-1900) y fechas completas. Lo que no reconoce se guarda como texto con aviso |
| Medidas | Alto, ancho y profundidad de la obra; si no hay, las del soporte. Marco y base no |
| Técnica | `LÁPIZ/PAPEL` pasa a `Lápiz sobre papel`, con acentos corregidos |
| Tipo | Por disciplina (obra gráfica, estampa → Grabado; caballete, mural → Pintura). Obra gráfica con técnica de dibujo → Dibujo. `DOCUMENTAL`, `MIXTA` y vacías quedan sin tipo con aviso |
| Periodo | Por año: antes de 1821 Colonial, hasta 1900 Siglo XIX, hasta 1950 Moderno, después Contemporáneo. "Siglo XX" usa los 40 años del autor |
| Acervo | Los 18 nombres del Excel van a las 21 claves de acervo del catálogo. `BAJA DEL ACERVO INBAL` se descarta |
| Derechos | Muerte del autor + 100 años antes de este año: libre; si no, restringida (la obra se publica sin imagen) |
| Localización, Observaciones | Se guardan solo para el panel; la API pública no las devuelve |

## Al actualizar una obra que ya existe

- Si vino del Excel y nadie la editó en el panel, se reemplaza su ficha.
- Si vino del prototipo o alguien la editó, solo se llena lo que falta y los
  datos internos.
- Nunca cambia la imagen, los derechos ni si está publicada.

## Primera corrida (6 oct 2026, base local)

2,709 filas: 2,676 obras nuevas (ocultas), 22 del prototipo completadas, 10 bajas,
1 duplicado, 0 errores. Avisos: 47 sin medidas, 21 sin tipo, 1 fecha (`31/05`).
