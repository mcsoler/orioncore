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
