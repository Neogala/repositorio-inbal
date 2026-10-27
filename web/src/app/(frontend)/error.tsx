'use client'

import Link from 'next/link'
import { useEffect } from 'react'

// Falla al cargar una página (por ejemplo, la base de datos no responde). El
// encabezado y el pie siguen visibles porque viven en el layout.
export default function ErrorPagina({
  error,
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="wrap" style={{ padding: '120px 0 140px', maxWidth: 720 }}>
      <p className="lbl">Algo salió mal</p>
      <h1
        style={{
          fontFamily: 'var(--display)',
          fontWeight: 500,
          fontSize: 'clamp(36px, 5vw, 56px)',
          lineHeight: 1.05,
          margin: '14px 0 18px',
        }}
      >
        No pudimos cargar esta página
      </h1>
      <p style={{ color: 'var(--gris)', marginBottom: 28 }}>
        Puede ser un problema momentáneo. Intenta de nuevo en unos segundos.
        {error.digest && <> Referencia: {error.digest}.</>}
      </p>
      <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
        <button
          type="button"
          onClick={retry}
          style={{ color: 'var(--guinda)', borderBottom: '1px solid currentColor' }}
        >
          Intentar de nuevo
        </button>
        <Link href="/" style={{ color: 'var(--gris)' }}>
          Ir al inicio
        </Link>
      </div>
    </div>
  )
}
