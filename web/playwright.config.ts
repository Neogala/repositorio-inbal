import { defineConfig, devices } from '@playwright/test'

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
import 'dotenv/config'

import { URL_E2E } from './tests/helpers/url'

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests/e2e',
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  // En local el servidor de desarrollo compila al vuelo y a veces tarda: un reintento.
  retries: process.env.CI ? 2 : 1,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: URL_E2E,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], channel: 'chromium' },
    },
  ],
  // Con E2E_URL las pruebas usan un servidor ya levantado (por ejemplo, next start);
  // si no, el de desarrollo. En CI corren contra el build de producción: el
  // servidor de desarrollo compila al vuelo y bajo carga a veces falla por dentro.
  webServer: {
    command: process.env.CI ? 'npm start' : 'npm run dev',
    reuseExistingServer: true,
    url: URL_E2E,
  },
})
