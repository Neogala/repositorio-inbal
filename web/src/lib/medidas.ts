// Medidas de una obra en centímetros. Vive aparte del importador para que la ficha
// pública no cargue el validador del Excel.

export type Medidas = {
  altoCm: number | null
  anchoCm: number | null
  profundidadCm: number | null
}

const cm = (n: number) => n.toLocaleString('es-MX', { maximumFractionDigits: 1 })

// "39.5 × 48 cm" para la ficha.
export function textoMedidas(m: Partial<Medidas>): string {
  const partes = [m.altoCm, m.anchoCm, m.profundidadCm].filter((n): n is number => n != null)
  return partes.length ? `${partes.map(cm).join(' × ')} cm` : ''
}
