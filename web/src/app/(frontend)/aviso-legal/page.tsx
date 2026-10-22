import type { Metadata } from 'next'

import { Proximamente } from '@/components/Proximamente/Proximamente'

export const metadata: Metadata = { title: 'Aviso legal' }

export default function Page() {
  return <Proximamente titulo="Aviso legal" />
}
