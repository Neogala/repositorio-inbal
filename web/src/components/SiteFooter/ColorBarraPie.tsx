'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

// Chrome en Android pinta su barra del sistema con el fondo de html. Al llegar al final de
// la página (el pie completo a la vista) html toma el verde del pie con data-pie; arriba y
// a media página no se toca. Sin transición: un fondo de html que cambia despacio dejaba
// ver blanco en el rebote (ver styles.css).
export function ColorBarraPie() {
  const pathname = usePathname()

  useEffect(() => {
    const html = document.documentElement
    const pie = document.querySelector('footer')
    if (!pie) return
    let frame = 0
    const revisar = () => {
      frame = 0
      // scrollY > 0: en una página que cabe completa no hay "final" al que llegar, y el
      // verde se vería también al jalar arriba.
      const alFinal =
        window.scrollY > 0 && pie.getBoundingClientRect().bottom <= window.innerHeight + 1
      if (alFinal) html.dataset.pie = ''
      else delete html.dataset.pie
    }
    const programar = () => {
      if (!frame) frame = requestAnimationFrame(revisar)
    }
    revisar()
    window.addEventListener('scroll', programar, { passive: true })
    window.addEventListener('resize', programar)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', programar)
      window.removeEventListener('resize', programar)
      delete html.dataset.pie
    }
  }, [pathname])

  return null
}
