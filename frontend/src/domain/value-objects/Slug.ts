import { InvalidValueError } from '../errors/DomainError';

const VALID_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Segmento de URL: minúsculas, dígitos y guiones simples (`automatizacion-de-procesos`). */
export class Slug {
  private constructor(readonly value: string) {}

  /** Valida un slug ya formado. */
  static of(value: string): Slug {
    if (!VALID_SLUG.test(value)) throw new InvalidValueError('slug', `"${value}" no es un slug válido`);
    return new Slug(value);
  }

  /** Genera el slug a partir de un título: quita tildes, símbolos y espacios. */
  static fromText(text: string): Slug {
    const value = text
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    if (!value) throw new InvalidValueError('slug', `"${text}" no tiene caracteres utilizables`);
    return Slug.of(value);
  }

  equals(other: Slug): boolean {
    return this.value === other.value;
  }
}
