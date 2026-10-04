import { defineCollection } from 'astro:content';

// Contenido editable del sitio. Se valida con Zod en StaticContentRepository
// (infraestructura) para que el dominio no dependa de Astro.
export const collections = {
  home: defineCollection({ type: 'data' }),
};
