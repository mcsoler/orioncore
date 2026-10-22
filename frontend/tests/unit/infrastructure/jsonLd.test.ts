import { describe, expect, it } from 'vitest';
import {
  articleJsonLd,
  collectionPageJsonLd,
  confirmedFaqs,
  productJsonLd,
  serviceJsonLd,
} from '../../../src/infrastructure/seo/jsonLd';

const SITE = 'https://orioncore.co';
const business = { name: 'Orion Core Tecnologías', email: 'a@b.co', phoneLabel: '+57', address: '[Dirección]', city: 'Bogotá D.C.' };

describe('JSON-LD de las plantillas', () => {
  it('FAQPage solo con preguntas que ya tienen respuesta real', () => {
    expect(
      confirmedFaqs([
        { question: '¿Necesito WhatsApp Business API?', answer: '[Respuesta: …]' },
        { question: '¿Puedo seguir respondiendo yo?', answer: 'Sí.' },
      ]),
    ).toEqual([{ question: '¿Puedo seguir respondiendo yo?', answer: 'Sí.' }]);
  });

  it('Service con proveedor, área y, en el hub, su OfferCatalog', () => {
    const block = serviceJsonLd(
      { name: 'Marketing', description: 'd', path: '/marketing-digital/', catalog: [{ name: 'Análisis web', path: '/marketing-digital/analisis-web/' }] },
      business,
      SITE,
    );
    expect(block).toMatchObject({
      '@type': 'Service',
      url: 'https://orioncore.co/marketing-digital/',
      provider: { '@type': 'Organization', name: 'Orion Core Tecnologías' },
      areaServed: { name: 'Colombia' },
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        itemListElement: [{ itemOffered: { name: 'Análisis web', url: 'https://orioncore.co/marketing-digital/analisis-web/' } }],
      },
    });
  });

  it('CollectionPage con la lista de productos en orden', () => {
    const block = collectionPageJsonLd(
      { name: 'Tienda', description: 'd', path: '/tienda/', items: [{ name: 'Router', path: '/tienda/router/' }] },
      SITE,
    );
    expect(block).toMatchObject({
      '@type': 'CollectionPage',
      mainEntity: { '@type': 'ItemList', itemListElement: [{ position: 1, url: 'https://orioncore.co/tienda/router/' }] },
    });
  });

  it('Product + Offer solo con precio confirmado; los marcadores no se publican', () => {
    const base = { name: 'Router Wi‑Fi 6', description: 'd', path: '/tienda/router/', sku: '[XXXX]', brand: 'TP-Link', inStock: true };
    expect(productJsonLd(base, SITE)).toBeUndefined();
    const block = productJsonLd({ ...base, price: 400_000 }, SITE)!;
    expect(block).toMatchObject({
      '@type': 'Product',
      brand: { name: 'TP-Link' },
      offers: { priceCurrency: 'COP', price: 400_000, availability: 'https://schema.org/InStock' },
    });
    expect(block).not.toHaveProperty('sku');
    expect(productJsonLd({ ...base, name: '[Router]', price: 1 }, SITE)).toBeUndefined();
  });

  it('Article con autor solo si su nombre está confirmado', () => {
    const article = { title: 'T', description: 'd', path: '/blog/t/', updatedIso: '2026-10-01', author: { name: 'Michael [Apellido]', href: '/nosotros/' } };
    expect(articleJsonLd(article, business, SITE)).not.toHaveProperty('author');
    expect(articleJsonLd({ ...article, author: { name: 'Michael Soler', href: '/nosotros/' } }, business, SITE)).toMatchObject({
      '@type': 'Article',
      dateModified: '2026-10-01',
      author: { '@type': 'Person', name: 'Michael Soler', url: 'https://orioncore.co/nosotros/' },
      publisher: { name: 'Orion Core Tecnologías' },
    });
  });
});
