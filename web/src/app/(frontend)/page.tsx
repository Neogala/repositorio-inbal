import styles from './page.module.css'

// Portada provisional para probar el encabezado sobre la portada.
// El home real se arma en la semana 5 con el global Home del CMS.
export default function HomePage() {
  return (
    <>
      <section className={styles.hero}>
        <div className="wrap">
          <p className={styles.kicker}>Instituto Nacional de Bellas Artes y Literatura</p>
          <h1 className={styles.title}>Colección digital</h1>
          <p className={styles.lead}>Sitio en construcción.</p>
        </div>
      </section>
      <section className={`wrap ${styles.body}`}>
        <p>Siguiente: sección Obras con datos de SIGROPAM.</p>
      </section>
    </>
  )
}
