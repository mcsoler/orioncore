import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import tailwindConfig from '../../../tailwind.config.mjs';

const root = new URL('../../../', import.meta.url).pathname;
// Config de Tailwind en JS: se tipa como un registro simple para las aserciones
const theme = tailwindConfig.theme!.extend as Record<string, Record<string, string | string[]>>;

function filesIn(dir: string, exts: string[]): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return filesIn(path, exts);
    return exts.some((e) => name.endsWith(e)) ? [path] : [];
  });
}

describe('tokens de diseño (identidad visual sin cambios)', () => {
  it('conserva los tokens originales con los mismos valores', () => {
    expect(theme.colors).toMatchObject({
      primary: '#2554d8',
      secondary: '#00e0ff',
      electric: '#00f5ff',
      'bg-main': '#ffffff',
      'bg-secondary': '#f8fafc',
      'text-primary': '#1e293b',
      'text-secondary': '#64748b',
    });
    expect(theme.boxShadow).toMatchObject({
      'glow-cyan': '0 0 20px rgba(0, 224, 255, 0.35)',
      'glow-blue': '0 0 20px rgba(37,  84, 216, 0.40)',
    });
  });

  it('centraliza como tokens los hex que estaban escritos en los componentes', () => {
    expect(theme.colors).toMatchObject({
      'brand-blue': '#2463EB',
      'brand-cyan': '#08CBEF',
      ink: '#101B31',
      muted: '#65748D',
      navy: '#061126',
      'hero-from': '#02050f',
      'hero-to': '#060d24',
      'surface-soft': '#F6F8FC',
      amber: '#FBBF24',
      'nav-glass': 'rgba(2, 8, 30, 0.55)',
    });
  });

  it('solo agrega colores funcionales nuevos (éxito, error, WhatsApp)', () => {
    expect(theme.colors).toMatchObject({ success: '#15803d', danger: '#b91c1c', whatsapp: '#25D366' });
  });

  it('mantiene Poppins para títulos e Inter para el cuerpo, sin el alias playfair', () => {
    expect(theme.fontFamily!.poppins![0]).toBe('Poppins');
    expect(theme.fontFamily!.inter![0]).toBe('Inter');
    expect(theme.fontFamily).not.toHaveProperty('playfair');
  });

  it('ningún componente, página o estilo tiene colores hex escritos a mano', () => {
    const files = [
      ...filesIn(join(root, 'src/ui'), ['.astro', '.tsx', '.ts']),
      ...filesIn(join(root, 'src/pages'), ['.astro']),
      join(root, 'src/styles/global.css'),
    ];
    const offenders = files.filter((f) => /#[0-9a-fA-F]{3,8}\b(?![\w-])/.test(readFileSync(f, 'utf8').replace(/href="#[\w-]*"/g, '')));
    expect(offenders.map((f) => f.replace(root, ''))).toEqual([]);
  });
});
