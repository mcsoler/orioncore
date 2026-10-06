import { z } from 'zod';
import { ROUTE_SECTIONS, ROUTE_STATUSES } from '../../domain/entities/SiteRoute';

const text = z.string().trim().min(1);
const status = z.enum(ROUTE_STATUSES);
const cta = z.object({ label: text, href: text });

const serviceSchema = z.object({
  title: text,
  slug: text,
  status: status.optional(),
  badge: text.optional(),
  href: text.optional(),
  headline: text,
  description: text,
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
    categories: z.array(z.object({ title: text, slug: text, status })).min(1),
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
  articles: z
    .array(
      z.object({
        title: text,
        slug: text,
        category: text,
        excerpt: text,
        readingTime: text,
        seoTitle: text.optional(),
        status,
      }),
    )
    .min(1),
  home: z.object({
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
      slots: z.object({ label: text, value: text, progress: z.number().min(0).max(100) }),
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
