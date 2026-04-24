# URU Scraper Starter

Starter monorepo para scraping inmobiliario en Uruguay.

## Qué incluye
- React + Vite para dashboard interno
- API con Fastify
- Workers base para crawling
- PostgreSQL + Redis con Docker Compose
- Conectores stub para:
  - InfoCasas
  - Gallito
  - Casasweb
  - REMAX Uruguay
  - Casas y Más
  - Mercado Libre
- `plan.md` con roadmap completo

## Requisitos
- Node.js 20+
- npm 10+
- Docker Desktop

## Arranque
```bash
npm install
npm run bootstrap
npm run infra:up
npm run dev:api
npm run dev:web
npm run dev:workers
```


## Deploy en Vercel

Este monorepo debe desplegarse desde la raíz del repositorio. Configuración recomendada en Vercel:

- Root Directory: `.`
- Build Command: `npm run build`
- Output Directory: `apps/web/dist`
- Install Command: `npm install`

El repo también define scripts `build` en los workspaces para que Vercel no falle si detecta un workspace individual durante la instalación/build.

## Validación
```bash
npm test
npm run typecheck
npm run build
```

- `npm test`: corre tests unitarios de API y conectores con `node:test` + `tsx`.
- `npm run typecheck`: valida TypeScript en apps y packages.
- `npm run build`: genera el build de producción del dashboard web.

## Apps
- `apps/web`: dashboard React + Vite
- `apps/api`: API Fastify
- `apps/workers`: workers BullMQ / seeds
- `packages/connectors`: conectores por portal
- `packages/shared`: tipos compartidos
- `infra/sql`: esquema inicial PostgreSQL

## Estado
Esto es una base de trabajo lista para desarrollar.
Los scrapers reales están stubbeados y se implementan siguiendo `plan.md`.
