import { notFound } from 'next/navigation'

// El sitio y el panel tienen cada uno su layout raíz, así que Next solo usa
// not-found.tsx de (frontend) cuando una ruta del sitio lo pide. Este comodín
// manda ahí cualquier dirección desconocida; /admin, /api y las demás rutas
// del sitio son más específicas y tienen prioridad.
export default function NoExiste() {
  notFound()
}
