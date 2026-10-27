// Sitio contra el que corren las pruebas e2e: el de desarrollo por omisión, o el
// que indique E2E_URL (por ejemplo, un build de producción con next start).
export const URL_E2E = process.env.E2E_URL || 'http://localhost:3000'
