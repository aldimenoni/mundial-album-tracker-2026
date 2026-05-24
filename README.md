# Mundial Album Tracker 2026

Aplicación fullstack para cargar, consultar y comparar el estado de un álbum de figuritas del Mundial 2026.

## Stack

- Frontend: React + Vite + TypeScript strict.
- Backend: Node.js + Express + TypeScript.
- Base de datos: PostgreSQL + Prisma ORM.
- Validación: Zod.
- Monorepo: `apps/web`, `apps/api`, `packages/shared`.

## Estructura

```txt
apps/
  api/        API REST, Prisma schema y seed
  web/        App React/Vite
packages/
  shared/     DTOs y tipos compartidos
```

## Requisitos

- Node.js 22 o superior.
- Docker Desktop o una instancia local de PostgreSQL.
- npm 11 o superior.

## Configuración

```bash
npm install
cp .env.example .env
docker compose up -d postgres
npm run prisma:migrate
npm run seed
npm run dev
```

La API queda en `http://localhost:4000` y el frontend en `http://localhost:5173`.

## Variables

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mundial_album_tracker_2026?schema=public"
PORT=4000
NODE_ENV=development
VITE_API_URL=http://localhost:4000
```

## Scripts

- `npm run dev`: levanta API y web.
- `npm run build`: compila shared, API y web.
- `npm run typecheck`: valida TypeScript strict en todos los workspaces.
- `npm run prisma:generate`: genera Prisma Client.
- `npm run prisma:migrate`: aplica migraciones locales.
- `npm run seed`: carga el catálogo inicial.

## Endpoints

- `GET /stickers`
- `GET /stickers?team=Argentina`
- `POST /users`
- `GET /users`
- `GET /albums/:userId`
- `PUT /albums/:userId/stickers/:stickerId`
- `GET /albums/:userId/summary`
- `GET /albums/:myUserId/compare/:otherUserId`

## Seed

El seed carga un catálogo base de 992 figuritas:

- `PANINI00`.
- `FWC1` a `FWC19`.
- 48 selecciones con 20 figuritas por equipo.
- `CC1` a `CC12` para Coca-Cola.

La estructura replica el tamaño base público del álbum 2026 y suma las 12 Coca-Cola pedidas. Los nombres de jugadores de equipos están como datos mock por slot para mantener el proyecto reproducible; los nombres de Coca-Cola se cargan desde el listado público de Coca-Cola.

Referencias usadas para modelar el catálogo:

- [Panini America: FIFA World Cup 2026 Official Sticker Collection Album](https://www.paniniamerica.net/fifa-world-cup-2026-official-sticker-collection-album.html)
- [Scanini: Panini FIFA World Cup 2026 checklist](https://scanini.app/albums/world-cup-2026)
- [Coca-Cola: Panini players](https://www.coca-cola.com/us/en/offerings/fifa-world-cup-26/panini/players)

## Flujo de uso

1. Crear o seleccionar usuario.
2. Cargar figuritas por orden o por equipo.
3. Revisar resumen del álbum.
4. Explorar álbumes de otros usuarios.
5. Comparar dos álbumes para ver qué puede dar cada persona y sugerencias de cambio.
