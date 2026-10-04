import { describe, expect, it } from 'vitest';
import { GetHomeContent, MissingSectionError } from '../../../src/application/use-cases/GetHomeContent';
import type { ContentRepository, HomeContent } from '../../../src/application/ports/out/ContentRepository';
import { homeContentFixture } from '../../support/homeContent';

const repositoryWith = (content: HomeContent): ContentRepository => ({ getHome: async () => content });
const run = (content: HomeContent) => new GetHomeContent(repositoryWith(content)).execute();

describe('GetHomeContent', () => {
  it('convierte los servicios en vistas con href, ítems y etiqueta, en el mismo orden', async () => {
    const view = await run(homeContentFixture());
    expect(view.services.items).toEqual([
      {
        title: 'Automatización de Procesos',
        description: 'a',
        items: ['1'],
        href: '/servicios/automatizacion-de-procesos/',
      },
      {
        title: 'Agentes de IA',
        description: 'b',
        items: ['1'],
        href: '/servicios/agentes-ia-whatsapp/',
        badge: 'Más solicitado',
      },
    ]);
  });

  it('las líneas de marketing enlazan a /marketing-digital/{slug}/', async () => {
    const view = await run(homeContentFixture());
    expect(view.marketing.items.map((m) => m.href)).toEqual(['/marketing-digital/analisis-web/']);
  });

  it('formatea el precio en COP y marca el pendiente sin inventarlo', async () => {
    const view = await run(homeContentFixture());
    expect(view.shop.products.map((p) => p.price)).toEqual(['$1.299.000', 'Precio por confirmar']);
  });

  it('expone casos, artículos, pasos y preguntas como datos planos', async () => {
    const view = await run(homeContentFixture());
    expect(view.results.cases[0]).toEqual({
      title: 'Cliente Uno',
      description: 'x',
      result: '[X] %',
      href: '/casos/cliente-uno/',
    });
    expect(view.blog.articles[0]!.href).toBe('/blog/guia-uno/');
    expect(view.process.steps[0]).toEqual({ order: 1, title: 'Diagnóstico', description: 'x' });
    expect(view.faq.items[0]).toEqual({ question: '¿Q?', answer: 'R' });
    expect(view.results.testimonials[0]).toEqual({ quote: 'Bien', author: '[Nombre]', company: undefined });
  });

  it('entrega el WhatsApp como dígitos para wa.me, o nada si no está confirmado', async () => {
    expect((await run(homeContentFixture())).business.whatsapp).toBe('573001234567');
    const sinNumero = homeContentFixture();
    sinNumero.business = { ...sinNumero.business, whatsapp: undefined };
    expect((await run(sinNumero)).business.whatsapp).toBeUndefined();
  });

  it('ordena los pasos del proceso por su número', async () => {
    const content = homeContentFixture();
    const [first] = content.process.steps;
    const { ProcessStep } = await import('../../../src/domain/entities/ProcessStep');
    content.process = { ...content.process, steps: [ProcessStep.create({ order: 2, title: 'B', description: 'x' }), first!] };
    expect((await run(content)).process.steps.map((s) => s.order)).toEqual([1, 2]);
  });

  it('falla con un error claro si falta una sección', async () => {
    const { faq: _omit, ...rest } = homeContentFixture();
    await expect(run(rest as HomeContent)).rejects.toThrow(new MissingSectionError('faq'));
  });

  it.each(['services', 'marketing', 'pains'] as const)('falla si la sección %s está vacía', async (section) => {
    const content = homeContentFixture();
    content[section] = { ...content[section], items: [] } as never;
    await expect(run(content)).rejects.toThrow(MissingSectionError);
  });
});
