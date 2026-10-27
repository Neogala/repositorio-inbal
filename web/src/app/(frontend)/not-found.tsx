import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="wrap" style={{ padding: '120px 0 140px', maxWidth: 720 }}>
      <p className="lbl">Error 404</p>
      <h1
        style={{
          fontFamily: 'var(--display)',
          fontWeight: 500,
          fontSize: 'clamp(36px, 5vw, 56px)',
          lineHeight: 1.05,
          margin: '14px 0 18px',
        }}
      >
        No encontramos esta página
      </h1>
      <p style={{ color: 'var(--gris)', marginBottom: 28 }}>
        Puede que el enlace tenga un error o que la página se haya movido.
      </p>
      <Link href="/" style={{ color: 'var(--guinda)', borderBottom: '1px solid currentColor' }}>
        Ir al inicio
      </Link>
    </div>
  )
}
