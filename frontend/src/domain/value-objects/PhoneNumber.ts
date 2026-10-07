import { InvalidValueError } from '../errors/DomainError';

const SEPARATORS = /[\s().-]/g;
const COLOMBIAN_MOBILE = /^3\d{9}$/;

/** Celular colombiano normalizado a E.164: `+573001234567`. */
export class PhoneNumber {
  private constructor(readonly value: string) {}

  static parse(input: string): PhoneNumber {
    const raw = input.trim().replace(SEPARATORS, '').replace(/^\+/, '');
    if (!/^\d+$/.test(raw)) throw new InvalidValueError('phone', 'solo puede contener dígitos');

    const national = raw.length === 12 && raw.startsWith('57') ? raw.slice(2) : raw;
    if (!COLOMBIAN_MOBILE.test(national)) {
      throw new InvalidValueError('phone', 'debe ser un celular colombiano de 10 dígitos que empiece por 3');
    }
    return new PhoneNumber(`+57${national}`);
  }

  /** Dígitos sin `+`, como los espera wa.me. */
  get digits(): string {
    return this.value.slice(1);
  }

  equals(other: PhoneNumber): boolean {
    return this.value === other.value;
  }
}
