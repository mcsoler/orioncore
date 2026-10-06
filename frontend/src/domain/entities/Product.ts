import { Money } from '../value-objects/Money';
import { Slug } from '../value-objects/Slug';
import { InvalidValueError } from '../errors/DomainError';
import { optionalText, requireText } from './guards';

/** Categoría de la tienda: /tienda/{slug}/ (comparte nivel con los productos). */
export class ShopCategory {
  private constructor(
    readonly title: string,
    readonly slug: Slug,
  ) {}

  static create(props: { title: string; slug?: string }): ShopCategory {
    const title = requireText('title', props.title);
    return new ShopCategory(title, props.slug ? Slug.of(props.slug) : Slug.fromText(title));
  }

  get href(): string {
    return `/tienda/${this.slug.value}/`;
  }
}

export interface ProductProps {
  title: string;
  description: string;
  category: string;
  slug?: string;
  /** Pendiente de definir: sin precio no se inventa uno. */
  price?: number;
  /** Precio antes del descuento. */
  oldPrice?: number;
  badge?: string;
  /** Unidades disponibles. */
  stock?: number;
}

/** Producto de la tienda: /tienda/{slug}/. */
export class Product {
  private constructor(
    readonly title: string,
    readonly slug: Slug,
    readonly description: string,
    readonly category: Slug,
    readonly price?: Money,
    readonly oldPrice?: Money,
    readonly badge?: string,
    readonly stock?: number,
  ) {}

  static create(props: ProductProps): Product {
    if (props.stock !== undefined && (!Number.isInteger(props.stock) || props.stock < 0)) {
      throw new InvalidValueError('stock', 'debe ser un entero mayor o igual a 0');
    }
    const title = requireText('title', props.title);
    return new Product(
      title,
      props.slug ? Slug.of(props.slug) : Slug.fromText(title),
      requireText('description', props.description),
      Slug.of(props.category),
      props.price === undefined ? undefined : Money.cop(props.price),
      props.oldPrice === undefined ? undefined : Money.cop(props.oldPrice),
      optionalText('badge', props.badge),
      props.stock,
    );
  }

  get href(): string {
    return `/tienda/${this.slug.value}/`;
  }
}
