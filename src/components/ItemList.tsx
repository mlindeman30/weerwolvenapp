import type { ListItem } from '../lib/items'
import { isGewoneKlik } from '../lib/route'
import { AllianceBadge } from './AllianceBadge'

export type Weergave = 'kaarten' | 'lijst'

interface Props {
  items: ListItem[]
  weergave: Weergave
  onOpen: (href: string) => void
  /** Ids van de items in 'Mijn lijst'. */
  gekozen: Set<string>
  onWissel: (id: string) => void
}

export function ItemList({ items, weergave, onOpen, gekozen, onWissel }: Props) {
  if (items.length === 0) {
    return <p className="leeg">Geen resultaten. Pas je zoekopdracht of filter aan.</p>
  }
  return (
    <ul className={weergave === 'kaarten' ? 'kaarten' : 'lijst'}>
      {items.map((item) => (
        <li key={item.id} className={`item${gekozen.has(item.id) ? ' gekozen' : ''}`}>
          <a
            className="item-link"
            href={item.href}
            onClick={(e) => {
              if (isGewoneKlik(e)) {
                e.preventDefault()
                onOpen(item.href)
              }
            }}
          >
            <div className="item-kop">
              <h3>{item.titel}</h3>
              <span className="item-labels">
                <AllianceBadge alliantie={item.alliantie} />
                {item.aanTeVullen.length > 0 && (
                  <span className="badge badge-aanvullen" title={`Nog aan te vullen: ${item.aanTeVullen.join(', ')}`}>
                    Nog aan te vullen
                  </span>
                )}
              </span>
            </div>
            {(item.subtitel || item.thema) && (
              <p className="item-meta">
                {item.subtitel}
                {item.subtitel && item.thema ? ' · ' : ''}
                {item.thema && <span className="thema">{item.thema}</span>}
              </p>
            )}
            {item.verwijzing && <p className="item-verwijzing">{item.verwijzing}</p>}
            {item.aantalVarianten > 0 && (
              <p className="item-verwijzing">
                {item.aantalVarianten} {item.aantalVarianten === 1 ? 'variant' : 'varianten'}
              </p>
            )}
            {item.snippet && <p className="item-tekst">{item.snippet}</p>}
          </a>
          <label className="kies">
            <input
              type="checkbox"
              checked={gekozen.has(item.id)}
              onChange={() => onWissel(item.id)}
              aria-label={`${item.titel} in mijn lijst`}
            />
          </label>
        </li>
      ))}
    </ul>
  )
}
