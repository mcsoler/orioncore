import type { HomeContent } from '../../src/application/ports/out/ContentRepository';
import { Article } from '../../src/domain/entities/Article';
import { CaseStudy } from '../../src/domain/entities/CaseStudy';
import { Faq } from '../../src/domain/entities/Faq';
import { MarketingLine } from '../../src/domain/entities/MarketingLine';
import { ProcessStep } from '../../src/domain/entities/ProcessStep';
import { Product } from '../../src/domain/entities/Product';
import { Service } from '../../src/domain/entities/Service';
import { Testimonial } from '../../src/domain/entities/Testimonial';
import { PhoneNumber } from '../../src/domain/value-objects/PhoneNumber';

const cta = (label: string, href: string) => ({ label, href });

/** Contenido mínimo y válido del home para pruebas de aplicación. */
export function homeContentFixture(overrides: Partial<HomeContent> = {}): HomeContent {
  return {
    announcement: { text: 'Quedan [N] cupos', cta: cta('Reservar', '#contacto') },
    hero: {
      title: 'Automatización, inteligencia artificial y marketing digital para empresas en Colombia',
      hook: 'Deja de perder clientes',
      subtitle: 'Cinco servicios',
      primaryCta: cta('Reservar mi diagnóstico gratis', '#contacto'),
      secondaryCta: cta('¿Cuánto estoy perdiendo?', '#calculadora'),
      microcopy: 'Sin compromiso',
      socialProof: '[X] empresas',
    },
    clients: { title: 'Confían en nosotros', logos: ['[Logo]'] },
    pains: { title: '¿Te suena familiar?', items: [{ title: 'Dolor', description: 'x' }], closing: 'Cierre' },
    services: {
      title: 'Servicios',
      subtitle: 'x',
      ctaLabel: 'Ver servicio',
      items: [
        Service.create({ title: 'Automatización de Procesos', description: 'a', items: ['1'] }),
        Service.create({ title: 'Agentes de IA', slug: 'agentes-ia-whatsapp', description: 'b', items: ['1'], badge: 'Más solicitado' }),
      ],
    },
    marketing: {
      title: 'Marketing 360°',
      subtitle: 'x',
      hub: cta('Ver todo', '/marketing-digital/'),
      items: [MarketingLine.create({ title: 'Análisis Web', description: 'x', items: ['GA4'] })],
    },
    calculator: {
      title: 'Calculadora',
      subtitle: 'x',
      defaultHours: 10,
      costPerHour: { default: 25_000, min: 10_000, max: 200_000, step: 5_000 },
      cta: cta('Recuperar ese tiempo', '#contacto'),
    },
    results: {
      title: 'Resultados',
      cases: [CaseStudy.create({ client: 'Cliente Uno', summary: 'x', result: '[X] %' })],
      stats: [{ value: '[X]', label: 'proyectos' }],
      certifications: ['[Certificación]'],
      testimonials: [Testimonial.create({ quote: 'Bien', author: '[Nombre]' })],
    },
    process: { title: 'Proceso', steps: [ProcessStep.create({ order: 1, title: 'Diagnóstico', description: 'x' })], guarantee: 'Garantía' },
    shop: {
      title: 'Tienda',
      cta: cta('Ver tienda', '/tienda/'),
      products: [
        Product.create({ title: 'Kit Chatbot', description: 'x', category: 'kits', price: 1_299_000 }),
        Product.create({ title: 'Kit CRM', description: 'x', category: 'kits' }),
      ],
    },
    blog: { title: 'Guías', cta: cta('Ver blog', '/blog/'), articles: [Article.create({ title: 'Guía Uno', excerpt: 'x' })] },
    faq: { title: 'Preguntas', items: [Faq.create({ question: '¿Q?', answer: 'R' })] },
    contact: { title: 'Contacto', slots: 'Quedan [N]', benefits: ['Diagnóstico'], photoAlt: 'Michael', whatsappMessage: 'Hola' },
    business: {
      name: 'Orion Core Tecnologías',
      legalName: '[Razón social]',
      email: 'contacto@orioncore.co',
      phoneLabel: '[Teléfono]',
      whatsapp: PhoneNumber.parse('3001234567'),
      address: '[Dirección]',
      city: 'Bogotá',
    },
    ...overrides,
  };
}
