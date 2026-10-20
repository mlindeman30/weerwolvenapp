import { useState } from 'react'
import { downloadExcel, maakTekst } from '../lib/export'
import type { ListItem } from '../lib/items'
import { ItemList, type Weergave } from './ItemList'

interface Props {
  rollen: ListItem[]
  personages: ListItem[]
  weergave: Weergave
  gekozen: Set<string>
  onWissel: (id: string) => void
  onLeeg: () => void
  onOpen: (href: string) => void
}

export function MijnLijst({ rollen, personages, weergave, gekozen, onWissel, onLeeg, onOpen }: Props) {
  const [melding, setMelding] = useState('')
  const [reservetekst, setReservetekst] = useState<string | null>(null)
  const ids = [...rollen, ...personages].map((i) => i.id)

  if (ids.length === 0) {
    return (
      <p className="leeg">
        Je lijst is nog leeg. Vink rollen of personages aan in de tabbladen Rollen en Personages.
      </p>
    )
  }

  async function kopieer() {
    const tekst = maakTekst(ids)
    try {
      await navigator.clipboard.writeText(tekst)
      setReservetekst(null)
      setMelding('Gekopieerd als tekst')
    } catch {
      setReservetekst(tekst)
      setMelding('Kopiëren is niet gelukt: kopieer de tekst hieronder zelf')
    }
  }

  async function exporteer() {
    setMelding('Excel wordt gemaakt…')
    try {
      await downloadExcel(ids)
      setMelding('Excel gedownload')
    } catch {
      setMelding('Excel maken is niet gelukt')
    }
  }

  return (
    <div>
      <div className="lijst-acties">
        <button type="button" className="chip actief" onClick={kopieer}>
          Kopieer als tekst
        </button>
        <button type="button" className="chip actief" onClick={exporteer}>
          Download Excel
        </button>
        <button
          type="button"
          className="chip"
          onClick={() => {
            onLeeg()
            setMelding('')
            setReservetekst(null)
          }}
        >
          Lijst leegmaken
        </button>
        <span className="kopieer-status" role="status">
          {melding}
        </span>
      </div>
      {reservetekst !== null && (
        <textarea className="reservetekst" readOnly rows={10} value={reservetekst} aria-label="Tekst om te kopiëren" />
      )}
      {rollen.length > 0 && (
        <section className="lijst-groep">
          <h2>
            Rollen <span className="aantal">{rollen.length}</span>
          </h2>
          <ItemList items={rollen} weergave={weergave} onOpen={onOpen} gekozen={gekozen} onWissel={onWissel} />
        </section>
      )}
      {personages.length > 0 && (
        <section className="lijst-groep">
          <h2>
            Personages <span className="aantal">{personages.length}</span>
          </h2>
          <ItemList items={personages} weergave={weergave} onOpen={onOpen} gekozen={gekozen} onWissel={onWissel} />
        </section>
      )}
    </div>
  )
}
