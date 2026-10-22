import { z } from 'zod';
import { AVAILABILITIES } from '../../domain/entities/Product';
import { ROUTE_SECTIONS, ROUTE_STATUSES } from '../../domain/entities/SiteRoute';

const text = z.string().trim().min(1);
const status = z.enum(ROUTE_STATUSES);
const cta = z.object({ label: text, href: text });
const qa = z.object({ question: text, answer: text });
const seoText = z.object({ title: text, body: text });

const serviceSchema = z.object({
  title: text,
  slug: text,
  status: status.optional(),
  badge: text.optional(),
  href: text.optional(),
  headline: text,
  description: text,
  /** Title SEO propio (plan SEO); si no hay, "{title} | Orion Core". */
  seoTitle: text.optional(),
  /** Meta description si `description` supera 155 caracteres. */
  seoDescription: text.optional(),
  items: z.array(text).min(1),
  cta: text,
  ctaHref: text,
  linkLabel: text,
});

const marketingLineSchema = z.object({
  title: text,
  slug: text,
  status,
  hook: text,
  description: text,
  items: z.array(text).min(1),
  seoTitle: text.optional(),
  seoDescription: text.optional(),
  /** Bloque de la línea en el hub /marketing-digital/. */
  hub: z.object({ visual: text, heading: text, text, items: z.array(text).min(1), cta: text }),
});

const articleSchema = z.object({
  title: text,
  slug: text,
  category: text,
  excerpt: text,
  readingTime: text,
  seoTitle: text.optional(),
  /** Etiqueta sobre el H1 ("Agentes de IA · Guía 2026"). */
  chip: text,
  lead: text,
  /** Clave en pages.es.json → authors. */
  author: text,
  published: text,
  updated: text,
  /** Fecha real de actualización (AAAA-MM-DD) para <time> y Article. */
  updatedIso: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  image: text,
  quickAnswer: text,
  sections: z
    .array(
      z.object({
        id: text,
        title: text,
        /** Admite enlaces internos con la forma [texto](/ruta/). */
        paragraphs: z.array(text).min(1),
        table: z.object({ columns: z.array(text).min(2), rows: z.array(z.array(text)).min(1) }).optional(),
      }),
    )
    .min(1),
  /** CTA dentro del contenido, después de la sección `after`. */
  inlineCta: z.object({ after: text, title: text, text, label: text, href: text }),
  /** Slugs de artículos relacionados. */
  related: z.array(text),
  status,
});

const heading = { eyebrow: text, title: text };

/** Forma de content/home/home.es.json. Las reglas de negocio las validan las entidades del dominio. */
export const siteContentSchema = z.object({
  business: z.object({
    name: text,
    legalName: text,
    nit: text,
    email: text,
    phoneLabel: text,
    whatsapp: text.nullable(),
    address: text,
    city: text,
    hours: text,
    googleBusinessUrl: z.string().url().nullable(),
  }),
  pages: z
    .array(
      z.object({
        path: text,
        title: text,
        status,
        section: z.enum(ROUTE_SECTIONS),
        description: text,
        seoTitle: text.optional(),
      }),
    )
    .min(1),
  services: z.array(serviceSchema).min(1),
  marketingLines: z.array(marketingLineSchema).min(1),
  shop: z.object({
    categories: z.array(z.object({ title: text, slug: text, status, description: text, seoText })).min(1),
    products: z
      .array(
        z.object({
          title: text,
          slug: text,
          category: text,
          description: text,
          price: z.number().nonnegative().nullable(),
          oldPrice: z.number().nonnegative().nullable(),
          badge: text.optional(),
          stock: z.number().int().nonnegative().nullable(),
          stockLabel: text,
          availability: z.enum(AVAILABILITIES),
          fastShipping: z.boolean(),
          installation: z.boolean(),
          brand: text,
          sku: text,
          featured: z.boolean().optional(),
          benefits: z.array(text).optional(),
          /** Presentaciones ("1 nodo", "Pack x3"…). */
          variants: z.array(text).optional(),
          specs: z.array(z.object({ label: text, value: text })).optional(),
          questions: z.array(qa).optional(),
          /** Slugs de los productos del combo "Se compran juntos". */
          bundle: z.array(text).optional(),
          status,
        }),
      )
      .min(1),
  }),
  cases: z
    .array(
      z.object({
        client: text,
        slug: text,
        tag: text,
        summary: text,
        result: text,
        quote: text.optional(),
        quoteAuthor: text.optional(),
        status,
      }),
    )
    .min(1),
  articles: z.array(articleSchema).min(1),
  home: z.object({
    slots: z.object({ remaining: z.number().int().nonnegative(), total: z.number().int().positive() }),
    announcement: z.object({ text, cta }),
    hero: z.object({
      title: text,
      hook: z.object({ before: text, highlight: text, after: text }),
      subtitle: text,
      primaryCta: cta,
      secondaryCta: cta,
      microcopy: text,
      rating: text,
      socialProof: text,
    }),
    clients: z.object({ title: text, logos: z.array(text).min(1) }),
    pains: z.object({
      ...heading,
      items: z.array(z.object({ tag: text, title: text, description: text })).min(1),
      closing: z.object({ text, highlight: text }),
    }),
    services: z.object(heading),
    marketing: z.object({
      ...heading,
      subtitle: text,
      hub: cta,
      hubCard: z.object({ title: text, hook: text, items: z.array(text).min(1) }),
    }),
    calculator: z.object({
      ...heading,
      subtitle: text,
      defaultHours: z.number().min(1).max(60),
      costPerHour: z.object({
        default: z.number().positive(),
        min: z.number().positive(),
        max: z.number().positive(),
        step: z.number().positive(),
      }),
      cta,
    }),
    results: z.object({
      ...heading,
      stats: z.array(z.object({ value: text, label: text })).min(1),
      certifications: z.array(text),
      testimonials: z.array(z.object({ quote: text, author: text, company: text.optional() })),
    }),
    process: z.object({
      ...heading,
      steps: z.array(z.object({ order: z.number().int().positive(), title: text, description: text })).min(1),
      guarantee: z.object({ title: text, body: text, cta }),
    }),
    shop: z.object({ ...heading, subtitle: text, cta }),
    blog: z.object({ ...heading, subtitle: text, cta }),
    faq: z.object({ ...heading, items: z.array(z.object({ question: text, answer: text })).min(1) }),
    contact: z.object({
      ...heading,
      slots: z.object({ label: text, value: text }),
      benefits: z.array(text).min(1),
      person: z.object({ name: text, role: text, note: text }),
      photoAlt: text,
      whatsappCta: text,
      whatsappMessage: text,
      formOptions: z.array(z.object({ value: text, label: text })).min(1),
    }),
  }),
});

export type SiteContent = z.infer<typeof siteContentSchema>;

const plans = z.object({
  title: text,
  note: text,
  plans: z
    .array(
      z.object({
        name: text,
        price: text,
        period: text.optional(),
        badge: text.optional(),
        items: z.array(text).min(1),
        cta: text,
      }),
    )
    .min(1),
});
const faq = z.object({ title: text, items: z.array(qa).min(1) });
const contactBand = z.object({ title: text, text, submitLabel: text });
const link = z.object({ label: text, href: text });

const servicePageSchema = z.object({
  hero: z.object({
    title: z.object({ before: text, highlight: text, after: z.string().trim() }),
    intro: text,
    /** href: ancla (#precios), ruta interna o "whatsapp". */
    primaryCta: cta,
    secondaryCta: cta,
    rating: text,
    proof: z.array(text),
    chat: z
      .object({
        name: text,
        status: text,
        messages: z.array(z.object({ from: z.enum(['client', 'agent']), text })).min(1),
      })
      .optional(),
  }),
  whatIs: z.object({ title: text, body: text, problems: z.array(text).min(1) }),
  howItWorks: z.object({ title: text, steps: z.array(z.object({ title: text, text })).min(1) }),
  features: z.object({
    title: text,
    items: z.array(z.object({ title: text, text })).min(1),
    integrations: z.array(text).min(1),
  }),
  comparison: z.object({
    title: text,
    columns: z.tuple([text, text, text]),
    rows: z.array(z.tuple([text, text, text])).min(1),
    idealFor: z.array(text).min(1),
  }),
  pricing: plans,
  case: z.object({ chip: text, title: text, quote: text, author: text, photo: text }),
  faq,
  related: z.object({ services: z.array(link).min(1), guides: z.array(link).min(1) }),
  contact: contactBand,
});

const icon = z.enum(['truck', 'shield', 'lock', 'whatsapp', 'rotate', 'tool']);

/** Forma de content/pages/pages.es.json: el contenido propio de cada plantilla de página. */
export const pagesContentSchema = z.object({
  services: z.record(servicePageSchema),
  marketingHub: z.object({
    hero: z.object({
      /** H1 (la ruta conserva su nombre corto para el menú y las migas). */
      title: text,
      intro: z.object({ before: text, strong: text, after: text }),
      primaryCta: cta,
      secondaryCta: cta,
      scarcity: text,
      stage: z.object({ reel: text, logo: text, post: text, metricLabel: text, metricValue: text }),
    }),
    strategy: z.object({
      id: text,
      title: text,
      visual: text,
      heading: text,
      text,
      items: z.array(text).min(1),
      cta: text,
    }),
    plans,
    faq,
    contact: contactBand,
  }),
  shop: z.object({
    /** H1 de /tienda/ (la ruta conserva "Tienda" para el menú y las migas). */
    title: text,
    intro: text,
    freeShippingFrom: z.number().positive().nullable(),
    combo: z.object({ chip: text, title: text, text, cta, photo: text }),
    seoText,
    b2b: z.object({ title: text, text, cta }),
    priceRanges: z
      .array(z.object({ label: text, min: z.number().nonnegative().nullable(), max: z.number().positive().nullable() }))
      .min(1),
    trust: z.array(z.object({ icon, title: text, text })).min(1),
    payments: z.array(text).min(1),
    paymentsLine: text,
    product: z.object({
      gallery: z.array(text).min(1),
      rating: text,
      reviewsCount: text,
      installments: text,
      cardInstallments: text,
      stockNotice: z.object({ strong: text, text, day: text }),
      perks: z.array(z.object({ icon, text })).min(1),
      description: text,
      shipping: text,
      questions: z.array(qa).min(1),
      reviews: z.object({
        /** Porcentaje de reseñas de 5★ a 1★. */
        distribution: z.array(z.number().min(0).max(100)).length(5),
        items: z.array(z.object({ name: text, stars: z.number().int().min(1).max(5), text })).min(1),
      }),
      bundle: z.object({ title: text, extras: z.array(text), total: text, savings: text }),
      /** Producto sugerido en el carrito ("Completa tu compra"). */
      crossSell: text,
    }),
  }),
  authors: z.record(
    z.object({ name: text, role: text, bio: text, href: text, linkedin: z.string().url().nullable() }),
  ),
  blog: z.object({ sideCta: z.object({ title: text, text, label: text }) }),
});

export type PagesContent = z.infer<typeof pagesContentSchema>;
