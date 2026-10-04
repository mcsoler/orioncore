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
  items: z.array(text).min(1),
  cta: text,
});

const marketingLineSchema = z.object({
  title: text,
  slug: text,
  status,
  description: text,
  items: z.array(text).min(1),
});

/** Forma de content/home.es.json. Las reglas de negocio las validan las entidades del dominio. */
export const siteContentSchema = z.object({
  business: z.object({
    name: text,
    legalName: text,
    email: text,
    phoneLabel: text,
    whatsapp: text.nullable(),
    address: text,
    city: text,
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
          status,
        }),
      )
      .min(1),
  }),
  cases: z.array(z.object({ client: text, slug: text, summary: text, result: text, status })).min(1),
  articles: z.array(z.object({ title: text, slug: text, excerpt: text, status })).min(1),
  home: z.object({
    announcement: z.object({ text, cta }),
    hero: z.object({
      title: text,
      hook: text,
      subtitle: text,
      primaryCta: cta,
      secondaryCta: cta,
      microcopy: text,
      socialProof: text,
    }),
    clients: z.object({ title: text, logos: z.array(text).min(1) }),
    pains: z.object({
      title: text,
      items: z.array(z.object({ title: text, description: text })).min(1),
      closing: text,
    }),
    services: z.object({ title: text, subtitle: text, ctaLabel: text }),
    marketing: z.object({ title: text, subtitle: text, hub: cta }),
    calculator: z.object({
      title: text,
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
      title: text,
      stats: z.array(z.object({ value: text, label: text })).min(1),
      certifications: z.array(text),
      testimonials: z.array(z.object({ quote: text, author: text, company: text.optional() })),
    }),
    process: z.object({
      title: text,
      steps: z.array(z.object({ order: z.number().int().positive(), title: text, description: text })).min(1),
      guarantee: text,
    }),
    shop: z.object({ title: text, cta }),
    blog: z.object({ title: text, cta }),
    faq: z.object({ title: text, items: z.array(z.object({ question: text, answer: text })).min(1) }),
    contact: z.object({
      title: text,
      slots: text,
      benefits: z.array(text).min(1),
      photoAlt: text,
      whatsappMessage: text,
    }),
  }),
});

export type SiteContent = z.infer<typeof siteContentSchema>;
