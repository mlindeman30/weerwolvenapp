import type { Alliantie, Thema } from '../types'
import type { Weergave } from './ItemList'

export type AlliantieFilter = 'alle' | Alliantie | 'onbekend'
export type ThemaFilter = 'alle' | Thema | 'geen'

export interface FilterOptie<T extends string> {
  waarde: T
  label: string
  aantal: number
}

interface Props {
  zoekopdracht: string
  onZoekopdracht: (waarde: string) => void
  filters: FilterOptie<AlliantieFilter>[]
  filter: AlliantieFilter
  onFilter: (waarde: AlliantieFilter) => void
  /** Alleen meegeven in het tabblad Personages. */
  themaFilters?: FilterOptie<ThemaFilter>[]
  themaFilter: ThemaFilter
  onThemaFilter: (waarde: ThemaFilter) => void
  weergave: Weergave
  onWeergave: (waarde: Weergave) => void
}

function Chips<T extends string>(props: {
  opties: FilterOptie<T>[]
  actief: T
  onKies: (waarde: T) => void
  label: string
}) {
  return (
    <div className="chips" role="group" aria-label={props.label}>
      {props.opties.map((f) => (
        <button
          key={f.waarde}
          type="button"
          className={`chip${props.actief === f.waarde ? ' actief' : ''}`}
          aria-pressed={props.actief === f.waarde}
          onClick={() => props.onKies(f.waarde)}
        >
          {f.label} <span className="aantal">{f.aantal}</span>
        </button>
      ))}
    </div>
  )
}

export function Toolbar(p: Props) {
  return (
    <div className="toolbar">
      <input
        type="search"
        className="zoek"
        placeholder="Zoek op naam, rol, thema of tekst"
        aria-label="Zoeken"
        value={p.zoekopdracht}
        onChange={(e) => p.onZoekopdracht(e.target.value)}
      />
      <Chips opties={p.filters} actief={p.filter} onKies={p.onFilter} label="Filter op alliantie" />
      <div className="weergave" role="group" aria-label="Weergave">
        {(['kaarten', 'lijst'] as const).map((w) => (
          <button
            key={w}
            type="button"
            className={`chip${p.weergave === w ? ' actief' : ''}`}
            aria-pressed={p.weergave === w}
            onClick={() => p.onWeergave(w)}
          >
            {w === 'kaarten' ? 'Kaarten' : 'Lijst'}
          </button>
        ))}
      </div>
      {p.themaFilters && (
        <Chips
          opties={p.themaFilters}
          actief={p.themaFilter}
          onKies={p.onThemaFilter}
          label="Filter op thema"
        />
      )}
    </div>
  )
}
