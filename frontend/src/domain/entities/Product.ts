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

export const AVAILABILITIES = ['in_stock', 'backorder'] as const;
/** `in_stock` = se despacha ya; `backorder` = bajo pedido. */
export type Availability = (typeof AVAILABILITIES)[number];

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
  /** Texto de disponibilidad de la tarjeta ("En stock · envío 24 h"). */
  stockLabel?: string;
  availability?: Availability;
  /** Despacho en 24 horas. */
  fastShipping?: boolean;
  /** Incluye instalación de nuestro equipo técnico. */
  installation?: boolean;
  brand?: string;
  /** Se muestra en la tienda del home. */
  featured?: boolean;
}

/** Producto de la tienda: /tienda/{slug}/. */
export class Product {
  private constructor(
    readonly title: string,
    readonly slug: Slug,
    readonly description: string,
    readonly category: Slug,
    readonly availability: Availability,
    readonly fastShipping: boolean,
    readonly installation: boolean,
    readonly featured: boolean,
    readonly price?: Money,
    readonly oldPrice?: Money,
    readonly badge?: string,
    readonly stock?: number,
    readonly stockLabel?: string,
    readonly brand?: string,
  ) {}

  static create(props: ProductProps): Product {
    if (props.stock !== undefined && (!Number.isInteger(props.stock) || props.stock < 0)) {
      throw new InvalidValueError('stock', 'debe ser un entero mayor o igual a 0');
    }
    const availability = props.availability ?? 'in_stock';
    if (!AVAILABILITIES.includes(availability)) {
      throw new InvalidValueError('availability', `"${availability}" no es in_stock ni backorder`);
    }
    const price = props.price === undefined ? undefined : Money.cop(props.price);
    const oldPrice = props.oldPrice === undefined ? undefined : Money.cop(props.oldPrice);
    if (price && oldPrice && oldPrice.amount < price.amount) {
      throw new InvalidValueError('oldPrice', 'no puede ser menor que el precio actual');
    }
    const title = requireText('title', props.title);
    return new Product(
      title,
      props.slug ? Slug.of(props.slug) : Slug.fromText(title),
      requireText('description', props.description),
      Slug.of(props.category),
      availability,
      props.fastShipping ?? false,
      props.installation ?? false,
      props.featured ?? false,
      price,
      oldPrice,
      optionalText('badge', props.badge),
      props.stock,
      optionalText('stockLabel', props.stockLabel),
      optionalText('brand', props.brand),
    );
  }

  get href(): string {
    return `/tienda/${this.slug.value}/`;
  }

  get inStock(): boolean {
    return this.availability === 'in_stock';
  }

  /** Lo que se ahorra frente al precio anterior; sin ambos precios no hay ahorro que mostrar. */
  get savings(): Money | undefined {
    if (!this.price || !this.oldPrice || this.oldPrice.equals(this.price)) return undefined;
    return Money.cop(this.oldPrice.amount - this.price.amount);
  }
}
