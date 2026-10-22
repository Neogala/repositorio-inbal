// Texto en minúsculas y sin acentos para buscar: "Velázquez" y "velazquez" coinciden.
export function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}
