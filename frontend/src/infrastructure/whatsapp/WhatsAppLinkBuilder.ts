import { PhoneNumber } from '../../domain/value-objects/PhoneNumber';

/** Builder de enlaces click-to-chat: `https://wa.me/573001234567?text=...`. */
export class WhatsAppLinkBuilder {
  private phone?: PhoneNumber;
  private text = '';

  to(phone: PhoneNumber): this {
    this.phone = phone;
    return this;
  }

  /** Dígitos sin `+` (como los entrega el HomeViewModel). */
  toDigits(digits: string): this {
    return this.to(PhoneNumber.parse(digits));
  }

  withText(text: string): this {
    this.text = text.trim();
    return this;
  }

  build(): string {
    if (!this.phone) throw new Error('WhatsAppLinkBuilder: falta el número de destino');
    const base = `https://wa.me/${this.phone.digits}`;
    return this.text ? `${base}?text=${encodeURIComponent(this.text)}` : base;
  }
}
