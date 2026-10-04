import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');

describe('configuración de despliegue (Paso 7)', () => {
  const dockerfile = read('../../Dockerfile');
  const https = read('../../../nginx/templates/https.conf.template');

  it('serve no usa -s (modo SPA): las rutas inexistentes responden 404 con 404.html', () => {
    const cmd = dockerfile.match(/^CMD (.+)$/m)![1]!;
    expect(cmd).not.toContain('"-s"');
    expect(cmd).toContain('"dist"');
  });

  it('serve fuerza la barra final (trailingSlash) como el sitio', () => {
    const serveConfig = JSON.parse(read('../../serve.json'));
    expect(serveConfig.trailingSlash).toBe(true);
    expect(dockerfile).toContain('serve.json');
  });

  it('Nginx en HTTPS redirige www al dominio sin www (una sola versión)', () => {
    expect(https).toMatch(/server_name www\.\$\{DOMAIN\};[\s\S]*return 301 https:\/\/\$\{DOMAIN\}\$request_uri;/);
  });

  it('Nginx en HTTP redirige directo al dominio canónico, sin pasar por www', () => {
    expect(https).toContain('return 301 https://${DOMAIN}$request_uri;');
    expect(https).not.toContain('return 301 https://$host$request_uri;');
  });

  it('el server HTTPS principal solo atiende el dominio sin www', () => {
    expect(https).toMatch(/listen 443 ssl;\s+http2 on;\s+server_name \$\{DOMAIN\};/);
  });
});
