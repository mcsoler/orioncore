import type { HubRowView, MarketingHubView } from '../dto/PageViews';
import type { PageContentRepository } from '../ports/out/PageContentRepository';

const number = (n: number) => String(n).padStart(2, '0');

/** Hub /marketing-digital/: la estrategia 360° y las 7 líneas, cada una con su ancla y su página. */
export class GetMarketingHub {
  constructor(private readonly content: PageContentRepository) {}

  execute(): MarketingHubView {
    const hub = this.content.getMarketingHub();
    const rows: Omit<HubRowView, 'number'>[] = [
      { ...hub.strategy, href: '#contacto' },
      ...hub.lines.map(({ line, hub: block }) => ({
        id: line.slug.value,
        title: line.title,
        visual: block.visual,
        heading: block.heading,
        text: block.text,
        items: block.items,
        cta: block.cta,
        href: line.href,
      })),
    ];

    return {
      hero: hub.hero,
      rows: rows.map((row, i) => ({ ...row, number: number(i + 1) })),
      plans: hub.plans,
      faq: hub.faq,
      contact: hub.contact,
    };
  }
}
