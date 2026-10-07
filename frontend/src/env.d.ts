/// <reference path="../.astro/types.d.ts" />

interface ImportMetaEnv {
  /** URL del backend; vacío = mismo dominio (Nginx enruta /api). */
  readonly PUBLIC_API_URL?: string;
  /** Destino de los leads: "api" (por defecto) o "console" (desarrollo). */
  readonly PUBLIC_LEAD_DESTINATION?: string;
  /** ID del contenedor de Google Tag Manager; sin él la analítica es un Null Object. */
  readonly PUBLIC_GTM_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
