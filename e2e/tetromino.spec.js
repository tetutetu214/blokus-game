const { test, expect } = require('@playwright/test');
const path = require('path');
const INDEX_URL = 'file://' + path.resolve(__dirname, '..', 'index.html');

async function blockExternalResources(page) {
  await page.route('**/*', (route) => {
    const url = route.request().url();
    if (url.startsWith('file://')) return route.continue();
    return route.abort();
  });
}

test('TETROMINO RECT: no JS errors on load', async ({ page }) => {
  await blockExternalResources(page);
  const errors = [];
  page.on('pageerror', err => errors.push(err.message));
  await page.goto(INDEX_URL, { waitUntil: 'load' });
  await page.waitForTimeout(500);
  expect(errors).toEqual([]);
});

test('TETROMINO RECT: can select from menu, show intro, start game, select piece', async ({ page }) => {
  await blockExternalResources(page);
  const errors = [];
  page.on('pageerror', err => errors.push(err.message));
  await page.goto(INDEX_URL, { waitUntil: 'load' });
  await page.waitForTimeout(300);

  // Open puzzle menu and click TETROMINO RECT
  await page.click('#btn-puzzle-menu');
  await expect(page.locator('#puzzle-menu')).toBeVisible();
  await page.click('#btn-tetromino');

  // App and intro overlay should be visible
  await expect(page.locator('#app')).toBeVisible({ timeout: 3000 });
  await expect(page.locator('#tetromino-intro-overlay')).toBeVisible({ timeout: 3000 });

  // Click START
  await page.click('#tetromino-intro-start-btn');
  await expect(page.locator('#tetromino-intro-overlay')).not.toBeVisible();

  // Board and piece list should be visible
  await expect(page.locator('#board')).toBeVisible();
  await expect(page.locator('#piece-list')).toBeVisible();
  await expect(page.locator('#color-selector')).toBeVisible();

  // 5 tetromino pieces should be shown
  const pieces = page.locator('#piece-list .piece-item');
  const count = await pieces.count();
  expect(count).toBe(5);

  // Select first piece
  await pieces.first().click();
  await expect(pieces.first()).toHaveClass(/selected/);
  await expect(page.locator('#deselect-btn')).toBeVisible();

  // No errors
  expect(errors).toEqual([]);
});
