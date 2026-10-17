import { expect, test } from '@playwright/test'

test.describe('Portada provisional', () => {
  test('el home carga con su título', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Colección Digital INBAL/)
    await expect(page.locator('h1').first()).toHaveText('Colección digital')
  })
})
