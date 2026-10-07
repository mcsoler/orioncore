import { describe, expect, it } from 'vitest';
import { iconForHref, painIcon } from '../../../src/ui/presenters/homePresenter';

describe('homePresenter', () => {
  it('elige el ícono de cada servicio por su URL', () => {
    expect(iconForHref('/servicios/automatizacion-de-procesos/')).toBe('gear');
    expect(iconForHref('/servicios/agentes-ia-whatsapp/')).toBe('chat');
    expect(iconForHref('/servicios/software-a-medida/')).toBe('code');
    expect(iconForHref('/servicios/seguridad-control-de-acceso/')).toBe('shield');
    expect(iconForHref('/marketing-digital/')).toBe('rocket');
  });

  it('elige el ícono de cada línea de marketing y usa uno genérico si no la conoce', () => {
    expect(iconForHref('/marketing-digital/pauta-digital/')).toBe('megaphone');
    expect(iconForHref('/marketing-digital/analisis-web/')).toBe('chart');
    expect(iconForHref('/marketing-digital/nueva-linea/')).toBe('sparkles');
  });

  it('los 4 dolores tienen íconos y se repiten si hay más', () => {
    expect([0, 1, 2, 3, 4].map(painIcon)).toEqual(['chat', 'clock', 'chart', 'plug', 'chat']);
  });

});
