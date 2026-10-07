/**
 * Geometría del isotipo actual (constelación de Orión), tal como estaba en la Navbar original.
 * La usan Logo.astro y scripts/generate-brand-assets.mjs (favicon, apple-touch-icon, OG),
 * así todos los formatos salen del mismo dibujo.
 */
export const LOGO_VIEWBOX = '0 0 36 36';

export const LOGO_NODES = [
  { cx: 18, cy: 4, r: 2.8, opacity: 0.95 },
  { cx: 9, cy: 13, r: 2.2, opacity: 0.85 },
  { cx: 27, cy: 13, r: 2.2, opacity: 0.85 },
  { cx: 14, cy: 20, r: 1.8, opacity: 0.75 },
  { cx: 22, cy: 20, r: 1.8, opacity: 0.75 },
  { cx: 9, cy: 29, r: 2.2, opacity: 0.9 },
  { cx: 27, cy: 29, r: 2.2, opacity: 0.9 },
] as const;

export const LOGO_LINES = [
  { x1: 18, y1: 4, x2: 9, y2: 13, opacity: 0.5 },
  { x1: 18, y1: 4, x2: 27, y2: 13, opacity: 0.5 },
  { x1: 9, y1: 13, x2: 27, y2: 13, opacity: 0.35 },
  { x1: 9, y1: 13, x2: 14, y2: 20, opacity: 0.5 },
  { x1: 27, y1: 13, x2: 22, y2: 20, opacity: 0.5 },
  { x1: 14, y1: 20, x2: 9, y2: 29, opacity: 0.5 },
  { x1: 22, y1: 20, x2: 27, y2: 29, opacity: 0.5 },
  { x1: 9, y1: 29, x2: 27, y2: 29, opacity: 0.35 },
] as const;

/** Halo del nodo superior. */
export const LOGO_HALO = { cx: 18, cy: 4, r: 5.5, strokeWidth: 0.6, opacity: 0.2 } as const;
export const LOGO_LINE_WIDTH = 0.9;
