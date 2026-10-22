import type { Article } from '../../../domain/entities/Article';
import type { MarketingLine } from '../../../domain/entities/MarketingLine';
import type { Product, ShopCategory } from '../../../domain/entities/Product';
import type { Service } from '../../../domain/entities/Service';
import type { ShippingPolicy } from '../../../domain/value-objects/ShippingPolicy';
import type { Cta } from './ContentRepository';

type Plans = { title: string; note: string; plans: { name: string; price: string; period?: string; badge?: string; items: string[]; cta: string }[] };
type Faq = { title: string; items: { question: string; answer: string }[] };
type ContactBand = { title: string; text: string; submitLabel: string };

export interface ServicePageContent {
  hero: {
    title: { before: string; highlight: string; after: string };
    intro: string;
    primaryCta: Cta;
    secondaryCta: Cta;
    rating: string;
    proof: string[];
    chat?: { name: string; status: string; messages: { from: 'client' | 'agent'; text: string }[] };
  };
  whatIs: { title: string; body: string; problems: string[] };
  howItWorks: { title: string; steps: { title: string; text: string }[] };
  features: { title: string; items: { title: string; text: string }[]; integrations: string[] };
  comparison: { title: string; columns: [string, string, string]; rows: [string, string, string][]; idealFor: string[] };
  pricing: Plans;
  case: { chip: string; title: string; quote: string; author: string; photo: string };
  faq: Faq;
  related: { services: Cta[]; guides: Cta[] };
  contact: ContactBand;
}

export interface MarketingHubContent {
  hero: {
    title: string;
    intro: { before: string; strong: string; after: string };
    primaryCta: Cta;
    secondaryCta: Cta;
    scarcity: string;
    stage: { reel: string; logo: string; post: string; metricLabel: string; metricValue: string };
  };
  strategy: { id: string; title: string; visual: string; heading: string; text: string; items: string[]; cta: string };
  lines: { line: MarketingLine; hub: { visual: string; heading: string; text: string; items: string[]; cta: string } }[];
  plans: Plans;
  faq: Faq;
  contact: ContactBand;
}

export interface ProductDetails {
  sku: string;
  benefits?: string[];
  variants?: string[];
  specs?: { label: string; value: string }[];
  questions?: { question: string; answer: string }[];
  bundle?: string[];
}

export interface ShopContent {
  page: {
    title: string;
    intro: string;
    combo: { chip: string; title: string; text: string; cta: Cta; photo: string };
    seoText: { title: string; body: string };
    b2b: { title: string; text: string; cta: Cta };
    priceRanges: { label: string; min: number | null; max: number | null }[];
    trust: { icon: string; title: string; text: string }[];
    payments: string[];
    paymentsLine: string;
  };
  shipping: ShippingPolicy;
  /** Plantilla de la ficha de producto: lo que aún no es propio de cada producto. */
  productTemplate: {
    gallery: string[];
    rating: string;
    reviewsCount: string;
    installments: string;
    cardInstallments: string;
    stockNotice: { strong: string; text: string; day: string };
    perks: { icon: string; text: string }[];
    description: string;
    shipping: string;
    questions: { question: string; answer: string }[];
    reviews: { distribution: number[]; items: { name: string; stars: number; text: string }[] };
    bundle: { title: string; extras: string[]; total: string; savings: string };
    crossSell: string;
  };
  categories: { category: ShopCategory; description: string; seoText: { title: string; body: string } }[];
  products: { product: Product; details: ProductDetails }[];
}

export interface ArticleContent {
  article: Article;
  body: {
    chip: string;
    lead: string;
    author: string;
    published: string;
    updated: string;
    updatedIso: string;
    image: string;
    quickAnswer: string;
    sections: { id: string; title: string; paragraphs: string[]; table?: { columns: string[]; rows: string[][] } }[];
    inlineCta: { after: string; title: string; text: string; label: string; href: string };
    related: string[];
  };
}

export interface BlogContent {
  articles: ArticleContent[];
  authors: Record<string, { name: string; role: string; bio: string; href: string; linkedin: string | null }>;
  sideCta: { title: string; text: string; label: string };
}

/** Puerto de salida: el contenido de las plantillas de página (servicio, hub, tienda, blog). */
export interface PageContentRepository {
  /** undefined si el servicio no tiene página (p. ej. Marketing 360° vive en el hub). */
  getServicePage(slug: string): { service: Service; page: ServicePageContent } | undefined;
  getMarketingHub(): MarketingHubContent;
  getShop(): ShopContent;
  getBlog(): BlogContent;
}
