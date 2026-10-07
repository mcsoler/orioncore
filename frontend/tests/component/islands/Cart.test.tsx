import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import AddToCartButton from '../../../src/ui/islands/AddToCartButton';
import CartBadge from '../../../src/ui/islands/CartBadge';
import { AddToCart, GetCartCount } from '../../../src/application/use-cases/AddToCart';
import type { CartRepository } from '../../../src/application/ports/out/CartRepository';
import { Cart } from '../../../src/domain/entities/Cart';

function memoryCart(initial = Cart.empty()): CartRepository {
  let cart = initial;
  return { load: () => cart, save: (c) => void (cart = c) };
}

describe('Carrito (islas)', () => {
  it('"Agregar al carrito" suma el producto y el contador del header se actualiza', async () => {
    const repo = memoryCart();
    const user = userEvent.setup();
    render(
      <>
        <CartBadge getCount={new GetCartCount(repo)} />
        <AddToCartButton slug="router-wifi-6-malla" name="[Router Wi‑Fi 6 malla]" addToCart={new AddToCart(repo)} />
      </>,
    );
    expect(screen.getByTestId('cart-count')).toHaveTextContent('0');

    await user.click(screen.getByRole('button', { name: 'Agregar al carrito: [Router Wi‑Fi 6 malla]' }));
    expect(screen.getByTestId('cart-count')).toHaveTextContent('1');
    expect(screen.getByRole('status')).toHaveTextContent('Agregado');
  });

  it('el contador muestra lo guardado al cargar y escucha cambios de otras pestañas', () => {
    const repo = memoryCart(Cart.from({ a: 2 }));
    render(<CartBadge getCount={new GetCartCount(repo)} />);
    expect(screen.getByTestId('cart-count')).toHaveTextContent('2');

    repo.save(Cart.from({ a: 5 }));
    act(() => void window.dispatchEvent(new StorageEvent('storage')));
    expect(screen.getByTestId('cart-count')).toHaveTextContent('5');
  });

  it('el contador se anuncia a lectores de pantalla como parte del nombre del carrito', () => {
    render(<CartBadge getCount={new GetCartCount(memoryCart(Cart.from({ a: 3 })))} />);
    expect(screen.getByText(', 3 productos en el carrito')).toHaveClass('sr-only');
  });
});
