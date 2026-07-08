# DESIGN — clima-react

Visual identity and UX specification for the weather app. This document is the
contract for the frontend agent: design tokens (Tailwind CSS v4 `@theme`),
layout, component specs, icon set and accessibility rules.

Conventions:

- Document, token names and class names in **English**. All UI copy in **Spanish**
  (copy strings in this doc are final wording; they take precedence over the
  drafts in ARCHITECTURE.md §6 where they differ — differences are minor).
- Tailwind CSS v4 via `@tailwindcss/vite`; tokens live in `src/index.css` under
  `@theme`. No `tailwind.config` file.
- Mobile first: base classes target ~360 px; scale up with `sm:` / `md:`.

---

## 1. Visual identity

### 1.1 Concept

Clean "sky" identity: a calm blue as the single brand color, neutral slate
surfaces, one warm accent (amber) reserved exclusively for the favorite star.
No gradients, no glassmorphism, no per-condition background themes — the
weather icon and the data are the protagonists. Consistency over decoration.

### 1.2 Color modes

**Both light and dark mode, following the system preference only (no toggle).**

Justification: a toggle adds client state, persistence and UI surface for zero
portfolio value; honoring `prefers-color-scheme` costs almost nothing because
every semantic token is defined once with CSS `light-dark()` (supported in all
evergreen browsers since 2024). Components use semantic utilities
(`bg-surface`, `text-ink`, …) and never need `dark:` variants.

### 1.3 Palette (semantic tokens)

| Token | Light | Dark | Use |
|---|---|---|---|
| `surface` | `#f1f5f9` (slate-100) | `#0f172a` (slate-900) | Page background |
| `surface-raised` | `#ffffff` | `#1e293b` (slate-800) | Cards, dropdown |
| `surface-sunken` | `#e2e8f0` (slate-200) | `#334155` (slate-700) | Input bg, skeleton blocks |
| `ink` | `#0f172a` (slate-900) | `#f1f5f9` (slate-100) | Primary text |
| `ink-muted` | `#475569` (slate-600) | `#94a3b8` (slate-400) | Secondary text, labels |
| `line` | `#cbd5e1` (slate-300) | `#334155` (slate-700) | Borders, dividers |
| `brand` | `#0284c7` (sky-600) | `#38bdf8` (sky-400) | Primary actions, links, focus ring, active states |
| `brand-strong` | `#0369a1` (sky-700) | `#7dd3fc` (sky-300) | Hover on brand elements |
| `brand-soft` | `#e0f2fe` (sky-100) | `#082f49` (sky-950) | Selected/hover backgrounds, subtle chips |
| `accent` | `#f59e0b` (amber-500) | `#fbbf24` (amber-400) | Favorite star (active) — nothing else |
| `danger` | `#dc2626` (red-600) | `#f87171` (red-400) | Error text/icons |
| `danger-soft` | `#fee2e2` (red-100) | `#450a0a` (red-950) | Error panel background |

Contrast: every text/background pair above meets WCAG AA (≥ 4.5:1 for body
text; `ink-muted` on `surface-raised` is 7.6:1 light / 7.0:1 dark). `brand` is
used for text only on `surface`/`surface-raised` (4.8:1 light, 8.4:1 dark),
never on `brand-soft` for small text.

### 1.4 Typography

**System font stack** (Tailwind's default `--font-sans`). Justification: zero
network requests and zero dependencies for a data-first app; native system
fonts (Segoe UI Variable, SF Pro, Roboto) are excellent at both the small
label sizes and the 60 px hero temperature. A webfont would add load time
without a distinctive payoff here.

Rules:

- All numeric weather data uses `tabular-nums` so digits don't shift when
  values change (temperatures, wind, humidity, percentages).
- Type scale (Tailwind defaults, no custom sizes):

| Role | Classes |
|---|---|
| Hero temperature | `text-6xl font-light tracking-tight tabular-nums` |
| App title (header) | `text-lg font-semibold` |
| Section heading ("Pronóstico de 7 días") | `text-sm font-semibold text-ink-muted uppercase tracking-wide` |
| City name in weather card | `text-xl font-semibold` |
| Body / condition label | `text-base` |
| Metric values | `text-sm font-medium tabular-nums` |
| Metric labels, day names, captions | `text-xs text-ink-muted` |

### 1.5 Spacing, radii, shadows

- **Spacing**: Tailwind's default 4 px scale only. Rhythm: `gap-2` (8 px)
  inside dense rows, `p-4` (16 px) card padding on mobile / `sm:p-6` on ≥640 px,
  `space-y-6` (24 px) between page sections.
- **Radii**: `rounded-2xl` for cards and panels, `rounded-lg` for inputs and
  buttons, `rounded-full` for chips/pills and the spinner.
- **Shadows**: `shadow-sm` on raised cards and `shadow-lg` on the dropdown.
  Nothing heavier. In dark mode shadows barely read, so raised elements also
  carry `border border-line` (light and dark) — the border does the separation
  work in dark mode.
- **Motion**: `transition-colors duration-150` on interactive elements;
  `animate-pulse` for skeletons; `animate-spin` for the spinner. No entrance
  animations.

---

## 2. Design tokens (`src/index.css`)

Exact file content the frontend must start from:

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

Usage: `bg-surface-raised`, `text-ink-muted`, `border-line`, `text-brand`,
`ring-brand`, `bg-danger-soft`, etc. **Do not** use raw Tailwind palette
colors (`bg-white`, `text-slate-500`, …) in components — semantic tokens only,
so dark mode stays free.

Global focus style (also in `index.css`):

```css
@layer base {
  :focus-visible {
    @apply outline-2 outline-offset-2 outline-brand;
  }
}
```

---

## 3. Layout (single view, mobile first)

Vertical hierarchy, one column, centered:

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

- Page shell (`App.tsx`):
  `min-h-dvh` on body wrapper; content in
  `mx-auto w-full max-w-3xl px-4 py-6 sm:px-6` with `space-y-6` between the
  sections (search, favorites, weather, forecast).
- **Header**: `flex h-14 items-center gap-2` — `WeatherIcon kind="clear" isDay`
  at `size-6 text-brand` + title `Clima` (`text-lg font-semibold`). No nav.
- **Favorites** sit **between search and current weather**: they are a faster
  alternative to searching, so they belong next to the input. On mobile the
  strip scrolls horizontally (`overflow-x-auto`); it never wraps to more than
  one row (max 10 chips per ARCHITECTURE §5.5).
- **Forecast grid**: mobile = vertical list (`flex flex-col gap-2`, one row per
  day, easy to scan and tap-free); `md:` (≥768 px) = `md:grid md:grid-cols-7 md:gap-2`
  with compact vertical day cards. `max-w-3xl` keeps 7 columns comfortable
  (~96 px each) without ultrawide stretching.
- The search **dropdown overlays** the content below it (`absolute` within a
  `relative` wrapper), it never pushes layout.

Breakpoints used: only `sm:` (spacing/padding bumps) and `md:` (forecast grid,
current-card internal grid). Nothing else is needed.

---

## 4. Component specs

Class strings are normative; the frontend may split them into smaller
components but must not change the visual result.

### 4.1 `CitySearch` (SearchBar + dropdown)

Wrapper: `relative` (dropdown anchors here). Label visually hidden:
`<label class="sr-only" for="city-search">Buscar ciudad</label>`.

**Input row** — `relative`:

- Magnifier icon: absolute left, `absolute left-3 top-1/2 size-5 -translate-y-1/2 text-ink-muted pointer-events-none`, `aria-hidden="true"`.
- Input:
  `w-full h-12 rounded-lg border border-line bg-surface-raised pl-10 pr-10 text-base text-ink placeholder:text-ink-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand`
  — `placeholder="Buscar ciudad…"`, `type="text"`, `autocomplete="off"`,
  `spellcheck="false"`. Height 48 px = comfortable touch target.
- Inline spinner (while `isDebouncing || isFetching`): `Spinner` at
  `absolute right-3 top-1/2 -translate-y-1/2 size-5` (see §4.6).

**Dropdown panel** (`SearchResultsList`), rendered when the input has focus and
`debouncedQuery.length >= 2`:

- Container:
  `absolute inset-x-0 top-full z-10 mt-2 max-h-80 overflow-y-auto rounded-lg border border-line bg-surface-raised shadow-lg`
- Option row (per `City`):
  `flex w-full items-center gap-3 px-4 py-3 text-left cursor-pointer`
  — active/highlighted option gets `bg-brand-soft`; no `hover:` needed beyond
  that (highlight follows mouse and keyboard through `aria-activedescendant`).
  - Line 1: city name — `text-base font-medium text-ink`.
  - Line 2: `admin1 · country` (omit `admin1` when absent) — `text-xs text-ink-muted`.
- **No matches** (successful response, empty list): single non-interactive row
  `px-4 py-3 text-sm text-ink-muted` with copy
  `No se encontraron ciudades para «{query}»`.
- **Search error**: single row `px-4 py-3 text-sm text-danger`, copy
  `No se pudo buscar. Revisa tu conexión.` (uses `role="alert"`, see §6).

Selecting an option fills nothing back into the input decoration-wise: clear
the query, close the dropdown, select the city.

### 4.2 `CurrentWeatherCard`

Card shell (shared by all cards):
`rounded-2xl border border-line bg-surface-raised p-4 shadow-sm sm:p-6`.

Internal structure:

1. **Header row** — `flex items-start justify-between gap-2`:
   - Left: city name `text-xl font-semibold` + below it
     `{admin1 · }country` in `text-xs text-ink-muted`, and the condition label
     (`WeatherCondition.label`, e.g. "Parcialmente nublado") in
     `mt-1 text-sm text-ink-muted`.
   - Right: `FavoriteToggleButton` (§4.4).
2. **Hero row** — `mt-4 flex items-center gap-4`:
   - `WeatherIcon kind isDay` at `size-16 text-brand` (64 px), `aria-hidden`.
   - Temperature: `text-6xl font-light tracking-tight tabular-nums`, value
     rounded to integer + `°` (e.g. `23°`). Feels-like directly under it:
     `text-sm text-ink-muted` — `Sensación térmica: 25°`.
3. **Metrics row** — `mt-6 grid grid-cols-2 gap-3`:
   two metric tiles, each
   `rounded-lg bg-surface-sunken px-3 py-2`:
   - label `text-xs text-ink-muted` (`Viento`, `Humedad`)
   - value `text-sm font-medium tabular-nums` (`14 km/h`, `62 %`).

Subtle refetch indicator (`isFetching && !isPending`): render the §4.6 Spinner
at `size-4 text-ink-muted` in the header row, next to the city name, inside a
`role="status"` span with `sr-only` text `Actualizando…`. Data stays visible.

### 4.3 `ForecastList` / `ForecastDayCard`

Section heading above the list: `Pronóstico de 7 días` styled
`text-sm font-semibold text-ink-muted uppercase tracking-wide` (a real
`<h2>`).

List container: `flex flex-col gap-2 md:grid md:grid-cols-7`.

`ForecastDayCard` — one per day, **not interactive** (plain `<li>` inside a
`<ul>`):

- Mobile (row layout): `flex items-center gap-3 rounded-2xl border border-line bg-surface-raised px-4 py-3 md:flex-col md:gap-1 md:px-2 md:py-4 md:text-center`
  - Day name: index 0 → `Hoy`, else `formatDayName` es-ES short (`mié`, `jue`) —
    `w-12 text-sm font-medium capitalize md:w-auto`.
  - `WeatherIcon` at `size-8 text-brand` (`aria-hidden`; the condition label is
    provided as `sr-only` text next to it).
  - Precipitation probability, only when ≥ 20 %: `text-xs text-brand tabular-nums`
    (e.g. `40 %`); reserve the slot with `min-h-4` so cards align when absent.
  - Temps, pushed right on mobile (`ml-auto md:ml-0`): max
    `text-sm font-semibold tabular-nums` + min `text-sm text-ink-muted tabular-nums`,
    formatted `21° / 12°` on mobile, stacked (max above min) on `md:`.

### 4.4 `FavoritesList` / `FavoriteToggleButton`

**FavoritesList** — heading `Favoritas` (visually hidden `<h2 class="sr-only">`;
the chips are self-explanatory) + strip:
`flex gap-2 overflow-x-auto pb-1` (padding-bottom keeps the scrollbar off the
chips).

Favorite chip (button that selects the city):
`inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full border border-line bg-surface-raised px-4 text-sm font-medium transition-colors hover:bg-brand-soft`
— when the chip is the **currently selected** city:
`border-brand bg-brand-soft text-brand` + `aria-current="true"`.
Chip label: `name` only (country in `title` attribute). Removal happens via the
star on the weather card, not on the chip — one obvious way to do it, and it
keeps chips as single-action targets.

**Empty state**: when `favorites.length === 0`, render one line
`text-sm text-ink-muted`: `Aún no tienes ciudades favoritas. Márcalas con la
estrella ☆.`

**FavoriteToggleButton** (lives in `CurrentWeatherCard` header):
`inline-flex size-10 items-center justify-center rounded-full transition-colors hover:bg-brand-soft`
with a star SVG at `size-6`:

- Not favorite: outline star, `text-ink-muted`, `aria-pressed="false"`,
  `aria-label="Añadir a favoritas"`.
- Favorite: filled star, `text-accent`, `aria-pressed="true"`,
  `aria-label="Quitar de favoritas"`.

### 4.5 Empty / placeholder states (`EmptyState`)

Shared shape: centered column inside a card shell —
`flex flex-col items-center gap-3 rounded-2xl border border-dashed border-line px-6 py-12 text-center`
(dashed border + no fill distinguishes placeholders from real content).
Icon at `size-10 text-ink-muted` (`aria-hidden`), message
`text-sm text-ink-muted`.

- **No city selected** (replaces weather + forecast sections): magnifier icon,
  copy `Busca una ciudad para ver el clima`.
- Search "no results" and favorites-empty use the inline variants specified in
  §4.1 and §4.4 (a full card would be disproportionate there).

### 4.6 Loading states

**`Spinner`** — inline SVG circle:
`animate-spin` on an `svg` with `viewBox="0 0 24 24"`, a full circle at
`opacity-25` plus a 90° arc at full opacity, both `stroke="currentColor"
stroke-width="2.5" fill="none"`. Size via `size-*` utility from the parent.
Always accompanied by `role="status"` + `<span class="sr-only">Cargando…</span>`
on its wrapper (or `aria-hidden` when a sibling status text exists).

**Weather panel skeleton** (first load, `isPending`): mirror
`CurrentWeatherCard` + `ForecastList` geometry with `animate-pulse` blocks of
`rounded-lg bg-surface-sunken`:

- Card: header bar `h-6 w-40`, hero row = circle `size-16 rounded-full` +
  bar `h-14 w-32`, two metric tiles `h-14`.
- Forecast: 7 rows `h-14 rounded-2xl` (mobile) / 7 columns `h-36` (`md:`).

Wrap the whole skeleton region in `role="status"` with `sr-only` text
`Cargando el clima…` and `aria-hidden` on the decorative blocks.

### 4.7 `ErrorMessage` (weather load failure)

Card: `flex flex-col items-center gap-3 rounded-2xl border border-danger/30 bg-danger-soft px-6 py-10 text-center`, `role="alert"`.

- Alert-triangle icon `size-8 text-danger` (`aria-hidden`).
- Copy `text-sm text-ink`:
  `No se pudo cargar el clima. Comprueba tu conexión e inténtalo de nuevo.`
- Retry button (the only solid-brand button in the app):
  `h-10 rounded-lg bg-brand px-4 text-sm font-medium text-white transition-colors hover:bg-brand-strong`
  — label `Reintentar`, calls `refetch()`. In dark mode `text-white` on sky-400
  is low contrast, so use `text-surface` instead of `text-white`
  (slate-900 on sky-400 = 8.9:1): final classes use `text-surface`.

---

## 5. Icon set (`WeatherIcon`)

**Decision: hand-written inline SVG set, confirmed.** Ten kinds × two variants
for two of them = 12 small glyphs (~15 lines of SVG each). An icon library
(lucide, @tabler) would add a dependency and still lack coherent
day/night weather variants; drawing them keeps the bundle at ~3 KB and
demonstrates SVG craft — right trade-off for a portfolio frontend.

### 5.1 SVG style guide

- `viewBox="0 0 24 24"`, `fill="none"`, `stroke="currentColor"`,
  `stroke-width="1.75"`, `stroke-linecap="round"`, `stroke-linejoin="round"`.
- Color always via `currentColor` (parent sets `text-brand`, `text-ink-muted`, …).
  Exception: the sun core and the moon may use `fill="currentColor"` with no
  stroke for visual weight; raindrops/snowflakes are stroked lines/dots.
- No hardcoded `width`/`height` attributes — size comes from Tailwind `size-*`
  utilities (`size-5` = 20 px search/UI, `size-8` = 32 px forecast,
  `size-16` = 64 px hero).
- Every `WeatherIcon` renders `aria-hidden="true"` and `focusable="false"`;
  meaning is always conveyed by adjacent visible or `sr-only` text
  (the `WeatherCondition.label`).

### 5.2 `WeatherKind` → glyph mapping

| `kind` | `isDay=true` | `isDay=false` | Glyph description |
|---|---|---|---|
| `clear` | sun | moon | Sun: filled circle r=4 + 8 short rays. Moon: filled crescent (circle masked by offset circle path). |
| `partly-cloudy` | sun-behind-cloud | moon-behind-cloud | Small sun/moon top-left at ~60 % scale, cloud outline overlapping bottom-right. |
| `overcast` | cloud | same | Single large cloud outline, flat base. |
| `fog` | cloud + 2 horizontal lines below | same | Cloud raised, two staggered lines underneath. |
| `drizzle` | cloud + 3 dots | same | Dots (tiny round-cap strokes) staggered under the cloud base. |
| `rain` | cloud + 3 short diagonal strokes | same | Slashes ~4 px at ~70° under the cloud. |
| `freezing-rain` | cloud + 2 diagonal strokes + 1 asterisk | same | Mixed rain/ice: two rain slashes plus one 3-stroke star. |
| `snow` | cloud + 3 asterisks | same | Three small 3-stroke stars staggered under the cloud. |
| `showers` | cloud + 3 long diagonal strokes | same | Like `rain` but strokes ~6 px and steeper — visibly heavier. |
| `thunderstorm` | cloud + lightning bolt | same | Filled zig-zag bolt (`fill="currentColor"`, no stroke) under the cloud. |

Only `clear` and `partly-cloudy` have night variants (per ARCHITECTURE §4.4);
all others ignore `isDay`. Reuse one `<Cloud />` path constant across the
cloud-based glyphs to keep them visually identical.

The app favicon (`public/favicon.svg`) is the `clear`/day sun glyph in
`#0284c7`.

---

## 6. Accessibility

### 6.1 Contrast and touch targets

- All token pairs meet WCAG AA (§1.3). Never place `text-brand` on
  `bg-brand-soft` for text below 18 px.
- Minimum interactive size 40×40 px: search input h-12, chips h-10, star
  button size-10, retry button h-10, dropdown options py-3 (≥44 px rows).

### 6.2 Focus

- Single global rule (§2): `outline-2 outline-offset-2 outline-brand` on
  `:focus-visible`. Never `outline-none` without a replacement.
- The dropdown uses `aria-activedescendant`, so DOM focus stays on the input;
  the highlighted option gets `bg-brand-soft` as its visual focus.

### 6.3 Autocomplete ARIA pattern (WAI-ARIA combobox)

- Input: `role="combobox"`, `aria-expanded={open}`,
  `aria-controls="city-search-listbox"`, `aria-autocomplete="list"`,
  `aria-activedescendant={activeOptionId ?? undefined}`.
- List: `<ul id="city-search-listbox" role="listbox" aria-label="Ciudades sugeridas">`.
- Options: `<li role="option" id={`city-option-${city.id}`} aria-selected={isActive}>`.
- Keyboard: `ArrowDown`/`ArrowUp` move the active option (wrapping),
  `Enter` selects the active option (or the first when none is active),
  `Escape` closes the dropdown and clears the active option, `Tab` closes it.
- The "no results" row is `role="status"` (not an option); the search error row
  is `role="alert"`.

### 6.4 Live regions and labels

- Weather skeleton and refetch indicator: `role="status"` with `sr-only`
  Spanish text (`Cargando el clima…`, `Actualizando…`).
- `ErrorMessage`: `role="alert"`.
- Icons: always `aria-hidden="true"`; condition conveyed by the visible
  `label` text (current weather) or `sr-only` text (forecast cards).
- Star toggle uses `aria-pressed` + explicit `aria-label` (§4.4).
- `<html lang="es">` in `index.html`; document title `Clima — pronóstico por
  ciudad`.

### 6.5 Motion

Respect `prefers-reduced-motion`: Tailwind's `motion-reduce:animate-none` on
`animate-pulse` skeleletons is optional (pulse is subtle), but apply
`motion-reduce:animate-none` plus a static `opacity-50` fallback style is NOT
required for the spinner — a spinner conveys progress and is exempt as
essential motion. Add `motion-reduce:animate-none` only to skeletons.

---

## 7. Copy reference (final Spanish strings)

| Context | String |
|---|---|
| Input placeholder | `Buscar ciudad…` |
| Input label (sr-only) | `Buscar ciudad` |
| Dropdown label | `Ciudades sugeridas` |
| No search results | `No se encontraron ciudades para «{query}»` |
| Search error | `No se pudo buscar. Revisa tu conexión.` |
| No city selected | `Busca una ciudad para ver el clima` |
| Weather error | `No se pudo cargar el clima. Comprueba tu conexión e inténtalo de nuevo.` |
| Retry button | `Reintentar` |
| No favorites | `Aún no tienes ciudades favoritas. Márcalas con la estrella ☆.` |
| Add favorite (aria) | `Añadir a favoritas` |
| Remove favorite (aria) | `Quitar de favoritas` |
| Loading (sr-only) | `Cargando el clima…` / `Cargando…` |
| Refetching (sr-only) | `Actualizando…` |
| Feels like | `Sensación térmica: {t}°` |
| Metric labels | `Viento` / `Humedad` |
| Forecast heading | `Pronóstico de 7 días` |
| Today | `Hoy` |
| App title | `Clima` |
