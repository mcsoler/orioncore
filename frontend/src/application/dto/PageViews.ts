/** Vistas de las plantillas de página (servicio, hub, tienda, producto, artículo): solo texto, números y URLs. */

export interface LinkView {
  label: string;
  href: string;
}

export interface FaqView {
  title: string;
  items: { question: string; answer: string }[];
}

export interface PlanView {
  name: string;
  price: string;
  period?: string;
  badge?: string;
  items: string[];
  cta: string;
}

export interface PlansView {
  title: string;
  note: string;
  plans: PlanView[];
}

/** Cierre de página con el formulario corto (nombre + WhatsApp). */
export interface ContactBandView {
  title: string;
  text: string;
  submitLabel: string;
}

export interface ServicePageView {
  slug: string;
  /** Nombre corto del servicio (migas de pan, opción del formulario). */
  name: string;
  path: string;
  /** Meta description de la ruta (Service en JSON-LD). */
  description: string;
  badge?: string;
  hero: {
    title: { before: string; highlight: string; after: string };
    intro: string;
    /** href: ancla, ruta interna o `whatsapp`. */
    primaryCta: LinkView;
    secondaryCta: LinkView;
    rating: string;
    proof: string[];
    chat?: { name: string; status: string; messages: { from: 'client' | 'agent'; text: string }[] };
  };
  whatIs: { title: string; body: string; problems: string[] };
  howItWorks: { title: string; steps: { number: string; title: string; text: string }[] };
  features: { title: string; items: { title: string; text: string }[]; integrations: string[] };
  comparison: { title: string; columns: [string, string, string]; rows: [string, string, string][]; idealFor: string[] };
  pricing: PlansView;
  case: { chip: string; title: string; quote: string; author: string; photo: string; href: string };
  faq: FaqView;
  related: { services: LinkView[]; guides: LinkView[] };
  contact: ContactBandView;
}

export interface HubRowView {
  id: string;
  number: string;
  title: string;
  visual: string;
  heading: string;
  text: string;
  items: string[];
  cta: string;
  /** Página de la línea (o el formulario, para la estrategia 360°). */
  href: string;
}

export interface MarketingHubView {
  hero: {
    title: string;
    intro: { before: string; strong: string; after: string };
    primaryCta: LinkView;
    secondaryCta: LinkView;
    scarcity: string;
    stage: { reel: string; logo: string; post: string; metricLabel: string; metricValue: string };
  };
  rows: HubRowView[];
  plans: PlansView;
  faq: FaqView;
  contact: ContactBandView;
}

/** Producto en el catálogo (tarjeta y filtros). */
export interface CatalogItemView {
  slug: string;
  title: string;
  href: string;
  category: string;
  categorySlug: string;
  brand: string;
  badge?: string;
  /** `$1.299.000` o el marcador [PRECIO]. */
  price: string;
  /** Precio numérico para ordenar, filtrar y sumar; sin precio, undefined. */
  priceValue?: number;
  oldPrice?: string;
  installments: string;
  reviewsCount: string;
  stockLabel: string;
  inStock: boolean;
  fastShipping: boolean;
  installation: boolean;
  /** Orden de "Novedades". */
  isNew: boolean;
}

export interface PriceRangeView {
  label: string;
  min?: number;
  max?: number;
}

export interface TrustItemView {
  icon: string;
  title: string;
  text: string;
}

export interface ShopPageView {
  /** H1: el de la tienda o el nombre de la categoría. */
  title: string;
  intro: string;
  /** Pestañas: Todo + categorías (enlaces rastreables). */
  tabs: (LinkView & { current: boolean })[];
  /** "Todo" o el nombre de la categoría actual. */
  scope: string;
  items: CatalogItemView[];
  brands: string[];
  priceRanges: PriceRangeView[];
  combo: { chip: string; title: string; text: string; cta: LinkView; photo: string };
  seoText: { title: string; body: string };
  b2b: { title: string; text: string; cta: LinkView };
  trust: TrustItemView[];
}

/** Datos de la tienda que comparten el header, el carrito y la barra de envío gratis. */
export interface StoreView {
  /** Productos con precio para el carrito. */
  products: Pick<CatalogItemView, 'slug' | 'title' | 'href' | 'price' | 'priceValue'>[];
  freeShippingFrom?: number;
  paymentsLine: string;
  /** Producto sugerido en el carrito. */
  crossSell?: string;
}

export interface ProductPageView {
  slug: string;
  title: string;
  path: string;
  description: string;
  category: LinkView;
  brand: string;
  sku: string;
  badge?: string;
  rating: string;
  reviewsCount: string;
  price: string;
  priceValue?: number;
  oldPrice?: string;
  savings?: string;
  installments: string;
  benefits: string[];
  variants: string[];
  gallery: string[];
  stockNotice: { strong: string; text: string; day: string };
  perks: { icon: string; text: string }[];
  payments: string[];
  inStock: boolean;
  bundle?: { title: string; items: LinkView[]; slugs: string[]; total: string; savings: string };
  details: { description: string; specs: { label: string; value: string }[]; shipping: string; questions: { question: string; answer: string }[] };
  reviews: { average: string; count: string; distribution: { stars: number; percent: number }[]; items: { name: string; stars: number; text: string }[] };
  related: CatalogItemView[];
}

export interface ArticlePageView {
  slug: string;
  title: string;
  path: string;
  excerpt: string;
  category: string;
  chip: string;
  lead: string;
  author: { name: string; role: string; bio: string; href: string; linkedin?: string };
  published: string;
  updated: string;
  updatedIso: string;
  readingTime: string;
  image: string;
  quickAnswer: string;
  sections: { id: string; number: number; title: string; paragraphs: string[]; table?: { columns: string[]; rows: string[][] } }[];
  inlineCta: { after: string; title: string; text: string; label: string; href: string };
  related: LinkView[];
  sideCta: { title: string; text: string; label: string };
}
