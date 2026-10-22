/** Evento que avisa al contador del header que el carrito cambió en esta pestaña. */
export const CART_CHANGED = 'orioncore:cart-changed';

/** Pide abrir el carrito lateral de la tienda. */
export const CART_OPEN = 'orioncore:cart-open';

/** La ficha de producto avisa la presentación y cantidad elegidas (barra fija inferior). */
export const SELECTION_CHANGED = 'orioncore:selection-changed';
export interface SelectionDetail {
  variant?: string;
  quantity: number;
}

export function notifyCartChanged(): void {
  window.dispatchEvent(new CustomEvent(CART_CHANGED));
}

export function openCart(): void {
  window.dispatchEvent(new CustomEvent(CART_OPEN));
}
