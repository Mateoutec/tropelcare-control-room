# TropelCare Control Room

Frontend para la hackathon **TropelCare Control Room - Pizza Protocol**.

## Stack

- React + TypeScript estricto
- Vite
- React Router
- Tailwind CSS
- Fetch API
- Mocks determinísticos opcionales para desarrollo

## Instalación

```bash
npm install
cp .env.example .env
npm run dev
```

## Variables de entorno

```properties
VITE_USE_MOCKS=false
VITE_API_BASE_URL=https://<backend-url>/api/v1
```

Para trabajar sin backend localmente:

```properties
VITE_USE_MOCKS=true
VITE_MOCK_DELAY_MS=250
```

> En entrega real debe usarse `VITE_USE_MOCKS=false` y la URL real del backend del TA.

## Comandos

```bash
npm run dev
npm run typecheck
npm run build
npm run preview
```

## Deploy en Vercel

1. Subir el repositorio a GitHub.
2. Importar el proyecto en Vercel.
3. Configurar variables:
   - `VITE_USE_MOCKS=false`
   - `VITE_API_BASE_URL=https://<backend-url>/api/v1`
4. Build command: `npm run build`
5. Output directory: `dist`

El archivo `vercel.json` incluye rewrites a `index.html` para que las rutas internas como `/signals/sig_001` o `/sectors/sec_001/story` abran directamente.

## Checkpoints cubiertos

- Checkpoint 1: login, sesión persistente, logout, dashboard real.
- Checkpoint 2: tropeles con paginación real, filtros combinables, búsqueda, sort, URL sync y cancelación de requests obsoletas.
- Checkpoint 3: feed infinito cursor-based, deduplicación, una carga en vuelo, filtros en URL, conservación de posición y recuperación de error sin borrar páginas.
- Checkpoint 4: detalle de señal, PATCH de estado, loading, error y actualización reflejada al volver al feed.
- Checkpoint 5: Sector Story Engine con scrollytelling, visual persistente, progreso, fallback con IntersectionObserver, reduced motion, mobile y navegación por teclado.

## Decisiones técnicas

- No se usa React Query/SWR/TanStack Query para cumplir la regla del enunciado.
- No se simula paginación en cliente cuando se usa API real.
- Los mocks están aislados en `src/mocks` y solo se activan con `VITE_USE_MOCKS=true`.
- No se usa `any` en tipos de API.
