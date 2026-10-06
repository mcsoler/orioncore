import { describe, expect, it } from 'vitest';
import { LocalStorageCartRepository, CART_KEY } from '../../../src/infrastructure/cart/LocalStorageCartRepository';
import { Cart } from '../../../src/domain/entities/Cart';

function fakeStorage(initial: Record<string, string> = {}): Storage {
  const data = new Map(Object.entries(initial));
  return {
    get length() {
      return data.size;
    },
    clear: () => data.clear(),
    getItem: (k) => data.get(k) ?? null,
    key: (i) => [...data.keys()][i] ?? null,
    removeItem: (k) => void data.delete(k),
    setItem: (k, v) => void data.set(k, v),
  };
}

describe('LocalStorageCartRepository', () => {
  it('guarda y vuelve a leer el carrito', () => {
    const storage = fakeStorage();
    const repo = new LocalStorageCartRepository(storage);
    repo.save(Cart.empty().add('laptop-empresarial-14').add('laptop-empresarial-14'));
    expect(JSON.parse(storage.getItem(CART_KEY)!)).toEqual({ 'laptop-empresarial-14': 2 });
    expect(new LocalStorageCartRepository(storage).load().count).toBe(2);
  });

  it('con datos corruptos o sin almacenamiento empieza vacío', () => {
    expect(new LocalStorageCartRepository(fakeStorage({ [CART_KEY]: '{no-json' })).load().count).toBe(0);
    expect(new LocalStorageCartRepository(undefined).load().count).toBe(0);
  });

  it('si el navegador bloquea el almacenamiento no falla', () => {
    const blocked = { ...fakeStorage(), setItem: () => { throw new Error('QuotaExceeded'); } } as Storage;
    expect(() => new LocalStorageCartRepository(blocked).save(Cart.empty().add('a'))).not.toThrow();
  });
});
