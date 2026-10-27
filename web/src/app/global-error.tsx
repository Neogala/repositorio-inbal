'use client'

import { useEffect } from 'react'

// Último recurso: falla el layout mismo, así que no hay estilos ni encabezado del sitio.
export default function ErrorGlobal({ error, retry }: { error: Error; retry: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="es">
      <body
        style={{
          fontFamily: 'system-ui, sans-serif',
          padding: '15vh 24px',
          maxWidth: 640,
          margin: '0 auto',
        }}
      >
        <h1 style={{ fontWeight: 500 }}>Colección Digital INBAL</h1>
        <p>El sitio no está disponible en este momento. Intenta de nuevo en unos minutos.</p>
        <button type="button" onClick={retry}>
          Intentar de nuevo
        </button>
      </body>
    </html>
  )
}
