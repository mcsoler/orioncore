import { useEffect, useId, useState } from 'react';
import type { CatalogItemView, PriceRangeView } from '../../application/dto/PageViews';
import type { AddToCart } from '../../application/use-cases/AddToCart';
import { SORTS, filterCatalog, type CatalogSort } from '../../application/use-cases/filterCatalog';
import { interactiveUseCases } from '../../composition/interactive';
import { notifyCartChanged } from './cartEvents';

export interface CatalogBrowserProps {
  items: CatalogItemView[];
  brands: string[];
  priceRanges: PriceRangeView[];
  /** "Todo" o la categoría actual. */
  scope: string;
  addToCart?: Pick<AddToCart, 'execute'>;
  /** Búsqueda inicial; por defecto, el parámetro ?q= de la URL. */
  query?: string;
}

const check = 'flex items-center gap-2.5 min-h-9 text-[15px] text-white/70 cursor-pointer';

/**
 * Catálogo con filtros, orden y búsqueda en el navegador. El HTML del servidor trae todos
 * los productos (rastreables); los filtros no crean URLs nuevas que indexar.
 */
export default function CatalogBrowser({ items, brands, priceRanges, scope, addToCart, query: initialQuery }: CatalogBrowserProps) {
  const id = useId();
  const [query, setQuery] = useState(initialQuery ?? '');
  const [inStock, setInStock] = useState(false);
  const [fastShipping, setFastShipping] = useState(false);
  const [installation, setInstallation] = useState(false);
  const [selectedBrands, setBrands] = useState<string[]>([]);
  const [range, setRange] = useState<number | undefined>();
  const [sort, setSort] = useState<CatalogSort>('best');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [added, setAdded] = useState<string | undefined>();

  useEffect(() => {
    if (initialQuery !== undefined) return;
    const q = new URLSearchParams(window.location.search).get('q');
    if (q) setQuery(q);
  }, []);

  const visible = filterCatalog(items, {
    query,
    inStock,
    fastShipping,
    installation,
    brands: selectedBrands,
    ...(range !== undefined && { priceRange: priceRanges[range] }),
    sort,
  });

  function add(item: CatalogItemView) {
    (addToCart ?? interactiveUseCases().addToCart).execute(item.slug);
    notifyCartChanged();
    setAdded(item.slug);
  }

  const toggleBrand = (brand: string, on: boolean) =>
    setBrands((current) => (on ? [...current, brand] : current.filter((b) => b !== brand)));

  return (
    <div className="flex flex-col lg:flex-row gap-7 items-start">
      <button
        type="button"
        className="btn-ghost lg:hidden w-full"
        aria-expanded={filtersOpen}
        aria-controls={`${id}-filtros`}
        onClick={() => setFiltersOpen((o) => !o)}
      >
        {filtersOpen ? 'Ocultar filtros' : 'Filtrar productos'}
      </button>
      <aside
        id={`${id}-filtros`}
        aria-label="Filtros"
        className={`card p-5 flex-col gap-[18px] w-full lg:w-[260px] lg:shrink-0 ${filtersOpen ? 'flex' : 'hidden lg:flex'}`}
      >
        <strong className="text-base">Filtrar</strong>
        <fieldset>
          <legend className="font-semibold mb-1.5">Disponibilidad</legend>
          <label className={check}>
            <input type="checkbox" className="accent-brand-blue" checked={inStock} onChange={(e) => setInStock(e.target.checked)} />
            En stock
          </label>
          <label className={check}>
            <input type="checkbox" className="accent-brand-blue" checked={fastShipping} onChange={(e) => setFastShipping(e.target.checked)} />
            Envío en 24 h
          </label>
        </fieldset>
        <fieldset>
          <legend className="font-semibold mb-1.5">Precio</legend>
          {priceRanges.map((r, i) => (
            <label key={r.label} className={check}>
              <input type="radio" name={`${id}-precio`} className="accent-brand-blue" checked={range === i} onChange={() => setRange(i)} />
              {r.label}
            </label>
          ))}
          {range !== undefined && (
            <button type="button" className="text-link text-sm" onClick={() => setRange(undefined)}>
              Quitar filtro de precio
            </button>
          )}
        </fieldset>
        <fieldset>
          <legend className="font-semibold mb-1.5">Marca</legend>
          {brands.map((brand) => (
            <label key={brand} className={check}>
              <input
                type="checkbox"
                className="accent-brand-blue"
                checked={selectedBrands.includes(brand)}
                onChange={(e) => toggleBrand(brand, e.target.checked)}
              />
              {brand}
            </label>
          ))}
        </fieldset>
        <fieldset>
          <legend className="font-semibold mb-1.5">Servicio</legend>
          <label className={check}>
            <input type="checkbox" className="accent-brand-blue" checked={installation} onChange={(e) => setInstallation(e.target.checked)} />
            Incluye instalación
          </label>
        </fieldset>
      </aside>

      <div className="flex-1 min-w-0 w-full flex flex-col gap-[18px]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-white/70" role="status" data-testid="catalog-count">
            {visible.length} {visible.length === 1 ? 'producto' : 'productos'} en <strong className="text-white">{scope}</strong>
            {query && (
              <>
                {' '}
                para “{query}”{' '}
                <button type="button" className="text-link text-sm" onClick={() => setQuery('')}>
                  Quitar búsqueda
                </button>
              </>
            )}
          </p>
          <label className="flex items-center gap-2 text-sm text-white/70">
            Ordenar
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as CatalogSort)}
              className="bg-surface text-white border border-line rounded-[10px] min-h-[42px] px-2.5"
            >
              {SORTS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {visible.length === 0 ? (
          <p className="card p-6 text-white/70">No encontramos productos con esos filtros.</p>
        ) : (
          <ul className="grid gap-[18px] sm:grid-cols-2 xl:grid-cols-3" aria-label="Productos">
            {visible.map((item) => (
              <li key={item.slug}>
                <article className="card p-3.5 flex flex-col gap-[9px] h-full" data-product={item.slug}>
                  <a href={item.href} tabIndex={-1} aria-hidden="true" className="ph relative h-[190px]">
                    {item.badge && (
                      <span className="absolute top-2.5 left-2.5 bg-brand-blue text-white text-xs font-bold px-2 py-1 rounded-md">{item.badge}</span>
                    )}
                    [Foto · {item.category}]
                  </a>
                  <span className="text-xs uppercase tracking-[0.08em] text-white/70">{item.category}</span>
                  <h3 className="text-base font-semibold leading-snug font-inter">
                    <a href={item.href} className="text-white hover:underline underline-offset-4">
                      {item.title}
                    </a>
                  </h3>
                  <p className="text-[13px] text-white/70">
                    <span className="text-brand-cyan" aria-hidden="true">
                      ★★★★★
                    </span>{' '}
                    ({item.reviewsCount})
                  </p>
                  <p className="flex flex-wrap items-baseline gap-2">
                    <span className="font-poppins text-[22px] font-bold">{item.price}</span>
                    {item.oldPrice && <s className="text-[13px] text-white/70">{item.oldPrice}</s>}
                  </p>
                  <p className="text-[13px] text-white/70">{item.installments}</p>
                  <p className={`text-[13px] ${item.inStock ? 'text-success' : 'text-amber'}`}>{item.stockLabel}</p>
                  <div className="mt-auto flex gap-2">
                    <button type="button" className="btn-primary flex-1 min-h-11" onClick={() => add(item)} aria-label={`Agregar al carrito: ${item.title}`}>
                      {added === item.slug ? '✓ Agregado' : 'Agregar'}
                    </button>
                    <a href={item.href} className="btn-ghost min-h-11 w-11 px-0" aria-label={`Ver detalle: ${item.title}`}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                        <path d="M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0 M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6" />
                      </svg>
                    </a>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
