import { describe, expect, it } from 'vitest';
import { Product, ShopCategory } from '../../../src/domain/entities/Product';
import { CaseStudy } from '../../../src/domain/entities/CaseStudy';
import { Article } from '../../../src/domain/entities/Article';
import { Faq } from '../../../src/domain/entities/Faq';
import { ProcessStep } from '../../../src/domain/entities/ProcessStep';
import { Testimonial } from '../../../src/domain/entities/Testimonial';
import { Money } from '../../../src/domain/value-objects/Money';
import { InvalidValueError } from '../../../src/domain/errors/DomainError';

describe('ShopCategory y Product', () => {
  it('la categoría expone href bajo /tienda/', () => {
    expect(ShopCategory.create({ title: 'Kits de automatización' }).href).toBe('/tienda/kits-de-automatizacion/');
  });

  it('el producto expone href, categoría y precio opcional', () => {
    const product = Product.create({
      title: 'Kit Chatbot',
      description: 'Plantilla lista.',
      category: 'kits-de-automatizacion',
      price: 1_299_000,
    });
    expect(product.href).toBe('/tienda/kit-chatbot/');
    expect(product.category.value).toBe('kits-de-automatizacion');
    expect(product.price?.equals(Money.cop(1_299_000))).toBe(true);
  });

  it('expone distintivo, precio anterior y unidades disponibles opcionales', () => {
    const product = Product.create({
      title: 'Router', description: 'x', category: 'redes', price: 400_000, oldPrice: 500_000, badge: 'Combo', stock: 3,
    });
    expect(product.badge).toBe('Combo');
    expect(product.oldPrice?.amount).toBe(500_000);
    expect(product.stock).toBe(3);
    expect(() => Product.create({ title: 'R', description: 'x', category: 'redes', stock: -1 })).toThrow(InvalidValueError);
    expect(() => Product.create({ title: 'R', description: 'x', category: 'redes', stock: 1.5 })).toThrow(InvalidValueError);
  });

  it('el precio puede quedar pendiente ([X]) sin inventarlo', () => {
    const product = Product.create({ title: 'Kit', description: 'x', category: 'kits' });
    expect(product.price).toBeUndefined();
  });

  it('rechaza precio negativo o categoría inválida', () => {
    expect(() => Product.create({ title: 'Kit', description: 'x', category: 'kits', price: -1 })).toThrow(InvalidValueError);
    expect(() => Product.create({ title: 'Kit', description: 'x', category: 'Kits Malos' })).toThrow(InvalidValueError);
  });
});

describe('Product (tienda)', () => {
  it('disponibilidad, envío rápido, instalación, marca y destacado', () => {
    const product = Product.create({
      title: 'Cámara', description: 'x', category: 'seguridad', availability: 'backorder',
      fastShipping: true, installation: true, brand: 'Marca A', featured: true, stockLabel: 'Bajo pedido · 5 días',
    });
    expect(product.inStock).toBe(false);
    expect(product.fastShipping).toBe(true);
    expect(product.installation).toBe(true);
    expect(product.brand).toBe('Marca A');
    expect(product.featured).toBe(true);
    expect(product.stockLabel).toBe('Bajo pedido · 5 días');
  });

  it('por defecto está en stock, sin envío rápido ni instalación y no es destacado', () => {
    const product = Product.create({ title: 'Mouse', description: 'x', category: 'accesorios' });
    expect(product.inStock).toBe(true);
    expect(product.fastShipping).toBe(false);
    expect(product.installation).toBe(false);
    expect(product.featured).toBe(false);
  });

  it('calcula el ahorro frente al precio anterior solo con ambos precios', () => {
    expect(Product.create({ title: 'R', description: 'x', category: 'redes', price: 400_000, oldPrice: 500_000 }).savings?.format()).toBe('$100.000');
    expect(Product.create({ title: 'R', description: 'x', category: 'redes', price: 400_000 }).savings).toBeUndefined();
    expect(Product.create({ title: 'R', description: 'x', category: 'redes', oldPrice: 500_000 }).savings).toBeUndefined();
  });

  it('rechaza un precio anterior menor que el actual o una disponibilidad desconocida', () => {
    expect(() => Product.create({ title: 'R', description: 'x', category: 'redes', price: 500_000, oldPrice: 400_000 })).toThrow(InvalidValueError);
    expect(() =>
      Product.create({ title: 'R', description: 'x', category: 'redes', availability: 'agotado' as never }),
    ).toThrow(InvalidValueError);
  });
});

describe('CaseStudy', () => {
  it('expone href bajo /casos/ y su resultado destacado', () => {
    const study = CaseStudy.create({ client: 'Cliente Uno', summary: 'Automatizamos su CRM.', result: '[X] % menos tiempo' });
    expect(study.href).toBe('/casos/cliente-uno/');
    expect(study.result).toBe('[X] % menos tiempo');
  });

  it('expone su etiqueta y la cita opcional del cliente', () => {
    const study = CaseStudy.create({
      client: 'A', summary: 's', result: '+30%', tag: 'Marketing · Retail', quote: 'Excelente', quoteAuthor: 'Ana, Gerente',
    });
    expect(study.tag).toBe('Marketing · Retail');
    expect(study.quote).toBe('Excelente');
    expect(study.quoteAuthor).toBe('Ana, Gerente');
  });

  it('rechaza un caso sin resumen', () => {
    expect(() => CaseStudy.create({ client: 'A', summary: '', result: 'x' })).toThrow(InvalidValueError);
  });
});

describe('Article', () => {
  it('expone href bajo /blog/', () => {
    expect(Article.create({ title: 'Guía de automatización', excerpt: 'Paso a paso.' }).href).toBe(
      '/blog/guia-de-automatizacion/',
    );
  });
});

describe('Article (metadatos)', () => {
  it('expone la categoría, el tiempo de lectura y un title SEO opcional', () => {
    const article = Article.create({
      title: '¿Cuánto cuesta un chatbot de IA para WhatsApp en Colombia?',
      excerpt: 'x',
      category: 'Agentes de IA',
      readingTime: '[N] min de lectura',
      seoTitle: 'Precio de un chatbot de IA para WhatsApp | Orion Core',
    });
    expect(article.category).toBe('Agentes de IA');
    expect(article.readingTime).toBe('[N] min de lectura');
    expect(article.seoTitle).toBe('Precio de un chatbot de IA para WhatsApp | Orion Core');
  });
});

describe('Faq', () => {
  it('requiere pregunta y respuesta', () => {
    expect(Faq.create({ question: '¿Cuánto cuesta?', answer: 'Depende.' }).question).toBe('¿Cuánto cuesta?');
    expect(() => Faq.create({ question: '¿?', answer: ' ' })).toThrow(InvalidValueError);
  });
});

describe('ProcessStep', () => {
  it('requiere un orden entero positivo', () => {
    expect(ProcessStep.create({ order: 1, title: 'Diagnóstico', description: 'x' }).order).toBe(1);
    expect(() => ProcessStep.create({ order: 0, title: 'x', description: 'x' })).toThrow(InvalidValueError);
    expect(() => ProcessStep.create({ order: 1.5, title: 'x', description: 'x' })).toThrow(InvalidValueError);
  });
});

describe('Testimonial', () => {
  it('requiere cita y autor; la empresa es opcional', () => {
    const t = Testimonial.create({ quote: 'Excelente.', author: '[Nombre]' });
    expect(t.author).toBe('[Nombre]');
    expect(t.company).toBeUndefined();
    expect(() => Testimonial.create({ quote: '', author: 'A' })).toThrow(InvalidValueError);
  });
});
