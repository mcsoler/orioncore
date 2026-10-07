import type { HomeContent } from '../ports/out/ContentRepository';
import type { SlotsView } from './SlotsView';

export interface LinkCardView {
  title: string;
  description: string;
  href: string;
}

export interface ServiceView extends LinkCardView {
  /** "01", "02"… según el orden oficial. */
  number: string;
  items: readonly string[];
  /** `#contacto`, otra ancla del home o `whatsapp`. */
  ctaHref: string;
  badge?: string;
  headline?: string;
  cta?: string;
  linkLabel?: string;
}

export interface MarketingCardView {
  number: string;
  title: string;
  hook: string;
  items: readonly string[];
  href: string;
}

export interface ProductView extends LinkCardView {
  slug: string;
  /** `$1.299.000` o el marcador de precio pendiente. */
  price: string;
  oldPrice?: string;
  badge?: string;
  stock?: string;
}

export interface CaseView extends LinkCardView {
  result: string;
  tag?: string;
  quote?: string;
  quoteAuthor?: string;
}

export interface ArticleView extends LinkCardView {
  category?: string;
  readingTime?: string;
}

/** Datos listos para pintar el home: solo texto, números y URLs (sin entidades). */
export interface HomeViewModel {
  slots: SlotsView;
  announcement: HomeContent['announcement'];
  hero: HomeContent['hero'];
  clients: HomeContent['clients'];
  pains: HomeContent['pains'];
  services: { eyebrow: string; title: string; items: ServiceView[] };
  marketing: { eyebrow: string; title: string; subtitle: string; hub: HomeContent['marketing']['hub']; cards: MarketingCardView[] };
  calculator: HomeContent['calculator'];
  results: {
    eyebrow: string;
    title: string;
    cases: CaseView[];
    stats: HomeContent['results']['stats'];
    certifications: string[];
    testimonials: { quote: string; author: string; company?: string }[];
  };
  process: {
    eyebrow: string;
    title: string;
    steps: { order: number; number: string; title: string; description: string }[];
    guarantee: HomeContent['process']['guarantee'];
  };
  shop: { eyebrow: string; title: string; subtitle: string; cta: HomeContent['shop']['cta']; products: ProductView[] };
  blog: { eyebrow: string; title: string; subtitle: string; cta: HomeContent['blog']['cta']; articles: ArticleView[] };
  faq: { eyebrow: string; title: string; items: { question: string; answer: string }[] };
  contact: HomeContent['contact'];
  business: Omit<HomeContent['business'], 'whatsapp'> & { whatsapp?: string };
}
