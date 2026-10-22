'use client'

import { useCallback, useEffect, useRef } from 'react'

// setTimeout que se cancela solo: al programar otro (gana el último) y al desmontar
// el componente, para no actualizar estado de algo que ya no está en pantalla.
export function useTemporizador() {
  const id = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => () => clearTimeout(id.current), [])
  return useCallback((fn: () => void, ms: number) => {
    clearTimeout(id.current)
    id.current = setTimeout(fn, ms)
  }, [])
}
