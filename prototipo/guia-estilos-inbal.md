# Guía de estilos — Colección Digital INBAL

Referencia rápida de CSS para mantener consistencia. Fuente: maqueta `home-inbal-v2.html`.

## Tokens CSS (copiar en `:root`)

```css
:root{
  /* Color */
  --guinda:#9b2247;      /* primario / acentos */
  --guinda-900:#611232;  /* bandas oscuras, footer */
  --verde:#1e5b4f;       /* secundario */
  --verde-900:#002f2a;   /* fondo del hero */
  --oro:#a57f2c;         /* líneas finas, etiquetas, marcos */
  --arena:#e6d194;       /* detalle claro sobre oscuro */
  --tinta:#211a1c;       /* texto principal */
  --gris:#6f6a66;        /* texto secundario */
  --linea:#e8e3da;       /* bordes / hairlines */
  --papel:#ffffff;       /* fondo base */
  --papel-2:#faf7f2;     /* fondo alterno cálido */

  /* Tipografía */
  --display:"Patria","Fraunces",Georgia,serif; /* Patria = licenciada; Fraunces = fallback */
  --sans:"Noto Sans",system-ui,sans-serif;

  /* Layout */
  --wrap:1280px;         /* ancho máx. de contenido */
  --pad-x:40px;          /* padding lateral (22px en móvil) */
  --section:96px;        /* padding vertical de sección */
  --gap:24px;            /* separación de grillas */

  /* Radios */
  --r-obra:4px;          /* imagen/tarjeta de obra */
  --r-card:14px;         /* tarjetas de recurso */
  --r-band:16px;         /* banda de curaduría */
  --r-pill:40px;         /* botones / CTA */

  /* Movimiento */
  --ease:cubic-bezier(.2,.7,.2,1);
  --dur:.35s;
}
```

## Color — reglas de uso

- **Fondo del cuerpo: siempre blanco/limpio** (`--papel`). El oscuro (`--guinda-900`, `--verde-900`) solo en hero, banda de curaduría y footer.
- Texto sobre oscuro: blanco o `--arena`. Nunca colores fuera de la paleta institucional.
- Acento principal `--guinda`; `--oro` solo para hairlines, etiquetas y marcos.

## Tipografía — escala

| Uso | Familia | Tamaño | Peso | Extras |
|---|---|---|---|---|
| Hero (display) | display | `clamp(52px,9.2vw,138px)` | 500 | `line-height:.9; letter-spacing:-.02em` |
| Estadística | display | `clamp(34px,4vw,52px)` | 500 | color `--guinda` |
| Título de sección (H2) | display | `clamp(30px,4vw,46px)` | 500 | `line-height:1.05` |
| Título de banda (H3) | display | `clamp(30px,3.6vw,44px)` | 500 | |
| Ítem grande (acceso) | display | `clamp(24px,3vw,36px)` | 500 | |
| Nombre de museo | display | `clamp(20px,2.4vw,30px)` | 500 | |
| Título de obra | display | `17px` | 500 | |
| Cuerpo | sans | `16px` | 400 | `line-height:1.6` |
| Texto secundario | sans | `13–15px` | 400 | color `--gris` |
| Metadato de obra | sans | `12.5px` | 400 | color `--gris` |
| Etiqueta (`.lbl`) | sans | `11px` | 500 | `uppercase; letter-spacing:.22em; color:--gris` |
| Navegación / CTA | sans | `12–12.5px` | 500 | `uppercase; letter-spacing:.12–.16em` |

Regla: **títulos siempre en `--display`; todo lo demás en `--sans`.**

## Elementos con consistencia obligatoria

- **Contenedor:** `max-width:var(--wrap); margin:0 auto; padding:0 var(--pad-x)`.
- **Sección:** `padding:var(--section) 0`.
- **Bordes:** `1px solid var(--linea)` (hairlines y separadores de lista).
- **Botón / CTA:** fondo `--arena`, texto `--guinda-900`, `padding:15px 26px`, `border-radius:var(--r-pill)`, `11–12px uppercase letter-spacing:.16em`; hover `background:#fff; transform:translateY(-2px)`.
- **Etiqueta de tipo de obra:** fondo `rgba(97,18,50,.9)` (guinda), texto `--arena`, `10px uppercase`, `border-radius:3px`.
- **Tarjeta de obra:** imagen con `border-radius:var(--r-obra)` + zoom `scale(1.05)` al hover; debajo título (display) y metadato (sans/`--gris`).
- **Header:** fijo; transparente con texto blanco sobre el hero, y `fondo blanco + texto --tinta/--guinda` al hacer scroll.
- **Marcos de obra destacada:** borde `--arena` (8px) o hairline `--oro`.

## Movimiento

- Transiciones con `var(--ease)` y `~var(--dur)`; reveal de secciones `.9s`.
- **Respetar accesibilidad:**

```css
@media (prefers-reduced-motion: reduce){ *{animation:none!important;transition:none!important} }
```

## Responsive

- Único breakpoint principal: `max-width:900px`. Ahí: menú y decorativos se ocultan, grillas colapsan a 1–2 columnas, `--pad-x` baja a `22px`, toca-targets ≥ 44px.
