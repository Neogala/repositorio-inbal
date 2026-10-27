'use client'

import { useEffect } from 'react'

// Mientras una imagen carga, styles.css le pone un recuadro con brillo (esqueleto). Aquí se
// marca cada <img> con data-cargada al terminar (o al fallar) para quitárselo; si no, el
// brillo seguiría detrás de las obras que no llenan su marco (object-fit: contain).
// Escucha en captura porque el evento load de una imagen no burbujea.
export function EsqueletoImagenes() {
  useEffect(() => {
    const marcar = (e: Event) => {
      if (e.target instanceof HTMLImageElement) e.target.dataset.cargada = ''
    }
    document.addEventListener('load', marcar, true)
    document.addEventListener('error', marcar, true)
    // Las que ya cargaron antes de hidratar.
    document.querySelectorAll('img').forEach((img) => {
      if (img.complete) img.dataset.cargada = ''
    })
    return () => {
      document.removeEventListener('load', marcar, true)
      document.removeEventListener('error', marcar, true)
    }
  }, [])

  return null
}
