/** Datos del formulario tal como llegan de la UI (sin validar). */
export interface LeadRequest {
  name: string;
  whatsapp: string;
  email: string;
  company?: string;
  /** Slugs de los servicios de interés. */
  services: readonly string[];
  message?: string;
  /** Autorización de tratamiento de datos (Ley 1581 de 2012). */
  consent: boolean;
}

export type LeadField = keyof LeadRequest | 'form';

export type SubmitLeadResult = { ok: true } | { ok: false; errors: Partial<Record<LeadField, string>> };
