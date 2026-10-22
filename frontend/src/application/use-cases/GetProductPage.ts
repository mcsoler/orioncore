import type { ProductPageView } from '../dto/PageViews';
import type { PageContentRepository } from '../ports/out/PageContentRepository';
import { RouteNotFoundError } from '../../domain/errors/DomainError';
import { PRICE_PENDING } from './GetHomeContent';
import { OLD_PRICE_PENDING, catalogItems } from './GetShopPage';

/** Ahorro aún no definido. */
export const SAVINGS_PENDING = '[$X]';
const RELATED = 4;

/** Ficha de producto: /tienda/{producto}/. Lo que el producto no define sale de la plantilla de la tienda. */
export class GetProductPage {
  constructor(private readonly content: PageContentRepository) {}

  execute(slug: string): ProductPageView {
    const shop = this.content.getShop();
    const entry = shop.products.find(({ product }) => product.slug.value === slug);
    if (!entry) throw new RouteNotFoundError(`/tienda/${slug}/`);
    const { product, details } = entry;
    const template = shop.productTemplate;
    const category = shop.categories.find(({ category: c }) => c.slug.equals(product.category))?.category;
    const items = catalogItems(shop);
    const bySlug = new Map(items.map((item) => [item.slug, item]));

    const bundleProducts = (details.bundle ?? []).map((s) => bySlug.get(s)).filter((item) => item !== undefined);
    const savings = product.savings?.format() ?? (product.price ? undefined : SAVINGS_PENDING);

    return {
      slug,
      title: product.title,
      path: product.href,
      description: product.description,
      category: { label: category?.title ?? product.category.value, href: category?.href ?? '/tienda/' },
      brand: product.brand ?? '[MARCA]',
      sku: details.sku,
      ...(product.badge && { badge: product.badge }),
      rating: template.rating,
      reviewsCount: template.reviewsCount,
      price: product.price?.format() ?? PRICE_PENDING,
      ...(product.price && { priceValue: product.price.amount }),
      ...(product.price ? product.oldPrice && { oldPrice: product.oldPrice.format() } : { oldPrice: OLD_PRICE_PENDING }),
      ...(savings && { savings }),
      installments: template.installments,
      benefits: details.benefits ?? ['[Beneficio 1]', '[Beneficio 2]', '[Beneficio 3]'],
      variants: details.variants ?? [],
      gallery: template.gallery,
      stockNotice: template.stockNotice,
      perks: template.perks,
      payments: shop.page.payments,
      inStock: product.inStock,
      ...(bundleProducts.length > 0 && {
        bundle: {
          title: template.bundle.title,
          items: [
            { label: 'Este producto', href: product.href },
            ...bundleProducts.map((item) => ({ label: item.title, href: item.href })),
            ...template.bundle.extras.map((label) => ({ label, href: '' })),
          ],
          slugs: [slug, ...bundleProducts.map((item) => item.slug)],
          total: template.bundle.total,
          savings: template.bundle.savings,
        },
      }),
      details: {
        description: product.description.includes('[Descripción del producto]') ? template.description : product.description,
        specs: details.specs ?? [
          { label: 'Marca', value: product.brand ?? '[MARCA]' },
          { label: 'Garantía', value: '[N] meses' },
          { label: 'En la caja', value: '[Contenido]' },
        ],
        shipping: template.shipping,
        questions: details.questions ?? template.questions,
      },
      reviews: {
        average: template.rating,
        count: template.reviewsCount,
        distribution: template.reviews.distribution.map((percent, i) => ({ stars: 5 - i, percent })),
        items: template.reviews.items,
      },
      // Primero los de la misma categoría, después el resto del catálogo
      related: [
        ...items.filter((item) => item.slug !== slug && item.categorySlug === product.category.value),
        ...items.filter((item) => item.slug !== slug && item.categorySlug !== product.category.value),
      ].slice(0, RELATED),
    };
  }
}
