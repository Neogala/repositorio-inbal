import { expect, test } from '@playwright/test'

test.describe('Plantilla: encabezado y pie', () => {
  test('el home carga con título y encabezado sobre la portada', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Colección Digital INBAL/)
    await expect(page.locator('h1').first()).toHaveText('Colección digital')

    const header = page.locator('header')
    await expect(header).toHaveAttribute('data-solid', 'false')

    await page.mouse.wheel(0, 2000)
    await expect(header).toHaveAttribute('data-solid', 'true')
  })

  test('el buscador lleva a /obras con la consulta', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Buscar' }).click()
    const input = page.getByRole('searchbox', { name: /Buscar obras/ })
    await input.fill('Orozco')
    await input.press('Enter')
    await expect(page).toHaveURL(/\/obras\?q=Orozco$/)
  })

  test('el menú móvil abre y se cierra con Escape', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')
    const toggle = page.getByRole('button', { name: 'Abrir menú' })
    await toggle.click()
    await expect(toggle).toHaveAttribute('aria-expanded', 'true')
    await expect(page.getByRole('navigation', { name: 'Menú' }).getByRole('link', { name: 'Obras' })).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(toggle).toHaveAttribute('aria-expanded', 'false')
  })

  test('el pie muestra las ligas principales', async ({ page }) => {
    await page.goto('/')
    const footer = page.locator('footer')
    await expect(footer.getByRole('link', { name: 'Curadurías' })).toBeVisible()
  })
})
