import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { renderAstro } from '../../support/renderAstro';
import Seo from '../../../src/ui/components/shared/Seo.astro';
import { SeoMetaBuilder } from '../../../src/infrastructure/seo/SeoMetaBuilder';

const meta = new SeoMetaBuilder({ url: 'https://orioncore.co', name: 'Orion Core Tecnologías', locale: 'es_CO', image: '/og-image.png' })
  .forPath('/')
  .withTitle('Automatización, IA y Marketing para Empresas | Orion Core')
  .withDescription('Descripción')
  .withRobots('noindex, follow')
  .withJsonLd({ '@type': 'WebSite' })
  .build();

describe('Seo', () => {
  it('pinta title, description, canónica, robots, Open Graph, Twitter y JSON-LD', async () => {
    const { html } = await renderAstro(Seo, { props: { meta } });
    expect(html).toContain('<title>Automatización, IA y Marketing para Empresas | Orion Core</title>');
    expect(html).toContain('<meta name="description" content="Descripción">');
    expect(html).toContain('<link rel="canonical" href="https://orioncore.co/">');
    expect(html).toContain('<meta name="robots" content="noindex, follow">');
    expect(html).toContain('<meta property="og:image" content="https://orioncore.co/og-image.png">');
    expect(html).toContain('<meta property="og:locale" content="es_CO">');
    expect(html).toContain('<meta name="twitter:card" content="summary_large_image">');
    expect(html).toContain('<script type="application/ld+json">{"@type":"WebSite"}</script>');
  });
});

describe('global.css', () => {
  const css = readFileSync(new URL('../../../src/styles/global.css', import.meta.url), 'utf8');
  const rule = (name: string) => css.match(new RegExp(`\\.${name}\\s*{([^}]*)}`))![1]!;

  it('tema oscuro de la referencia en el body', () => {
    expect(css).toMatch(/body\s*{[^}]*bg-navy[^}]*text-white/);
  });

  it('btn-primary: texto blanco sobre brand-blue sólido (5,2:1)', () => {
    expect(rule('btn-primary')).toContain('bg-brand-blue');
    expect(rule('btn-primary')).toContain('text-white');
    expect(rule('btn-primary')).toContain('hover:shadow-glow-cyan');
  });

  it('btn-whatsapp: tinta oscura sobre el verde de WhatsApp (el blanco no alcanza 4,5:1)', () => {
    expect(rule('btn-whatsapp')).toContain('bg-whatsapp');
    expect(rule('btn-whatsapp')).toContain('text-whatsapp-ink');
  });

  it('clases de la referencia: card, eyebrow, h2, chip, tag, ph y stage', () => {
    for (const name of ['card', 'eyebrow', 'h2', 'chip', 'tag', 'ph', 'stage']) expect(rule(name)).toBeTruthy();
  });

  it('respeta prefers-reduced-motion', () => {
    expect(css).toMatch(/@media \(prefers-reduced-motion: reduce\)/);
  });
});
