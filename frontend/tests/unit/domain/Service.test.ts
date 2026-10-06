import { describe, expect, it } from 'vitest';
import { Service } from '../../../src/domain/entities/Service';
import { MarketingLine } from '../../../src/domain/entities/MarketingLine';
import { InvalidValueError } from '../../../src/domain/errors/DomainError';

const serviceProps = {
  title: 'Automatización de Procesos',
  description: 'Eliminamos tareas repetitivas.',
  items: ['Flujos automáticos', 'Integraciones', 'Reportes'],
};

describe('Service', () => {
  it('genera el slug desde el título y expone href con barra final', () => {
    const service = Service.create(serviceProps);
    expect(service.slug.value).toBe('automatizacion-de-procesos');
    expect(service.href).toBe('/servicios/automatizacion-de-procesos/');
  });

  it('respeta un slug explícito', () => {
    const service = Service.create({ ...serviceProps, slug: 'seguridad-control-de-acceso' });
    expect(service.href).toBe('/servicios/seguridad-control-de-acceso/');
  });

  it('permite apuntar a otra URL interna (p. ej. el hub de marketing)', () => {
    const service = Service.create({ ...serviceProps, title: 'Marketing Digital 360°', href: '/marketing-digital/' });
    expect(service.href).toBe('/marketing-digital/');
  });

  it('expone título, descripción, ítems y etiqueta opcional', () => {
    const service = Service.create({ ...serviceProps, badge: 'Más solicitado' });
    expect(service.title).toBe('Automatización de Procesos');
    expect(service.description).toBe('Eliminamos tareas repetitivas.');
    expect(service.items).toEqual(['Flujos automáticos', 'Integraciones', 'Reportes']);
    expect(service.badge).toBe('Más solicitado');
    expect(Service.create(serviceProps).badge).toBeUndefined();
  });

  it('expone el texto del enlace de detalle y el destino del CTA', () => {
    const service = Service.create({ ...serviceProps, linkLabel: 'Ver automatización de procesos', ctaHref: 'whatsapp' });
    expect(service.linkLabel).toBe('Ver automatización de procesos');
    expect(service.ctaHref).toBe('whatsapp');
    expect(Service.create(serviceProps).ctaHref).toBe('#contacto');
  });

  it.each(['#marketing360', '#contacto', 'whatsapp'])('acepta el destino de CTA %s', (ctaHref) => {
    expect(Service.create({ ...serviceProps, ctaHref }).ctaHref).toBe(ctaHref);
  });

  it.each(['/contacto/', 'https://wa.me/1', '#', 'contacto'])('rechaza el destino de CTA %s', (ctaHref) => {
    expect(() => Service.create({ ...serviceProps, ctaHref })).toThrow(InvalidValueError);
  });

  it('expone el titular de beneficio y el texto del CTA', () => {
    const service = Service.create({ ...serviceProps, headline: 'Recupera tus horas', cta: 'Quiero automatizar' });
    expect(service.headline).toBe('Recupera tus horas');
    expect(service.cta).toBe('Quiero automatizar');
  });

  it.each([
    ['titular vacío', { ...serviceProps, headline: ' ' }],
    ['CTA vacío', { ...serviceProps, cta: '' }],
    ['título vacío', { ...serviceProps, title: '  ' }],
    ['descripción vacía', { ...serviceProps, description: '' }],
    ['sin ítems', { ...serviceProps, items: [] }],
    ['ítem vacío', { ...serviceProps, items: ['ok', ' '] }],
    ['href sin barra final', { ...serviceProps, href: '/marketing-digital' }],
    ['href externo', { ...serviceProps, href: 'https://otro.com/' }],
  ])('rechaza %s', (_, props) => {
    expect(() => Service.create(props)).toThrow(InvalidValueError);
  });
});

describe('MarketingLine', () => {
  it('expone href bajo /marketing-digital/ con barra final', () => {
    const line = MarketingLine.create({
      title: 'Análisis Web',
      description: 'Medimos lo que importa.',
      items: ['GA4', 'Embudos'],
    });
    expect(line.slug.value).toBe('analisis-web');
    expect(line.href).toBe('/marketing-digital/analisis-web/');
  });

  it('expone el gancho corto de su tarjeta', () => {
    const line = MarketingLine.create({ title: 'Email marketing', description: 'd', hook: 'Ventas automáticas.', items: ['x'] });
    expect(line.hook).toBe('Ventas automáticas.');
    expect(() => MarketingLine.create({ title: 'X', description: 'd', hook: ' ', items: ['x'] })).toThrow(InvalidValueError);
  });

  it('rechaza una línea sin ítems', () => {
    expect(() => MarketingLine.create({ title: 'Branding Digital', description: 'x', items: [] })).toThrow(
      InvalidValueError,
    );
  });
});
