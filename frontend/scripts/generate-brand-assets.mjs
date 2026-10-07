// Genera los assets de marca a partir del isotipo real (src/ui/components/shared/logoGeometry.ts)
// y los colores de tailwind.config.mjs, usando el Chrome instalado (playwright-core, sin descargas).
//
//   public/favicon.svg, public/apple-touch-icon.png, public/logo-orion-core.png, public/og-image.png
//   src/assets/hero-globe.png  (imagen estática del globo para móvil y como fallback)
//
// Uso: node scripts/copy-globe-assets.mjs && node scripts/generate-brand-assets.mjs
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from 'playwright-core';
import tailwind from '../tailwind.config.mjs';
import {
  LOGO_HALO,
  LOGO_LINE_WIDTH,
  LOGO_LINES,
  LOGO_NODES,
  LOGO_VIEWBOX,
} from '../src/ui/components/shared/logoGeometry.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const color = tailwind.theme.extend.colors;
const CHROME = process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

function isotype({ size, x = 0, y = 0 }) {
  const shapes = [
    ...LOGO_NODES.map((n) => `<circle cx="${n.cx}" cy="${n.cy}" r="${n.r}" fill="${color.secondary}" opacity="${n.opacity}"/>`),
    ...LOGO_LINES.map(
      (l) =>
        `<line x1="${l.x1}" y1="${l.y1}" x2="${l.x2}" y2="${l.y2}" stroke="${color.secondary}" stroke-width="${LOGO_LINE_WIDTH}" stroke-opacity="${l.opacity}"/>`,
    ),
    `<circle cx="${LOGO_HALO.cx}" cy="${LOGO_HALO.cy}" r="${LOGO_HALO.r}" stroke="${color.secondary}" stroke-width="${LOGO_HALO.strokeWidth}" stroke-opacity="${LOGO_HALO.opacity}" fill="none"/>`,
  ];
  return `<svg x="${x}" y="${y}" width="${size}" height="${size}" viewBox="${LOGO_VIEWBOX}" fill="none" xmlns="http://www.w3.org/2000/svg">${shapes.join('')}</svg>`;
}

/** Isotipo sobre un cuadrado navy: visible en pestañas claras y oscuras. En PNG va sin redondeo (iOS aplica su máscara). */
function iconSvg({ rounded = true } = {}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36"><rect width="36" height="36" rx="${rounded ? 8 : 0}" fill="${color.navy}"/>${isotype({ size: 28, x: 4, y: 4 })}</svg>`;
}

const font = (pkg, file) => pathToFileURL(join(root, 'node_modules/@fontsource', pkg, 'files', file)).href;

function ogHtml() {
  return `<!doctype html><html><head><style>
    @font-face { font-family: Poppins; font-weight: 700; src: url(${font('poppins', 'poppins-latin-700-normal.woff2')}); }
    @font-face { font-family: Inter; font-weight: 500; src: url(${font('inter', 'inter-latin-500-normal.woff2')}); }
    body { margin: 0; }
    #og { width: 1200px; height: 630px; display: flex; flex-direction: column; justify-content: center; gap: 36px; padding: 0 96px;
          box-sizing: border-box; background: linear-gradient(135deg, ${color['hero-from']}, ${color['hero-to']} 60%, ${color.navy}); }
    .brand { display: flex; align-items: center; gap: 28px; }
    .name { font: 700 76px/1 Poppins; color: white; letter-spacing: -0.02em; }
    .sub { font: 500 22px/1 Inter; color: ${color.secondary}; opacity: .7; letter-spacing: .3em; text-transform: uppercase; margin-top: 14px; }
    .tagline { font: 500 34px/1.3 Inter; color: rgba(255,255,255,.85); max-width: 900px; }
  </style></head><body><div id="og">
    <div class="brand">${isotype({ size: 150 })}<div><div class="name">Orion Core</div><div class="sub">Tecnologías</div></div></div>
    <div class="tagline">Automatización, inteligencia artificial y marketing digital para empresas en Colombia</div>
  </div></body></html>`;
}

function globeHtml() {
  const pub = (p) => pathToFileURL(join(root, 'public', p)).href;
  // Mismos parámetros visuales que el globo animado del Hero
  return `<!doctype html><html><head><style>
    body { margin: 0; background: transparent; }
    #globe { width: 600px; height: 600px;
      filter: brightness(1.6) contrast(0.78) saturate(1.05) opacity(0.55)
              drop-shadow(0 0 28px rgba(0, 224, 255, 0.25)) drop-shadow(0 0 60px rgba(0, 224, 255, 0.10)); }
  </style><script src="${pub('globe.gl.min.js')}"></script></head><body><div id="globe"></div><script>
    Globe()(document.getElementById('globe'))
      .globeImageUrl('${pub('earth/earth-blue-marble.jpg')}')
      .bumpImageUrl('${pub('earth/earth-topology.png')}')
      .backgroundColor('rgba(0,0,0,0)').width(600).height(600)
      .atmosphereColor('${color.secondary}').atmosphereAltitude(0.38)
      .pointOfView({ lat: 4.6, lng: -74.1, altitude: 2.4 });
  </script></body></html>`;
}

async function shot(page, html, selector, out, { transparent = false, wait = 300 } = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'orion-assets-'));
  const file = join(dir, 'page.html');
  writeFileSync(file, html);
  await page.goto(pathToFileURL(file).href);
  await page.waitForTimeout(wait);
  mkdirSync(dirname(out), { recursive: true });
  await page.locator(selector).screenshot({ path: out, omitBackground: transparent });
  console.log('✓', out.replace(`${root}/`, ''));
}

const browser = await chromium.launch({
  executablePath: CHROME,
  args: ['--allow-file-access-from-files', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
try {
  writeFileSync(join(root, 'public/favicon.svg'), `${iconSvg()}\n`);
  console.log('✓ public/favicon.svg');

  const page = await browser.newPage({ deviceScaleFactor: 1 });
  const icon = (px) =>
    `<!doctype html><body style="margin:0"><div id="i" style="width:${px}px;height:${px}px">${iconSvg({ rounded: false }).replace('<svg ', `<svg width="${px}" height="${px}" `)}</div></body>`;
  await shot(page, icon(180), '#i', join(root, 'public/apple-touch-icon.png'));
  await shot(page, icon(512), '#i', join(root, 'public/logo-orion-core.png'));
  await page.setViewportSize({ width: 1200, height: 630 });
  await shot(page, ogHtml(), '#og', join(root, 'public/og-image.png'), { wait: 800 });
  await page.setViewportSize({ width: 600, height: 600 });
  await shot(page, globeHtml(), '#globe', join(root, 'src/assets/hero-globe.png'), { transparent: true, wait: 4000 });
} finally {
  await browser.close();
}
