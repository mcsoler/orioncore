# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies
RUN npm install

# Copy source files
COPY . .

# Copiar globe.gl y texturas a public/ para servirlos localmente (sin CDN)
RUN cp node_modules/globe.gl/dist/globe.gl.min.js public/globe.gl.min.js && \
    mkdir -p public/earth && \
    cp node_modules/three-globe/example/img/earth-blue-marble.jpg public/earth/ && \
    cp node_modules/three-globe/example/img/earth-topology.png public/earth/ && \
    cp node_modules/three-globe/example/img/earth-night.jpg public/earth/ 2>/dev/null || true

# URL pública del backend; Astro la incrusta en el bundle al hacer el build.
# Vacía = mismo dominio, Nginx enruta /api al backend.
ARG PUBLIC_API_URL=
ENV PUBLIC_API_URL=$PUBLIC_API_URL

# Build the application
RUN npm run build

# Production stage
FROM node:22-alpine AS runner

WORKDIR /app

# Install a simple static server
RUN npm install -g serve

# Copy built files
COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]
