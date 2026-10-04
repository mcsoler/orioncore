import { describe, expect, it } from 'vitest';
import { Slug } from '../../../src/domain/value-objects/Slug';
import { InvalidValueError } from '../../../src/domain/errors/DomainError';

describe('Slug', () => {
  it.each([
    ['Automatización de Procesos', 'automatizacion-de-procesos'],
    ['Agentes de IA para WhatsApp', 'agentes-de-ia-para-whatsapp'],
    ['Seguridad & Control de Acceso', 'seguridad-control-de-acceso'],
    ['  Marketing   Digital 360° ', 'marketing-digital-360'],
    ['Niño Ñandú Pingüino', 'nino-nandu-pinguino'],
    ['--ya-es-slug--', 'ya-es-slug'],
  ])('"%s" → %s', (input, expected) => {
    expect(Slug.fromText(input).value).toBe(expected);
  });

  it('acepta un slug ya válido tal cual', () => {
    expect(Slug.of('software-a-medida').value).toBe('software-a-medida');
  });

  it.each(['Con Mayúsculas', 'con espacios', 'tilde-é', 'doble--guion', '-borde', ''])(
    'Slug.of rechaza "%s"',
    (input) => {
      expect(() => Slug.of(input)).toThrow(InvalidValueError);
    },
  );

  it('fromText rechaza texto sin caracteres utilizables', () => {
    expect(() => Slug.fromText('¡¿?! °')).toThrow(InvalidValueError);
  });

  it('compara por valor', () => {
    expect(Slug.fromText('Software a Medida').equals(Slug.of('software-a-medida'))).toBe(true);
  });
});
