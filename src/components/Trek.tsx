import { isGewoneKlik } from '../lib/route'
import type { ListItem } from '../lib/items'

interface Props {
  item: ListItem
  soort: string
  inLijst: boolean
  onOpen: (href: string) => void
  onOpnieuw: () => void
  onWissel: () => void
  onSluit: () => void
}

/** Toont alleen de naam van de getrokken rol; het detail opent de bezoeker zelf. */
export function Trek({ item, soort, inLijst, onOpen, onOpnieuw, onWissel, onSluit }: Props) {
  return (
    <section className="trek" aria-live="polite" aria-label="Getrokken rol">
      <p className="item-meta">Getrokken {soort.toLowerCase()}</p>
      <p className="trek-naam">{item.titel}</p>
      <div className="trek-acties">
        <a
          className="chip actief"
          href={item.href}
          onClick={(e) => {
            if (isGewoneKlik(e)) {
              e.preventDefault()
              onOpen(item.href)
            }
          }}
        >
          Bekijk detail
        </a>
        <button type="button" className="chip" onClick={onOpnieuw}>
          Opnieuw trekken
        </button>
        <button type="button" className="chip" onClick={onWissel}>
          {inLijst ? 'Haal uit mijn lijst' : 'Voeg toe aan mijn lijst'}
        </button>
        <button type="button" className="chip" onClick={onSluit}>
          Sluiten
        </button>
      </div>
    </section>
  )
}
