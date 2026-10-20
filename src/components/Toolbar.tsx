import type { Weergave } from './ItemList'
import { MultiSelect, type Optie } from './MultiSelect'

interface Props {
  zoekopdracht: string
  onZoekopdracht: (waarde: string) => void
  alliantieOpties: Optie[]
  alliantie: string[]
  onAlliantie: (waarden: string[]) => void
  /** Alleen meegeven in het tabblad Personages. */
  themaOpties?: Optie[]
  thema: string[]
  onThema: (waarden: string[]) => void
  weergave: Weergave
  onWeergave: (waarde: Weergave) => void
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
      <div className="filters">
        <MultiSelect
          label="Alliantie"
          opties={p.alliantieOpties}
          geselecteerd={p.alliantie}
          onWijzig={p.onAlliantie}
        />
        {p.themaOpties && (
          <MultiSelect
            label="Thema"
            opties={p.themaOpties}
            geselecteerd={p.thema}
            onWijzig={p.onThema}
            uitlijning="rechts"
          />
        )}
      </div>
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
    </div>
  )
}
