import type { HomeContent } from '../ports/out/ContentRepository';

export interface LinkCardView {
  title: string;
  description: string;
  href: string;
}

export interface ServiceView extends LinkCardView {
  items: readonly string[];
  badge?: string;
  headline?: string;
  cta?: string;
}

export interface ProductView extends LinkCardView {
  /** `$1.299.000` o el texto de precio pendiente. */
  price: string;
}

export interface CaseView extends LinkCardView {
  result: string;
}

/** Datos listos para pintar el home: solo texto, números y URLs (sin entidades). */
export interface HomeViewModel {
  announcement: HomeContent['announcement'];
  hero: HomeContent['hero'];
  clients: HomeContent['clients'];
  pains: HomeContent['pains'];
  services: { title: string; subtitle: string; ctaLabel: string; items: ServiceView[] };
  marketing: { title: string; subtitle: string; hub: HomeContent['marketing']['hub']; items: ServiceView[] };
  calculator: HomeContent['calculator'];
  results: {
    title: string;
    cases: CaseView[];
    stats: HomeContent['results']['stats'];
    certifications: string[];
    testimonials: { quote: string; author: string; company?: string }[];
  };
  process: { title: string; steps: { order: number; title: string; description: string }[]; guarantee: string };
  shop: { title: string; cta: HomeContent['shop']['cta']; products: ProductView[] };
  blog: { title: string; cta: HomeContent['blog']['cta']; articles: LinkCardView[] };
  faq: { title: string; items: { question: string; answer: string }[] };
  contact: HomeContent['contact'];
  business: Omit<HomeContent['business'], 'whatsapp'> & { whatsapp?: string };
}
