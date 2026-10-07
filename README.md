# Orion Core Tecnologías

Sitio web de [orioncore.co](https://orioncore.co): automatización de procesos, agentes de IA para WhatsApp, software a medida, seguridad y marketing digital para empresas en Colombia.

## Stack

| Parte | Tecnología |
|---|---|
| Frontend | Astro 4 (sitio estático), TypeScript estricto, Tailwind 3, islas React 18 |
| Pruebas del frontend | Vitest, Testing Library, Astro Container API, Playwright, dependency-cruiser |
| Backend | FastAPI (Python 3.11) + Motor, con autenticación JWT para `/api/contacts` |
| Base de datos | MongoDB 7 |
| Proxy | Nginx (HTTP en DEV, HTTPS con Let's Encrypt en producción) |
| Despliegue | Docker Compose; GitHub Actions: PR automático + DEV en un runner propio + producción por SSH |

```
orioncore/
├── frontend/          # Astro: src/{domain,application,infrastructure,ui,composition,content,pages}
├── backend/           # FastAPI (/api/contact, /api/auth/token, /api/contacts)
├── nginx/             # nginx.conf, templates http/https, snippets
├── .github/
│   ├── workflows/     # dev.yml (PR + DEV), deploy.yml (producción)
│   └── pipelines/     # deploy.sh (se ejecuta en el servidor)
├── docker-compose.yml
└── .env.example       # todas las variables, con valores de DEV y de producción
```

## Requisitos

- **Node 22.23.3** (fijado en `frontend/.nvmrc`) y **pnpm 10.34.6** (vía `corepack`). Docker usa la misma versión, así que local, DEV y producción construyen igual.
- Docker con Compose.
- Chrome instalado, solo para las pruebas e2e y para regenerar los assets de marca.

```bash
# macOS con Homebrew: Node 22 junto al Node global, sin reemplazarlo
brew install node@22
export PATH="/opt/homebrew/opt/node@22/bin:$PATH"
corepack enable
```

## Frontend

```bash
cd frontend
pnpm install
pnpm dev               # http://localhost:4321
pnpm build             # sitio estático en dist/
pnpm preview           # sirve dist/
```

Pruebas y verificaciones:

```bash
pnpm test              # unitarias, contrato y componentes
pnpm test:coverage     # exige ≥ 90 % en domain/ y application/
pnpm typecheck         # astro check
pnpm lint:deps         # reglas de la arquitectura hexagonal (el dominio no importa nada externo)
pnpm build && pnpm test:e2e   # Playwright contra el build
```

Variables `PUBLIC_*`, que se incrustan en el build:

| Variable | Uso |
|---|---|
| `PUBLIC_API_URL` | URL del backend; vacío = mismo dominio (Nginx enruta `/api`) |
| `PUBLIC_LEAD_DESTINATION` | `api` (por defecto) o `console` para desarrollar sin backend |
| `PUBLIC_GTM_ID` | ID de Google Tag Manager; sin él no se registra analítica |

El contenido editable (textos, servicios, estado draft/published de cada página) está en `frontend/src/content/home/home.es.json`. Publicar una página es cambiar su `status` a `published`: entra al sitemap y deja de llevar `noindex`. Los marcadores `[X]` son datos pendientes de confirmar.

## Backend

```bash
cd backend
python3.11 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
export MONGODB_URL=mongodb://localhost:27017 JWT_SECRET=$(openssl rand -hex 32) ADMIN_PASSWORD=cambia-esta-clave
uvicorn app.main:app --reload --port 8000     # documentación en http://localhost:8000/docs
```

Pruebas del backend:

```bash
pip install -r requirements-dev.txt
pytest -q
```

## Todo junto con Docker

```bash
cp .env.example .env        # ajustar claves
docker compose up -d --build
open http://localhost       # Nginx: / → frontend, /api → backend
```

## Despliegue

1. Push a una rama → `dev.yml` abre el PR y levanta DEV en el runner `dev` (tu máquina), con `.dev.env`.
2. Merge del PR → `deploy.yml` entra por SSH al servidor y ejecuta `.github/pipelines/deploy.sh`:
   `git pull` → build → `docker compose down` → `docker compose up -d --build` → chequeo de `/health`.
   Si el chequeo falla, vuelve al commit anterior.

Las variables de cada entorno están documentadas en [.env.example](.env.example).
