import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import type { CatalogItemView, StoreView } from '../../../src/application/dto/PageViews';
import type { CartRepository } from '../../../src/application/ports/out/CartRepository';
import { AddToCart, GetCartSummary } from '../../../src/application/use-cases/AddToCart';
import { Cart } from '../../../src/domain/entities/Cart';
import CartButton from '../../../src/ui/islands/CartButton';
import CartDrawer from '../../../src/ui/islands/CartDrawer';
import CatalogBrowser from '../../../src/ui/islands/CatalogBrowser';
import FreeShippingBar from '../../../src/ui/islands/FreeShippingBar';
import ProductBuyBox from '../../../src/ui/islands/ProductBuyBox';
import ProductGallery from '../../../src/ui/islands/ProductGallery';
import StickyAddToCart from '../../../src/ui/islands/StickyAddToCart';
import { CART_OPEN, openCart } from '../../../src/ui/islands/cartEvents';

function memoryCart(initial = Cart.empty()): CartRepository {
  let cart = initial;
  return { load: () => cart, save: (c) => void (cart = c) };
}

const item = (slug: string, overrides: Partial<CatalogItemView> = {}): CatalogItemView => ({
  slug,
  title: `[${slug}]`,
  href: `/tienda/${slug}/`,
  category: 'Redes',
  categorySlug: 'redes',
  brand: '[Marca A]',
  price: '[PRECIO]',
  oldPrice: '[ANTES]',
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
  item('router', { badge: '-[X]%', fastShipping: true }),
  item('camara', { category: 'Seguridad', brand: '[Marca B]', installation: true }),
  item('facial', { category: 'Seguridad', brand: '[Marca B]', inStock: false, stockLabel: 'Bajo pedido · [N] días' }),
];

const store: StoreView = {
  products: [
    { slug: 'router', title: '[Router]', href: '/tienda/router/', price: '$400.000', priceValue: 400_000 },
    { slug: 'mouse', title: '[Kit teclado + mouse]', href: '/tienda/mouse/', price: '$100.000', priceValue: 100_000 },
  ],
  freeShippingFrom: 600_000,
  paymentsLine: 'PSE · Tarjeta · Nequi · Contraentrega',
  crossSell: 'mouse',
};

describe('CatalogBrowser', () => {
  function setup(repo = memoryCart(), query?: string) {
    const user = userEvent.setup();
    render(
      <CatalogBrowser
        items={items}
        brands={['[Marca A]', '[Marca B]']}
        priceRanges={[{ label: 'Hasta [$X]' }]}
        scope="Todo"
        addToCart={new AddToCart(repo)}
        {...(query !== undefined && { query })}
      />,
    );
    const cards = () => within(screen.getByRole('list', { name: 'Productos' })).getAllByRole('article');
    return { user, repo, cards };
  }

  it('muestra cada producto como en el diseño: categoría, nombre, precio, cuotas y stock', () => {
    const { cards } = setup();
    expect(cards()).toHaveLength(3);
    expect(screen.getByTestId('catalog-count')).toHaveTextContent('3 productos en Todo');
    const router = cards()[0]!;
    expect(within(router).getByRole('link', { name: '[router]' })).toHaveAttribute('href', '/tienda/router/');
    expect(router).toHaveTextContent('-[X]%');
    expect(router).toHaveTextContent('[PRECIO]');
    expect(router).toHaveTextContent('o [N] cuotas de [$X]');
    expect(within(router).getByRole('link', { name: 'Ver detalle: [router]' })).toBeInTheDocument();
  });

  it('filtra por stock, instalación y marca, y cuenta los resultados', async () => {
    const { user, cards } = setup();
    await user.click(screen.getByRole('checkbox', { name: 'En stock' }));
    expect(cards()).toHaveLength(2);
    await user.click(screen.getByRole('checkbox', { name: 'Incluye instalación' }));
    expect(cards()).toHaveLength(1);
    expect(screen.getByTestId('catalog-count')).toHaveTextContent('1 producto en Todo');
  });

  it('busca con el texto del buscador y permite quitar la búsqueda', async () => {
    const { user, cards } = setup(memoryCart(), 'seguridad');
    expect(cards()).toHaveLength(2);
    expect(screen.getByTestId('catalog-count')).toHaveTextContent('para “seguridad”');
    await user.click(screen.getByRole('button', { name: 'Quitar búsqueda' }));
    expect(cards()).toHaveLength(3);
  });

  it('sin resultados lo dice en lugar de mostrar una grilla vacía', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('checkbox', { name: '[Marca A]' }));
    await user.click(screen.getByRole('checkbox', { name: 'Incluye instalación' }));
    expect(screen.getByText('No encontramos productos con esos filtros.')).toBeInTheDocument();
  });

  it('"Agregar" suma una unidad al carrito', async () => {
    const { user, repo } = setup();
    await user.click(screen.getByRole('button', { name: 'Agregar al carrito: [router]' }));
    expect(repo.load().quantityOf('router')).toBe(1);
    expect(screen.getByRole('button', { name: 'Agregar al carrito: [router]' })).toHaveTextContent('✓ Agregado');
  });
});

describe('Carrito de la tienda', () => {
  it('"Carrito (N)" muestra las unidades y abre el carrito lateral', async () => {
    const repo = memoryCart(Cart.from({ router: 2 }));
    const reader = new GetCartSummary(repo);
    const user = userEvent.setup();
    render(
      <>
        <CartButton store={store} reader={reader} />
        <CartDrawer store={store} reader={reader} addToCart={new AddToCart(repo)} checkoutHref="https://wa.me/573054195433?text=Hola" />
      </>,
    );
    expect(screen.getByRole('button', { name: /Carrito \(2\)/ })).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).toBeNull();

    await user.click(screen.getByRole('button', { name: /Carrito \(2\)/ }));
    const dialog = screen.getByRole('dialog', { name: 'Tu carrito (2)' });
    expect(within(dialog).getByRole('link', { name: '[Router]' })).toHaveAttribute('href', '/tienda/router/');
    expect(within(dialog).getByText('x2')).toBeInTheDocument();
    expect(within(dialog).getByTestId('cart-subtotal')).toHaveTextContent('$800.000');
    expect(within(dialog).getByText('¡Tienes envío gratis!')).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: 'Cerrar carrito' })).toHaveFocus();
  });

  it('el pago se cierra con un asesor por WhatsApp con el detalle del pedido', async () => {
    const repo = memoryCart(Cart.from({ router: 1 }));
    render(<CartDrawer store={store} reader={new GetCartSummary(repo)} checkoutHref="https://wa.me/573054195433?text=Hola" />);
    act(() => openCart());
    const checkout = screen.getByRole('link', { name: 'Finalizar compra con un asesor' });
    const url = new URL(checkout.getAttribute('href')!);
    expect(url.origin + url.pathname).toBe('https://wa.me/573054195433');
    expect(url.searchParams.get('text')).toBe('Hola, quiero comprar: 1 × [Router].');
    expect(screen.getByText('PSE · Tarjeta · Nequi · Contraentrega')).toBeInTheDocument();
  });

  it('sugiere completar la compra y lo agrega al carrito', async () => {
    const repo = memoryCart(Cart.from({ router: 1 }));
    const user = userEvent.setup();
    render(<CartDrawer store={store} reader={new GetCartSummary(repo)} addToCart={new AddToCart(repo)} />);
    act(() => void window.dispatchEvent(new CustomEvent(CART_OPEN)));
    expect(screen.getByText('Completa tu compra')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Agregar al carrito: [Kit teclado + mouse]' }));
    expect(repo.load().quantityOf('mouse')).toBe(1);
    expect(screen.queryByText('Completa tu compra')).toBeNull();
  });

  it('Escape cierra el carrito; vacío, invita a ver la tienda', async () => {
    const user = userEvent.setup();
    render(<CartDrawer store={store} reader={new GetCartSummary(memoryCart())} />);
    act(() => openCart());
    expect(screen.getByText(/Tu carrito está vacío/)).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Finalizar compra con un asesor' })).toBeNull();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('la barra de envío gratis muestra cuánto falta, o el marcador si no hay monto definido', () => {
    const repo = memoryCart(Cart.from({ mouse: 3 }));
    const { unmount } = render(<FreeShippingBar store={store} reader={new GetCartSummary(repo)} />);
    expect(screen.getByText(/Te faltan/)).toHaveTextContent('Te faltan $300.000 para envío gratis');
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '50');
    unmount();

    render(<FreeShippingBar store={{ products: store.products }} reader={new GetCartSummary(repo)} />);
    expect(screen.getByText(/Te faltan/)).toHaveTextContent('Te faltan [$X] para envío gratis');
  });
});

describe('Ficha de producto', () => {
  it('la galería cambia la imagen principal con las miniaturas', async () => {
    const user = userEvent.setup();
    render(<ProductGallery shots={['Foto principal', 'Foto en uso', 'Video 15 s']} badge="-[X]%" />);
    expect(screen.getByTestId('gallery-main')).toHaveTextContent('[Foto principal]');
    await user.click(screen.getByRole('button', { name: 'Video 15 s' }));
    expect(screen.getByTestId('gallery-main')).toHaveTextContent('[Video 15 s]');
    expect(screen.getByRole('button', { name: 'Video 15 s' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('presentación y cantidad: agrega las unidades elegidas, abre el carrito y avisa a la barra fija', async () => {
    const repo = memoryCart();
    const user = userEvent.setup();
    const opened: Event[] = [];
    window.addEventListener(CART_OPEN, (e) => opened.push(e));
    render(
      <>
        <ProductBuyBox slug="router" title="[Router]" variants={['1 nodo', 'Pack x2', 'Pack x3']} addToCart={new AddToCart(repo)} />
        <StickyAddToCart slug="router" title="[Router]" price="[PRECIO]" variant="Pack x2" addToCart={new AddToCart(repo)} />
      </>,
    );
    expect(screen.getByRole('button', { name: 'Pack x2' })).toHaveAttribute('aria-pressed', 'true');
    await user.click(screen.getByRole('button', { name: 'Pack x3' }));
    expect(screen.getByText('Presentación:').parentElement).toHaveTextContent('Presentación: Pack x3');

    await user.click(screen.getByRole('button', { name: 'Sumar' }));
    await user.click(screen.getByRole('button', { name: 'Sumar' }));
    await user.click(screen.getByRole('button', { name: 'Restar' }));
    expect(screen.getByTestId('quantity')).toHaveTextContent('2');

    await user.click(screen.getByRole('button', { name: 'Agregar al carrito: [Router]' }));
    expect(repo.load().quantityOf('router')).toBe(2);
    expect(opened).toHaveLength(1);

    // La barra fija inferior sigue la elección de arriba
    const sticky = document.querySelector('[data-sticky-cart]') as HTMLElement;
    expect(sticky).toHaveTextContent('Pack x3');
    await user.click(within(sticky).getByRole('button', { name: 'Agregar al carrito' }));
    expect(repo.load().quantityOf('router')).toBe(4);
  });

  it('la cantidad no baja de 1 y "Comprar ahora" también agrega', async () => {
    const repo = memoryCart();
    const user = userEvent.setup();
    render(<ProductBuyBox slug="mouse" title="[Mouse]" variants={[]} addToCart={new AddToCart(repo)} />);
    await user.click(screen.getByRole('button', { name: 'Restar' }));
    expect(screen.getByTestId('quantity')).toHaveTextContent('1');
    expect(screen.queryByText('Presentación:')).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Comprar ahora' }));
    expect(repo.load().quantityOf('mouse')).toBe(1);
  });
});
