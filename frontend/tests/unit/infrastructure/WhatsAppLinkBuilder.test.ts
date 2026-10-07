import { describe, expect, it } from 'vitest';
import { WhatsAppLinkBuilder } from '../../../src/infrastructure/whatsapp/WhatsAppLinkBuilder';
import { PhoneNumber } from '../../../src/domain/value-objects/PhoneNumber';

const phone = PhoneNumber.parse('300 123 4567');

describe('WhatsAppLinkBuilder', () => {
  it('construye https://wa.me/57XXXXXXXXXX?text=... con el texto codificado', () => {
    const link = new WhatsAppLinkBuilder()
      .to(phone)
      .withText('Hola, quiero un diagnóstico & más info?')
      .build();
    expect(link).toBe(
      'https://wa.me/573001234567?text=Hola%2C%20quiero%20un%20diagn%C3%B3stico%20%26%20m%C3%A1s%20info%3F',
    );
  });

  it('sin texto no agrega query string', () => {
    expect(new WhatsAppLinkBuilder().to(phone).build()).toBe('https://wa.me/573001234567');
  });

  it('acepta los dígitos ya normalizados (como llegan al ViewModel)', () => {
    expect(new WhatsAppLinkBuilder().toDigits('573001234567').withText('Hola').build()).toBe(
      'https://wa.me/573001234567?text=Hola',
    );
  });

  it('ignora un texto vacío', () => {
    expect(new WhatsAppLinkBuilder().to(phone).withText('   ').build()).toBe('https://wa.me/573001234567');
  });

  it('falla si no se indicó el número', () => {
    expect(() => new WhatsAppLinkBuilder().withText('Hola').build()).toThrow(/número/);
  });

  it('rechaza dígitos que no son un celular colombiano', () => {
    expect(() => new WhatsAppLinkBuilder().toDigits('5212345').build()).toThrow();
  });
});
