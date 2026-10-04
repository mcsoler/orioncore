import { describe, expect, it } from 'vitest';
import { SeoMetaBuilder } from '../../../src/infrastructure/seo/SeoMetaBuilder';
import {
  faqPageJsonLd,
  localBusinessJsonLd,
  organizationJsonLd,
  webSiteJsonLd,
} from '../../../src/infrastructure/seo/jsonLd';

const site = { url: 'https://orioncore.co', name: 'Orion Core Tecnologías', locale: 'es_CO', image: '/og-image.png' };
const HOME_TITLE = 'Automatización, IA y Marketing para Empresas | Orion Core';
const HOME_DESCRIPTION =
  'Automatizamos procesos, atendemos WhatsApp con IA 24/7, creamos software y marketing 360°. Diagnóstico gratis en Colombia.';

const builder = () => new SeoMetaBuilder(site).forPath('/').withTitle(HOME_TITLE).withDescription(HOME_DESCRIPTION);

describe('SeoMetaBuilder', () => {
  it('arma title, description, canónica absoluta con barra final y robots', () => {
    const meta = builder().withRobots('index, follow').build();
    expect(meta.title).toBe(HOME_TITLE);
    expect(meta.description).toBe(HOME_DESCRIPTION);
    expect(meta.canonical).toBe('https://orioncore.co/');
    expect(meta.robots).toBe('index, follow');
  });

  it('la canónica de una subpágina conserva la barra final', () => {
    const meta = new SeoMetaBuilder(site).forPath('/servicios/software-a-medida/').withTitle('T').withDescription('D').build();
    expect(meta.canonical).toBe('https://orioncore.co/servicios/software-a-medida/');
  });

  it('robots es noindex, follow para un borrador', () => {
    expect(builder().withRobots('noindex, follow').build().robots).toBe('noindex, follow');
  });

  it('Open Graph y Twitter Card usan la imagen con el logo real como URL absoluta', () => {
    const meta = builder().build();
    expect(meta.openGraph).toEqual({
      type: 'website',
      url: 'https://orioncore.co/',
      title: HOME_TITLE,
      description: HOME_DESCRIPTION,
      siteName: 'Orion Core Tecnologías',
      locale: 'es_CO',
      image: 'https://orioncore.co/og-image.png',
      imageAlt: 'Orion Core Tecnologías',
    });
    expect(meta.twitter).toEqual({
      card: 'summary_large_image',
      title: HOME_TITLE,
      description: HOME_DESCRIPTION,
      image: 'https://orioncore.co/og-image.png',
    });
  });

  it('rechaza un title de más de 60 caracteres', () => {
    expect(() => builder().withTitle('x'.repeat(61)).build()).toThrow(/60/);
  });

  it('rechaza una description de más de 155 caracteres', () => {
    expect(() => builder().withDescription('x'.repeat(156)).build()).toThrow(/155/);
  });

  it('exige title, description y ruta', () => {
    expect(() => new SeoMetaBuilder(site).forPath('/').withDescription('d').build()).toThrow(/title/);
    expect(() => new SeoMetaBuilder(site).withTitle('t').withDescription('d').build()).toThrow(/ruta/);
  });

  it('acumula bloques JSON-LD', () => {
    const meta = builder().withJsonLd({ '@type': 'A' }).withJsonLd({ '@type': 'B' }).build();
    expect(meta.jsonLd.map((j) => j['@type'])).toEqual(['A', 'B']);
  });
});

describe('JSON-LD', () => {
  const business = {
    name: 'Orion Core Tecnologías',
    email: 'orioncoretechnologies@gmail.com',
    phoneLabel: '+57 305 419 5433',
    whatsapp: '573054195433',
    address: '[Dirección]',
    city: '[Ciudad]',
  };

  it('Organization usa el isotipo real como logo', () => {
    const json = organizationJsonLd(business, site.url);
    expect(json['@type']).toBe('Organization');
    expect(json.logo).toBe('https://orioncore.co/logo-orion-core.png');
    expect(json.email).toBe('orioncoretechnologies@gmail.com');
  });

  it('LocalBusiness incluye teléfono E.164, país CO y no publica marcadores [X]', () => {
    const json = localBusinessJsonLd(business, site.url);
    expect(json['@type']).toBe('ProfessionalService');
    expect(json.telephone).toBe('+573054195433');
    expect(json.address).toEqual({ '@type': 'PostalAddress', addressCountry: 'CO' });
    expect(JSON.stringify(json)).not.toContain('[');
  });

  it('WebSite declara el idioma es-CO', () => {
    expect(webSiteJsonLd(site.name, site.url)).toMatchObject({ '@type': 'WebSite', inLanguage: 'es-CO', url: 'https://orioncore.co/' });
  });

  it('FAQPage lista preguntas y respuestas', () => {
    const json = faqPageJsonLd([{ question: '¿Q?', answer: 'R' }]);
    expect(json.mainEntity).toEqual([
      { '@type': 'Question', name: '¿Q?', acceptedAnswer: { '@type': 'Answer', text: 'R' } },
    ]);
  });
});
