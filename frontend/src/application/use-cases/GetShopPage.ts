import type { CatalogItemView, ShopPageView, StoreView } from '../dto/PageViews';
import type { PageContentRepository, ShopContent } from '../ports/out/PageContentRepository';
import { RouteNotFoundError } from '../../domain/errors/DomainError';
import { PRICE_PENDING } from './GetHomeContent';

/** Precio anterior aún no definido. */
export const OLD_PRICE_PENDING = '[ANTES]';

/** Catálogo de la tienda: /tienda/ (todo) o /tienda/{categoria}/. */
export class GetShopPage {
  constructor(private readonly content: PageContentRepository) {}

  execute(categorySlug?: string): ShopPageView {
    const shop = this.content.getShop();
    const current = categorySlug ? shop.categories.find((c) => c.category.slug.value === categorySlug) : undefined;
    if (categorySlug && !current) throw new RouteNotFoundError(`/tienda/${categorySlug}/`);

    const all = catalogItems(shop);
    const items = current ? all.filter((item) => item.categorySlug === categorySlug) : all;

    return {
      title: current?.category.title ?? shop.page.title,
      intro: current?.description ?? shop.page.intro,
      tabs: [
        { label: 'Todo', href: '/tienda/', current: !current },
        ...shop.categories.map(({ category }) => ({
          label: category.title,
          href: category.href,
          current: category === current?.category,
        })),
      ],
      scope: current?.category.title ?? 'Todo',
      items,
      brands: [...new Set(items.map((item) => item.brand))],
      priceRanges: shop.page.priceRanges.map((r) => ({
        label: r.label,
        ...(r.min !== null && { min: r.min }),
        ...(r.max !== null && { max: r.max }),
      })),
      combo: shop.page.combo,
      seoText: current?.seoText ?? shop.page.seoText,
      b2b: shop.page.b2b,
      trust: shop.page.trust,
    };
  }
}

/** Lo que necesitan el header de la tienda, el carrito y la barra de envío gratis. */
export class GetStore {
  constructor(private readonly content: PageContentRepository) {}

  execute(): StoreView {
    const shop = this.content.getShop();
    return {
      products: catalogItems(shop).map(({ slug, title, href, price, priceValue }) => ({
        slug,
        title,
        href,
        price,
        ...(priceValue !== undefined && { priceValue }),
      })),
      ...(shop.shipping.freeFrom && { freeShippingFrom: shop.shipping.freeFrom.amount }),
      paymentsLine: shop.page.paymentsLine,
      crossSell: shop.productTemplate.crossSell,
    };
  }
}

export function catalogItems(shop: ShopContent): CatalogItemView[] {
  const categoryTitle = new Map(shop.categories.map(({ category }) => [category.slug.value, category.title]));
  return shop.products.map(({ product }) => ({
    slug: product.slug.value,
    title: product.title,
    href: product.href,
    category: categoryTitle.get(product.category.value) ?? product.category.value,
    categorySlug: product.category.value,
    brand: product.brand ?? '[MARCA]',
    ...(product.badge && { badge: product.badge }),
    price: product.price?.format() ?? PRICE_PENDING,
    ...(product.price && { priceValue: product.price.amount }),
    // Sin precio, el precio anterior también queda pendiente (como en el diseño)
    ...(product.price ? product.oldPrice && { oldPrice: product.oldPrice.format() } : { oldPrice: OLD_PRICE_PENDING }),
    installments: shop.productTemplate.cardInstallments,
    reviewsCount: shop.productTemplate.reviewsCount,
    stockLabel: product.stockLabel ?? (product.inStock ? 'En stock' : 'Bajo pedido'),
    inStock: product.inStock,
    fastShipping: product.fastShipping,
    installation: product.installation,
    isNew: product.badge === 'Nuevo',
  }));
}
