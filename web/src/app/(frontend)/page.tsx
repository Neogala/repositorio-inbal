import styles from './page.module.css'

// Portada provisional: el sitio público se arma en las siguientes entregas.
export default function HomePage() {
  return (
    <section className={styles.hero}>
      <div className="wrap">
        <p className={styles.kicker}>Instituto Nacional de Bellas Artes y Literatura</p>
        <h1 className={styles.title}>Colección digital</h1>
        <p className={styles.lead}>Sitio en construcción.</p>
      </div>
    </section>
  )
}
