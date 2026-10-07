export const MAX_TITLE = 60;
export const MAX_DESCRIPTION = 155;

export interface SiteSeo {
  url: string;
  name: string;
  locale: string;
  /** Imagen Open Graph por defecto (con el logo real). */
  image: string;
}

export type JsonLd = Record<string, unknown>;

export interface SeoMeta {
  title: string;
  description: string;
  canonical: string;
  robots: string;
  openGraph: {
    type: 'website';
    url: string;
    title: string;
    description: string;
    siteName: string;
    locale: string;
    image: string;
    imageAlt: string;
  };
  twitter: { card: 'summary_large_image'; title: string; description: string; image: string };
  jsonLd: JsonLd[];
}

/** Builder de metadatos SEO: valida los límites de Google y genera URLs absolutas. */
export class SeoMetaBuilder {
  private path?: string;
  private title?: string;
  private description?: string;
  private robots = 'index, follow';
  private image: string;
  private readonly jsonLd: JsonLd[] = [];

  constructor(private readonly site: SiteSeo) {
    this.image = site.image;
  }

  forPath(path: string): this {
    this.path = path;
    return this;
  }

  withTitle(title: string): this {
    this.title = title.trim();
    return this;
  }

  withDescription(description: string): this {
    this.description = description.trim();
    return this;
  }

  withRobots(robots: string): this {
    this.robots = robots;
    return this;
  }

  withImage(image: string): this {
    this.image = image;
    return this;
  }

  withJsonLd(block: JsonLd): this {
    this.jsonLd.push(block);
    return this;
  }

  build(): SeoMeta {
    if (!this.path) throw new Error('SeoMetaBuilder: falta la ruta de la página');
    if (!this.title) throw new Error('SeoMetaBuilder: falta el title');
    if (!this.description) throw new Error('SeoMetaBuilder: falta la description');
    if (this.title.length > MAX_TITLE) {
      throw new Error(`SeoMetaBuilder: el title tiene ${this.title.length} caracteres (máximo ${MAX_TITLE}): "${this.title}"`);
    }
    if (this.description.length > MAX_DESCRIPTION) {
      throw new Error(
        `SeoMetaBuilder: la description tiene ${this.description.length} caracteres (máximo ${MAX_DESCRIPTION})`,
      );
    }

    const canonical = new URL(this.path, this.site.url).href;
    const image = new URL(this.image, this.site.url).href;
    return {
      title: this.title,
      description: this.description,
      canonical,
      robots: this.robots,
      openGraph: {
        type: 'website',
        url: canonical,
        title: this.title,
        description: this.description,
        siteName: this.site.name,
        locale: this.site.locale,
        image,
        imageAlt: this.site.name,
      },
      twitter: { card: 'summary_large_image', title: this.title, description: this.description, image },
      jsonLd: [...this.jsonLd],
    };
  }
}
