'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

import styles from './TintesSafari.module.css'

// Safari en iOS 26 ignora theme-color: pinta sus barras de arriba y de abajo con el fondo
// de la página o, si hay uno, con el de un elemento fijo de lado a lado pegado a ese borde.
// Estas dos franjas (detrás de las barras de Safari) le dan el color de la portada o del
// pie cuando están en ese borde; el resto del tiempo van con display: none (opacity: 0 sí
// la toma en cuenta) y Safari pinta como siempre. Sin transición, como el fondo de html.
const PORTADA_ARRIBA = '#0f2420' // medido en iPhone bajo el velo de la portada
const PORTADA_ABAJO = '#021412'
const PIE = '#1e5c3b' // --guinda-900

function esIos() {
  const { userAgent, maxTouchPoints } = navigator
  // El iPad con iPadOS se presenta como Mac; se distingue por la pantalla táctil.
  return /iP(hone|ad|od)/.test(userAgent) || (/Macintosh/.test(userAgent) && maxTouchPoints > 1)
}

function pintar(franja: HTMLDivElement | null, color: string | null) {
  if (!franja) return
  franja.style.display = color ? 'block' : 'none'
  if (color) franja.style.backgroundColor = color
}

export function TintesSafari() {
  const pathname = usePathname()
  const arriba = useRef<HTMLDivElement>(null)
  const abajo = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const franjaArriba = arriba.current
    const franjaAbajo = abajo.current
    if (!esIos()) return
    let frame = 0
    const revisar = () => {
      frame = 0
      const alto = window.innerHeight
      const portada = document.querySelector('[data-portada]')
      const encabezado = document.querySelector('header')
      const pie = document.querySelector('footer')

      // Arriba: la portada mientras el encabezado va transparente sobre ella.
      pintar(franjaArriba, portada && encabezado?.dataset.solid === 'false' ? PORTADA_ARRIBA : null)

      // Abajo: el pie al llegar al final (misma regla que ColorBarraPie); si no, la portada
      // mientras llegue hasta el borde de abajo.
      let colorAbajo: string | null = null
      const alFinal = pie && window.scrollY > 0 && pie.getBoundingClientRect().bottom <= alto + 1
      if (alFinal) colorAbajo = PIE
      else if (portada && portada.getBoundingClientRect().bottom >= alto - 1) {
        colorAbajo = PORTADA_ABAJO
      }
      pintar(franjaAbajo, colorAbajo)
    }
    const programar = () => {
      if (!frame) frame = requestAnimationFrame(revisar)
    }
    revisar()
    window.addEventListener('scroll', programar, { passive: true })
    window.addEventListener('resize', programar)
    // El encabezado cambia data-solid en su propio render: se revisa cuando cambia.
    const encabezado = document.querySelector('header')
    const observador = new MutationObserver(programar)
    if (encabezado) observador.observe(encabezado, { attributeFilter: ['data-solid'] })
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', programar)
      window.removeEventListener('resize', programar)
      observador.disconnect()
      pintar(franjaArriba, null)
      pintar(franjaAbajo, null)
    }
  }, [pathname])

  return (
    <>
      <div ref={arriba} className={`${styles.franja} ${styles.arriba}`} aria-hidden="true" />
      <div ref={abajo} className={`${styles.franja} ${styles.abajo}`} aria-hidden="true" />
    </>
  )
}
