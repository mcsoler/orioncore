import { requireText } from './guards';

export class Faq {
  private constructor(
    readonly question: string,
    readonly answer: string,
  ) {}

  static create(props: { question: string; answer: string }): Faq {
    return new Faq(requireText('question', props.question), requireText('answer', props.answer));
  }
}
