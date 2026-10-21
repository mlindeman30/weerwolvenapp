export function Sectie({ titel, tekst }: { titel: string; tekst: string }) {
  if (!tekst) return null
  return (
    <section className="sectie">
      <h3>{titel}</h3>
      <p className="lopend">{tekst}</p>
    </section>
  )
}

/** Waarschuwing in het detailvenster als er velden ontbreken. */
export function AanTeVullen({ velden }: { velden: string[] }) {
  if (velden.length === 0) return null
  return (
    <p className="aanvul-melding">
      <strong>Nog aan te vullen:</strong> {velden.join(', ')}
    </p>
  )
}
