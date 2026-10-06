'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

import { mainNav } from '@/lib/navigation'
import styles from './SiteHeader.module.css'

// En el home el encabezado va transparente sobre la portada y se vuelve sólido
// al bajar el 72% de la pantalla, igual que en index.html del prototipo.
// En las demás páginas siempre es sólido.
const SOLID_AFTER = 0.72

export function SiteHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const overHero = pathname === '/'

  const [scrolledPastHero, setScrolledPastHero] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [query, setQuery] = useState('')

  const searchInput = useRef<HTMLInputElement>(null)
  const searchButton = useRef<HTMLButtonElement>(null)
  const menuButton = useRef<HTMLButtonElement>(null)

  const solid = !overHero || scrolledPastHero

  useEffect(() => {
    if (!overHero) return
    const onScroll = () => setScrolledPastHero(window.scrollY > window.innerHeight * SOLID_AFTER)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [overHero])

  useEffect(() => {
    document.body.classList.toggle('overflow-hidden', menuOpen)
    return () => document.body.classList.remove('overflow-hidden')
  }, [menuOpen])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (menuOpen) closeMenu()
      else if (searchOpen) closeSearch()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [menuOpen, searchOpen])

  function openSearch() {
    setSearchOpen(true)
    setTimeout(() => searchInput.current?.focus(), 150)
  }

  function closeSearch() {
    setSearchOpen(false)
    setQuery('')
    searchButton.current?.focus()
  }

  function closeMenu() {
    setMenuOpen(false)
    menuButton.current?.focus()
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const q = query.trim()
    if (!q) return
    router.push(`/obras?q=${encodeURIComponent(q)}`)
    closeSearch()
  }

  return (
    <>
      <header
        className={styles.header}
        data-solid={solid}
        data-over-hero={overHero}
      >
        <div className={`wrap ${styles.nav}`}>
          <Link className={styles.brand} href="/">
            <span className={styles.logoWrap}>
              <Image
                className={styles.logoWhite}
                src="/img/logo-white.png"
                alt="INBAL"
                fill
                sizes="81px"
                priority
              />
              <Image
                className={styles.logoDark}
                src="/img/logo-guinda.png"
                alt=""
                fill
                sizes="81px"
                priority
              />
            </span>
            <span className={styles.sep} />
            <span className={styles.brandText}>Colección digital</span>
          </Link>

          <nav className={styles.menu} aria-label="Principal">
            {mainNav.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={pathname.startsWith(link.href) ? 'page' : undefined}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className={styles.search} data-open={searchOpen}>
            <button
              ref={searchButton}
              type="button"
              className={styles.searchIcon}
              onClick={openSearch}
              aria-label="Buscar"
              aria-expanded={searchOpen}
            >
              <SearchIcon />
            </button>
            <form className={styles.searchForm} onSubmit={onSubmit} role="search">
              <SearchIcon />
              <label htmlFor="site-search" className="visually-hidden">
                Buscar obras, artistas, museos
              </label>
              <input
                ref={searchInput}
                id="site-search"
                type="search"
                className={styles.searchInput}
                placeholder="Buscar obras, artistas, museos…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                tabIndex={searchOpen ? 0 : -1}
                autoComplete="off"
              />
              <button
                type="button"
                className={styles.searchClose}
                onClick={closeSearch}
                aria-label="Cerrar búsqueda"
                tabIndex={searchOpen ? 0 : -1}
              >
                <CloseIcon />
              </button>
            </form>
          </div>

          <button
            ref={menuButton}
            type="button"
            className={styles.menuToggle}
            onClick={() => setMenuOpen(true)}
            aria-label="Abrir menú"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      <div
        id="mobile-menu"
        className={styles.mobileMenu}
        data-open={menuOpen}
        aria-hidden={!menuOpen}
        inert={!menuOpen}
      >
        <div className={styles.backdrop} onClick={closeMenu} />
        <nav className={styles.panel} aria-label="Menú">
          <button
            type="button"
            className={styles.panelClose}
            onClick={closeMenu}
            aria-label="Cerrar menú"
          >
            <CloseIcon />
          </button>
          {mainNav.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)}>
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </>
  )
}

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}
