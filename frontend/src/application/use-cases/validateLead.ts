import type { LeadField, LeadRequest } from '../dto/LeadRequest';
import type { ValidLead } from '../ports/out/LeadGateway';
import { InvalidValueError } from '../../domain/errors/DomainError';
import { Email } from '../../domain/value-objects/Email';
import { PhoneNumber } from '../../domain/value-objects/PhoneNumber';

export const MESSAGES = {
  name: 'Escribe tu nombre (mínimo 2 letras).',
  whatsapp: 'Escribe un celular colombiano válido, por ejemplo 300 123 4567.',
  email: 'Escribe un correo válido, por ejemplo nombre@empresa.com.',
  services: 'Elige al menos un servicio.',
  consent: 'Debes autorizar el tratamiento de tus datos (Ley 1581 de 2012) para que te contactemos.',
  form: 'No pudimos enviar tu solicitud. Inténtalo de nuevo o escríbenos por WhatsApp.',
} as const;

/** Campos del primer paso del formulario (datos de contacto). */
export const CONTACT_FIELDS = ['name', 'whatsapp', 'email'] as const satisfies readonly LeadField[];

export interface LeadValidation {
  errors: Partial<Record<LeadField, string>>;
  lead?: ValidLead;
}

/** Valida y normaliza un lead. Sin efectos: la usan SubmitLead y el formulario por pasos. */
export function validateLead(request: LeadRequest): LeadValidation {
  const errors: Partial<Record<LeadField, string>> = {};

  const name = request.name.trim();
  if (name.length < 2) errors.name = MESSAGES.name;
  const phone = parseOrFlag(() => PhoneNumber.parse(request.whatsapp), () => (errors.whatsapp = MESSAGES.whatsapp));
  const email = parseOrFlag(() => Email.parse(request.email), () => (errors.email = MESSAGES.email));
  const services = request.services.map((s) => s.trim()).filter(Boolean);
  if (services.length === 0) errors.services = MESSAGES.services;
  if (request.consent !== true) errors.consent = MESSAGES.consent;

  if (Object.keys(errors).length > 0 || !phone || !email) return { errors };

  return {
    errors,
    lead: {
      name,
      phone,
      email,
      services,
      consent: true,
      ...optional('company', request.company),
      ...optional('message', request.message),
    },
  };
}

function parseOrFlag<T>(parse: () => T, flag: () => void): T | undefined {
  try {
    return parse();
  } catch (error) {
    if (!(error instanceof InvalidValueError)) throw error;
    flag();
    return undefined;
  }
}

function optional<K extends string>(key: K, value: string | undefined): Partial<Record<K, string>> {
  const text = value?.trim();
  return text ? ({ [key]: text } as Record<K, string>) : {};
}
