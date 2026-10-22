import { expect, test, type Page } from '@playwright/test';

async function hydrated(page: Page, islandSelector: string) {
  const island = page.locator(islandSelector).first();
  await island.scrollIntoViewIfNeeded();
  await expect(island).not.toHaveAttribute('ssr');
}

test.describe('tienda', () => {
  test('buscar desde el header filtra el catálogo', async ({ page }) => {
    await page.goto('/tienda/');
    await page.getByRole('searchbox', { name: 'Buscar productos' }).fill('cámara');
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/tienda\/\?q=c%C3%A1mara/);
    await hydrated(page, '#catalogo astro-island');
    await expect(page.getByTestId('catalog-count')).toContainText('1 producto en Todo');
  });

  test('agregar desde el catálogo actualiza "Carrito (N)" y el carrito lateral', async ({ page }) => {
    await page.goto('/tienda/');
    await hydrated(page, '#catalogo astro-island');
    await page.getByRole('button', { name: 'Agregar al carrito: [Switch 8 puertos PoE]' }).click();
    await expect(page.getByRole('button', { name: 'Carrito (1)' })).toBeVisible();
    await page.getByRole('button', { name: 'Carrito (1)' }).click();
    const drawer = page.getByRole('dialog', { name: 'Tu carrito (1)' });
    await expect(drawer).toContainText('[Switch 8 puertos PoE]');
    await page.keyboard.press('Escape');
    await expect(drawer).toBeHidden();
  });

  test('ficha: elegir cantidad y agregar abre el carrito con esas unidades', async ({ page }) => {
    await page.goto('/tienda/router-wifi-6-malla/');
    await hydrated(page, 'astro-island:has(button[aria-label="Sumar"])');
    await page.getByRole('button', { name: 'Sumar' }).click();
    await page.getByRole('button', { name: 'Agregar al carrito: [Router Wi‑Fi 6 malla x3]' }).click();
    const drawer = page.getByRole('dialog', { name: 'Tu carrito (2)' });
    await expect(drawer).toContainText('x2');
    await expect(drawer.getByRole('link', { name: 'Finalizar compra con un asesor' })).toHaveAttribute('href', /wa\.me\/573054195433/);
  });
});
