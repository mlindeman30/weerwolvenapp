import { useEffect, useId, useRef, useState } from 'react'

export interface Optie {
  waarde: string
  label: string
  aantal: number
}

interface Props {
  label: string
  opties: Optie[]
  geselecteerd: string[]
  onWijzig: (waarden: string[]) => void
  /** Aan welke kant het keuzepaneel uitlijnt, zodat het niet buiten beeld valt. */
  uitlijning?: 'links' | 'rechts'
}

function samenvatting(opties: Optie[], geselecteerd: string[]): string {
  if (geselecteerd.length === 0) return 'Alle'
  const labels = opties.filter((o) => geselecteerd.includes(o.waarde)).map((o) => o.label)
  return labels.length <= 2 ? labels.join(', ') : `${labels.length} gekozen`
}

export function MultiSelect({ label, opties, geselecteerd, onWijzig, uitlijning = 'links' }: Props) {
  const [open, setOpen] = useState(false)
  const wrapper = useRef<HTMLDivElement>(null)
  const knop = useRef<HTMLButtonElement>(null)
  const paneelId = useId()

  useEffect(() => {
    if (!open) return
    const buitenKlik = (e: MouseEvent) => {
      if (wrapper.current && !wrapper.current.contains(e.target as Node)) setOpen(false)
    }
    const toets = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        knop.current?.focus()
      }
    }
    document.addEventListener('mousedown', buitenKlik)
    document.addEventListener('keydown', toets)
    return () => {
      document.removeEventListener('mousedown', buitenKlik)
      document.removeEventListener('keydown', toets)
    }
  }, [open])

  function wissel(waarde: string) {
    onWijzig(
      geselecteerd.includes(waarde)
        ? geselecteerd.filter((w) => w !== waarde)
        : [...geselecteerd, waarde],
    )
  }

  const actief = geselecteerd.length > 0

  return (
    <div className="multi" ref={wrapper}>
      <button
        ref={knop}
        type="button"
        className={`multi-knop${actief ? ' actief' : ''}`}
        aria-expanded={open}
        aria-controls={paneelId}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="multi-label">{label}:</span> {samenvatting(opties, geselecteerd)}
        <span className="pijl" aria-hidden="true">
          ▾
        </span>
      </button>
      {open && (
        <div
          id={paneelId}
          className={`multi-paneel multi-${uitlijning}`}
          role="group"
          aria-label={`Filter op ${label.toLowerCase()}`}
        >
          {opties.map((o) => {
            const aangevinkt = geselecteerd.includes(o.waarde)
            const uitgeschakeld = o.aantal === 0 && !aangevinkt
            return (
              <label key={o.waarde} className={`multi-optie${uitgeschakeld ? ' uit' : ''}`}>
                <input
                  type="checkbox"
                  checked={aangevinkt}
                  disabled={uitgeschakeld}
                  onChange={() => wissel(o.waarde)}
                />
                <span className="multi-tekst">{o.label}</span>
                <span className="aantal">{o.aantal}</span>
              </label>
            )
          })}
          {actief && (
            <button type="button" className="multi-wis" onClick={() => onWijzig([])}>
              Wis keuze
            </button>
          )}
        </div>
      )}
    </div>
  )
}
