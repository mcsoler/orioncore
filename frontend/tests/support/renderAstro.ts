import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { getContainerRenderer } from '@astrojs/react';
import { loadRenderers } from 'astro:container';
import { JSDOM } from 'jsdom';

let containerPromise: Promise<AstroContainer> | undefined;

function container(): Promise<AstroContainer> {
  containerPromise ??= loadRenderers([getContainerRenderer()]).then(async (renderers) => {
    const astro = await AstroContainer.create({ renderers });
    // Para que las islas (client:*) se rendericen como <astro-island>
    astro.addClientRenderer({ name: '@astrojs/react', entrypoint: '@astrojs/react/client.js' });
    return astro;
  });
  return containerPromise;
}

type AstroComponent = Parameters<AstroContainer['renderToString']>[0];

/** Renderiza un componente .astro con el Container API y devuelve su HTML y un DOM para consultarlo. */
export async function renderAstro(
  component: AstroComponent,
  options: { props?: object; slots?: Record<string, string>; params?: Record<string, string> } = {},
) {
  const html = await (await container()).renderToString(component, options as Parameters<AstroContainer['renderToString']>[1]);
  const { document } = new JSDOM(`<!doctype html><body>${html}</body>`).window;
  return { html, document };
}

/**
 * Renderiza una página completa (con <html> y <head>).
 * Las páginas sin Props se tipan como `(_props: never) => any`, por eso se recibe unknown.
 */
export async function renderPage(page: unknown, params: Record<string, string> = {}) {
  const html = await (await container()).renderToString(page as AstroComponent, { params, partial: false });
  const { document } = new JSDOM(html).window;
  return { html, document };
}
