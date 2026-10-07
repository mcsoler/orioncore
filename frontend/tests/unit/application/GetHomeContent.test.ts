import { describe, expect, it } from 'vitest';
import { GetHomeContent, MissingSectionError, PRICE_PENDING } from '../../../src/application/use-cases/GetHomeContent';
import type { ContentRepository, HomeContent } from '../../../src/application/ports/out/ContentRepository';
import { ProcessStep } from '../../../src/domain/entities/ProcessStep';
import { homeContentFixture } from '../../support/homeContent';

const repositoryWith = (content: HomeContent): ContentRepository => ({ getHome: async () => content });
const run = (content: HomeContent) => new GetHomeContent(repositoryWith(content)).execute();

describe('GetHomeContent', () => {
  it('numera los servicios (01, 02…) y expone href, destino del CTA y texto del enlace en el mismo orden', async () => {
    const view = await run(homeContentFixture());
    expect(view.services.items).toEqual([
      {
        number: '01',
        title: 'Automatización de procesos',
        description: 'a',
        items: ['1'],
        href: '/servicios/automatizacion-de-procesos/',
        ctaHref: '#contacto',
        linkLabel: 'Ver automatización',
      },
      {
        number: '02',
        title: 'Agentes de IA',
        description: 'b',
        items: ['1'],
        href: '/servicios/agentes-ia-whatsapp/',
        ctaHref: 'whatsapp',
        badge: 'Más solicitado',
      },
    ]);
  });

  it('arma las tarjetas de marketing: el hub primero y luego cada línea, numeradas', async () => {
    const view = await run(homeContentFixture());
    expect(view.marketing.cards).toEqual([
      { number: '01', title: 'Marketing Digital 360°', hook: 'Estrategia integral.', items: ['Auditoría', 'Plan'], href: '/marketing-digital/' },
      { number: '02', title: 'Análisis web', hook: 'Tu web no convierte.', items: ['GA4', 'CRO'], href: '/marketing-digital/analisis-web/' },
    ]);
  });

  it('una línea sin gancho usa su descripción en la tarjeta', async () => {
    const { MarketingLine } = await import('../../../src/domain/entities/MarketingLine');
    const content = homeContentFixture();
    content.marketing = { ...content.marketing, items: [MarketingLine.create({ title: 'X', description: 'Desc', items: ['a'] })] };
    expect((await run(content)).marketing.cards[1]!.hook).toBe('Desc');
  });

  it('productos: precio, precio anterior, distintivo y stock; los pendientes se marcan sin inventarlos', async () => {
    const [known, pending] = (await run(homeContentFixture())).shop.products;
    expect(known).toMatchObject({ slug: 'kit-chatbot', price: '$1.299.000', oldPrice: '$1.500.000', badge: 'Nuevo', stock: 'Solo quedan 3' });
    expect(pending).toMatchObject({ price: PRICE_PENDING, oldPrice: undefined, badge: undefined, stock: undefined });
  });

  it('casos con etiqueta y cita; artículos con categoría y tiempo de lectura', async () => {
    const view = await run(homeContentFixture());
    expect(view.results.cases[0]).toEqual({
      title: 'Cliente Uno',
      description: 'x',
      result: '[X] %',
      href: '/casos/cliente-uno/',
      tag: 'Agente IA · Servicios',
      quote: undefined,
      quoteAuthor: undefined,
    });
    expect(view.blog.articles[0]).toEqual({
      title: 'Guía Uno',
      description: 'x',
      href: '/blog/guia-uno/',
      category: 'Automatización',
      readingTime: '5 min',
    });
  });

  it('expone pasos, preguntas, testimonios y garantía como datos planos', async () => {
    const view = await run(homeContentFixture());
    expect(view.process.steps[0]).toEqual({ order: 1, number: '01', title: 'Diagnóstico', description: 'x' });
    expect(view.process.guarantee.title).toBe('Garantía Orion');
    expect(view.faq.items[0]).toEqual({ question: '¿Q?', answer: 'R' });
    expect(view.results.testimonials[0]).toEqual({ quote: 'Bien', author: '[Nombre]', company: undefined });
  });

  it('entrega los cupos iniciales del contenido (los reales se consultan en el navegador)', async () => {
    expect((await run(homeContentFixture())).slots).toEqual({ remaining: 4, taken: 6, total: 10, progress: 60 });
  });

  it('entrega el WhatsApp como dígitos para wa.me, o nada si no está confirmado', async () => {
    expect((await run(homeContentFixture())).business.whatsapp).toBe('573001234567');
    const sinNumero = homeContentFixture();
    sinNumero.business = { ...sinNumero.business, whatsapp: undefined };
    expect((await run(sinNumero)).business.whatsapp).toBeUndefined();
  });

  it('ordena los pasos del proceso por su número', async () => {
    const content = homeContentFixture();
    content.process = { ...content.process, steps: [ProcessStep.create({ order: 2, title: 'B', description: 'x' }), content.process.steps[0]!] };
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
