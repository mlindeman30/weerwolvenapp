import type { Weergave } from './ItemList'
import type { Criterium, Richting } from '../lib/sorteer'
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
  criterium: Criterium
  onCriterium: (waarde: Criterium) => void
  richting: Richting
  onRichting: (waarde: Richting) => void
  /** Sorteren op aantal varianten kan alleen bij rollen. */
  metVarianten: boolean
  /** Aantal items in dit tabblad dat nog aangevuld moet worden; 0 = geen knop. */
  aantalAanTeVullen: number
  alleenAanTeVullen: boolean
  onAlleenAanTeVullen: (waarde: boolean) => void
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
      <div className="toolbar-onder">
        <div className="sorteer-rij">
          <label className="sorteer">
            <span className="multi-label">Sorteren op</span>
            <select value={p.criterium} onChange={(e) => p.onCriterium(e.target.value as Criterium)}>
              <option value="naam">Naam</option>
              {p.metVarianten && <option value="varianten">Aantal varianten</option>}
              <option value="alliantie">Alliantie</option>
            </select>
          </label>
          <button
            type="button"
            className="sorteer-richting"
            onClick={() => p.onRichting(p.richting === 'oplopend' ? 'aflopend' : 'oplopend')}
            aria-label={`Richting: ${p.richting}. Klik om te wisselen`}
            title="Wissel tussen oplopend en aflopend"
          >
            {p.richting === 'oplopend' ? '↑ Oplopend' : '↓ Aflopend'}
          </button>
        </div>
        {p.aantalAanTeVullen > 0 && (
          <button
            type="button"
            className={`chip${p.alleenAanTeVullen ? ' actief' : ''}`}
            aria-pressed={p.alleenAanTeVullen}
            onClick={() => p.onAlleenAanTeVullen(!p.alleenAanTeVullen)}
          >
            Nog aan te vullen <span className="aantal">{p.aantalAanTeVullen}</span>
          </button>
        )}
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
    </div>
  )
}
