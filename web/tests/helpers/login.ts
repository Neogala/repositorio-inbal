import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

import { URL_E2E } from './url'

export interface LoginOptions {
  page: Page
  serverURL?: string
  user: {
    email: string
    password: string
  }
}

/**
 * Logs the user into the admin panel via the login page.
 */
export async function login({ page, serverURL = URL_E2E, user }: LoginOptions): Promise<void> {
  await page.goto(`${serverURL}/admin/login`)

  await page.fill('#field-email', user.email)
  await page.fill('#field-password', user.password)
  await page.click('button[type="submit"]')

  await page.waitForURL(`${serverURL}/admin`)

  const dashboardArtifact = page.locator('span[title="Panel de Control"]')
  await expect(dashboardArtifact).toBeVisible({ timeout: 20_000 })
}
