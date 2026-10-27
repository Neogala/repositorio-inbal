// Logo de la pantalla de acceso al panel.
export function Logo() {
  return (
    <div className="inbal-logo">
      <div className="inbal-logo__marca">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/img/logo-guinda.png" alt="INBAL" width={110} height={39} />
        <span className="inbal-logo__sep" />
        <span className="inbal-logo__texto">Colección digital</span>
      </div>
      <p className="inbal-logo__sub">Panel de administración</p>
    </div>
  )
}
