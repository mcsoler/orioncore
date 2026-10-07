// Copia globe.gl y sus texturas a public/ para servirlos sin CDN.
// Con pnpm, three-globe no está en la raíz de node_modules sino junto a globe.gl,
// por eso se resuelve desde la ubicación real de globe.gl (funciona también con npm).
import { copyFileSync, mkdirSync, realpathSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const globeDir = realpathSync(join(root, 'node_modules', 'globe.gl'));
const threeGlobeDir = realpathSync(join(globeDir, '..', 'three-globe'));

const files = [
  [join(globeDir, 'dist', 'globe.gl.min.js'), join(root, 'public', 'globe.gl.min.js')],
  [join(threeGlobeDir, 'example', 'img', 'earth-blue-marble.jpg'), join(root, 'public', 'earth', 'earth-blue-marble.jpg')],
  [join(threeGlobeDir, 'example', 'img', 'earth-topology.png'), join(root, 'public', 'earth', 'earth-topology.png')],
  [join(threeGlobeDir, 'example', 'img', 'earth-night.jpg'), join(root, 'public', 'earth', 'earth-night.jpg')],
];

mkdirSync(join(root, 'public', 'earth'), { recursive: true });
for (const [from, to] of files) {
  copyFileSync(from, to);
}
console.log(`globe assets: ${files.length} archivos copiados a public/`);
