import { describe, expect, it } from 'vitest';
import { Email } from '../../../src/domain/value-objects/Email';
import { InvalidValueError } from '../../../src/domain/errors/DomainError';

describe('Email', () => {
  it('normaliza a minúsculas y sin espacios', () => {
    expect(Email.parse('  Michael@OrionCore.CO ').value).toBe('michael@orioncore.co');
  });

  it.each(['ana@empresa.com', 'a.b+tag@sub.dominio.com.co', 'x_y-z@d.io'])('acepta %s', (input) => {
    expect(Email.parse(input).value).toBe(input);
  });

  it.each([
    ['vacío', ''],
    ['sin arroba', 'ana.empresa.com'],
    ['sin dominio', 'ana@'],
    ['sin TLD', 'ana@empresa'],
    ['con espacios', 'ana maria@empresa.com'],
    ['dos arrobas', 'ana@@empresa.com'],
    ['demasiado largo', `${'a'.repeat(250)}@empresa.com`],
  ])('rechaza %s', (_, input) => {
    expect(() => Email.parse(input)).toThrow(InvalidValueError);
  });

  it('compara por valor', () => {
    expect(Email.parse('A@b.co').equals(Email.parse('a@B.co'))).toBe(true);
  });
});
