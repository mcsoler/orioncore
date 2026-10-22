import { describe, expect, it } from 'vitest';
import { ContentValidationError, StaticContentRepository } from '../../../src/infrastructure/content/StaticContentRepository';
import { GetHomeContent } from '../../../src/application/use-cases/GetHomeContent';
import { RouteRegistry } from '../../../src/domain/routing/RouteRegistry';
import content from '../../../src/content/home/home.es.json';
import pages from '../../../src/content/pages/pages.es.json';
import { SeoMetaBuilder } from '../../../src/infrastructure/seo/SeoMetaBuilder';

const repository = () => new StaticContentRepository(content);
const registry = () => RouteRegistry.create(repository().getRoutes());

/** Mapa de URLs aprobado (Paso 0.5). Las rutas de colección cuentan por su patrón. */
const APPROVED_URL_MAP = [
  '/',
  '/servicios/automatizacion-de-procesos/',
  '/servicios/agentes-ia-whatsapp/',
  '/servicios/software-a-medida/',
  '/servicios/seguridad-control-de-acceso/',
  '/marketing-digital/',
  '/marketing-digital/analisis-web/',
  '/marketing-digital/branding-digital/',
  '/marketing-digital/community-manager/',
  '/marketing-digital/posicionamiento-de-marca/',
  '/marketing-digital/email-marketing/',
  '/marketing-digital/pauta-digital/',
  '/marketing-digital/integraciones-web/',
  '/tienda/',
  '/tienda/[categoria]/',
  '/tienda/[producto]/',
  '/casos/',
  '/casos/[cliente]/',
  '/blog/',
  '/blog/[articulo]/',
  '/nosotros/',
  '/contacto/',
  '/privacidad/',
  '/terminos/',
];

describe('StaticContentRepository (content/home/home.es.json)', () => {
  it('el contenido real es válido', () => {
    expect(repository).not.toThrow();
  });

  it('el RouteRegistry contiene exactamente las 24 URLs del mapa aprobado', () => {
    expect(registry().patterns().sort()).toEqual([...APPROVED_URL_MAP].sort());
    expect(APPROVED_URL_MAP).toHaveLength(24);
  });

  it('todas las rutas tienen title (≤ 60) y description (≤ 155) válidos para SEO', () => {
    const site = { url: 'https://orioncore.co', name: 'Orion Core', locale: 'es_CO', image: '/og-image.png' };
    for (const route of registry().all()) {
      expect(route.description, route.path).toBeTruthy();
      expect(() =>
        new SeoMetaBuilder(site)
          .forPath(route.path)
          .withTitle(route.seoTitle ?? `${route.title} | Orion Core`)
          .withDescription(route.description!)
          .build(),
      ).not.toThrow();
    }
  });

  it('el home usa el title y la description SEO aprobados', () => {
    const home = registry().get('/');
    expect(home.seoTitle).toBe('Automatización, IA y Marketing para Empresas | Orion Core');
    expect(home.description).toBe(
      'Automatizamos procesos, atendemos WhatsApp con IA 24/7, creamos software y marketing 360°. Diagnóstico gratis en Colombia.',
    );
  });

  it('el home es la única ruta publicada en la fase 1', () => {
    expect(registry().sitemapEntries()).toEqual(['/']);
  });

  it('entrega los 5 servicios en el orden oficial', async () => {
    const home = await repository().getHome();
    expect(home.services.items.map((s) => s.href)).toEqual([
      '/servicios/automatizacion-de-procesos/',
      '/servicios/agentes-ia-whatsapp/',
      '/servicios/software-a-medida/',
      '/servicios/seguridad-control-de-acceso/',
      '/marketing-digital/',
    ]);
    expect(home.services.items.find((s) => s.badge)?.href).toBe('/servicios/agentes-ia-whatsapp/');
  });

  it('usa los textos de la referencia del home (home-html/Main.dc.html)', async () => {
    const home = await repository().getHome();
    expect(home.hero.hook).toEqual({
      before: 'Deja de perder',
      highlight: 'clientes, horas y dinero',
      after: 'en lo que la tecnología ya resuelve.',
    });
    expect(home.pains.title).toBe('Si te pasa al menos una de estas cosas, estás dejando dinero sobre la mesa.');
    expect(home.services.title).toBe('Cinco soluciones. Un mismo objetivo: que tu empresa crezca.');
    expect(home.services.items.map((s) => s.headline)).toEqual([
      'Deja de invertir días en lo que debería tomar minutos.',
      'Cada mensaje respondido a tiempo es una oportunidad que no se pierde.',
      'Toda tu empresa en una sola pantalla.',
      'Sabe quién entra, cuándo y por dónde. Siempre.',
      'Más clientes, no solo más likes.',
    ]);
    expect(home.services.items[2]!.items).toEqual([
      'ERP y CRM a la medida de tu operación',
      'Analítica de datos y dashboards en tiempo real',
      'Migración de datos sin perder información',
      'Almacenamiento y despliegue en la nube',
      'Portales empresariales e integraciones personalizadas',
    ]);
    expect(home.services.items.map((s) => s.ctaHref)).toEqual(['#contacto', 'whatsapp', '#contacto', '#contacto', '#marketing360']);
    expect(home.marketing.items.map((m) => m.title)).toEqual([
      'Análisis web', 'Branding digital', 'Community manager', 'Posicionamiento presencial',
      'Email marketing', 'Pauta multicanal', 'Conexiones e integraciones web',
    ]);
    expect(home.faq.items.map((f) => f.question)).toEqual([
      '¿El diagnóstico de verdad es gratis?',
      '¿Cuánto cuesta un proyecto?',
      '¿Cuánto tarda la implementación?',
      '¿Puedo contratar solo un servicio?',
    ]);
  });

  it('entrega las líneas de marketing, productos, casos y artículos del home', async () => {
    const home = await repository().getHome();
    expect(home.marketing.items).toHaveLength(7);
    expect(home.shop.products).toHaveLength(9);
    expect(home.results.cases).toHaveLength(3);
    expect(home.blog.articles).toHaveLength(5);
    expect(home.process.steps).toHaveLength(4);
    expect(home.pains.items).toHaveLength(4);
  });

  it('la calculadora menciona software a la medida, automatización, análisis de datos y agentes de IA', async () => {
    const { calculator } = await repository().getHome();
    for (const topic of ['software a la medida', 'automatización', 'análisis de datos', 'agentes de IA']) {
      expect(calculator.subtitle).toContain(topic);
    }
  });

  it('beneficios del diagnóstico: sin "tuyo aunque no sigas" y con asesoría gratuita', async () => {
    const { contact } = await repository().getHome();
    expect(contact.benefits).toEqual([
      'Plan de acción con prioridades',
      'Respuesta en menos de 24 horas',
      'Equipo multidisciplinario asignado',
      'Asesoría y acompañamiento gratuito',
    ]);
  });

  it('cupos: empiezan en 4 de 10 y los textos usan el mes en curso', async () => {
    const home = await repository().getHome();
    expect(home.slots.remaining).toBe(4);
    expect(home.slots.total).toBe(10);
    expect(home.announcement.text).toBe('Diagnóstico gratuito de {month}: quedan solo {remaining} de {total} cupos');
    expect(home.contact.slots).toEqual({ label: 'Cupos de {month}', value: '{taken} de {total} tomados' });
  });

  it('usa los datos de contacto confirmados', async () => {
    const { business } = await repository().getHome();
    expect(business.email).toBe('orioncoretechnologies@gmail.com');
    expect(business.phoneLabel).toBe('+57 305 419 5433');
    expect(business.whatsapp?.value).toBe('+573054195433');
  });

  it('muestra las cifras confirmadas y deja pendiente la que no lo está', async () => {
    const { results } = await repository().getHome();
    expect(results.stats).toEqual([
      { value: '10+', label: 'Proyectos entregados' },
      { value: '5+', label: 'Empresas clientes' },
      { value: '5+', label: 'Años de experiencia' },
      { value: '24/7', label: 'Soporte técnico' },
    ]);
  });

  it('integridad de enlaces: todo href interno del home existe en el RouteRegistry', async () => {
    const view = await new GetHomeContent(repository()).execute();
    const hrefs = [...JSON.stringify(view).matchAll(/"href":"([^"]+)"/g)].map((m) => m[1]!);
    const internal = hrefs.filter((h) => h.startsWith('/'));

    expect(internal.length).toBeGreaterThan(20);
    expect(internal.filter((h) => !registry().has(h))).toEqual([]);
    expect(hrefs).not.toContain('#');
    expect(hrefs.filter((h) => h.startsWith('#'))).toEqual(
      expect.arrayContaining(['#contacto']),
    );
  });

  describe('con JSON inválido', () => {
    it('falla si falta una sección, indicando la ruta del campo', () => {
      const { home: _home, ...broken } = content;
      expect(() => new StaticContentRepository(broken)).toThrow(ContentValidationError);
      expect(() => new StaticContentRepository(broken)).toThrow(/home/);
    });

    it('falla si un servicio no tiene ítems', () => {
      const broken = structuredClone(content);
      broken.services[0]!.items = [];
      expect(() => new StaticContentRepository(broken)).toThrow(/services\.0\.items/);
    });

    it('falla si un estado no es draft ni published', () => {
      const broken = structuredClone(content) as { pages: { status: string }[] };
      broken.pages[0]!.status = 'oculto';
      expect(() => new StaticContentRepository(broken)).toThrow(ContentValidationError);
    });

    it('falla si una entidad del dominio rechaza el dato (slug inválido)', () => {
      const broken = structuredClone(content);
      broken.articles[0]!.slug = 'Slug Malo';
      expect(() => new StaticContentRepository(broken).getRoutes()).toThrow();
    });

    it('falla si no es un objeto', () => {
      expect(() => new StaticContentRepository('texto')).toThrow(ContentValidationError);
    });
  });
});

describe('Plan SEO (orioncore.html → URLs y metadatos)', () => {
  const PLAN: [string, string, string][] = [
    ['/', 'Automatización, IA y Marketing para Empresas | Orion Core', 'Automatizamos procesos, atendemos WhatsApp con IA 24/7, creamos software y marketing 360°. Diagnóstico gratis en Colombia.'],
    ['/servicios/automatizacion-de-procesos/', 'Automatización de Procesos para Empresas | Orion Core', 'Elimina tareas manuales: integramos tus plataformas y automatizamos reportes y alertas. Recupera horas cada semana.'],
    ['/servicios/agentes-ia-whatsapp/', 'Agentes de IA para WhatsApp: Atención 24/7 | Orion Core', 'Responde en segundos, califica prospectos y agenda citas por WhatsApp 24/7. Prueba gratis el agente con tu negocio.'],
    ['/servicios/software-a-medida/', 'Software a Medida y CRM para Empresas | Orion Core', 'CRM, dashboards, portales y apps hechos a la medida de tu operación. Cotiza tu software con precio cerrado.'],
    ['/servicios/seguridad-control-de-acceso/', 'Control de Acceso y Reconocimiento Facial | Orion Core', 'Controla quién entra a tu empresa con reconocimiento facial, permisos y alertas en tiempo real. Evaluación gratuita.'],
    ['/marketing-digital/', 'Agencia de Marketing Digital 360° en Colombia | Orion Core', 'Estrategia, branding, redes, pauta y email en un solo equipo. Más clientes, no solo más likes. Auditoría gratis.'],
    ['/marketing-digital/analisis-web/', 'Análisis y Auditoría Web (UX, SEO y CRO) | Orion Core', 'Descubre por qué tu web no convierte: auditoría de experiencia, velocidad, SEO y embudo con plan de acción.'],
    ['/marketing-digital/branding-digital/', 'Branding Digital: Diseño de Logo e Identidad | Orion Core', 'Logo, paleta, tipografía y manual de marca para que tu empresa se vea profesional en web y redes.'],
    ['/marketing-digital/community-manager/', 'Community Manager y Gestión de Redes Sociales | Orion Core', 'Contenido, diseño, reels y gestión de comunidad para tus redes, todos los meses. Planes desde [$X].'],
    ['/marketing-digital/posicionamiento-de-marca/', 'Posicionamiento de Marca Presencial y POP | Orion Core', 'Material POP, activaciones, eventos y piezas impresas alineadas con tu marca digital.'],
    ['/marketing-digital/email-marketing/', 'Email Marketing y Automatizaciones | Orion Core', 'Correos que venden solos: bienvenida, recompra y carrito abandonado. Diseño, segmentación y reportes.'],
    ['/marketing-digital/pauta-digital/', 'Pauta en Meta, Google, TikTok y LinkedIn | Orion Core', 'Campañas en Meta, Google, TikTok, Pinterest y LinkedIn optimizadas por costo por cliente.'],
    ['/marketing-digital/integraciones-web/', 'Integraciones Web: CRM, Pagos y WhatsApp | Orion Core', 'Conectamos tu web con CRM, pasarelas de pago, WhatsApp y API de conversiones para medir cada venta.'],
    ['/tienda/', 'Tienda de Tecnología para Empresas | Orion Core', 'Laptops, redes Wi‑Fi, cámaras y control de acceso con envío a toda Colombia, garantía e instalación opcional.'],
  ];

  it.each(PLAN)('%s usa el title y la meta description del plan', (path, title, description) => {
    const route = registry().get(path);
    expect(route.seoTitle).toBe(title);
    expect(route.description).toBe(description);
  });

  it('las fichas de producto usan "[Producto] | Precio y Envío | Orion Core"', () => {
    expect(registry().get('/tienda/router-wifi-6-malla/').seoTitle).toBe('[Router Wi‑Fi 6 malla x3] | Precio y Envío | Orion Core');
  });

  it('la tienda tiene las 5 categorías del catálogo y sus 9 productos, sin choques de URL', () => {
    const shop = registry().all().filter((r) => r.section === 'tienda' && r.depth === 2);
    expect(shop.filter((r) => r.pattern === '/tienda/[categoria]/').map((r) => r.path)).toEqual([
      '/tienda/laptops/', '/tienda/redes/', '/tienda/seguridad/', '/tienda/accesorios/', '/tienda/smart-office/',
    ]);
    expect(shop.filter((r) => r.pattern === '/tienda/[producto]/')).toHaveLength(9);
  });
});

describe('StaticContentRepository (content/pages/pages.es.json)', () => {
  const withPages = () => new StaticContentRepository(content, pages);

  it('el contenido de las plantillas es válido', () => {
    expect(withPages).not.toThrow();
  });

  it('cada servicio con página tiene su contenido de plantilla', () => {
    const repo = withPages();
    for (const slug of ['automatizacion-de-procesos', 'agentes-ia-whatsapp', 'software-a-medida', 'seguridad-control-de-acceso']) {
      expect(repo.getServicePage(slug)?.service.slug.value, slug).toBe(slug);
    }
    expect(repo.getServicePage('marketing-digital-360')).toBeUndefined();
  });

  it('indica el archivo y el campo cuando el contenido de las páginas no es válido', () => {
    const broken = { ...pages, shop: { ...pages.shop, trust: [] } };
    expect(() => new StaticContentRepository(content, broken)).toThrow(ContentValidationError);
    expect(() => new StaticContentRepository(content, broken)).toThrow(/pages\.es\.json[\s\S]*shop\.trust/);
  });

  it('sin el contenido de las páginas, el home sigue funcionando y las plantillas avisan', () => {
    const repo = new StaticContentRepository(content);
    expect(() => repo.getRoutes()).not.toThrow();
    expect(() => repo.getShop()).toThrow(/pages\.es\.json/);
  });

  it('todo enlace interno del contenido de las páginas existe en el RouteRegistry', () => {
    const routes = registry();
    const hrefs = JSON.stringify(pages).match(/"href":\s*"(\/[^"#]*)/g)!.map((m) => m.replace(/"href":\s*"/, ''));
    const markdown = [...JSON.stringify({ pages, content }).matchAll(/\]\((\/[^)#]*)/g)].map((m) => m[1]!);
    const missing = [...hrefs, ...markdown].filter((href) => href !== '/' && !routes.has(href));
    expect(missing).toEqual([]);
  });
});
