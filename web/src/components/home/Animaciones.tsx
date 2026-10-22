'use client'

import { useEffect, useRef, useState } from 'react'

// Activa las animaciones de entrada (.reveal) de la página actual, como en el prototipo.
export function ActivarReveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((e, i) => {
          if (!e.isIntersecting) return
          setTimeout(() => e.target.classList.add('in'), (i % 4) * 70)
          io.unobserve(e.target)
        })
      },
      { threshold: 0.14 },
    )
    document.querySelectorAll('.reveal:not(.in)').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
  return null
}

// Número que cuenta desde 0 cuando entra en pantalla.
export function Contador({ hasta, className }: { hasta: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [valor, setValor] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    let frame = 0
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return
        io.disconnect()
        const dur = 1400
        let inicio: number | null = null
        const paso = (t: number) => {
          inicio ??= t
          const p = Math.min((t - inicio) / dur, 1)
          setValor(Math.round(hasta * (1 - Math.pow(1 - p, 3))))
          if (p < 1) frame = requestAnimationFrame(paso)
        }
        frame = requestAnimationFrame(paso)
      },
      { threshold: 0.6 },
    )
    io.observe(el)
    return () => {
      io.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [hasta])

  return (
    <div ref={ref} className={className} aria-label={hasta.toLocaleString('es-MX')}>
      {valor.toLocaleString('es-MX')}
    </div>
  )
}

// Barra de progreso de lectura en la parte superior.
export function ProgresoScroll({ className }: { className: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const onScroll = () => {
      const max = document.body.scrollHeight - window.innerHeight
      if (ref.current) ref.current.style.width = `${max > 0 ? (window.scrollY / max) * 100 : 0}%`
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return <div ref={ref} className={className} aria-hidden="true" />
}
