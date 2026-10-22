import Image from 'next/image'
import Link from 'next/link'

import { ActivarReveal, Contador, ProgresoScroll } from '@/components/home/Animaciones'
import { GaleriaAcervos } from '@/components/home/GaleriaAcervos'
import { HeroMorph } from '@/components/home/HeroMorph'
import styles from '@/components/home/home.module.css'
import { obtenerInicio } from '@/lib/inicio'
import { etiquetaCortaMuseo, imagenDe } from '@/lib/obras'

// Home portado de prototipo/index.html; el contenido se edita en el global "Página de inicio".
export default async function HomePage() {
  const { portada, inicial, accesos, curaduria, destacadas, acervos, recursos, cifras } =
    await obtenerInicio()

  return (
    <>
      <ProgresoScroll className={styles.progreso} />
      <ActivarReveal />

      {portada.length > 0 && <HeroMorph obras={portada} inicial={inicial} />}

      {/* Acceso rápido */}
      <section className={styles.seccion}>
        <div className="wrap">
          <div className={`${styles.ceja} reveal`}>
            <span className="lbl">Explora el repositorio</span>
          </div>
          <h2 className={`${styles.h2t} reveal`}>Recorre las obras</h2>
          <div className={styles.accesos}>
            {accesos.map((a, i) => {
              const contenido = (
                <>
                  <Image src={a.imagen} alt={a.alt} fill sizes="(max-width: 900px) 100vw, 25vw" />
                  <span className={styles.accesoVelo} />
                  <span className={styles.accesoCuerpo}>
                    <span className={styles.accesoNum}>{String(i + 1).padStart(2, '0')}</span>
                    <span className={styles.accesoTitulo}>{a.titulo}</span>
                    <span className={styles.accesoDesc}>{a.descripcion}</span>
                    <span className={styles.accesoCta}>
                      <span>{a.href ? 'Explorar' : 'Próximamente'}</span>
                      {a.href && <i>→</i>}
                    </span>
                  </span>
                </>
              )
              const estilo = { '--card-rgb': a.rgb } as React.CSSProperties
              return a.href ? (
                <Link
                  key={a.titulo}
                  href={a.href}
                  className={`${styles.acceso} reveal`}
                  style={estilo}
                >
                  {contenido}
                </Link>
              ) : (
                <div key={a.titulo} className={`${styles.acceso} reveal`} style={estilo}>
                  {contenido}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Curaduría inaugural */}
      {curaduria && (
        <section className={styles.seccionSinArriba}>
          <div className="wrap">
            <div className={`${styles.banda} reveal`}>
              <div className={styles.bandaTexto}>
                <span className="lbl">Curaduría inaugural</span>
                <h3>{curaduria.titulo}</h3>
                <p>{curaduria.intro}</p>
                <Link className={styles.cta} href={curaduria.href}>
                  Ver el recorrido <i>→</i>
                </Link>
              </div>
              <div className={styles.bandaVisual}>
                {curaduria.imagen && (
                  <Image
                    src={curaduria.imagen.src}
                    alt={curaduria.imagen.alt}
                    fill
                    sizes="(max-width: 900px) 100vw, 50vw"
                  />
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Obras destacadas */}
      <section className={styles.seccionSinArriba}>
        <div className="wrap">
          <div className={`${styles.ceja} reveal`}>
            <span className="lbl">Selección curada</span>
          </div>
          <div className={styles.destacadasCabeza}>
            <h2 className={`${styles.h2t} reveal`}>Obras destacadas</h2>
            <Link className="reveal" href="/obras">
              Ver galería completa →
            </Link>
          </div>
          <div className={styles.gridArte}>
            {destacadas.map(({ obra, columnas, alto }) => {
              const img = imagenDe(obra, 'ficha')
              return (
                <Link
                  key={obra.id}
                  href={`/obras/${obra.sigropam}`}
                  className={`${styles.obra} ${alto === 'alta' ? styles.alta : styles.media} reveal`}
                  style={{ gridColumn: `span ${columnas}`, alignSelf: 'start' }}
                >
                  <div className={styles.obraArte}>
                    {obra.tipo && <span className={styles.etiqueta}>{obra.tipo}</span>}
                    {img && (
                      <Image
                        src={img.src}
                        alt={img.alt}
                        width={img.width}
                        height={img.height}
                        sizes="(max-width: 900px) 50vw, 40vw"
                      />
                    )}
                  </div>
                  <div className={styles.obraMeta}>
                    <b>{obra.titulo}</b>
                    <span>
                      {[obra.autor, obra.fechaTexto].filter(Boolean).join(' · ')}
                      {obra.museo && (
                        <span className={styles.obraMuseo}>{etiquetaCortaMuseo(obra.museo)}</span>
                      )}
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Acervos */}
      <section className={styles.seccionSinArriba}>
        <div className="wrap">
          <div className={`${styles.ceja} reveal`}>
            <span className="lbl">Del espacio físico al acervo digital</span>
          </div>
          <h2 className={`${styles.h2t} reveal`} style={{ marginBottom: 30 }}>
            Explora por acervo
          </h2>
          <div className="reveal">
            <GaleriaAcervos acervos={acervos} />
          </div>
          <div className={styles.centro}>
            <Link className={`${styles.cta} ${styles.ctaVerde}`} href="/acervos">
              Ver todos los acervos <i>→</i>
            </Link>
          </div>
        </div>
      </section>

      {/* Recursos */}
      <section className={styles.seccionSinArriba}>
        <div className="wrap">
          <div className={`${styles.ceja} reveal`}>
            <span className="lbl">Para investigadores y público</span>
          </div>
          <h2 className={`${styles.h2t} reveal`} style={{ marginBottom: 34 }}>
            Recursos para investigación
          </h2>
          <div className={styles.recursos}>
            {recursos.map((r) => (
              <Link key={r.titulo} className={`${styles.recurso} reveal`} href={r.href}>
                <div className={styles.icono} aria-hidden="true">
                  {r.icono}
                </div>
                <h3>{r.titulo}</h3>
                <p>{r.texto}</p>
              </Link>
            ))}
          </div>
          <div className={styles.cifras}>
            {cifras.map((c) => (
              <div key={c.texto} className="reveal">
                <Contador hasta={c.valor} className={styles.cifra} />
                <div className={styles.cifraTexto}>{c.texto}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
