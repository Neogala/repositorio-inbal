// Contenido editorial del home tomado de prototipo/index.html. Ya no lo lee el
// sitio: solo es la fuente de `npm run importar:contenido` para el global "inicio".
import type { AcervoGaleria } from '@/components/home/GaleriaAcervos'
import type { ObraHero } from '@/components/home/HeroMorph'

// Obras de la portada animada (archivos en public/img/home/hero).
const IDS_HERO = [
  'MAM_10252', 'MAM_10494', 'MAM_12432', 'MAM_13157', 'MAM_13173', 'MUNAL_13727',
  'MUNAL_24089', 'MAM_52814', 'MNSC_5379', 'MAM_59834', 'MAM_8688', 'MAM_8712',
  'MAM_8883', 'MAM_13154', 'MAM_18030', 'MAM_19154', 'MAM_59340', 'MNSC_10737',
  'MNSC_19049', 'MNSC_3992', 'MNSC_3994', 'MNSC_50941', 'MUNAL_14333', 'MUNAL_16095',
]

export const OBRAS_HERO: ObraHero[] = IDS_HERO.map((id) => ({
  id,
  src: `/img/home/hero/${id}.jpg`,
  alt: `Obra ${id.replace('_', ' ')}, acervo INBAL`,
}))

// Tarjetas de "Recorre las obras". Fondos no tiene página en la Fase 1.
export const ACCESOS: {
  titulo: string
  descripcion: string
  href: string | null
  imagen: string
  alt: string
  rgb: string
}[] = [
  {
    titulo: 'Obras',
    descripcion: 'Busca en todo el acervo con filtros por museo, período, técnica y tipo de obra.',
    href: '/obras',
    imagen: '/img/home/hero/MNSC_19049.jpg',
    alt: 'Episodio del diluvio universal, Francesco Coghetti',
    rgb: '30,91,79',
  },
  {
    titulo: 'Acervos',
    descripcion: 'Explora la red de recintos del INBAL y su colección digitalizada.',
    href: '/acervos',
    imagen: '/img/home/bellas-artes.jpg',
    alt: 'Palacio de Bellas Artes',
    rgb: '141,194,183',
  },
  {
    titulo: 'Fondos',
    descripcion: 'Catálogo razonado por fondos especiales, cronología y series.',
    href: null,
    imagen: '/img/home/hero/MUNAL_16095.jpg',
    alt: 'El descubrimiento del Pulque, José María Obregón',
    rgb: '219,211,182',
  },
  {
    titulo: 'Curadurías',
    descripcion: 'Recorridos temáticos comentados por el equipo curatorial.',
    href: '/curadurias',
    imagen: '/img/home/hero/MAM_19154.jpg',
    alt: 'Autorretrato, Rosa Rolanda de Covarrubias',
    rgb: '30,92,59',
  },
]

// Obras destacadas: No. SIGROPAM y acomodo en la retícula de 12 columnas.
export const DESTACADAS: { sigropam: string; columnas: number; alto: 'alta' | 'media' }[] = [
  { sigropam: '13154', columnas: 4, alto: 'alta' },
  { sigropam: '29013', columnas: 4, alto: 'media' },
  { sigropam: '18030', columnas: 4, alto: 'media' },
  { sigropam: '59340', columnas: 5, alto: 'media' },
  { sigropam: '56', columnas: 7, alto: 'media' },
]

// Galería "Explora por acervo"; los slugs coinciden con /acervos/[slug].
export const ACERVOS_GALERIA: AcervoGaleria[] = [
  { slug: 'munal', nombre: 'Museo Nacional de Arte', clave: 'MUNAL', zona: 'Centro Histórico', obras: '3,450', imagen: '/img/home/acervos/munal.jpg' },
  { slug: 'bellas-artes', nombre: 'Museo del Palacio de Bellas Artes', clave: 'MPBA', zona: 'Centro Histórico', obras: '945', imagen: '/img/home/acervos/bellas-artes.jpg' },
  { slug: 'mural-diego-rivera', nombre: 'Museo Mural Diego Rivera', clave: 'MMDR', zona: 'Centro Histórico', obras: '46', imagen: '/img/home/acervos/diego-rivera.jpg' },
  { slug: 'mam', nombre: 'Museo de Arte Moderno', clave: 'MAM', zona: 'Bosque de Chapultepec', obras: '1,892', imagen: '/img/home/acervos/arte-moderno.jpg' },
  { slug: 'tamayo', nombre: 'Museo Tamayo Arte Contemporáneo', clave: 'MTAC', zona: 'Bosque de Chapultepec', obras: '386', imagen: '/img/home/acervos/tamayo.jpg' },
  { slug: 'san-carlos', nombre: 'Museo Nacional de San Carlos', clave: 'MNSC', zona: 'Centro Histórico', obras: '1,182', imagen: '/img/home/acervos/san-carlos.jpg' },
  { slug: 'munae', nombre: 'Museo Nacional de la Estampa', clave: 'MUNAE', zona: 'Centro Histórico', obras: '712', imagen: '/img/home/acervos/estampa.jpg' },
  { slug: 'carrillo-gil', nombre: 'Museo de Arte Carrillo Gil', clave: 'MACG', zona: 'San Ángel', obras: '1,240', imagen: '/img/home/acervos/carrillo-gil.jpg' },
  { slug: 'arquitectura', nombre: 'Museo Nacional de Arquitectura', clave: 'MNARQ', zona: 'Centro Histórico', obras: '318', imagen: '/img/home/acervos/arquitectura.jpg' },
]

export const RECURSOS = [
  {
    icono: '⌕',
    titulo: 'Búsqueda avanzada',
    texto: 'Cruza autor, técnica, fecha, inventario y museo con operadores booleanos. Exporta en CSV o PDF.',
    href: '/investigacion#busqueda',
  },
  {
    icono: '❝',
    titulo: 'Guía de citación',
    texto: 'Cita cada obra en formato APA y Chicago con un clic, con permalink permanente.',
    href: '/investigacion#citacion',
  },
  {
    icono: '◈',
    titulo: 'Licencias y reutilización',
    texto: 'Metadatos abiertos bajo estándar CENCROPAM e imágenes de dominio público en alta resolución.',
    href: '/investigacion#licencias',
  },
]

// Cifras del prototipo; se confirmarán con el INBAL.
export const CIFRAS = [
  { valor: 70000, texto: 'Obras catalogadas' },
  { valor: 12, texto: 'Acervos' },
  { valor: 5, texto: 'Fondos' },
  { valor: 12, texto: 'Curadurías activas' },
]
