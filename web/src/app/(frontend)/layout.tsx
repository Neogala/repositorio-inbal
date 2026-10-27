import type { Metadata, Viewport } from 'next'
import { Fraunces, Noto_Sans } from 'next/font/google'
import React from 'react'

import { SiteFooter } from '@/components/SiteFooter/SiteFooter'
import { SiteHeader } from '@/components/SiteHeader/SiteHeader'
import { TintesSafari } from '@/components/TintesSafari/TintesSafari'
import { EsqueletoImagenes } from '@/components/EsqueletoImagenes'
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

// Hasta el borde de abajo: Chrome en Android ya no pone la franja blanca sobre la barra del
// sistema y la portada se ve detrás. Lo que va pegado abajo suma env(safe-area-inset-bottom).
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${fraunces.variable} ${notoSans.variable}`}>
      <body>
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
        <TintesSafari />
        <EsqueletoImagenes />
      </body>
    </html>
  )
}
