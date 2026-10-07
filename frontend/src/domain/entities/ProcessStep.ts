import { InvalidValueError } from '../errors/DomainError';
import { requireText } from './guards';

export class ProcessStep {
  private constructor(
    readonly order: number,
    readonly title: string,
    readonly description: string,
  ) {}

  static create(props: { order: number; title: string; description: string }): ProcessStep {
    if (!Number.isInteger(props.order) || props.order < 1) {
      throw new InvalidValueError('order', 'debe ser un entero mayor o igual a 1');
    }
    return new ProcessStep(props.order, requireText('title', props.title), requireText('description', props.description));
  }
}
