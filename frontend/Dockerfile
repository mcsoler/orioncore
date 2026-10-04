# Versión de Node: debe coincidir con .nvmrc y "engines" de package.json
# (tests/unit/toolchain.test.ts lo verifica). DEV y producción usan esta misma imagen.
ARG NODE_VERSION=22.23.3

# Build stage
FROM node:${NODE_VERSION}-alpine AS builder

WORKDIR /app

# pnpm en la versión fijada en "packageManager" de package.json
RUN corepack enable

# Dependencias exactas del lockfile
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# Copy source files
COPY . .

# URL pública del backend; Astro la incrusta en el bundle al hacer el build.
# Vacía = mismo dominio, Nginx enruta /api al backend.
ARG PUBLIC_API_URL=
ENV PUBLIC_API_URL=$PUBLIC_API_URL

# Build the application (incluye la copia de globe.gl y sus texturas a public/)
RUN pnpm build

# Production stage
FROM node:${NODE_VERSION}-alpine AS runner

WORKDIR /app

# Install a simple static server
RUN npm install -g serve

# Copy built files
COPY --from=builder /app/dist ./dist
COPY serve.json ./serve.json

EXPOSE 3000

# Sin -s (modo SPA): las rutas inexistentes responden 404 con dist/404.html, no index.html con 200.
# serve.json fuerza la barra final, igual que trailingSlash: 'always' de Astro.
CMD ["serve", "dist", "-l", "3000", "-c", "../serve.json"]
