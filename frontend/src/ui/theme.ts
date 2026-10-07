import tailwind from '../../tailwind.config.mjs';

/** Colores de marca desde tailwind.config.mjs, para donde no se puede usar una clase (canvas, meta theme-color). */
export const brandColors = tailwind.theme!.extend!.colors as Record<string, string>;
