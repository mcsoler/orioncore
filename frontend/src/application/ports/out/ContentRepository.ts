import type { Article } from '../../../domain/entities/Article';
import type { CaseStudy } from '../../../domain/entities/CaseStudy';
import type { Faq } from '../../../domain/entities/Faq';
import type { MarketingLine } from '../../../domain/entities/MarketingLine';
import type { ProcessStep } from '../../../domain/entities/ProcessStep';
import type { Product } from '../../../domain/entities/Product';
import type { Service } from '../../../domain/entities/Service';
import type { Testimonial } from '../../../domain/entities/Testimonial';
import type { PhoneNumber } from '../../../domain/value-objects/PhoneNumber';

export interface Cta {
  label: string;
  href: string;
}

/** Encabezado común de las secciones del home. */
export interface SectionHeading {
  eyebrow: string;
  title: string;
}

/** Contenido del home ya convertido a entidades del dominio. */
export interface HomeContent {
  announcement: { text: string; cta: Cta };
  hero: {
    /** H1 con la palabra clave. */
    title: string;
    /** Gancho visual (no es el H1); `highlight` se resalta en azul. */
    hook: { before: string; highlight: string; after: string };
    subtitle: string;
    primaryCta: Cta;
    secondaryCta: Cta;
    microcopy: string;
    /** Calificación a mostrar, p. ej. "4,9". */
    rating: string;
    socialProof: string;
  };
  clients: { title: string; logos: string[] };
  pains: SectionHeading & {
    items: { tag: string; title: string; description: string }[];
    closing: { text: string; highlight: string };
  };
  services: SectionHeading & { items: Service[] };
  marketing: SectionHeading & {
    subtitle: string;
    hub: Cta;
    /** Tarjeta del hub (Marketing 360°), la primera de las 8. */
    hubCard: { title: string; hook: string; items: string[] };
    items: MarketingLine[];
  };
  calculator: SectionHeading & {
    subtitle: string;
    defaultHours: number;
    costPerHour: { default: number; min: number; max: number; step: number };
    cta: Cta;
  };
  results: SectionHeading & {
    cases: CaseStudy[];
    stats: { value: string; label: string }[];
    certifications: string[];
    testimonials: Testimonial[];
  };
  process: SectionHeading & {
    steps: ProcessStep[];
    guarantee: { title: string; body: string; cta: Cta };
  };
  shop: SectionHeading & { subtitle: string; cta: Cta; products: Product[] };
  blog: SectionHeading & { subtitle: string; cta: Cta; articles: Article[] };
  faq: SectionHeading & { items: Faq[] };
  contact: SectionHeading & {
    slots: { label: string; value: string; /** 0–100 */ progress: number };
    benefits: string[];
    person: { name: string; role: string; note: string };
    photoAlt: string;
    whatsappCta: string;
    whatsappMessage: string;
    /** Opciones de "¿Qué quieres mejorar primero?". */
    formOptions: { value: string; label: string }[];
  };
  business: {
    name: string;
    legalName: string;
    nit: string;
    email: string;
    /** Texto a mostrar; puede ser un marcador `[Teléfono]`. */
    phoneLabel: string;
    /** Sin número confirmado no se construye el enlace de WhatsApp. */
    whatsapp?: PhoneNumber;
    address: string;
    city: string;
    hours: string;
    googleBusinessUrl?: string;
  };
}

/** Puerto de salida: de dónde sale el contenido del home. */
export interface ContentRepository {
  getHome(): Promise<HomeContent>;
}
