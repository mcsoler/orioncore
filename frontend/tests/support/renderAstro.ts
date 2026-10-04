import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { getContainerRenderer } from '@astrojs/react';
import { loadRenderers } from 'astro:container';
import { JSDOM } from 'jsdom';

let containerPromise: Promise<AstroContainer> | undefined;

function container(): Promise<AstroContainer> {
  containerPromise ??= loadRenderers([getContainerRenderer()]).then((renderers) =>
    AstroContainer.create({ renderers }),
  );
  return containerPromise;
}

type AstroComponent = Parameters<AstroContainer['renderToString']>[0];

/** Renderiza un componente .astro con el Container API y devuelve su HTML y un DOM para consultarlo. */
export async function renderAstro(
  component: AstroComponent,
  options: { props?: Record<string, unknown>; slots?: Record<string, string> } = {},
) {
  const html = await (await container()).renderToString(component, options);
  const { document } = new JSDOM(`<!doctype html><body>${html}</body>`).window;
  return { html, document };
}
