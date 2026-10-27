import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

// Pruebas unitarias: funciones puras y hooks con argumentos falsos. No leen .env ni
// tocan la base, así que corren antes de levantar PostgreSQL (en local y en el CI).
export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: 'node',
    include: ['tests/unit/**/*.unit.spec.ts'],
    // Ninguna prueba hereda los mocks ni las variables de otra.
    restoreMocks: true,
    unstubEnvs: true,
    coverage: {
      provider: 'v8',
      include: ['src/lib/**', 'src/access/**', 'src/hooks/**'],
      reporter: ['text', 'html', 'json-summary'],
      reportsDirectory: './coverage',
      // Por debajo de lo que mide hoy la suite (99% de líneas, 96% de ramas) para
      // que una prueba nueva no rompa el CI por un punto, pero sí una caída real.
      thresholds: {
        lines: 90,
        statements: 90,
        functions: 90,
        branches: 85,
      },
    },
  },
})
