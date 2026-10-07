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
import { Slots } from '../../src/domain/value-objects/Slots';

const cta = (label: string, href: string) => ({ label, href });

/** Contenido mínimo y válido del home para pruebas de aplicación. */
export function homeContentFixture(overrides: Partial<HomeContent> = {}): HomeContent {
  return {
    slots: Slots.of({ remaining: 4, total: 10 }),
    announcement: { text: 'Quedan {remaining} de {total} cupos', cta: cta('Reservar el mío', '#contacto') },
    hero: {
      title: 'Automatización, inteligencia artificial y marketing digital para empresas en Colombia',
      hook: { before: 'Deja de perder', highlight: 'clientes, horas y dinero', after: 'en lo que la tecnología ya resuelve.' },
      subtitle: 'Un solo equipo',
      primaryCta: cta('Reservar mi diagnóstico gratis', '#contacto'),
      secondaryCta: cta('¿Cuánto estoy perdiendo?', '#calculadora'),
      microcopy: 'Sin compromiso',
      rating: '[4,9]',
      socialProof: 'Más de [N] empresas',
    },
    clients: { title: 'Empresas que ya dejaron de perder tiempo:', logos: ['[Logo]'] },
    pains: {
      eyebrow: '¿Te suena familiar?',
      title: 'Dinero sobre la mesa',
      items: [{ tag: 'Ventas perdidas', title: 'Dolor', description: 'x' }],
      closing: { text: 'No es falta de esfuerzo.', highlight: 'Es falta de sistema.' },
    },
    services: {
      eyebrow: 'Nuestros servicios',
      title: 'Cinco soluciones',
      items: [
        Service.create({ title: 'Automatización de procesos', description: 'a', items: ['1'], linkLabel: 'Ver automatización' }),
        Service.create({
          title: 'Agentes de IA',
          slug: 'agentes-ia-whatsapp',
          description: 'b',
          items: ['1'],
          badge: 'Más solicitado',
          ctaHref: 'whatsapp',
        }),
      ],
    },
    marketing: {
      eyebrow: 'Marketing digital 360°',
      title: 'Agencia de marketing digital',
      subtitle: 'x',
      hub: cta('Ver marketing digital 360°', '/marketing-digital/'),
      hubCard: { title: 'Marketing Digital 360°', hook: 'Estrategia integral.', items: ['Auditoría', 'Plan'] },
      items: [MarketingLine.create({ title: 'Análisis web', description: 'x', hook: 'Tu web no convierte.', items: ['GA4', 'CRO'] })],
    },
    calculator: {
      eyebrow: 'Calculadora',
      title: 'Calculadora',
      subtitle: 'x',
      defaultHours: 15,
      costPerHour: { default: 30_000, min: 10_000, max: 150_000, step: 5_000 },
      cta: cta('Quiero recuperar ese dinero', '#contacto'),
    },
    results: {
      eyebrow: 'Resultados',
      title: 'Resultados',
      cases: [CaseStudy.create({ client: 'Cliente Uno', summary: 'x', result: '[X] %', tag: 'Agente IA · Servicios' })],
      stats: [{ value: '10+', label: 'proyectos' }],
      certifications: ['[Certificación]'],
      testimonials: [Testimonial.create({ quote: 'Bien', author: '[Nombre]' })],
    },
    process: {
      eyebrow: 'Así trabajamos',
      title: 'Proceso',
      steps: [ProcessStep.create({ order: 1, title: 'Diagnóstico', description: 'x' })],
      guarantee: { title: 'Garantía Orion', body: 'Sin riesgo', cta: cta('Empezar sin riesgo', '#contacto') },
    },
    shop: {
      eyebrow: 'Tienda Orion',
      title: 'Tienda',
      subtitle: 'Stock limitado',
      cta: cta('Ver todo el catálogo', '/tienda/'),
      products: [
        Product.create({ title: 'Kit Chatbot', description: 'x', category: 'kits', price: 1_299_000, oldPrice: 1_500_000, badge: 'Nuevo', stock: 3 }),
        Product.create({ title: 'Kit CRM', description: 'x', category: 'kits' }),
      ],
    },
    blog: {
      eyebrow: 'Guías',
      title: 'Guías',
      subtitle: 'x',
      cta: cta('Ver blog', '/blog/'),
      articles: [Article.create({ title: 'Guía Uno', excerpt: 'x', category: 'Automatización', readingTime: '5 min' })],
    },
    faq: { eyebrow: 'Preguntas', title: 'Preguntas', items: [Faq.create({ question: '¿Q?', answer: 'R' })] },
    contact: {
      eyebrow: 'Diagnóstico gratuito',
      title: 'Contacto',
      slots: { label: 'Cupos de {month}', value: '{taken} de {total} tomados' },
      benefits: ['Diagnóstico'],
      person: { name: 'Michael', role: '[Cargo]', note: 'Revisa cada diagnóstico' },
      photoAlt: 'Michael',
      whatsappCta: 'Prefiero escribir por WhatsApp',
      whatsappMessage: 'Hola',
      formOptions: [{ value: 'automatizacion-de-procesos', label: 'Automatización' }],
    },
    business: {
      name: 'Orion Core Tecnologías',
      legalName: 'Orion Core Tecnologías S.A.S.',
      nit: '[número]',
      email: 'contacto@orioncore.co',
      phoneLabel: '+57 300 123 4567',
      whatsapp: PhoneNumber.parse('3001234567'),
      address: '[Dirección]',
      city: 'Bogotá D.C.',
      hours: 'Lun a vie · [8:00 a. m. – 6:00 p. m.]',
    },
    ...overrides,
  };
}
