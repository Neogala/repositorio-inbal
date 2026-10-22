import type { Metadata } from 'next'

import { Proximamente } from '@/components/Proximamente/Proximamente'

export const metadata: Metadata = { title: 'Obras' }

export default function Page() {
  return <Proximamente titulo="Obras" />
}
