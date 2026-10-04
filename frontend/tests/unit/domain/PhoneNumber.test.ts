import { describe, expect, it } from 'vitest';
import { PhoneNumber } from '../../../src/domain/value-objects/PhoneNumber';
import { InvalidValueError } from '../../../src/domain/errors/DomainError';

describe('PhoneNumber (+57)', () => {
  it.each([
    ['+57 300 000 0000', '+573000000000'],
    ['3000000000', '+573000000000'],
    ['573001234567', '+573001234567'],
    ['+57 (310) 555-12-34', '+573105551234'],
    ['  321 456 7890 ', '+573214567890'],
  ])('normaliza %s a %s', (input, expected) => {
    expect(PhoneNumber.parse(input).value).toBe(expected);
  });

  it.each([
    ['vacío', ''],
    ['muy corto', '300 000'],
    ['muy largo', '+57 300 000 00000'],
    ['fijo, no celular', '6012345678'],
    ['otro país', '+1 202 555 0123'],
    ['letras', '300abc0000'],
  ])('rechaza %s', (_, input) => {
    expect(() => PhoneNumber.parse(input)).toThrow(InvalidValueError);
  });

  it('expone los dígitos sin + para enlaces wa.me', () => {
    expect(PhoneNumber.parse('300 123 4567').digits).toBe('573001234567');
  });

  it('compara por valor', () => {
    expect(PhoneNumber.parse('3001234567').equals(PhoneNumber.parse('+57 300 123 4567'))).toBe(true);
  });
});
