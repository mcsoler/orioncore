/** Ícono de cada servicio o línea de marketing según su URL (es presentación, no contenido). */
const ICONS_BY_SLUG: Record<string, string> = {
  'automatizacion-de-procesos': 'gear',
  'agentes-ia-whatsapp': 'chat',
  'software-a-medida': 'code',
  'seguridad-control-de-acceso': 'shield',
  'marketing-digital': 'rocket',
  'analisis-web': 'chart',
  'branding-digital': 'palette',
  'community-manager': 'users',
  'posicionamiento-presencial': 'megaphone',
  'email-marketing': 'mail',
  'pauta-digital': 'megaphone',
  'integraciones-web': 'plug',
};

const PAIN_ICONS = ['chat', 'clock', 'chart', 'plug'];

/** Último segmento de una ruta interna: `/servicios/software-a-medida/` → `software-a-medida`. */
export function slugOf(href: string): string {
  return href.split('/').filter(Boolean).pop() ?? '';
}

export function iconForHref(href: string): string {
  return ICONS_BY_SLUG[slugOf(href)] ?? 'sparkles';
}

export function painIcon(index: number): string {
  return PAIN_ICONS[index % PAIN_ICONS.length]!;
}
