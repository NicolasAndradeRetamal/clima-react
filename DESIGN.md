# DESIGN — clima-react

Identidad visual y especificación de UX de la aplicación de clima. Este
documento es el contrato para el agente frontend: tokens de diseño (`@theme` de
Tailwind CSS v4), layout, especificaciones de componentes, set de iconos y
reglas de accesibilidad.

Convenciones:

- Nombres de tokens y de clases en **inglés**. Todo el copy de UI en **español**
  (las cadenas de copy de este documento son la redacción final; tienen
  precedencia sobre los borradores de ARCHITECTURE.md §6 donde difieran — las
  diferencias son menores).
- Tailwind CSS v4 vía `@tailwindcss/vite`; los tokens viven en `src/index.css`
  bajo `@theme`. Sin archivo `tailwind.config`.
- Mobile first: las clases base apuntan a ~360 px; se escala con `sm:` / `md:`.

---

## 1. Identidad visual

### 1.1 Concepto

Identidad "cielo" limpia: un azul sereno como único color de marca, superficies
slate neutras, un solo acento cálido (ámbar) reservado exclusivamente para la
estrella de favorita. Sin degradados, sin glassmorphism, sin fondos temáticos
por condición — el icono del clima y los datos son los protagonistas.
Consistencia por encima de decoración.

### 1.2 Modos de color

**Modo claro y oscuro, siguiendo únicamente la preferencia del sistema (sin toggle).**

Justificación: un toggle añade estado de cliente, persistencia y superficie de
UI a cambio de cero valor de portafolio; respetar `prefers-color-scheme` cuesta
casi nada porque cada token semántico se define una sola vez con `light-dark()`
de CSS (soportado en todos los navegadores evergreen desde 2024). Los
componentes usan utilidades semánticas (`bg-surface`, `text-ink`, …) y nunca
necesitan variantes `dark:`.

### 1.3 Paleta (tokens semánticos)

| Token | Claro | Oscuro | Uso |
|---|---|---|---|
| `surface` | `#f1f5f9` (slate-100) | `#0f172a` (slate-900) | Fondo de página |
| `surface-raised` | `#ffffff` | `#1e293b` (slate-800) | Tarjetas, dropdown |
| `surface-sunken` | `#e2e8f0` (slate-200) | `#334155` (slate-700) | Fondo del input, bloques de skeleton |
| `ink` | `#0f172a` (slate-900) | `#f1f5f9` (slate-100) | Texto principal |
| `ink-muted` | `#475569` (slate-600) | `#94a3b8` (slate-400) | Texto secundario, etiquetas |
| `line` | `#cbd5e1` (slate-300) | `#334155` (slate-700) | Bordes, divisores |
| `brand` | `#0284c7` (sky-600) | `#38bdf8` (sky-400) | Acciones principales, enlaces, anillo de foco, estados activos |
| `brand-strong` | `#0369a1` (sky-700) | `#7dd3fc` (sky-300) | Hover en elementos de marca |
| `brand-soft` | `#e0f2fe` (sky-100) | `#082f49` (sky-950) | Fondos de seleccionado/hover, chips sutiles |
| `accent` | `#f59e0b` (amber-500) | `#fbbf24` (amber-400) | Estrella de favorita (activa) — nada más |
| `danger` | `#dc2626` (red-600) | `#f87171` (red-400) | Texto/iconos de error |
| `danger-soft` | `#fee2e2` (red-100) | `#450a0a` (red-950) | Fondo del panel de error |

Contraste: todos los pares texto/fondo anteriores cumplen WCAG AA (≥ 4.5:1 para
texto de cuerpo; `ink-muted` sobre `surface-raised` es 7.6:1 en claro / 7.0:1
en oscuro). `brand` se usa como texto solo sobre `surface`/`surface-raised`
(4.8:1 claro, 8.4:1 oscuro), nunca sobre `brand-soft` para texto pequeño.

### 1.4 Tipografía

**Stack de fuentes del sistema** (el `--font-sans` por defecto de Tailwind).
Justificación: cero peticiones de red y cero dependencias para una app centrada
en datos; las fuentes nativas del sistema (Segoe UI Variable, SF Pro, Roboto)
funcionan de maravilla tanto en los tamaños pequeños de etiqueta como en la
temperatura hero de 60 px. Una webfont añadiría tiempo de carga sin un
beneficio distintivo aquí.

Reglas:

- Todos los datos meteorológicos numéricos usan `tabular-nums` para que los
  dígitos no se desplacen cuando cambian los valores (temperaturas, viento,
  humedad, porcentajes).
- Escala tipográfica (defaults de Tailwind, sin tamaños custom):

| Rol | Clases |
|---|---|
| Temperatura hero | `text-6xl font-light tracking-tight tabular-nums` |
| Título de la app (header) | `text-lg font-semibold` |
| Encabezado de sección ("Pronóstico de 7 días") | `text-sm font-semibold text-ink-muted uppercase tracking-wide` |
| Nombre de ciudad en la tarjeta de clima | `text-xl font-semibold` |
| Cuerpo / etiqueta de condición | `text-base` |
| Valores de métricas | `text-sm font-medium tabular-nums` |
| Etiquetas de métricas, nombres de día, leyendas | `text-xs text-ink-muted` |

### 1.5 Espaciado, radios, sombras

- **Espaciado**: solo la escala de 4 px por defecto de Tailwind. Ritmo: `gap-2`
  (8 px) dentro de filas densas, `p-4` (16 px) de padding de tarjeta en móvil /
  `sm:p-6` en ≥640 px, `space-y-6` (24 px) entre secciones de página.
- **Radios**: `rounded-2xl` para tarjetas y paneles, `rounded-lg` para inputs y
  botones, `rounded-full` para chips/pills y el spinner.
- **Sombras**: `shadow-sm` en tarjetas elevadas y `shadow-lg` en el dropdown.
  Nada más pesado. En modo oscuro las sombras apenas se perciben, así que los
  elementos elevados llevan además `border border-line` (claro y oscuro) — el
  borde hace el trabajo de separación en modo oscuro.
- **Movimiento**: `transition-colors duration-150` en elementos interactivos;
  `animate-pulse` para skeletons; `animate-spin` para el spinner. Sin
  animaciones de entrada.

---

## 2. Tokens de diseño (`src/index.css`)

Contenido exacto del archivo del que debe partir el frontend:

```css
@import "tailwindcss";

@theme {
  /* Surfaces */
  --color-surface: light-dark(#f1f5f9, #0f172a);
  --color-surface-raised: light-dark(#ffffff, #1e293b);
  --color-surface-sunken: light-dark(#e2e8f0, #334155);

  /* Text */
  --color-ink: light-dark(#0f172a, #f1f5f9);
  --color-ink-muted: light-dark(#475569, #94a3b8);

  /* Lines */
  --color-line: light-dark(#cbd5e1, #334155);

  /* Brand */
  --color-brand: light-dark(#0284c7, #38bdf8);
  --color-brand-strong: light-dark(#0369a1, #7dd3fc);
  --color-brand-soft: light-dark(#e0f2fe, #082f49);

  /* Accent (favorites only) */
  --color-accent: light-dark(#f59e0b, #fbbf24);

  /* Feedback */
  --color-danger: light-dark(#dc2626, #f87171);
  --color-danger-soft: light-dark(#fee2e2, #450a0a);

  /* Chart series — v2 (§8.1): only inside HourlyChart */
  --color-chart-temp: light-dark(#ea580c, #fb923c);
}

:root {
  color-scheme: light dark; /* required for light-dark() and native form styling */
}

body {
  @apply bg-surface text-ink antialiased;
}
```

Uso: `bg-surface-raised`, `text-ink-muted`, `border-line`, `text-brand`,
`ring-brand`, `bg-danger-soft`, etc. **No** usar colores crudos de la paleta de
Tailwind (`bg-white`, `text-slate-500`, …) en componentes — solo tokens
semánticos, para que el modo oscuro salga gratis.

Estilo de foco global (también en `index.css`):

```css
@layer base {
  :focus-visible {
    @apply outline-2 outline-offset-2 outline-brand;
  }
}
```

---

## 3. Layout (vista única, mobile first)

Jerarquía vertical, una columna, centrada:

```
┌──────────────────────────────┐
│ Header: ☀ Clima              │  h-14, app name only
├──────────────────────────────┤
│ [ 🔍 Buscar ciudad…        ] │  SearchBar (+ dropdown overlays below)
├──────────────────────────────┤
│ Favoritas                    │  FavoritesList: horizontal chip strip
│ (Madrid ×) (Lima ×) (Bogotá ×)
├──────────────────────────────┤
│ CurrentWeatherCard           │  hero card
├──────────────────────────────┤
│ PRONÓSTICO DE 7 DÍAS         │
│ ForecastList                 │  mobile: 7 stacked rows
│                              │  md+: 7-column grid
└──────────────────────────────┘
```

- Contenedor de página (`App.tsx`):
  `min-h-dvh` en el wrapper del body; contenido en
  `mx-auto w-full max-w-3xl px-4 py-6 sm:px-6` con `space-y-6` entre las
  secciones (búsqueda, favoritas, clima, pronóstico).
- **Header**: `flex h-14 items-center gap-2` — `WeatherIcon kind="clear" isDay`
  a `size-6 text-brand` + título `Clima` (`text-lg font-semibold`). Sin nav.
- Las **favoritas** van **entre la búsqueda y el clima actual**: son una
  alternativa más rápida a buscar, así que pertenecen junto al input. En móvil
  la franja hace scroll horizontal (`overflow-x-auto`); nunca se envuelve a más
  de una fila (máximo 10 chips según ARCHITECTURE §5.5).
- **Grid de pronóstico**: móvil = lista vertical (`flex flex-col gap-2`, una
  fila por día, fácil de escanear y sin necesidad de tocar); `md:` (≥768 px) =
  `md:grid md:grid-cols-7 md:gap-2` con tarjetas de día verticales compactas.
  `max-w-3xl` mantiene cómodas las 7 columnas (~96 px cada una) sin estirarse
  en pantallas ultrapanorámicas.
- El **dropdown** de búsqueda **se superpone** al contenido de debajo
  (`absolute` dentro de un wrapper `relative`), nunca empuja el layout.

Breakpoints usados: solo `sm:` (ajustes de espaciado/padding) y `md:` (grid del
pronóstico, grid interno de la tarjeta actual). No se necesita nada más.

---

## 4. Especificaciones de componentes

Las cadenas de clases son normativas; el frontend puede dividirlas en
componentes más pequeños, pero no debe cambiar el resultado visual.

### 4.1 `CitySearch` (SearchBar + dropdown)

Wrapper: `relative` (el dropdown se ancla aquí). Label oculto visualmente:
`<label class="sr-only" for="city-search">Buscar ciudad</label>`.

**Fila del input** — `relative`:

- Icono de lupa: absoluto a la izquierda, `absolute left-3 top-1/2 size-5 -translate-y-1/2 text-ink-muted pointer-events-none`, `aria-hidden="true"`.
- Input:
  `w-full h-12 rounded-lg border border-line bg-surface-raised pl-10 pr-10 text-base text-ink placeholder:text-ink-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand`
  — `placeholder="Buscar ciudad…"`, `type="text"`, `autocomplete="off"`,
  `spellcheck="false"`. Altura de 48 px = objetivo táctil cómodo.
- Spinner inline (mientras `isDebouncing || isFetching`): `Spinner` a
  `absolute right-3 top-1/2 -translate-y-1/2 size-5` (ver §4.6).

**Panel del dropdown** (`SearchResultsList`), renderizado cuando el input tiene
foco y `debouncedQuery.length >= 2`:

- Contenedor:
  `absolute inset-x-0 top-full z-10 mt-2 max-h-80 overflow-y-auto rounded-lg border border-line bg-surface-raised shadow-lg`
- Fila de opción (por `City`):
  `flex w-full items-center gap-3 px-4 py-3 text-left cursor-pointer`
  — la opción activa/resaltada recibe `bg-brand-soft`; no hace falta `hover:`
  más allá de eso (el resaltado sigue al ratón y al teclado a través de
  `aria-activedescendant`).
  - Línea 1: nombre de la ciudad — `text-base font-medium text-ink`.
  - Línea 2: `admin1 · country` (omitir `admin1` cuando falte) — `text-xs text-ink-muted`.
- **Sin coincidencias** (respuesta exitosa, lista vacía): una sola fila no
  interactiva `px-4 py-3 text-sm text-ink-muted` con el copy
  `No se encontraron ciudades para «{query}»`.
- **Error de búsqueda**: una sola fila `px-4 py-3 text-sm text-danger`, copy
  `No se pudo buscar. Revisa tu conexión.` (usa `role="alert"`, ver §6).

Seleccionar una opción no rellena nada de vuelta en el input a nivel
decorativo: se limpia la query, se cierra el dropdown y se selecciona la ciudad.

### 4.2 `CurrentWeatherCard`

Estructura base de tarjeta (compartida por todas las tarjetas):
`rounded-2xl border border-line bg-surface-raised p-4 shadow-sm sm:p-6`.

Estructura interna:

1. **Fila de cabecera** — `flex items-start justify-between gap-2`:
   - Izquierda: nombre de ciudad `text-xl font-semibold` + debajo
     `{admin1 · }country` en `text-xs text-ink-muted`, y la etiqueta de
     condición (`WeatherCondition.label`, p. ej. "Parcialmente nublado") en
     `mt-1 text-sm text-ink-muted`.
   - Derecha: `FavoriteToggleButton` (§4.4).
2. **Fila hero** — `mt-4 flex items-center gap-4`:
   - `WeatherIcon kind isDay` a `size-16 text-brand` (64 px), `aria-hidden`.
   - Temperatura: `text-6xl font-light tracking-tight tabular-nums`, valor
     redondeado a entero + `°` (p. ej. `23°`). Sensación térmica justo debajo:
     `text-sm text-ink-muted` — `Sensación térmica: 25°`.
3. **Fila de métricas** — `mt-6 grid grid-cols-2 gap-3`:
   dos tiles de métrica, cada una
   `rounded-lg bg-surface-sunken px-3 py-2`:
   - etiqueta `text-xs text-ink-muted` (`Viento`, `Humedad`)
   - valor `text-sm font-medium tabular-nums` (`14 km/h`, `62 %`).

Indicador sutil de refetch (`isFetching && !isPending`): renderizar el Spinner
de §4.6 a `size-4 text-ink-muted` en la fila de cabecera, junto al nombre de la
ciudad, dentro de un span con `role="status"` y texto `sr-only`
`Actualizando…`. Los datos permanecen visibles.

### 4.3 `ForecastList` / `ForecastDayCard`

Encabezado de sección sobre la lista: `Pronóstico de 7 días` con estilo
`text-sm font-semibold text-ink-muted uppercase tracking-wide` (un `<h2>` real).

Contenedor de la lista: `flex flex-col gap-2 md:grid md:grid-cols-7`.

`ForecastDayCard` — una por día, **no interactiva** (un `<li>` plano dentro de
un `<ul>`):

- Móvil (layout de fila): `flex items-center gap-3 rounded-2xl border border-line bg-surface-raised px-4 py-3 md:flex-col md:gap-1 md:px-2 md:py-4 md:text-center`
  - Nombre del día: índice 0 → `Hoy`, si no `formatDayName` es-ES corto (`mié`, `jue`) —
    `w-12 text-sm font-medium capitalize md:w-auto`.
  - `WeatherIcon` a `size-8 text-brand` (`aria-hidden`; la etiqueta de condición
    se provee como texto `sr-only` junto a él).
  - Probabilidad de precipitación, solo cuando ≥ 20 %: `text-xs text-brand tabular-nums`
    (p. ej. `40 %`); reservar el hueco con `min-h-4` para que las tarjetas
    queden alineadas cuando falte.
  - Temperaturas, empujadas a la derecha en móvil (`ml-auto md:ml-0`): máxima
    `text-sm font-semibold tabular-nums` + mínima `text-sm text-ink-muted tabular-nums`,
    formateadas `21° / 12°` en móvil, apiladas (máxima sobre mínima) en `md:`.

### 4.4 `FavoritesList` / `FavoriteToggleButton`

**FavoritesList** — encabezado `Favoritas` (un `<h2 class="sr-only">` oculto
visualmente; los chips se explican solos) + franja:
`flex gap-2 overflow-x-auto pb-1` (el padding-bottom mantiene la barra de
scroll separada de los chips).

Chip de favorita (botón que selecciona la ciudad):
`inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full border border-line bg-surface-raised px-4 text-sm font-medium transition-colors hover:bg-brand-soft`
— cuando el chip es la ciudad **actualmente seleccionada**:
`border-brand bg-brand-soft text-brand` + `aria-current="true"`.
Etiqueta del chip: solo `name` (el país va en el atributo `title`). Quitar la
favorita se hace con la estrella de la tarjeta de clima, no en el chip — una
sola forma obvia de hacerlo, y mantiene los chips como objetivos de acción única.

**Estado vacío**: cuando `favorites.length === 0`, renderizar una línea
`text-sm text-ink-muted`: `Aún no tienes ciudades favoritas. Márcalas con la
estrella ☆.`

**FavoriteToggleButton** (vive en la cabecera de `CurrentWeatherCard`):
`inline-flex size-10 items-center justify-center rounded-full transition-colors hover:bg-brand-soft`
con un SVG de estrella a `size-6`:

- No favorita: estrella con contorno, `text-ink-muted`, `aria-pressed="false"`,
  `aria-label="Añadir a favoritas"`.
- Favorita: estrella rellena, `text-accent`, `aria-pressed="true"`,
  `aria-label="Quitar de favoritas"`.

### 4.5 Estados vacíos / placeholder (`EmptyState`)

Forma compartida: columna centrada dentro de una estructura de tarjeta —
`flex flex-col items-center gap-3 rounded-2xl border border-dashed border-line px-6 py-12 text-center`
(el borde discontinuo sin relleno distingue los placeholders del contenido real).
Icono a `size-10 text-ink-muted` (`aria-hidden`), mensaje
`text-sm text-ink-muted`.

- **Sin ciudad seleccionada** (reemplaza las secciones de clima + pronóstico):
  icono de lupa, copy `Busca una ciudad para ver el clima`.
- Los estados "sin resultados" de la búsqueda y favoritas-vacías usan las
  variantes inline especificadas en §4.1 y §4.4 (una tarjeta completa sería
  desproporcionada ahí).

### 4.6 Estados de carga

**`Spinner`** — círculo SVG inline:
`animate-spin` sobre un `svg` con `viewBox="0 0 24 24"`, un círculo completo a
`opacity-25` más un arco de 90° a opacidad plena, ambos `stroke="currentColor"
stroke-width="2.5" fill="none"`. Tamaño vía utilidad `size-*` desde el padre.
Siempre acompañado de `role="status"` + `<span class="sr-only">Cargando…</span>`
en su wrapper (o `aria-hidden` cuando exista un texto de estado hermano).

**Skeleton del panel de clima** (primera carga, `isPending`): replicar la
geometría de `CurrentWeatherCard` + `ForecastList` con bloques `animate-pulse`
de `rounded-lg bg-surface-sunken`:

- Tarjeta: barra de cabecera `h-6 w-40`, fila hero = círculo `size-16 rounded-full` +
  barra `h-14 w-32`, dos tiles de métrica `h-14`.
- Pronóstico: 7 filas `h-14 rounded-2xl` (móvil) / 7 columnas `h-36` (`md:`).

Envolver toda la región del skeleton en `role="status"` con texto `sr-only`
`Cargando el clima…` y `aria-hidden` en los bloques decorativos.

### 4.7 `ErrorMessage` (fallo al cargar el clima)

Tarjeta: `flex flex-col items-center gap-3 rounded-2xl border border-danger/30 bg-danger-soft px-6 py-10 text-center`, `role="alert"`.

- Icono de triángulo de alerta `size-8 text-danger` (`aria-hidden`).
- Copy `text-sm text-ink`:
  `No se pudo cargar el clima. Comprueba tu conexión e inténtalo de nuevo.`
- Botón de reintento (el único botón sólido de marca en la app):
  `h-10 rounded-lg bg-brand px-4 text-sm font-medium text-white transition-colors hover:bg-brand-strong`
  — etiqueta `Reintentar`, llama a `refetch()`. En modo oscuro `text-white`
  sobre sky-400 tiene bajo contraste, así que se usa `text-surface` en lugar de
  `text-white` (slate-900 sobre sky-400 = 8.9:1): las clases finales usan
  `text-surface`.

---

## 5. Set de iconos (`WeatherIcon`)

**Decisión: set de SVG inline escrito a mano, confirmada.** Diez kinds × dos
variantes para dos de ellos = 12 glifos pequeños (~15 líneas de SVG cada uno).
Una librería de iconos (lucide, @tabler) añadiría una dependencia y aun así
carecería de variantes meteorológicas día/noche coherentes; dibujarlos mantiene
el bundle en ~3 KB y demuestra oficio con SVG — el trade-off correcto para un
frontend de portafolio.

### 5.1 Guía de estilo SVG

- `viewBox="0 0 24 24"`, `fill="none"`, `stroke="currentColor"`,
  `stroke-width="1.75"`, `stroke-linecap="round"`, `stroke-linejoin="round"`.
- Color siempre vía `currentColor` (el padre pone `text-brand`, `text-ink-muted`, …).
  Excepción: el núcleo del sol y la luna pueden usar `fill="currentColor"` sin
  trazo para dar peso visual; las gotas de lluvia/copos de nieve son
  líneas/puntos trazados.
- Sin atributos `width`/`height` hardcodeados — el tamaño viene de las
  utilidades `size-*` de Tailwind (`size-5` = 20 px búsqueda/UI, `size-8` =
  32 px pronóstico, `size-16` = 64 px hero).
- Todo `WeatherIcon` renderiza `aria-hidden="true"` y `focusable="false"`;
  el significado siempre se transmite mediante texto adyacente visible o
  `sr-only` (el `WeatherCondition.label`).

### 5.2 Mapeo `WeatherKind` → glifo

| `kind` | `isDay=true` | `isDay=false` | Descripción del glifo |
|---|---|---|---|
| `clear` | sol | luna | Sol: círculo relleno r=4 + 8 rayos cortos. Luna: creciente relleno (círculo enmascarado por un path de círculo desplazado). |
| `partly-cloudy` | sol tras nube | luna tras nube | Sol/luna pequeño arriba a la izquierda a ~60 % de escala, contorno de nube solapando abajo a la derecha. |
| `overcast` | nube | igual | Un solo contorno de nube grande, base plana. |
| `fog` | nube + 2 líneas horizontales debajo | igual | Nube elevada, dos líneas escalonadas debajo. |
| `drizzle` | nube + 3 puntos | igual | Puntos (trazos diminutos de extremo redondeado) escalonados bajo la base de la nube. |
| `rain` | nube + 3 trazos diagonales cortos | igual | Trazos de ~4 px a ~70° bajo la nube. |
| `freezing-rain` | nube + 2 trazos diagonales + 1 asterisco | igual | Lluvia/hielo mixto: dos trazos de lluvia más una estrella de 3 trazos. |
| `snow` | nube + 3 asteriscos | igual | Tres estrellitas de 3 trazos escalonadas bajo la nube. |
| `showers` | nube + 3 trazos diagonales largos | igual | Como `rain` pero con trazos de ~6 px y más inclinados — visiblemente más intenso. |
| `thunderstorm` | nube + rayo | igual | Rayo en zigzag relleno (`fill="currentColor"`, sin trazo) bajo la nube. |

Solo `clear` y `partly-cloudy` tienen variante nocturna (según ARCHITECTURE
§4.4); el resto ignora `isDay`. Reutilizar una constante de path `<Cloud />`
en todos los glifos basados en nube para que sean visualmente idénticos.

El favicon de la app (`public/favicon.svg`) es el glifo de sol `clear`/día en
`#0284c7`.

---

## 6. Accesibilidad

### 6.1 Contraste y objetivos táctiles

- Todos los pares de tokens cumplen WCAG AA (§1.3). Nunca colocar `text-brand`
  sobre `bg-brand-soft` para texto por debajo de 18 px.
- Tamaño interactivo mínimo 40×40 px: input de búsqueda h-12, chips h-10,
  botón de estrella size-10, botón de reintento h-10, opciones del dropdown
  py-3 (filas de ≥44 px).

### 6.2 Foco

- Una sola regla global (§2): `outline-2 outline-offset-2 outline-brand` en
  `:focus-visible`. Nunca `outline-none` sin un reemplazo.
- El dropdown usa `aria-activedescendant`, así que el foco del DOM permanece en
  el input; la opción resaltada recibe `bg-brand-soft` como foco visual.

### 6.3 Patrón ARIA de autocompletado (combobox WAI-ARIA)

- Input: `role="combobox"`, `aria-expanded={open}`,
  `aria-controls="city-search-listbox"`, `aria-autocomplete="list"`,
  `aria-activedescendant={activeOptionId ?? undefined}`.
- Lista: `<ul id="city-search-listbox" role="listbox" aria-label="Ciudades sugeridas">`.
- Opciones: `<li role="option" id={`city-option-${city.id}`} aria-selected={isActive}>`.
- Teclado: `ArrowDown`/`ArrowUp` mueven la opción activa (con wrap),
  `Enter` selecciona la opción activa (o la primera cuando no hay ninguna activa),
  `Escape` cierra el dropdown y limpia la opción activa, `Tab` lo cierra.
- La fila de "sin resultados" es `role="status"` (no una opción); la fila de
  error de búsqueda es `role="alert"`.

### 6.4 Live regions y etiquetas

- Skeleton del clima e indicador de refetch: `role="status"` con texto `sr-only`
  en español (`Cargando el clima…`, `Actualizando…`).
- `ErrorMessage`: `role="alert"`.
- Iconos: siempre `aria-hidden="true"`; la condición se transmite mediante el
  texto visible del `label` (clima actual) o texto `sr-only` (tarjetas de pronóstico).
- El toggle de estrella usa `aria-pressed` + `aria-label` explícito (§4.4).
- `<html lang="es">` en `index.html`; título del documento `Clima — pronóstico
  por ciudad`.

### 6.5 Movimiento

Respetar `prefers-reduced-motion`: `motion-reduce:animate-none` de Tailwind en
los skeletons con `animate-pulse` es opcional (el pulso es sutil), pero aplicar
`motion-reduce:animate-none` más un estilo estático de fallback `opacity-50` NO
es necesario para el spinner — un spinner comunica progreso y está exento como
movimiento esencial. Añadir `motion-reduce:animate-none` solo a los skeletons.

---

## 7. Referencia de copy (cadenas finales en español)

Cadenas del MVP. Las cadenas nuevas de v2 están en §11.

| Contexto | Cadena |
|---|---|
| Placeholder del input | `Buscar ciudad…` |
| Etiqueta del input (sr-only) | `Buscar ciudad` |
| Etiqueta del dropdown | `Ciudades sugeridas` |
| Sin resultados de búsqueda | `No se encontraron ciudades para «{query}»` |
| Error de búsqueda | `No se pudo buscar. Revisa tu conexión.` |
| Sin ciudad seleccionada | `Busca una ciudad para ver el clima` |
| Error del clima | `No se pudo cargar el clima. Comprueba tu conexión e inténtalo de nuevo.` |
| Botón de reintento | `Reintentar` |
| Sin favoritas | `Aún no tienes ciudades favoritas. Márcalas con la estrella ☆.` |
| Añadir favorita (aria) | `Añadir a favoritas` |
| Quitar favorita (aria) | `Quitar de favoritas` |
| Cargando (sr-only) | `Cargando el clima…` / `Cargando…` |
| Refrescando (sr-only) | `Actualizando…` |
| Sensación térmica | `Sensación térmica: {t}°` |
| Etiquetas de métricas | `Viento` / `Humedad` |
| Encabezado del pronóstico | `Pronóstico de 7 días` |
| Hoy | `Hoy` |
| Título de la app | `Clima` |

---

# Parte II — Diseño v2

Extensión de diseño para las tres features de v2 (ARCHITECTURE.md §9–§13):
gráfico horario, geolocalización y PWA. **La identidad de la Parte I no
cambia**: mismos tokens, misma tipografía, mismos patrones de tarjeta. Todo lo
nuevo se construye con las utilidades semánticas existentes; los únicos tokens
nuevos son los del gráfico (§8.1, ya añadidos al bloque `@theme` de §2).

---

## 8. Gráfico horario (`HourlyChart`)

Curva de temperatura + barras de precipitación por horas del día seleccionado.
Librería: Recharts 3.9.2, lazy-loaded (ARCHITECTURE §10).

### 8.1 Tokens del gráfico

| Token | Claro | Oscuro | Uso |
|---|---|---|---|
| `chart-temp` | `#ea580c` (orange-600) | `#fb923c` (orange-400) | Línea de temperatura, dot del tooltip, swatch de leyenda |
| `brand` (existente) | `#0284c7` | `#38bdf8` | Barras de precipitación, swatch de leyenda |

Justificación: la regla de identidad "un solo acento cálido reservado a la
estrella" (§1.1) se mantiene — `chart-temp` es un naranja **de visualización de
datos**, visiblemente más rojizo que el ámbar de `accent`, y su uso está
restringido al gráfico. El par naranja/azul es el dúo clásico seguro para
daltonismo (deuteranopia/protanopia), y además las dos series se distinguen
por **forma** (línea vs. barras), nunca solo por color. Contraste como gráfico
informativo (WCAG 1.4.11, ≥3:1): orange-600 sobre blanco 3.6:1, orange-400
sobre slate-800 6.2:1, brand ya validado en §1.3.

En recharts los colores se pasan como valor de prop: usar
`var(--color-chart-temp)`, `var(--color-brand)`, `var(--color-line)` y
`var(--color-ink-muted)` — nunca hex crudos, para que el modo oscuro salga
gratis también dentro del SVG del chart.

### 8.2 Ubicación en el layout

Nueva sección al final de `WeatherPanel`, **debajo del pronóstico de 7 días**
(el gráfico detalla el día que se selecciona en esa lista; la lectura es de
arriba abajo: actual → semana → detalle por horas):

```
├──────────────────────────────┤
│ PRONÓSTICO DE 7 DÍAS         │  ForecastList (días ahora seleccionables)
├──────────────────────────────┤
│ PRONÓSTICO POR HORAS · HOY   │  <h2>, mismo estilo de encabezado de sección
│ ┌──────────────────────────┐ │
│ │  [gráfico]               │ │  tarjeta estándar
│ │  ● Temperatura (°C)      │ │  leyenda
│ │  ▪ Precipitación (mm)    │ │
│ └──────────────────────────┘ │
└──────────────────────────────┘
```

- Encabezado de sección (`<h2>`, mismo estilo que "Pronóstico de 7 días"):
  `Pronóstico por horas · {día}` donde `{día}` es `hoy` para el índice 0 y, si
  no, día de la semana largo + número en es-ES (`jueves 17`). El encabezado es
  el indicador **textual** del día seleccionado (complementa al estado visual
  de la tarjeta, §8.5) y se actualiza al cambiar de día.
- Tarjeta contenedora estándar:
  `rounded-2xl border border-line bg-surface-raised p-4 shadow-sm sm:p-6`.
- La sección entra en el `space-y-6` existente de `WeatherPanel`; no cambia
  nada del layout de la Parte I.

### 8.3 Composición del chart

Contenedor del gráfico dentro de la tarjeta: `h-56 md:h-64` (224 px móvil /
256 px en `md:` — altura fija para que el skeleton reserve exactamente lo
mismo y no haya layout shift). `ResponsiveContainer width="100%" height="100%"`.

| Elemento | Especificación |
|---|---|
| `CartesianGrid` | Solo líneas horizontales (`vertical={false}`), `stroke="var(--color-line)"`, `strokeDasharray="3 3"` |
| `Line` (temperatura) | `type="monotone"`, `stroke="var(--color-chart-temp)"`, `strokeWidth={2}`, `dot={false}`, `activeDot={{ r: 4 }}`, eje Y izquierdo. Los `null` se dejan como huecos (`connectNulls={false}`) |
| `Bar` (precipitación) | `fill="var(--color-brand)"`, `fillOpacity={0.5}`, `radius={[2, 2, 0, 0]}`, eje Y derecho, dominio `[0, 'auto']` |
| `XAxis` | `dataKey="hourLabel"`, ticks cada 3 h (`interval={2}`), `tickFormatter` que recorta a la hora (`"14:00"` → `"14"`) para que quepan en 320 px; `tick={{ fill: 'var(--color-ink-muted)', fontSize: 12 }}`, `axisLine={{ stroke: 'var(--color-line)' }}`, `tickLine={false}` |
| `YAxis` ×2 | Izquierdo (°C): `tickFormatter` `` `${v}°` ``; derecho (mm): `orientation="right"`. Ambos: `tick` como el XAxis, `axisLine={false}`, `tickLine={false}`, `width={32}` |
| `Tooltip` | `content={<HourlyChartTooltip />}` (§8.4), `cursor={{ stroke: 'var(--color-line)' }}` |

**Leyenda** (obligatoria: hay dos series y dos ejes) — fila propia bajo el
gráfico, no la `<Legend />` de recharts:
`mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-muted`.
Cada ítem: swatch + etiqueta:

- Temperatura: `size-2.5 rounded-full bg-chart-temp` (punto = línea) + `Temperatura (°C)`
- Precipitación: `size-2.5 rounded-xs bg-brand/50` (cuadrado = barra) + `Precipitación (mm)`

La forma del swatch replica la forma de la serie: el color no es el único
diferenciador tampoco en la leyenda.

**Accesibilidad**: el `accessibilityLayer` de recharts v3 queda activado (por
defecto): el gráfico es enfocable y las flechas mueven el cursor/tooltip. El
wrapper del chart lleva `role="img"` implícito de recharts más
`aria-label="Gráfico de temperatura y precipitación por horas"`. El foco usa
el estilo global (§2). En `prefers-reduced-motion` no hay nada que apagar (el
chart no anima entradas; `isAnimationActive={false}` en `Line` y `Bar` para
evitar la animación de montaje de recharts — menos movimiento y tests más
estables).

### 8.4 Tooltip (`HourlyChartTooltip`)

Mini-tarjeta flotante, misma familia visual que el dropdown de búsqueda:
`rounded-lg border border-line bg-surface-raised px-3 py-2 shadow-lg`.

Contenido (formatos de `lib/format.ts`, es-ES):

1. **Hora** — `text-xs font-semibold text-ink tabular-nums`: `14:00`
   (el `hourLabel` completo; el eje X muestra solo `14`, el tooltip da la
   forma completa).
2. **Filas de datos** — una por métrica, `flex items-center gap-1.5 text-xs
   text-ink-muted`, valor en `font-medium text-ink tabular-nums`:
   - `● Temperatura: 23°` — dot `size-2 rounded-full bg-chart-temp`, entero redondeado.
   - `▪ Precipitación: 1,2 mm` — dot `size-2 rounded-xs bg-brand/50`, un
     decimal con coma es-ES; `0 mm` cuando es cero.
   - `Prob. de lluvia: 40 %` — sin dot (no se dibuja como serie), entero.

Una métrica `null` omite su fila. Si todas son `null` en ese punto, el tooltip
no se renderiza.

### 8.5 Día seleccionado en `ForecastList`

`ForecastDayCard` pasa de `<li>` plano a `<li>` con un `<button type="button">`
que ocupa toda la tarjeta (ARCHITECTURE §10.3). El botón absorbe las clases
visuales de la tarjeta actual:

- **Reposo**: `flex w-full cursor-pointer items-center gap-3 rounded-2xl
  border border-line bg-surface-raised px-4 py-3 text-left transition-colors
  md:flex-col md:gap-1 md:px-2 md:py-4 md:text-center` (idéntica a la tarjeta
  del MVP; el contenido interno no cambia). Altura de fila ≥48 px en móvil:
  objetivo táctil correcto.
- **Hover**: `hover:bg-brand-soft` (mismo patrón que los chips de favoritas).
- **Focus**: estilo global `:focus-visible` (§2), nada extra.
- **Seleccionado** (`aria-pressed="true"`): `border-brand bg-brand-soft` y el
  nombre del día en `font-semibold` — mismo lenguaje visual que el chip de
  favorita activa (§4.4), así "elemento activo" se ve igual en toda la app.
  El estado no depende solo del color: `aria-pressed` lo expone
  programáticamente y el encabezado del bloque horario (§8.2) lo repite en
  texto visible.
- **Deshabilitado / cargando**: no existen — los 7 días ya están en memoria;
  cambiar de día es instantáneo y sin spinner.

Contenedor `<ul>`: añade `role="group"` +
`aria-label="Selecciona un día para ver el detalle por horas"`.

### 8.6 Estados del bloque horario

| Estado | UI |
|---|---|
| Chunk lazy cargando (`Suspense`) | Skeleton: el encabezado de sección real + bloque `h-56 animate-pulse rounded-2xl bg-surface-sunken motion-reduce:animate-none md:h-64`, envuelto en `role="status"` con `sr-only` `Cargando el gráfico…`. Misma altura que el chart: cero layout shift |
| Primera carga del clima (`isPending`) | El `WeatherSkeleton` existente (§4.6) se extiende con ese mismo bloque al final |
| Día sin datos horarios (`points.length === 0` o todo `null`) | Variante compacta del `EmptyState`: `rounded-2xl border border-dashed border-line px-6 py-8 text-center` + mensaje `text-sm text-ink-muted` `Sin datos horarios para este día` (sin icono; py-8 en vez de py-12: es un hueco de sección, no de página) |
| Cambio de día | Encabezado y gráfico se actualizan de inmediato; sin spinner |

### 8.7 Responsive

- **Móvil (base)**: chart `h-56`, ticks del eje X cada 3 h abreviados (`00`,
  `03`, … `21`), ejes Y compactos (`width={32}`). El tooltip de recharts se
  reposiciona solo dentro del contenedor; con `accessibilityLayer` también
  funciona por teclado y toque.
- **`md:` (≥768 px)**: solo cambia la altura (`md:h-64`). Mismos ticks — más
  densidad no aporta lectura y mantiene un solo comportamiento que testear.
- El ancho lo gobierna el `max-w-3xl` de la página; `ResponsiveContainer`
  hace el resto.

---

## 9. Geolocalización

### 9.1 `GeolocationBanner` — ubicación y anatomía

Se renderiza en `App` **entre la búsqueda y las favoritas**: igual que los
chips, es una vía alternativa de selección y pertenece junto al input. Es una
fila ligera, **no** una tarjeta ni un modal — nunca bloquea el flujo de
búsqueda manual. Ocupa el hueco de una fila (`min-h-10`) mientras exista, y
desaparece del layout en `granted`/`unsupported`.

Estados (máquina de ARCHITECTURE §11.2):

| `status` | UI |
|---|---|
| `unsupported` | No se renderiza nada (la búsqueda es el flujo normal; no se anuncia una carencia del navegador). |
| `idle` | Botón secundario con icono de ubicación: `inline-flex h-10 cursor-pointer items-center gap-2 rounded-full border border-line bg-surface-raised px-4 text-sm font-medium text-brand transition-colors not-aria-disabled:hover:bg-brand-soft aria-disabled:opacity-60 aria-disabled:cursor-default` — icono pin `size-5` (`aria-hidden`), etiqueta `Usar mi ubicación`. Mismo lenguaje de chip que las favoritas: se lee como "otra forma de elegir ubicación". Hover/focus/activo como los chips; focus con el outline global. (Las variantes `aria-disabled:` van en la clase base porque el estado `requesting` reutiliza este mismo elemento, ver fila siguiente.) |
| `requesting` | **El mismo elemento `<button>`** que en `idle` — no se desmonta ni se sustituye por otro, para que el foco de teclado sobreviva a la transición (WCAG 2.4.3). Se marca con `aria-disabled="true"` y un guard en `onClick` (retorno inmediato mientras `status === 'requesting'`); **nunca el atributo `disabled`**, que expulsaría el foco a `document.body`. Visual: mismo aspecto atenuado que el disabled del sistema vía las variantes de la clase base (`opacity-60`, cursor por defecto, sin feedback de hover); sigue enfocable y conserva el outline global de focus. El icono pin se sustituye por el `Spinner` (§4.6) a `size-4`, etiqueta `Obteniendo tu ubicación…`. El wrapper lleva `role="status"` (anuncia el cambio a lectores de pantalla). |
| `denied` | Fila informativa, tono neutro (no es un error de la app): `flex items-center gap-2 rounded-lg bg-surface-sunken px-3 py-2 text-sm text-ink-muted` — icono de info `size-5 shrink-0` (`aria-hidden`) + texto `Permiso de ubicación denegado. Puedes buscar tu ciudad manualmente.` + botón de descarte al final (`ml-auto`): `inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-brand-soft` con icono × `size-4` y `aria-label="Descartar aviso"`. Sin botón de reintento: el permiso se gestiona en el navegador. Descartar oculta la fila para la sesión (estado local). |
| `error` | Misma fila neutra que `denied`, texto `No se pudo obtener tu ubicación.` + botón fantasma `Reintentar`: `h-10 shrink-0 cursor-pointer rounded-lg px-3 text-sm font-medium text-brand transition-colors hover:bg-brand-soft` → `requestLocation()`. (Fantasma y no sólido: el sólido queda reservado al error de datos de §4.7.) |
| `granted` | El banner desaparece; el panel muestra "Tu ubicación" (§9.3). |

**Gestión de foco al salir de `requesting`** (el botón se desmonta y, sin
esto, el foco caería a `document.body` — WCAG 2.4.3). Solo aplica si el foco
estaba en el botón del banner justo antes de la transición (rastrearlo con un
ref actualizado en `focus`/`blur` del botón); si el usuario estaba en otro
sitio, **nunca** se le roba el foco. Destinos por estado de llegada:

- `granted` → foco programático al encabezado "Tu ubicación" del panel
  (§9.3), que lleva `tabindex="-1"` para recibirlo. Es la continuación
  lógica: "pediste tu ubicación, aquí está".
- `denied` → foco al botón de descarte de la fila informativa (único
  elemento interactivo de la fila; el texto lo anuncia el `role="status"`
  del wrapper, no hace falta enfocar el contenedor).
- `error` → foco al botón `Reintentar` (la siguiente acción lógica).

Redacción: informativa y sin culpar ("Permiso de ubicación denegado…" en vez
de "Has denegado…"); nunca sugiere que la app esté rota, y siempre deja claro
el camino manual.

### 9.2 Icono de ubicación

Nuevo glifo en el set de iconos de UI, misma guía de estilo que §5.1
(`viewBox 24`, `stroke-width 1.75`, `currentColor`): **pin de mapa** —
contorno de gota invertida + círculo interior r=2.5. Se usa en el botón del
banner y junto al encabezado "Tu ubicación". Siempre `aria-hidden="true"`.

### 9.3 "Tu ubicación" en `CurrentWeatherCard`

Cuando la ubicación seleccionada viene de geolocalización
(`SelectedLocation.city === undefined`):

- **Encabezado**: icono pin `size-5 text-brand` (`aria-hidden`) + `Tu ubicación`
  en el estilo de nombre de ciudad (`text-xl font-semibold`), alineados con
  `inline-flex items-center gap-1.5`. El pin es la marca visual de "esto es tu
  posición, no una ciudad buscada". El encabezado lleva `tabindex="-1"`:
  es el destino del foco programático al concederse el permiso (§9.1); no
  entra en el orden de tabulación y conserva el estilo de focus global si el
  navegador lo muestra.
- **Sin sublínea** `admin1 · country` (no hay reverse geocoding —
  ARCHITECTURE §11.3); la etiqueta de condición sube a ocupar su lugar. No se
  muestran coordenadas crudas: ruido sin valor para el usuario.
- **Sin `FavoriteToggleButton`**: la ubicación actual **no es favoritable**
  (sin id estable). La estrella no se renderiza deshabilitada ni con tooltip:
  simplemente no existe, y la fila de cabecera conserva su
  `justify-between` sin hueco fantasma (el indicador de refetch sigue
  funcionando igual). Un control deshabilitado invitaría a preguntarse "¿por
  qué no puedo?"; su ausencia comunica que aquí no aplica.

Todo lo demás (fila hero, métricas, skeleton, error) es idéntico: el clima de
"Tu ubicación" es un clima más.

---

## 10. PWA

### 10.1 `OfflineBanner`

Franja informativa global, renderizada por `App` **fuera del contenedor
`max-w-3xl` y por encima del header**, a ancho completo:

- Clases: `sticky top-0 z-20 border-b border-line bg-surface-sunken px-4 py-2
  text-center text-sm text-ink` + `role="status"`.
- Contenido: icono nube tachada `size-4` inline (`aria-hidden`, mismo estilo
  §5.1) + `Sin conexión. Se muestran los últimos datos disponibles.`
- Color **neutro** (`surface-sunken`), no `danger`: estar offline no es un
  error de la app — los datos cacheados siguen siendo válidos y el copy lo
  dice. El rojo queda reservado para fallos reales (si además no hay caché,
  el `ErrorMessage` de §4.7 aparece debajo con su propio tratamiento).
  Contraste `ink` sobre `surface-sunken`: 14.5:1 claro / 9.4:1 oscuro.
- `sticky` y no `fixed`: empuja el contenido en vez de taparlo (sin necesidad
  de compensar con padding) y permanece visible al hacer scroll.
- Aparece cuando `useOnlineStatus()` es `false` y desaparece al reconectar,
  sin animación de entrada/salida (coherente con §1.5: sin animaciones de
  entrada).

### 10.2 Manifest: valores visuales finales

Valores que rellenan los huecos de ARCHITECTURE §12.2:

| Clave | Valor | Justificación |
|---|---|---|
| `theme_color` | `#0284c7` | `brand` claro: barra de título de la app instalada en azul de marca (texto del sistema en blanco: 4.1:1, suficiente para el texto grande de la barra). |
| `background_color` | `#0f172a` | `surface` oscuro: color del splash de arranque. El manifest no soporta `light-dark()`; se elige el fondo oscuro (mal menor: un destello claro en un entorno oscuro molesta más que lo inverso, y el icono de marca contrasta 4.3:1 sobre él). |

`index.html` añade además dos metas `theme-color` con media query (esto sí
puede seguir al sistema, a diferencia del manifest) y el icono de iOS:

```html
<meta name="theme-color" media="(prefers-color-scheme: light)" content="#f1f5f9" />
<meta name="theme-color" media="(prefers-color-scheme: dark)" content="#0f172a" />
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
```

(En el navegador, la UI se tiñe del color de `surface` del modo activo; el
azul de marca queda para la ventana de la app instalada vía manifest.)

### 10.3 Iconos PWA (entregados en `public/`)

Diseño: el glifo de sol del favicon (§5.2 — círculo relleno r=4 + 8 rayos,
espacio de 24 unidades) en **blanco** sobre fondo **brand `#0284c7`** (blanco
sobre sky-600: 4.1:1, ≥3:1 de gráfico). Mismo dibujo exacto que `favicon.svg`,
así el icono de
pestaña, el de instalación y el splash cuentan la misma marca.

| Archivo | Tamaño | Geometría |
|---|---|---|
| `pwa-192x192.png` | 192 | Fondo cuadrado redondeado (radio 20 %, esquinas transparentes), glifo centrado con radio exterior al 33 % del lienzo. |
| `pwa-512x512.png` | 512 | Ídem a 512 px. |
| `pwa-maskable-512x512.png` | 512 | Fondo **a sangre completa** (sin transparencia); glifo al 36 % del lienzo — dentro de la zona segura maskable (radio 40 %), sobrevive a cualquier máscara (círculo, squircle). |
| `apple-touch-icon.png` | 180 | A sangre completa (iOS aplica su propia máscara), glifo al 36 %. |

Los cuatro PNG están generados y commiteados en `public/`; si hubiera que
regenerarlos (p. ej. cambio de marca), la especificación de esta tabla es la
fuente: sol del favicon en blanco, fondo `#0284c7`, proporciones indicadas.

---

## 11. Referencia de copy v2 (cadenas finales en español)

| Contexto | Cadena |
|---|---|
| Encabezado del bloque horario | `Pronóstico por horas · hoy` / `Pronóstico por horas · {jueves 17}` |
| Etiqueta del gráfico (aria) | `Gráfico de temperatura y precipitación por horas` |
| Leyenda del gráfico | `Temperatura (°C)` / `Precipitación (mm)` |
| Tooltip del gráfico | `Temperatura: {23}°` / `Precipitación: {1,2} mm` / `Prob. de lluvia: {40} %` |
| Grupo de días (aria) | `Selecciona un día para ver el detalle por horas` |
| Sin datos horarios | `Sin datos horarios para este día` |
| Cargando el gráfico (sr-only) | `Cargando el gráfico…` |
| Botón de geolocalización | `Usar mi ubicación` |
| Solicitando ubicación | `Obteniendo tu ubicación…` |
| Permiso denegado | `Permiso de ubicación denegado. Puedes buscar tu ciudad manualmente.` |
| Error de geolocalización | `No se pudo obtener tu ubicación.` |
| Reintentar geolocalización | `Reintentar` |
| Descartar aviso (aria) | `Descartar aviso` |
| Encabezado de ubicación actual | `Tu ubicación` |
| Banner offline | `Sin conexión. Se muestran los últimos datos disponibles.` |
| Nombre de la app instalada | `Clima — Pronóstico del tiempo` (short name: `Clima`) |
| Descripción del manifest | `Clima actual y pronóstico de 7 días con Open-Meteo` |
