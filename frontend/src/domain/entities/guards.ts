import { InvalidValueError } from '../errors/DomainError';

export function requireText(field: string, value: string): string {
  const text = value.trim();
  if (!text) throw new InvalidValueError(field, 'no puede estar vacío');
  return text;
}

export function requireItems(field: string, items: readonly string[]): readonly string[] {
  if (items.length === 0) throw new InvalidValueError(field, 'debe tener al menos un elemento');
  return Object.freeze(items.map((item, i) => requireText(`${field}[${i}]`, item)));
}

/** Ruta interna del sitio: empieza y termina en `/` (trailingSlash: 'always'). */
export function requireInternalPath(field: string, path: string): string {
  if (!/^\/([a-z0-9-]+\/)*$/.test(path)) {
    throw new InvalidValueError(field, `"${path}" debe ser una ruta interna con barra final`);
  }
  return path;
}
