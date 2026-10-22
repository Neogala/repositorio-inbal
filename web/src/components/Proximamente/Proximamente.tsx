import Link from 'next/link'

import styles from './Proximamente.module.css'

// Página provisional para las ligas de la plantilla cuya sección todavía no se entrega.
// Cada ruta se reemplaza por su página real en la entrega que le toca.
export function Proximamente({ titulo }: { titulo: string }) {
  return (
    <section className={`wrap ${styles.proximamente}`}>
      <p className={styles.kicker}>Próximamente</p>
      <h1 className={styles.title}>{titulo}</h1>
      <p className={styles.lead}>Esta sección llega en una próxima entrega de la Colección Digital.</p>
      <Link href="/" className={styles.volver}>
        Volver al inicio
      </Link>
    </section>
  )
}
