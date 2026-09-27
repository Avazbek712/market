# MiniMarket

A full-stack marketplace application built to practice production-grade backend architecture: JWT authentication, permission-based authorization, soft-deletable entities, and a service layer designed around real business rules rather than CRUD scaffolding.

**Status:** actively developed. Auth and category management are complete; product listings with image uploads are in progress.

## Tech stack

**Backend**
- Java 17, Spring Boot 4
- Spring Security + JWT (`jjwt`) — stateless auth, permission-based `@PreAuthorize` (no role-string checks)
- Spring Data JPA + PostgreSQL, schema owned by **Liquibase** (Hibernate only validates, never auto-generates DDL)
- MapStruct for entity↔DTO mapping, Lombok
- Redis, Kafka — provisioned for future features (caching, async events)
- MinIO (S3-compatible) — object storage for product images *(in progress)*

**Frontend**
- React 19 + TypeScript + Vite
- Tailwind CSS v4
- react-router-dom, react-i18next (English/Russian)

**Infrastructure**
- Docker Compose for local dev services and for production deployment
- Nginx reverses `/api/*` to the backend and serves the built frontend, with rate-limiting on the login endpoint
- GitHub Actions: build → publish image to GHCR → deploy over SSH to a VPS

## Features

- **Auth** — self-registration for `BUYER`/`SELLER` roles, JWT login, `/api/user/me`
- **Authorization** — fine-grained permissions (e.g. `CATEGORY_MANAGE`, `PRODUCT_CREATE`) attached to roles, checked via `@PreAuthorize("hasAuthority(...)")` — never `hasRole()`, so permissions can be regranted without redeploying
- **Categories** — nested (one level) categories with soft-delete; a deleted category's name becomes reusable
- **Soft delete everywhere** — entities use `@SQLDelete` + `@SQLRestriction` instead of hard deletes, with partial unique indexes so unique fields (email, category name) are reusable after "deletion"
- **Products** *(in progress)* — listings owned by a seller, optional category, image uploads via MinIO

## Project structure

```
src/main/java/com/own/ownproject/
├── config/auth/        # Security config, JWT filter/service, MinIO config
├── controller/          # REST endpoints
├── entity/              # JPA entities
├── payload/             # Request/response DTOs
├── service/ + impl/     # Business logic
├── mapper/               # MapStruct mappers
├── repository/           # Spring Data repositories
└── exception/ + handler/ # Domain exceptions + global @ExceptionHandler

src/main/resources/db/changelog/   # Liquibase changesets (source of truth for schema)
frontend/                          # React + Vite SPA
nginx/                             # Reverse proxy config
docker-compose.yml                 # Local dev infra (Postgres, Redis, Kafka, MinIO)
docker-compose.prod.yml            # Full production stack (adds backend + nginx)
```

## Getting started

**Prerequisites:** JDK 17, Node 20+, Docker.

```bash
# 1. Clone and configure environment
git clone https://github.com/Avazbek712/ownProject.git
cd ownProject
cp .env.example .env   # defaults work out of the box for local dev

# 2. Start infrastructure (Postgres, Redis, Kafka, MinIO)
docker compose up -d

# 3. Run the backend (applies Liquibase migrations on boot)
./mvnw spring-boot:run

# 4. Run the frontend
cd frontend
npm install
npm run dev
```

The frontend dev server proxies `/api` to the backend on `:8080`. Backend listens on `:8080`, Postgres on `:5433` (mapped, so it doesn't collide with a local install), MinIO console on `:9001`.

## Environment variables

See [`.env.example`](.env.example) for the full list. Local dev uses safe defaults (`application.properties` also falls back to dev-only values if a variable is unset); production requires all of these to be set explicitly via CI/CD secrets — nothing sensitive is committed.

## API overview

| Endpoint | Method | Access |
|---|---|---|
| `/api/auth/register` | POST | Public — self-registration as `BUYER` or `SELLER` |
| `/api/auth/login` | POST | Public — rate-limited at the nginx layer |
| `/api/user/me` | GET | Authenticated |
| `/api/categories` | GET | Public |
| `/api/categories` | POST / PATCH / DELETE | Requires `CATEGORY_MANAGE` |

## CI/CD

On every push to `main`: build and test → publish a Docker image to GHCR → sync the built frontend and redeploy the backend on the VPS over SSH (`.github/workflows/ci.yml`). Deployment credentials are stored as GitHub Actions secrets, never in the repo.

## Roadmap

- [ ] Product CRUD + image upload via MinIO
- [ ] Product listing/search on the frontend
- [ ] Order flow
