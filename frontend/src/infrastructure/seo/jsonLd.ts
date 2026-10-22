import type { JsonLd } from './SeoMetaBuilder';

/** Logo para buscadores: el isotipo real exportado a PNG (scripts/generate-brand-assets.mjs). */
export const LOGO_PATH = '/logo-orion-core.png';

export interface BusinessSeo {
  name: string;
  email: string;
  phoneLabel: string;
  /** Dígitos sin + (573054195433). */
  whatsapp?: string;
  address: string;
  city: string;
  googleBusinessUrl?: string;
}

/** Los marcadores [X] no se publican en datos estructurados. */
const confirmed = (value: string | undefined): value is string => !!value && !value.includes('[');

export function organizationJsonLd(business: BusinessSeo, siteUrl: string): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: business.name,
    url: new URL('/', siteUrl).href,
    logo: new URL(LOGO_PATH, siteUrl).href,
    email: business.email,
    ...(business.whatsapp && { telephone: `+${business.whatsapp}` }),
    ...(business.googleBusinessUrl && { sameAs: [business.googleBusinessUrl] }),
  };
}

export function localBusinessJsonLd(business: BusinessSeo, siteUrl: string): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: business.name,
    url: new URL('/', siteUrl).href,
    image: new URL(LOGO_PATH, siteUrl).href,
    logo: new URL(LOGO_PATH, siteUrl).href,
    email: business.email,
    ...(business.whatsapp && { telephone: `+${business.whatsapp}` }),
    areaServed: { '@type': 'Country', name: 'Colombia' },
    address: {
      '@type': 'PostalAddress',
      ...(confirmed(business.address) && { streetAddress: business.address }),
      ...(confirmed(business.city) && { addressLocality: business.city }),
      addressCountry: 'CO',
    },
  };
}

export function webSiteJsonLd(name: string, siteUrl: string): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name,
    url: new URL('/', siteUrl).href,
    inLanguage: 'es-CO',
  };
}

export function faqPageJsonLd(items: { question: string; answer: string }[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };
}

/** Solo las preguntas con respuesta real: un FAQPage con marcadores [Respuesta] no se publica. */
export function confirmedFaqs<T extends { question: string; answer: string }>(items: readonly T[]): T[] {
  return items.filter((item) => confirmed(item.question) && confirmed(item.answer));
}

const provider = (business: BusinessSeo, siteUrl: string) => ({
  '@type': 'Organization',
  name: business.name,
  url: new URL('/', siteUrl).href,
});

/** Service de /servicios/{slug}/ y del hub de marketing (con su catálogo de líneas). */
export function serviceJsonLd(
  service: { name: string; description: string; path: string; catalog?: { name: string; path: string }[] },
  business: BusinessSeo,
  siteUrl: string,
): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.name,
    description: service.description,
    url: new URL(service.path, siteUrl).href,
    provider: provider(business, siteUrl),
    areaServed: { '@type': 'Country', name: 'Colombia' },
    ...(service.catalog && {
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: service.name,
        itemListElement: service.catalog.map((item) => ({
          '@type': 'Offer',
          itemOffered: { '@type': 'Service', name: item.name, url: new URL(item.path, siteUrl).href },
        })),
      },
    }),
  };
}

/** CollectionPage de la tienda o de una categoría, con sus productos en orden. */
export function collectionPageJsonLd(
  page: { name: string; description: string; path: string; items: { name: string; path: string }[] },
  siteUrl: string,
): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: page.name,
    description: page.description,
    url: new URL(page.path, siteUrl).href,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: page.items.map((item, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: new URL(item.path, siteUrl).href,
        name: item.name,
      })),
    },
  };
}

/**
 * Product + Offer. Google exige precio, reseñas o calificación: sin precio confirmado
 * no se publica (los datos estructurados no pueden llevar marcadores).
 */
export function productJsonLd(
  product: { name: string; description: string; path: string; sku: string; brand: string; price?: number; inStock: boolean },
  siteUrl: string,
): JsonLd | undefined {
  if (product.price === undefined || !confirmed(product.name)) return undefined;
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    ...(confirmed(product.description) && { description: product.description }),
    ...(confirmed(product.sku) && { sku: product.sku }),
    ...(confirmed(product.brand) && { brand: { '@type': 'Brand', name: product.brand } }),
    offers: {
      '@type': 'Offer',
      url: new URL(product.path, siteUrl).href,
      priceCurrency: 'COP',
      price: product.price,
      availability: product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/BackOrder',
    },
  };
}

/** Article del blog con su autor (E-E-A-T); los datos pendientes ([Apellido]) no se publican. */
export function articleJsonLd(
  article: { title: string; description: string; path: string; author: { name: string; href: string }; updatedIso: string },
  business: BusinessSeo,
  siteUrl: string,
): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    url: new URL(article.path, siteUrl).href,
    mainEntityOfPage: new URL(article.path, siteUrl).href,
    dateModified: article.updatedIso,
    inLanguage: 'es-CO',
    ...(confirmed(article.author.name) && {
      author: { '@type': 'Person', name: article.author.name, url: new URL(article.author.href, siteUrl).href },
    }),
    publisher: { ...provider(business, siteUrl), logo: { '@type': 'ImageObject', url: new URL(LOGO_PATH, siteUrl).href } },
  };
}
