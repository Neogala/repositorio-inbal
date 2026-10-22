export type NavLink = { href: string; label: string }

// Menú principal. "Fondos" existe en el prototipo pero no tiene página ni está
// en el alcance de la Fase 1; se agrega cuando se defina.
export const mainNav: NavLink[] = [
  { href: '/obras', label: 'Obras' },
  { href: '/acervos', label: 'Acervos' },
  { href: '/curadurias', label: 'Curadurías' },
  { href: '/investigacion', label: 'Investigación' },
]

export const footerNav: { title: string; links: NavLink[] }[] = [
  {
    title: 'Explorar',
    links: [
      { href: '/obras', label: 'Obras' },
      { href: '/acervos', label: 'Museos' },
      { href: '/curadurias', label: 'Curadurías' },
    ],
  },
  {
    title: 'Instituto',
    links: [
      { href: '/investigacion', label: 'Investigación' },
      { href: '/acerca', label: 'Acerca del proyecto' },
      { href: '/aviso-legal', label: 'Aviso legal' },
      { href: '/accesibilidad', label: 'Accesibilidad' },
    ],
  },
]
