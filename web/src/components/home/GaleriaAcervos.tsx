'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

import styles from './home.module.css'

export type AcervoGaleria = {
  slug: string
  nombre: string
  clave: string
  zona: string
  obras: string
  imagen: string
}

// "Explora por acervo": el elemento activo se expande; con mouse se activa al
// pasar encima, en táctil con el primer toque.
// En celular y tableta el acordeón no funciona bien (siglas en lugar de nombres,
// dos toques para entrar, la página brinca): ahí va el primer museo destacado y
// los demás en una lista con miniatura. Solo una de las dos versiones se muestra.
export function GaleriaAcervos({ acervos }: { acervos: AcervoGaleria[] }) {
  const [activo, setActivo] = useState(0)
  const [destacado, ...resto] = acervos

  return (
    <>
      <div className={styles.galeria}>
        {acervos.map((a, i) => (
          <Link
            key={a.slug}
            href={`/acervos/${a.slug}`}
            className={styles.galeriaItem}
            data-activo={i === activo}
            onMouseEnter={() => {
              if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) setActivo(i)
            }}
            onFocus={() => setActivo(i)}
            onClick={(e) => {
              if (i !== activo) {
                e.preventDefault()
                setActivo(i)
              }
            }}
          >
            <Image src={a.imagen} alt={a.nombre} fill sizes="(max-width: 900px) 100vw, 60vw" />
            <span className={styles.galeriaVelo} />
            <span className={styles.galeriaContenido}>
              <span className={styles.galeriaZona}>{a.zona}</span>
              <span className={styles.galeriaTitulo}>{a.nombre}</span>
              <span className={styles.galeriaCta}>
                {a.obras} obras <i>→</i>
              </span>
            </span>
            <span className={styles.galeriaPlegado} aria-hidden="true">
              <span className={styles.galeriaVertical}>{a.nombre}</span>
              <span className={styles.galeriaCorto}>
                {String(i + 1).padStart(2, '0')} · {a.clave}
              </span>
            </span>
          </Link>
        ))}
      </div>

      {destacado && (
        <div className={styles.acervosMovil}>
          <Link href={`/acervos/${destacado.slug}`} className={styles.acervoDestacado}>
            <Image src={destacado.imagen} alt="" fill sizes="100vw" />
            <span className={styles.galeriaVelo} />
            <span className={styles.acervoDestacadoCuerpo}>
              <span className={styles.galeriaZona}>{destacado.zona}</span>
              <span className={styles.galeriaTitulo}>{destacado.nombre}</span>
              <span className={styles.galeriaCta}>
                {destacado.obras} obras <i>→</i>
              </span>
            </span>
          </Link>
          <ul className={styles.acervosLista}>
            {resto.map((a) => (
              <li key={a.slug}>
                <Link href={`/acervos/${a.slug}`} className={styles.acervoFila}>
                  <span className={styles.acervoMini}>
                    <Image src={a.imagen} alt="" fill sizes="72px" />
                  </span>
                  <span className={styles.acervoTexto}>
                    <b>{a.nombre}</b>
                    <small>
                      {a.zona} · {a.obras} obras
                    </small>
                  </span>
                  <span className={styles.acervoFlecha} aria-hidden="true">
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  )
}
