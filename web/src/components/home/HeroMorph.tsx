'use client'

// Portada del home portada de prototipo/index.html: las obras se dispersan,
// se forman en línea, luego en círculo y, al hacer scroll, se abren en un arco.
// Clic en una obra (o cada 5 s) la pone de fondo.
import Image, { getImageProps } from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'

import { useTemporizador } from '@/components/useTemporizador'
import styles from './home.module.css'

// El fondo es CSS (cambia con la animación), así que no usa <Image>; getImageProps
// lo pasa por el optimizador de Next (WebP y tamaño justo) con 1x y 2x.
function fondoOptimizado(src: string): string {
  const {
    props: { srcSet },
  } = getImageProps({ alt: '', src, width: 1400, height: 900, quality: 75 })
  const opciones = (srcSet ?? '').split(', ').map((s) => {
    const [url, densidad] = s.split(' ')
    return `url("${url}") ${densidad}`
  })
  return opciones.length ? `image-set(${opciones.join(', ')})` : `url('${src}')`
}

export type ObraHero = { id: string; alt: string; src: string }

type Fase = 'dispersa' | 'linea' | 'circulo'

const ROTACION_MS = 5000
const TRANSICION_FONDO_MS = 620

function lerp(a: number, b: number, t: number) {
  return a * (1 - t) + b * t
}

export function HeroMorph({ obras, inicial }: { obras: ObraHero[]; inicial: string }) {
  const seccion = useRef<HTMLElement>(null)
  const tarjetas = useRef<(HTMLDivElement | null)[]>([])
  // Posiciones aleatorias iniciales; se calculan al montar (no en el render).
  const dispersion = useRef<{ x: number; y: number; r: number }[]>([])
  const fase = useRef<Fase>('dispersa')
  const mouseX = useRef(0)
  const movPendiente = useRef(0)

  const [introLista, setIntroLista] = useState(false)
  const [introOculta, setIntroOculta] = useState(false)
  const [arcoVisible, setArcoVisible] = useState(false)
  const [elegida, setElegida] = useState<string | null>(null)
  const [fondo, setFondo] = useState<string | null>(null)
  const [fondoActivo, setFondoActivo] = useState(false)

  const render = useCallback(() => {
    const el = seccion.current
    if (!el) return
    const { width: w, height: h } = el.getBoundingClientRect()
    const movil = w < 768
    const reducir = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const morph = reducir ? 1 : Math.min(Math.max(window.scrollY / 520, 0), 1)
    setArcoVisible(morph > 0.75)
    setIntroOculta(reducir || morph > 0.25)

    const total = obras.length
    tarjetas.current.forEach((t, i) => {
      if (!t) return
      let x = 0
      let y = 0
      let rot = 0
      let escala = 1
      let opacidad = 1
      if (fase.current === 'dispersa') {
        const d = dispersion.current[i] ?? { x: 0, y: 0, r: 0 }
        x = d.x
        y = d.y
        rot = d.r
        escala = 0.6
        opacidad = 0
      } else if (fase.current === 'linea') {
        const sep = movil ? 36 : 56
        x = i * sep - (total * sep) / 2
      } else {
        const radio = Math.min(w, h) * (movil ? 0.3 : 0.34)
        const ang = (i / total) * 360
        const rad = (ang * Math.PI) / 180
        // En celular el círculo sube y deja abajo el título y los botones, sin
        // obras encima del texto.
        const subir = movil ? h * 0.15 : 0
        const circ = { x: Math.cos(rad) * radio, y: Math.sin(rad) * radio - subir, r: ang + 90 }

        const radioArco = Math.min(w, h * 1.5) * (movil ? 1.35 : 1.05)
        const cima = h * (movil ? 0.32 : 0.22)
        const centroY = cima + radioArco
        const abertura = movil ? 110 : 150
        const angArco = -90 - abertura / 2 + i * (abertura / (total - 1))
        const radArco = (angArco * Math.PI) / 180
        const arco = {
          x: Math.cos(radArco) * radioArco + mouseX.current,
          y: Math.sin(radArco) * radioArco + centroY,
          r: angArco + 90,
          s: movil ? 1.05 : 1.5,
        }
        x = lerp(circ.x, arco.x, morph)
        y = lerp(circ.y, arco.y, morph)
        rot = lerp(circ.r, arco.r, morph)
        escala = lerp(1, arco.s, morph)
      }
      t.style.transform = `translate(${x}px, ${y}px) rotate(${rot}deg) scale(${escala})`
      t.style.opacity = String(opacidad)
      t.style.zIndex = String(1000 - Math.round(y))
    })
  }, [obras.length])

  // Cambio de fondo con desvanecido, igual que el prototipo.
  const elegidaRef = useRef<string | null>(null)
  const programar = useTemporizador()
  const elegir = useCallback(
    (id: string) => {
      const previa = elegidaRef.current
      if (previa === id) return
      elegidaRef.current = id
      setElegida(id)
      if (previa === null) {
        setFondo(id)
        setFondoActivo(true)
        return
      }
      setFondoActivo(false)
      programar(() => {
        // Si mientras tanto se eligió otra, gana la más reciente.
        if (elegidaRef.current !== id) return
        setFondo(id)
        setFondoActivo(true)
      }, TRANSICION_FONDO_MS)
    },
    [programar],
  )

  // Rotación automática; se reinicia al elegir una obra a mano.
  const [ciclo, setCiclo] = useState(0)
  useEffect(() => {
    if (elegida === null) return
    const t = setInterval(() => {
      const otras = obras.filter((o) => o.id !== elegida)
      elegir(otras[Math.floor(Math.random() * otras.length)].id)
    }, ROTACION_MS)
    return () => clearInterval(t)
  }, [elegida, ciclo, obras, elegir])

  useEffect(() => {
    dispersion.current = obras.map(() => ({
      x: (Math.random() - 0.5) * 900,
      y: (Math.random() - 0.5) * 600,
      r: (Math.random() - 0.5) * 180,
    }))
    const reducir = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const timers: ReturnType<typeof setTimeout>[] = []
    if (reducir) {
      fase.current = 'circulo'
      render()
      elegir(inicial)
    } else {
      render()
      // En celular la intro va más rápido: con 2 s de pantalla casi vacía mucha
      // gente se va antes de ver la portada.
      const movil = window.matchMedia('(max-width: 767px)').matches
      timers.push(
        setTimeout(
          () => {
            fase.current = 'linea'
            render()
          },
          movil ? 150 : 500,
        ),
        setTimeout(
          () => {
            fase.current = 'circulo'
            render()
            setIntroLista(true)
            elegir(inicial)
          },
          movil ? 1000 : 2200,
        ),
      )
    }
    // Un solo cálculo por cuadro de animación aunque lleguen varios eventos de scroll.
    let frame = 0
    const onScroll = () => {
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = 0
        // Fuera de la portada no hay nada que mover.
        if (window.scrollY > window.innerHeight * 1.2 && fase.current === 'circulo') return
        render()
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      timers.forEach(clearTimeout)
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [render, elegir, inicial, obras])

  const urlFondo = fondo ? obras.find((o) => o.id === fondo)?.src : null
  const fondoCss = urlFondo ? fondoOptimizado(urlFondo) : null

  return (
    <section
      ref={seccion}
      className={styles.hero}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect()
        mouseX.current = ((e.clientX - r.left) / r.width) * 2 * 60 - 60
        if (fase.current === 'circulo' && !movPendiente.current) {
          movPendiente.current = requestAnimationFrame(() => {
            movPendiente.current = 0
            render()
          })
        }
      }}
    >
      <div
        className={styles.fondo}
        data-activo={fondoActivo}
        style={fondoCss ? { backgroundImage: fondoCss } : undefined}
      />
      <div className={styles.veloFondo} data-activo={fondoActivo} />
      <div className={styles.velo} />
      <div className={styles.grano} />

      <div
        className={`${styles.texto} ${styles.intro}`}
        data-lista={introLista}
        data-oculta={introOculta}
      >
        <span className={styles.kick}>Instituto Nacional de Bellas Artes y Literatura</span>
        <h1 className={styles.mega}>
          <span className={styles.ln}>
            <span>Patrimonio</span>
          </span>
          <span className={styles.ln}>
            <span>
              <em>artístico</em>
            </span>
          </span>
          <span className={styles.ln}>
            <span>de México</span>
          </span>
        </h1>
      </div>

      <div className={`${styles.texto} ${styles.arco}`} data-visible={arcoVisible}>
        <h2>Patrimonio en movimiento</h2>
        <p>Miles de obras de la red de museos del INBAL, catalogadas y abiertas al mundo entero.</p>
      </div>

      <div className={styles.escenario}>
        {obras.map((o, i) => (
          <div
            key={o.id}
            ref={(el) => {
              tarjetas.current[i] = el
            }}
            className={styles.tarjeta}
            data-elegida={o.id === elegida}
          >
            <button
              type="button"
              className={styles.tarjetaInterior}
              onClick={() => {
                elegir(o.id)
                setCiclo((c) => c + 1)
              }}
              // El nombre empieza con el texto visible del reverso (WCAG 2.5.3).
              aria-label={`${o.id.split('_')[0]}: poner de fondo ${o.alt}`}
              tabIndex={-1}
            >
              <span className={styles.frente}>
                <Image src={o.src} alt="" width={132} height={184} sizes="100px" />
              </span>
              <span className={styles.reverso}>
                <span>{o.id.split('_')[0]}</span>
              </span>
            </button>
          </div>
        ))}
      </div>

      {/* Solo en celular: a dónde ir desde la portada, al alcance del pulgar */}
      <nav
        className={styles.heroBotones}
        aria-label="Empezar a explorar"
        data-lista={introLista}
        data-oculta={introOculta}
      >
        <Link className={styles.heroBoton} href="/obras">
          Explorar obras
        </Link>
        <Link className={`${styles.heroBoton} ${styles.heroBotonSecundario}`} href="/curadurias">
          Curadurías
        </Link>
      </nav>

      <div className={styles.desliza} aria-hidden="true">
        Desliza
      </div>
    </section>
  )
}
