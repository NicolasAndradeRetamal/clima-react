# clima-react

Aplicación de clima construida con React moderno. Busca cualquier ciudad del
mundo con autocompletado, consulta el clima actual y el pronóstico a 7 días,
y guarda tus ciudades favoritas. Consume las APIs públicas de
[Open-Meteo](https://open-meteo.com/) directamente desde el navegador: sin
backend propio, sin API keys y sin secretos.

> Proyecto de portafolio. El objetivo es demostrar React 19 + TypeScript
> estricto, gestión de estado de servidor con TanStack Query y una suite de
> tests realista con MSW.

## Demo

<!-- TODO: reemplazar con la URL real una vez publicado en GitHub Pages -->
Despliegue automático en GitHub Pages en cada push a `main`
(ver [Despliegue](#despliegue)).

<!-- ![Captura de clima-react](docs/screenshot.png) -->
<!-- TODO: añadir docs/screenshot.png con una captura de la app y descomentar la línea anterior -->

## Stack

| Área | Tecnología |
|---|---|
| UI | React 19 + TypeScript (estricto), Vite 8 |
| Datos remotos | TanStack Query v5 + `fetch` nativo tipado |
| API | Open-Meteo (geocoding + forecast), pública y sin API key |
| Estilos | Tailwind CSS v4 |
| Tests | Vitest + React Testing Library + MSW |
| CI/CD | GitHub Actions → GitHub Pages |

## Features

- **Búsqueda con autocompletado**: geocoding de Open-Meteo con debounce,
  resultados en español y navegación por teclado.
- **Clima actual**: temperatura, sensación térmica, viento, humedad e icono
  según la condición (mapeo de códigos WMO, con variantes día/noche).
- **Pronóstico de 7 días**: máximas, mínimas y probabilidad de precipitación.
- **Favoritas**: ciudades persistidas en `localStorage` (máximo 10), acceso
  con un clic.
- **Estados visibles**: cargando, error de red con reintento y "ciudad no
  encontrada" tienen UI explícita.

## Cómo levantarlo en local

Requisitos: [Node.js](https://nodejs.org/) 22 LTS (o superior) y npm.

```bash
git clone <url-del-repo>
cd clima-react
npm ci
npm run dev
```

La app queda disponible en `http://localhost:5173`. No hace falta configurar
nada más: no hay variables de entorno ni credenciales.

### Scripts disponibles

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo con HMR |
| `npm run build` | Typecheck (`tsc -b`) + build de producción en `dist/` |
| `npm run preview` | Sirve el build de producción en local |
| `npm test` | Ejecuta la suite de tests una vez |
| `npm run test:watch` | Tests en modo watch |
| `npm run typecheck` | Solo comprobación de tipos, sin emitir |

## Tests

```bash
npm test
```

53 tests con Vitest + React Testing Library. Las peticiones HTTP se
interceptan con **MSW**, así que los tests ejecutan el camino real de `fetch`
contra fixtures tipados con las mismas interfaces que la API (si el tipo y el
fixture divergen, no compila). Se cubren: mapeo de códigos WMO, formateo
es-ES, hooks (`useFavorites`, `useDebouncedValue`), flujo completo de búsqueda
y panel de clima con sus estados de error y reintento.

## Estructura del proyecto

```
src/
├── api/          # Cliente fetch tipado + endpoints de Open-Meteo (sin React)
├── hooks/        # useCitySearch, useWeather, useFavorites, useDebouncedValue
├── components/   # search/ weather/ favorites/ ui/ — consumen hooks, nunca fetch
├── lib/          # Funciones puras: códigos WMO → condición, formateo es-ES
├── types/        # Tipos de las respuestas de la API + tipos de dominio
└── test/         # Setup de Vitest, helpers y handlers/fixtures de MSW
```

Más detalle en [ARCHITECTURE.md](ARCHITECTURE.md) (decisiones técnicas y
contrato de la API) y [DESIGN.md](DESIGN.md) (sistema visual).

## CI/CD

Workflow en [`.github/workflows/ci.yml`](.github/workflows/ci.yml):

1. **CI** (push y PR a `main`): `npm ci` → typecheck → tests → build.
2. **Deploy** (solo push a `main`, si CI pasa): build con la `base` de GitHub
   Pages y publicación con `actions/deploy-pages`.

## Despliegue

### GitHub Pages (configurado)

El repositorio se despliega solo. Único paso manual, una vez: en GitHub ir a
**Settings → Pages → Build and deployment** y elegir **GitHub Actions** como
source. A partir de ahí, cada push a `main` publica en
`https://<usuario>.github.io/<repo>/`.

Nota sobre la `base` de Vite: Pages sirve los project sites bajo
`/<nombre-del-repo>/`, así que el workflow compila con
`npm run build -- --base="/<repo>/"` (derivado automáticamente del nombre del
repositorio). `vite.config.ts` no se toca y el build local mantiene `base: '/'`.

### Alternativa: Vercel o Netlify

Al ser una SPA estática sin variables de entorno, migrar es trivial:

1. Importar el repositorio en Vercel/Netlify.
2. Build command: `npm run build` — output directory: `dist`.
3. Eliminar (u omitir) el job `deploy` de `ci.yml`; el job `ci` sigue siendo útil.

No se necesitan rewrites: la app no usa routing en cliente.

## Créditos

- Datos meteorológicos y geocoding por [Open-Meteo](https://open-meteo.com/),
  API abierta y gratuita para uso no comercial (licencia
  [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)).
