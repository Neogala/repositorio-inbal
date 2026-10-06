import type { Metadata } from 'next'
import { Fraunces, Noto_Sans } from 'next/font/google'
import React from 'react'

import { SiteFooter } from '@/components/SiteFooter/SiteFooter'
import { SiteHeader } from '@/components/SiteHeader/SiteHeader'
import './styles.css'

const fraunces = Fraunces({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  axes: ['opsz'],
  variable: '--font-fraunces',
  display: 'swap',
})

const notoSans = Noto_Sans({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-noto-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Colección Digital INBAL',
    template: '%s · Colección Digital INBAL',
  },
  description:
    'Preservar, organizar y difundir el patrimonio artístico de México. Obras de los museos del Instituto Nacional de Bellas Artes y Literatura.',
}

export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${fraunces.variable} ${notoSans.variable}`}>
      <body>
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  )
}
