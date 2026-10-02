#!/usr/bin/env bash
# Se ejecuta EN EL SERVIDOR, enviado por SSH desde .github/workflows/deploy.yml.
# Uso: deploy.sh <APP_DIR>
#
# git pull → docker-compose down → docker-compose up -d --build
# Las imágenes se construyen ANTES del down para que la app esté caída solo
# unos segundos y no durante todo el build. Los volúmenes (Mongo) se conservan.
# Si la app no responde /health, vuelve al commit anterior.
set -Eeuo pipefail

APP_DIR="${1:?Falta APP_DIR}"
HEALTH_RETRIES=30
HEALTH_INTERVAL=5

log() { printf '[deploy %s] %s\n' "$(date +%H:%M:%S)" "$*"; }

cd "$APP_DIR"

# Evita despliegues simultáneos aunque se lancen fuera de GitHub Actions.
exec 9>/tmp/orioncore-deploy.lock
flock -n 9 || { log "Hay otro despliegue en curso"; exit 1; }

[ -f .env ] || { log "No existe $APP_DIR/.env (copiar desde .env.example)"; exit 1; }

# Soporta tanto "docker compose" (plugin) como "docker-compose" (binario)
if docker compose version >/dev/null 2>&1; then
  dc() { docker compose "$@"; }
else
  dc() { docker-compose "$@"; }
fi

HTTP_PORT=$(sed -n 's/^HTTP_PORT=//p' .env)
HTTP_PORT=${HTTP_PORT:-80}

healthy() {
  for _ in $(seq "$HEALTH_RETRIES"); do
    if curl -fsS "http://localhost:$HTTP_PORT/health" >/dev/null 2>&1; then
      return 0
    fi
    sleep "$HEALTH_INTERVAL"
  done
  return 1
}

restart_app() {
  dc build --pull
  dc down --remove-orphans
  dc up -d --build
}

PREV_SHA=$(git rev-parse HEAD)

log "git pull"
git checkout -q main
git pull --ff-only origin main
NEW_SHA=$(git rev-parse HEAD)
log "Código: ${PREV_SHA:0:7} → ${NEW_SHA:0:7}"

log "docker-compose down + up -d --build"
restart_app

log "Esperando a que la app responda /health"
if healthy; then
  docker image prune -f >/dev/null
  log "✅ Despliegue en producción exitoso (${NEW_SHA:0:7})"
  exit 0
fi

log "❌ La app no respondió; volviendo a ${PREV_SHA:0:7}"
dc logs --tail=100 || true
git reset --hard "$PREV_SHA"
restart_app
exit 1
