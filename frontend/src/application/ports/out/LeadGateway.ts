import type { Email } from '../../../domain/value-objects/Email';
import type { PhoneNumber } from '../../../domain/value-objects/PhoneNumber';

/** Lead ya validado y normalizado por SubmitLead. */
export interface ValidLead {
  name: string;
  phone: PhoneNumber;
  email: Email;
  company?: string;
  services: readonly string[];
  message?: string;
  consent: true;
}

/** El destino del lead no lo recibió (red, timeout, 4xx/5xx). */
export class LeadGatewayError extends Error {
  constructor(message: string, readonly status?: number) {
    super(message);
    this.name = 'LeadGatewayError';
  }
}

/** Puerto de salida (Strategy): a dónde se envía el lead. */
export interface LeadGateway {
  submit(lead: ValidLead): Promise<void>;
}
