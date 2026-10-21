import { useState } from 'react'
import { rollen } from '../lib/data'
import { normaliseer } from '../lib/search'

interface Props {
  geselecteerd: string[]
  onWijzig: (ids: string[]) => void
}

const gesorteerd = [...rollen].sort((a, b) => a.naam.localeCompare(b.naam, 'nl', { sensitivity: 'base' }))

/** Doorzoekbare lijst met vinkjes om één of meer algemene rollen te kiezen. */
export function RolKiezer({ geselecteerd, onWijzig }: Props) {
  const [zoek, setZoek] = useState('')
  const zichtbaar = gesorteerd.filter((r) => normaliseer(r.naam).includes(normaliseer(zoek)))

  function wissel(id: string) {
    onWijzig(geselecteerd.includes(id) ? geselecteerd.filter((x) => x !== id) : [...geselecteerd, id])
  }

  return (
    <div className="rolkiezer">
      <input
        type="search"
        placeholder="Zoek een rol"
        aria-label="Zoek een rol"
        value={zoek}
        onChange={(e) => setZoek(e.target.value)}
      />
      <div className="rolkiezer-lijst" role="group" aria-label="Rollen">
        {zichtbaar.map((r) => (
          <label key={r.id} className="multi-optie">
            <input type="checkbox" checked={geselecteerd.includes(r.id)} onChange={() => wissel(r.id)} />
            <span className="multi-tekst">{r.naam}</span>
          </label>
        ))}
        {zichtbaar.length === 0 && <p className="leeg">Geen rol gevonden.</p>}
      </div>
      <p className="item-meta">
        {geselecteerd.length === 0
          ? 'Geen rol gekozen'
          : `Gekozen: ${geselecteerd.map((id) => rollen.find((r) => r.id === id)?.naam ?? id).join(', ')}`}
      </p>
    </div>
  )
}
