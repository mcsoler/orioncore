import { useEffect, useRef, useState } from 'react';
import type { AddToCart } from '../../application/use-cases/AddToCart';
import type { StoreView } from '../../application/dto/PageViews';
import { interactiveUseCases } from '../../composition/interactive';
import { CART_OPEN, notifyCartChanged } from './cartEvents';
import FreeShippingBar from './FreeShippingBar';
import { useCartSummary, type CartSummaryReader } from './useCart';

export interface CartDrawerProps {
  store: StoreView;
  /**
   * Enlace de WhatsApp de la empresa: mientras no haya pasarela de pago,
   * el pedido se cierra con un asesor (el mensaje lleva el detalle del carrito).
   */
  checkoutHref?: string;
  reader?: CartSummaryReader;
  addToCart?: Pick<AddToCart, 'execute'>;
}

/** Carrito lateral de la tienda: envío gratis, productos, sugerido y subtotal. */
export default function CartDrawer({ store, checkoutHref, reader, addToCart }: CartDrawerProps) {
  const [open, setOpen] = useState(false);
  const summary = useCartSummary(store, reader);
  const closeButton = useRef<HTMLButtonElement>(null);
  const opener = useRef<Element | null>(null);
  const bySlug = new Map(store.products.map((p) => [p.slug, p]));

  useEffect(() => {
    const show = () => {
      opener.current = document.activeElement;
      setOpen(true);
    };
    window.addEventListener(CART_OPEN, show);
    return () => window.removeEventListener(CART_OPEN, show);
  }, []);

  useEffect(() => {
    if (!open) return;
    closeButton.current?.focus();
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && close();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  function close() {
    setOpen(false);
    (opener.current as HTMLElement | null)?.focus?.();
  }

  if (!open) return null;

  const crossSell = store.crossSell ? bySlug.get(store.crossSell) : undefined;
  const showCrossSell = crossSell && !summary.lines.some((line) => line.slug === crossSell.slug);
  const order = summary.lines.map((line) => `${line.quantity} × ${bySlug.get(line.slug)?.title ?? line.slug}`).join(', ');
  const checkout = checkoutHref ? withText(checkoutHref, `Hola, quiero comprar: ${order}.`) : '/contacto/';

  return (
    <div className="fixed inset-0 z-[60] flex justify-end bg-[rgba(3,6,15,0.6)]" onClick={(e) => e.target === e.currentTarget && close()}>
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="carrito-titulo"
        className="w-[420px] max-w-full h-full bg-surface border-l border-line p-6 flex flex-col gap-4 overflow-y-auto"
      >
        <div className="flex items-center justify-between">
          <strong id="carrito-titulo" className="font-poppins text-xl">
            Tu carrito ({summary.count})
          </strong>
          <button ref={closeButton} type="button" onClick={close} aria-label="Cerrar carrito" className="btn-ghost min-h-11 w-11 px-0">
            ✕
          </button>
        </div>

        <FreeShippingBar store={store} reader={reader} compact />

        {summary.lines.length === 0 ? (
          <p className="text-white/70">
            Tu carrito está vacío.{' '}
            <a href="/tienda/" className="text-link">
              Ver la tienda
            </a>
          </p>
        ) : (
          <ul className="flex flex-col gap-3" aria-label="Productos en el carrito">
            {summary.lines.map((line) => {
              const product = bySlug.get(line.slug);
              return (
                <li key={line.slug} className="flex gap-3">
                  <span className="ph w-[72px] h-[72px] shrink-0" aria-hidden="true">
                    [img]
                  </span>
                  <div className="flex-1">
                    <a href={product?.href ?? '/tienda/'} className="font-semibold text-white hover:underline underline-offset-4">
                      {product?.title ?? line.slug}
                    </a>
                    <div className="text-sm text-white/70">x{line.quantity}</div>
                    <div className="mt-1 font-semibold">{product?.price}</div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {showCrossSell && (
          <div className="border-t border-line pt-3.5">
            <strong className="text-[15px]">Completa tu compra</strong>
            <div className="mt-2.5 flex items-center gap-3">
              <span className="ph w-14 h-14 shrink-0" aria-hidden="true">
                [img]
              </span>
              <div className="flex-1 text-sm">
                {crossSell.title}
                <br />
                <span className="text-white/70">{crossSell.price}</span>
              </div>
              <button
                type="button"
                className="btn-ghost min-h-11 px-3.5"
                aria-label={`Agregar al carrito: ${crossSell.title}`}
                onClick={() => {
                  (addToCart ?? interactiveUseCases().addToCart).execute(crossSell.slug);
                  notifyCartChanged();
                }}
              >
                + Agregar
              </button>
            </div>
          </div>
        )}

        <div className="mt-auto flex flex-col gap-2.5">
          <div className="flex justify-between text-lg">
            <span>Subtotal</span>
            <strong data-testid="cart-subtotal">{summary.subtotal}</strong>
          </div>
          {summary.lines.length > 0 && (
            <a href={checkout} className="btn-primary w-full" {...(checkoutHref && { target: '_blank', rel: 'noopener noreferrer' })}>
              Finalizar compra con un asesor
            </a>
          )}
          <span className="text-center text-[13px] text-white/70">{store.paymentsLine}</span>
        </div>
      </aside>
    </div>
  );
}

function withText(href: string, text: string): string {
  const url = new URL(href);
  url.searchParams.set('text', text);
  return url.toString();
}
