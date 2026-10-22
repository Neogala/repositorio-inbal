# Análisis de los datos de muestra

Revisión del 6 de octubre de 2026 sobre los dos Excel de `datos/`.

## Archivos

| Archivo | Registros | Qué es |
|---|---|---|
| `9_grandes_SIGROPAM.xlsx` | 2,709 | Exportación de SIGROPAM de 9 artistas. Es la base real para el importador |
| `Fichas_obras_etiqueta_color.xlsx` | 24 | Fichas "etiqueta verde" de MUNAL, MAM, MUNAE y San Carlos, ya limpias a mano. Solo 3 están en el otro Excel |

Columnas de SIGROPAM: `No_Sigropam`, `Título`, `Autor(es)`, `Fecha`, `Técnica`,
`Medida`, `Localización`, `Disciplina`, `Acervo`, `Observaciones`.

## Hallazgos

**El ID sí es el No. SIGROPAM.** Las imágenes del prototipo se llaman
`<MUSEO>_<número>` (por ejemplo `MAM_10494`) y ese número es el No. SIGROPAM:
coinciden las 14 obras del prototipo que son de los 9 artistas. El campo `id`
del prototipo (1, 2, 3...) es solo un consecutivo. El título no sirve como
llave: hay títulos repetidos en obras distintas.

**Un duplicado.** El 67575 viene dos veces, idéntico. El importador debe
quedarse con uno.

**Fechas: solo 45% trae un año.**

| Formato | Registros | Ejemplos |
|---|---|---|
| Año | 991 | `1940` |
| Sin fecha | 1,246 | `S/F`, `SIN FECHA`, vacío |
| Rango | ~170 | `1971-1973`, `38-39`, `1952L1956` (la L es un guion mal exportado) |
| Siglo | ~215 | `S XIX`, `Siglo XX`, `Siglo  XX` |
| Aproximado | ~40 | `ca1945`, `ca. 1925`, `CA. 1910-1915` |
| Fecha completa | ~30 | `JULIO DE 1906`, `21/11/1943` |

Propuesta: guardar `fechaTexto` tal cual para mostrar, y calcular `anioInicio`,
`anioFin`, `aproximada` y `siglo` para filtrar. Así el filtro por años incluye
obras antiguas, por siglo y sin fecha.

**Medidas: 94% tiene alto y ancho de la obra.** Todo viene en un texto
(`Obra Alto 39.5 CM Obra Ancho 48.0 CM Base Alto ...`), siempre en centímetros.
Se pueden separar alto, ancho y profundidad de la obra; base, soporte y marco
no se publican. 162 registros no tienen "Obra" y solo traen soporte o marco.

**Títulos y autores en mayúsculas.** 99% de los títulos están en mayúsculas
(`NATURALEZA MUERTA (CON CEPILLO DE DIENTES)`). Pasarlos a tipo oración
automáticamente rompe nombres propios (`Paricutín`, `Frida`), así que conviene
una corrección manual de los que se publiquen o aceptar mayúsculas. Autores
vienen como `OROZCO, JOSÉ CLEMENTE, 1883-1949`: se separan nombre y fechas.
Uno viene repetido dentro del mismo campo (Velasco).

**Disciplina: 15 valores que se traslapan.** `OBRA GRÁFICA`, `ARTES GRÁFICAS`,
`ESTAMPA`, `IMPRESIÓN` y `GRABADO` son casi lo mismo; `OBRA DE CABALLETE` y
`PINTURA` también. Hay que acordar un catálogo corto (Pintura, Dibujo, Gráfica,
Mural, Escultura, Fotografía, Otro) y una tabla de equivalencias. 14 vienen
vacías.

**Técnica: 238 valores con dos estilos.** `LÁPIZ/PAPEL` y `LÁPIZ SOBRE PAPEL`
son lo mismo. Se normaliza la diagonal a "sobre" y se agrupa para el filtro.

**Acervo: 18 valores, no solo museos.**
- 469 en el Centro Nacional de Conservación (CENCROPAM), que no es un museo.
- 10 marcadas `BAJA DEL ACERVO INBAL`: **no se deben publicar**.
- Mayúsculas y nombres inconsistentes (`MUSEO CASA DIEGO RIVERA, GTO.`,
  `INBA/MUSEO ARTE MODERNO DE GOMEZ PALACIO, DGO.`).

**Localización es interna.** 704 registros dicen bodega o taller del
CENCROPAM; otros dicen museos extranjeros donde la obra está prestada
(Whitney, National Gallery). No se publica, o solo cuando es un museo del INBAL.

**Observaciones es interna.** Trae oficios, números de inventario, donaciones,
estado de conservación y bajas. No se publica.

## Para confirmar con Vania

1. ¿El lanzamiento es con estos 9 artistas, con los 4 museos del prototipo o
   con todo el acervo?
2. ¿Qué acervos se publican? ¿Entran las obras del CENCROPAM?
3. Catálogo corto de disciplinas y quién valida las equivalencias.
4. ¿Títulos en mayúsculas o corregidos a mano?
5. ¿Las imágenes vendrán nombradas `<MUSEO>_<SIGROPAM>` o solo con el número?
6. Derechos: ninguno de los dos Excel tiene un campo de derechos de imagen.
   En México el derecho patrimonial dura la vida del autor más 100 años:
   Velasco (1912) y Herrán (1918) ya son dominio público; Orozco, Rivera,
   Siqueiros, Varo, Dr. Atl, Izquierdo y Kahlo siguen protegidos. Hay que saber
   qué autorizaciones tiene el INBAL.

## Cambios al modelo de datos

- `sigropam` (texto, único) como llave; `museoClave` aparte para el nombre de imagen.
- Fecha: `fechaTexto`, `anioInicio`, `anioFin`, `aproximada`, `siglo`.
- Medidas: `altoCm`, `anchoCm`, `profundidadCm` solo de la obra; `medidaTexto` original.
- `disciplina` (catálogo corto) y `disciplinaOriginal`; `tecnica` normalizada y `tecnicaOriginal`.
- `acervo` como relación a Museos; excluir bajas en el importador.
- `localizacion` y `observaciones` se importan pero quedan solo para el panel.
- `derechos` lo llena el INBAL; por defecto restringida.
