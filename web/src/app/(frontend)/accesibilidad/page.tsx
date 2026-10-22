import type { Metadata } from 'next'

import { Proximamente } from '@/components/Proximamente/Proximamente'

export const metadata: Metadata = { title: 'Accesibilidad' }

export default function Page() {
  return <Proximamente titulo="Accesibilidad" />
}
