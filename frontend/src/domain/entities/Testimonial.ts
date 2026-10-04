import { requireText } from './guards';

export class Testimonial {
  private constructor(
    readonly quote: string,
    readonly author: string,
    readonly company?: string,
  ) {}

  static create(props: { quote: string; author: string; company?: string }): Testimonial {
    return new Testimonial(
      requireText('quote', props.quote),
      requireText('author', props.author),
      props.company?.trim() || undefined,
    );
  }
}
