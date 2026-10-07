import { createContainer } from '../../src/composition/container';

/** Contenedor y HomeViewModel reales (con el contenido de home.es.json), sin red. */
export async function homeView() {
  const container = createContainer({
    apiUrl: '',
    leadDestination: 'console',
    fetch: async () => new Response('{}'),
  });
  return { container, view: await container.getHomeContent.execute() };
}

/** Todos los href de un documento. */
export function hrefsOf(document: Document): string[] {
  return [...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href')!);
}
