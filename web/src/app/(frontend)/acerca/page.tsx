import type { Metadata } from 'next'

import { Proximamente } from '@/components/Proximamente/Proximamente'

export const metadata: Metadata = { title: 'Acerca del proyecto' }

export default function Page() {
  return <Proximamente titulo="Acerca del proyecto" />
}
