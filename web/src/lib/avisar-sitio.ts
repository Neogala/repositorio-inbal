// Para los scripts de importación, que corren fuera de Next: le pide al sitio que se
// regenere. Necesita el sitio arriba, NEXT_PUBLIC_SITE_URL y REVALIDAR_TOKEN.
export async function avisarAlSitio(): Promise<void> {
  const sitio = process.env.NEXT_PUBLIC_SITE_URL
  const token = process.env.REVALIDAR_TOKEN
  const manual = 'Para ver los cambios en el sitio, guarda cualquier obra en el panel o reinicia el servidor.'
  if (!sitio || !token) {
    console.log(`Sin REVALIDAR_TOKEN en .env. ${manual}`)
    return
  }
  try {
    const r = await fetch(`${sitio}/api/revalidar`, {
      method: 'POST',
      headers: { authorization: `Bearer ${token}` },
    })
    console.log(r.ok ? 'Sitio actualizado.' : `El sitio respondió ${r.status}. ${manual}`)
  } catch {
    console.log(`No se pudo contactar ${sitio}. ${manual}`)
  }
}
