import { describe, expect, it } from 'vitest';
import { iconForHref, painIcon, serviceOptions } from '../../../src/ui/presenters/homePresenter';
import { homeView } from '../../support/homeView';

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

  it('las opciones del formulario salen de los servicios del home, más "Otro"', async () => {
    const { view } = await homeView();
    expect(serviceOptions(view.services.items)).toEqual([
      { value: 'automatizacion-de-procesos', label: 'Automatización de Procesos' },
      { value: 'agentes-ia-whatsapp', label: 'Agentes de IA para WhatsApp' },
      { value: 'software-a-medida', label: 'Software Empresarial a Medida' },
      { value: 'seguridad-control-de-acceso', label: 'Seguridad y Control de Acceso' },
      { value: 'marketing-digital', label: 'Marketing Digital 360°' },
      { value: 'otro', label: 'Otro / No lo tengo claro aún' },
    ]);
  });
});
