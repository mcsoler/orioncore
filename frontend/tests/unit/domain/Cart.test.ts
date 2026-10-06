import { describe, expect, it } from 'vitest';
import { Cart } from '../../../src/domain/entities/Cart';
import { InvalidValueError } from '../../../src/domain/errors/DomainError';

describe('Cart', () => {
  it('empieza vacío', () => {
    expect(Cart.empty().count).toBe(0);
  });

  it('agregar suma unidades por producto sin mutar el carrito anterior', () => {
    const empty = Cart.empty();
    const cart = empty.add('router-wifi-6-malla').add('router-wifi-6-malla').add('laptop-empresarial-14');
    expect(cart.count).toBe(3);
    expect(cart.quantityOf('router-wifi-6-malla')).toBe(2);
    expect(empty.count).toBe(0);
  });

  it('se reconstruye desde sus líneas e ignora cantidades inválidas', () => {
    const cart = Cart.from({ 'laptop-empresarial-14': 2, 'mal': -1, 'otro': 1.5, 'Slug Malo': 1 });
    expect(cart.count).toBe(2);
    expect(cart.lines()).toEqual({ 'laptop-empresarial-14': 2 });
  });

  it('rechaza un producto con slug inválido', () => {
    expect(() => Cart.empty().add('Producto Malo')).toThrow(InvalidValueError);
  });
});
