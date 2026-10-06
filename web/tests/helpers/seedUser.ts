import { getPayload } from 'payload'
import config from '../../src/payload.config.js'

import { randomBytes } from 'crypto'

// Usuario temporal para pruebas e2e: la contraseña se genera en cada corrida
// para no dejar credenciales en el repositorio.
export const testUser = {
  email: 'e2e@coleccion-inbal.test',
  password: randomBytes(16).toString('hex'),
}

/**
 * Seeds a test user for e2e admin tests.
 */
export async function seedTestUser(): Promise<void> {
  const payload = await getPayload({ config })

  // Delete existing test user if any
  await payload.delete({
    collection: 'users',
    where: {
      email: {
        equals: testUser.email,
      },
    },
  })

  // Create fresh test user
  await payload.create({
    collection: 'users',
    data: testUser,
  })
}

/**
 * Cleans up test user after tests
 */
export async function cleanupTestUser(): Promise<void> {
  const payload = await getPayload({ config })

  await payload.delete({
    collection: 'users',
    where: {
      email: {
        equals: testUser.email,
      },
    },
  })
}
