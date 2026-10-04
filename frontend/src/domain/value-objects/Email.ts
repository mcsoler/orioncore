import { InvalidValueError } from '../errors/DomainError';

const MAX_LENGTH = 254;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Correo electrónico normalizado (sin espacios, en minúsculas). */
export class Email {
  private constructor(readonly value: string) {}

  static parse(input: string): Email {
    const value = input.trim().toLowerCase();
    if (value.length > MAX_LENGTH) throw new InvalidValueError('email', 'es demasiado largo');
    if (!EMAIL.test(value)) throw new InvalidValueError('email', 'no tiene un formato válido');
    return new Email(value);
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }
}
