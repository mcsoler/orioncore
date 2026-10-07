import { expect, test, type Page } from '@playwright/test';

/** Espera a que React hidrate la isla (client:visible): Astro quita el atributo ssr. */
async function hydrated(page: Page, section: string) {
  const island = page.locator(`${section} astro-island`);
  await island.scrollIntoViewIfNeeded();
  await expect(island).not.toHaveAttribute('ssr');
}

const WIDTHS = [360, 768, 1280];

test.describe('responsive', () => {
  for (const width of WIDTHS) {
    for (const path of ['/', '/servicios/software-a-medida/', '/tienda/']) {
      test(`${path} a ${width}px no tiene scroll horizontal`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(path);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        expect(overflow).toBe(0);
      });
    }
  }
});

test.describe('navegación', () => {
  test('menú móvil: abre con el botón, Escape lo cierra y devuelve el foco', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto('/');
    const toggle = page.getByRole('button', { name: 'Abrir menú' });
    await toggle.click();
    await expect(page.getByRole('button', { name: 'Cerrar menú' })).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByRole('navigation', { name: 'Menú móvil' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('navigation', { name: 'Menú móvil' })).toBeHidden();
    await expect(page.getByRole('button', { name: 'Abrir menú' })).toBeFocused();
  });

  test('submenú de Servicios: se despliega y se cierra con Escape', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    const toggle = page.getByRole('navigation', { name: 'Principal' }).getByRole('button', { name: 'Servicios' });
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByRole('link', { name: 'Software Empresarial a Medida' }).first()).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(toggle).toBeFocused();
  });
});

test.describe('globo 3D diferido', () => {
  test('en escritorio se carga después, con el navegador libre, y reemplaza la imagen', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    const globeRequest = page.waitForRequest('**/globe.gl.min.js');
    await page.goto('/');
    await globeRequest;
    await expect(page.locator('[data-globe]')).toHaveClass(/is-live/, { timeout: 15_000 });
  });

  test('el globo gira: dos capturas separadas en el tiempo son distintas', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    const globe = page.locator('[data-globe]');
    await expect(globe).toHaveClass(/is-live/, { timeout: 15_000 });
    await page.waitForTimeout(1500);
    const before = await globe.screenshot();
    await page.waitForTimeout(2500);
    const after = await globe.screenshot();
    expect(before.equals(after)).toBe(false);
  });

  test('en móvil nunca descarga globe.gl ni las texturas', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    const requested: string[] = [];
    page.on('request', (r) => requested.push(r.url()));
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    expect(requested.filter((u) => /globe\.gl|earth-/.test(u))).toEqual([]);
  });

  test('con prefers-reduced-motion no carga el globo ni anima', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 1280, height: 800 });
    const requested: string[] = [];
    page.on('request', (r) => requested.push(r.url()));
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    expect(requested.filter((u) => u.includes('globe.gl'))).toEqual([]);
  });
});

test('el botón de WhatsApp aparece al salir del hero', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto('/');
  // getByRole ignora elementos con visibility: hidden, por eso se ubica por su atributo
  const button = page.locator('[data-whatsapp-float]');
  await expect(button).toBeHidden();
  await page.locator('#servicios').scrollIntoViewIfNeeded();
  await expect(button).toBeVisible();
});

test('calculadora: el slider actualiza el resultado', async ({ page }) => {
  await page.goto('/#calculadora');
  await hydrated(page, '#calculadora');
  const hours = page.getByLabel(/Horas a la semana en tareas repetitivas/);
  await hours.focus();
  await page.keyboard.press('ArrowRight'); // 15 → 16 h/semana
  await expect(page.getByTestId('hours-per-year')).toHaveText('831');
});

test('formulario: envía el lead al backend con el contrato actual y muestra el éxito', async ({ page }) => {
  let body: unknown;
  await page.route('**/api/contact', async (route) => {
    body = route.request().postDataJSON();
    await route.fulfill({ status: 200, json: { id: '1' } });
  });
  await page.goto('/#contacto');
  await hydrated(page, '#contacto');
  const form = page.locator('#contacto form');
  await form.getByRole('checkbox', { name: 'Agente IA WhatsApp' }).check();
  await form.getByLabel('Nombre', { exact: true }).fill('Ana Gómez');
  await form.getByLabel('WhatsApp', { exact: true }).fill('300 123 4567');
  await form.getByRole('checkbox', { name: /Acepto la política/ }).check();
  await form.getByRole('button', { name: /Reservar mi cupo gratis/ }).click();
  await form.getByLabel('Correo electrónico').fill('ana@empresa.com');
  await form.getByRole('button', { name: 'Enviar solicitud' }).click();

  await expect(page.locator('#contacto').getByRole('status')).toContainText('Recibimos tu solicitud');
  expect(body).toEqual({ name: 'Ana Gómez', phone: '+573001234567', email: 'ana@empresa.com' });
});

test('carrito: "Agregar al carrito" actualiza el contador del header y se conserva al recargar', async ({ page }) => {
  await page.goto('/#tienda');
  const badge = page.getByTestId('cart-count');
  await expect(badge).toHaveText('0');
  const first = page.locator('#tienda article').first();
  await expect(first.locator('astro-island')).not.toHaveAttribute('ssr');
  await first.getByRole('button', { name: /Agregar al carrito/ }).click();
  await first.getByRole('button', { name: /Agregar al carrito/ }).click();
  await expect(badge).toHaveText('2');
  await page.reload();
  await expect(page.getByTestId('cart-count')).toHaveText('2');
});

test('una URL inexistente responde 404', async ({ page }) => {
  const response = await page.goto('/no-existe/');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Página no encontrada');
});
