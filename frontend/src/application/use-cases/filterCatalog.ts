import type { CatalogItemView, PriceRangeView } from '../dto/PageViews';

export const SORTS = [
  { value: 'best', label: 'Más vendidos' },
  { value: 'price-asc', label: 'Menor precio' },
  { value: 'price-desc', label: 'Mayor precio' },
  { value: 'new', label: 'Novedades' },
] as const;
export type CatalogSort = (typeof SORTS)[number]['value'];

export interface CatalogCriteria {
  query?: string;
  inStock?: boolean;
  fastShipping?: boolean;
  installation?: boolean;
  brands?: readonly string[];
  priceRange?: PriceRangeView;
  sort?: CatalogSort;
}

const normalize = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

/**
 * Filtros y orden del catálogo (en el navegador, sin URLs nuevas que indexar).
 * Los productos sin precio no se descartan por rango de precio: aún no tienen uno.
 */
export function filterCatalog(items: readonly CatalogItemView[], criteria: CatalogCriteria = {}): CatalogItemView[] {
  const words = normalize(criteria.query ?? '').split(/\s+/).filter(Boolean);
  const { min = 0, max = Infinity } = criteria.priceRange ?? {};

  const filtered = items.filter((item) => {
    const haystack = normalize(`${item.title} ${item.category} ${item.brand}`);
    if (!words.every((word) => haystack.includes(word))) return false;
    if (criteria.inStock && !item.inStock) return false;
    if (criteria.fastShipping && !item.fastShipping) return false;
    if (criteria.installation && !item.installation) return false;
    if (criteria.brands?.length && !criteria.brands.includes(item.brand)) return false;
    if (item.priceValue !== undefined && (item.priceValue < min || item.priceValue > max)) return false;
    return true;
  });

  return sortCatalog(filtered, criteria.sort ?? 'best');
}

function sortCatalog(items: CatalogItemView[], sort: CatalogSort): CatalogItemView[] {
  // Sin precio, al final en cualquier orden por precio
  const byPrice = (direction: 1 | -1) => (a: CatalogItemView, b: CatalogItemView) =>
    (a.priceValue === undefined ? 1 : 0) - (b.priceValue === undefined ? 1 : 0) ||
    direction * ((a.priceValue ?? 0) - (b.priceValue ?? 0));

  switch (sort) {
    case 'price-asc':
      return [...items].sort(byPrice(1));
    case 'price-desc':
      return [...items].sort(byPrice(-1));
    case 'new':
      return [...items].sort((a, b) => Number(b.isNew) - Number(a.isNew));
    default:
      return items;
  }
}
