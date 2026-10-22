import Image from 'next/image'
import Link from 'next/link'

import { footerNav } from '@/lib/navigation'
import styles from './SiteFooter.module.css'

export function SiteFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className={styles.footer}>
      <div className="wrap">
        <div className={styles.grid}>
          <div>
            <Link className={styles.brand} href="/">
              <span className={styles.logoWrap}>
                <Image src="/img/logo-white.png" alt="INBAL" fill sizes="81px" />
              </span>
              <span className={styles.sep} />
              <span className={styles.brandText}>Colección digital</span>
            </Link>
            <p className={styles.tag}>
              Preservar, organizar y difundir el patrimonio artístico de México. Un proyecto de la
              Coordinación de Artes Visuales.
            </p>
          </div>
          {footerNav.map((col) => (
            <nav key={col.title} className={styles.col} aria-label={col.title}>
              <h5>{col.title}</h5>
              {col.links.map((link) => (
                <Link key={link.href} href={link.href}>
                  {link.label}
                </Link>
              ))}
            </nav>
          ))}
        </div>
        <div className={styles.bottom}>
          <span>
            © {year} Instituto Nacional de Bellas Artes y Literatura · Secretaría de Cultura ·
            Gobierno de México
          </span>
          <span>Colección Digital INBAL</span>
        </div>
      </div>
    </footer>
  )
}
