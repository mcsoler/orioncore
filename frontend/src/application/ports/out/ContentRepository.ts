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

export interface TitledText {
  title: string;
  description: string;
}

/** Contenido del home ya convertido a entidades del dominio. */
export interface HomeContent {
  announcement: { text: string; cta: Cta };
  hero: {
    /** H1 con la palabra clave. */
    title: string;
    /** Gancho visual (no es el H1). */
    hook: string;
    subtitle: string;
    primaryCta: Cta;
    secondaryCta: Cta;
    microcopy: string;
    socialProof: string;
  };
  clients: { title: string; logos: string[] };
  pains: { title: string; items: TitledText[]; closing: string };
  services: { title: string; subtitle: string; ctaLabel: string; items: Service[] };
  marketing: { title: string; subtitle: string; hub: Cta; items: MarketingLine[] };
  calculator: {
    title: string;
    subtitle: string;
    defaultHours: number;
    costPerHour: { default: number; min: number; max: number; step: number };
    cta: Cta;
  };
  results: {
    title: string;
    cases: CaseStudy[];
    stats: { value: string; label: string }[];
    certifications: string[];
    testimonials: Testimonial[];
  };
  process: { title: string; steps: ProcessStep[]; guarantee: string };
  shop: { title: string; cta: Cta; products: Product[] };
  blog: { title: string; cta: Cta; articles: Article[] };
  faq: { title: string; items: Faq[] };
  contact: {
    title: string;
    slots: string;
    benefits: string[];
    photoAlt: string;
    whatsappMessage: string;
  };
  business: {
    name: string;
    legalName: string;
    email: string;
    /** Texto a mostrar; puede ser un marcador `[Teléfono]`. */
    phoneLabel: string;
    /** Sin número confirmado no se construye el enlace de WhatsApp. */
    whatsapp?: PhoneNumber;
    address: string;
    city: string;
    googleBusinessUrl?: string;
  };
}

/** Puerto de salida: de dónde sale el contenido del home. */
export interface ContentRepository {
  getHome(): Promise<HomeContent>;
}
