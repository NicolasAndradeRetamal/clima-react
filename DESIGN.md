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
