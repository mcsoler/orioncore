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

  it('btn-primary pone el texto blanco sobre brand-blue sólido (contraste 5,2:1), no sobre el cian', () => {
    const rule = css.match(/\.btn-primary\s*{([^}]*)}/)![1]!;
    expect(rule).toContain('bg-brand-blue');
    expect(rule).toContain('text-white');
    expect(rule).not.toMatch(/from-secondary/);
    expect(rule).toContain('hover:shadow-glow-cyan');
  });

  it('btn-whatsapp usa texto navy sobre el verde de WhatsApp (el blanco no alcanza 4,5:1)', () => {
    const rule = css.match(/\.btn-whatsapp\s*{([^}]*)}/)![1]!;
    expect(rule).toContain('bg-whatsapp');
    expect(rule).toContain('text-navy');
  });

  it('respeta prefers-reduced-motion', () => {
    expect(css).toMatch(/@media \(prefers-reduced-motion: reduce\)/);
  });
});
