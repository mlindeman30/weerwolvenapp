export function Sectie({ titel, tekst }: { titel: string; tekst: string }) {
  if (!tekst) return null
  return (
    <section className="sectie">
      <h3>{titel}</h3>
      <p className="lopend">{tekst}</p>
    </section>
  )
}
