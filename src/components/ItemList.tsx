import type { ListItem } from '../lib/items'
import { isGewoneKlik } from '../lib/route'
import { AllianceBadge } from './AllianceBadge'

export type Weergave = 'kaarten' | 'lijst'

interface Props {
  items: ListItem[]
  weergave: Weergave
  onOpen: (href: string) => void
}

export function ItemList({ items, weergave, onOpen }: Props) {
  if (items.length === 0) {
    return <p className="leeg">Geen resultaten. Pas je zoekopdracht of filter aan.</p>
  }
  return (
    <ul className={weergave === 'kaarten' ? 'kaarten' : 'lijst'}>
      {items.map((item) => (
        <li key={item.id} className="item">
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
              <AllianceBadge alliantie={item.alliantie} />
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
        </li>
      ))}
    </ul>
  )
}
