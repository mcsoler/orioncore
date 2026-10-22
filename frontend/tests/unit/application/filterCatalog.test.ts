import { describe, expect, it } from 'vitest';
import type { CatalogItemView } from '../../../src/application/dto/PageViews';
import { filterCatalog } from '../../../src/application/use-cases/filterCatalog';

const item = (slug: string, overrides: Partial<CatalogItemView> = {}): CatalogItemView => ({
  slug,
  title: slug,
  href: `/tienda/${slug}/`,
  category: 'Redes',
  categorySlug: 'redes',
  brand: 'Marca A',
  price: '[PRECIO]',
  installments: 'o [N] cuotas de [$X]',
  reviewsCount: '[N]',
  stockLabel: 'En stock',
  inStock: true,
  fastShipping: false,
  installation: false,
  isNew: false,
  ...overrides,
});

const items = [
  item('router', { title: 'Router Wi‑Fi 6', priceValue: 400_000, fastShipping: true }),
  item('camara', { title: 'Cámara IP exterior', category: 'Seguridad', brand: 'Marca B', priceValue: 250_000, installation: true, isNew: true }),
  item('facial', { title: 'Control de acceso facial', category: 'Seguridad', brand: 'Marca B', inStock: false }),
  item('laptop', { title: 'Laptop 14"', category: 'Laptops', priceValue: 3_000_000 }),
];
const slugs = (list: CatalogItemView[]) => list.map((i) => i.slug);

describe('filterCatalog', () => {
  it('sin criterios devuelve todo en el orden original (más vendidos)', () => {
    expect(slugs(filterCatalog(items))).toEqual(['router', 'camara', 'facial', 'laptop']);
  });

  it('busca por nombre, categoría o marca, sin importar tildes ni mayúsculas', () => {
    expect(slugs(filterCatalog(items, { query: 'camara' }))).toEqual(['camara']);
    expect(slugs(filterCatalog(items, { query: 'SEGURIDAD' }))).toEqual(['camara', 'facial']);
    expect(slugs(filterCatalog(items, { query: 'marca b acceso' }))).toEqual(['facial']);
  });

  it('filtra por disponibilidad, envío en 24 h, instalación y marca', () => {
    expect(slugs(filterCatalog(items, { inStock: true }))).toEqual(['router', 'camara', 'laptop']);
    expect(slugs(filterCatalog(items, { fastShipping: true }))).toEqual(['router']);
    expect(slugs(filterCatalog(items, { installation: true }))).toEqual(['camara']);
    expect(slugs(filterCatalog(items, { brands: ['Marca B'] }))).toEqual(['camara', 'facial']);
  });

  it('el rango de precio no descarta productos sin precio (aún no tienen uno)', () => {
    expect(slugs(filterCatalog(items, { priceRange: { label: 'Hasta $500.000', max: 500_000 } }))).toEqual(['router', 'camara', 'facial']);
    expect(slugs(filterCatalog(items, { priceRange: { label: 'Más de $1.000.000', min: 1_000_000 } }))).toEqual(['facial', 'laptop']);
  });

  it('ordena por precio (sin precio al final) y por novedades', () => {
    expect(slugs(filterCatalog(items, { sort: 'price-asc' }))).toEqual(['camara', 'router', 'laptop', 'facial']);
    expect(slugs(filterCatalog(items, { sort: 'price-desc' }))).toEqual(['laptop', 'router', 'camara', 'facial']);
    expect(slugs(filterCatalog(items, { sort: 'new' }))[0]).toBe('camara');
  });
});
