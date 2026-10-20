import { useEffect, useMemo, useState } from 'react'
import { Detail } from './components/Detail'
import { ItemList, type Weergave } from './components/ItemList'
import { PersonageDetail } from './components/PersonageDetail'
import { RolDetail } from './components/RolDetail'
import {
  Toolbar,
  type AlliantieFilter,
  type FilterOptie,
  type ThemaFilter,
} from './components/Toolbar'
import { personagePerId, rolPerId } from './lib/data'
import { personageItems, rolItems, type ListItem } from './lib/items'
import { HREF_LIJST, useRoute } from './lib/route'
import { komtOvereen } from './lib/search'

type Tab = 'rollen' | 'personages'

const ALLIANTIES: { waarde: AlliantieFilter; label: string }[] = [
  { waarde: 'alle', label: 'Alle' },
  { waarde: 'Goed', label: 'Goed' },
  { waarde: 'Neutraal', label: 'Neutraal' },
  { waarde: 'Slecht', label: 'Slecht' },
  { waarde: 'Gelinkt', label: 'Gelinkt' },
  { waarde: 'onbekend', label: 'Onbekend' },
]

const THEMAS: { waarde: ThemaFilter; label: string }[] = [
  { waarde: 'alle', label: "Alle thema's" },
  { waarde: 'Star Trek', label: 'Star Trek' },
  { waarde: 'Avatar', label: 'Avatar' },
  { waarde: 'Stardew Valley', label: 'Stardew Valley' },
  { waarde: 'Buffy', label: 'Buffy' },
  { waarde: 'geen', label: 'Geen thema' },
]

const hoortBijAlliantie = (item: ListItem, filter: AlliantieFilter) =>
  filter === 'alle' ? true : filter === 'onbekend' ? item.alliantie === null : item.alliantie === filter

const hoortBijThema = (item: ListItem, filter: ThemaFilter) =>
  filter === 'alle' ? true : filter === 'geen' ? item.thema === null : item.thema === filter

function leesWeergave(): Weergave {
  try {
    return localStorage.getItem('weergave') === 'lijst' ? 'lijst' : 'kaarten'
  } catch {
    return 'kaarten'
  }
}

function maakOpties<T extends string>(
  definities: { waarde: T; label: string }[],
  items: ListItem[],
  hoortBij: (item: ListItem, waarde: T) => boolean,
  actief: T,
): FilterOptie<T>[] {
  return definities
    .map((d) => ({ ...d, aantal: items.filter((i) => hoortBij(i, d.waarde)).length }))
    .filter((d) => d.waarde === 'alle' || d.waarde === actief || d.aantal > 0)
}

export default function App() {
  const [route, navigeer] = useRoute()
  // Bij een rechtstreekse link naar een personage starten we in het juiste tabblad.
  const [tab, setTab] = useState<Tab>(route.soort === 'personage' ? 'personages' : 'rollen')
  const [zoekopdracht, setZoekopdracht] = useState('')
  const [filter, setFilter] = useState<AlliantieFilter>('alle')
  const [themaFilter, setThemaFilter] = useState<ThemaFilter>('alle')
  const [weergave, setWeergave] = useState<Weergave>(leesWeergave)

  const items = tab === 'rollen' ? rolItems : personageItems
  const metThema = tab === 'personages'
  const actiefThema: ThemaFilter = metThema ? themaFilter : 'alle'

  const gevonden = useMemo(
    () => items.filter((i) => komtOvereen(i.zoektekst, zoekopdracht)),
    [items, zoekopdracht],
  )
  const zichtbaar = gevonden.filter(
    (i) => hoortBijAlliantie(i, filter) && hoortBijThema(i, actiefThema),
  )

  const alliantieOpties = maakOpties(
    ALLIANTIES,
    gevonden.filter((i) => hoortBijThema(i, actiefThema)),
    hoortBijAlliantie,
    filter,
  )
  const themaOpties = metThema
    ? maakOpties(
        THEMAS,
        gevonden.filter((i) => hoortBijAlliantie(i, filter)),
        hoortBijThema,
        themaFilter,
      )
    : undefined

  const rol = route.soort === 'rol' ? rolPerId.get(route.id) : undefined
  const personage = route.soort === 'personage' ? personagePerId.get(route.id) : undefined
  const detailTitel = rol?.naam ?? (personage ? (personage.naam ?? personage.rol) : null)

  useEffect(() => {
    document.title = detailTitel ? `${detailTitel} – Weerwolven Rollenboek` : 'Weerwolven Rollenboek'
  }, [detailTitel])

  function kiesWeergave(w: Weergave) {
    setWeergave(w)
    try {
      localStorage.setItem('weergave', w)
    } catch {
      /* opslaan mislukt: geen probleem */
    }
  }

  return (
    <div className="pagina">
      <header className="kop">
        <h1>Weerwolven Rollenboek</h1>
        <p>Rollen en personages uit Digitaal Weerwolven</p>
      </header>

      <div className="tabs" role="tablist" aria-label="Soort">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'rollen'}
          className={`tab${tab === 'rollen' ? ' actief' : ''}`}
          onClick={() => setTab('rollen')}
        >
          Rollen <span className="aantal">{rolItems.length}</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'personages'}
          className={`tab${tab === 'personages' ? ' actief' : ''}`}
          onClick={() => setTab('personages')}
        >
          Personages <span className="aantal">{personageItems.length}</span>
        </button>
      </div>

      <Toolbar
        zoekopdracht={zoekopdracht}
        onZoekopdracht={setZoekopdracht}
        filters={alliantieOpties}
        filter={filter}
        onFilter={setFilter}
        themaFilters={themaOpties}
        themaFilter={themaFilter}
        onThemaFilter={setThemaFilter}
        weergave={weergave}
        onWeergave={kiesWeergave}
      />

      <p className="resultaat" aria-live="polite">
        {zichtbaar.length} van {items.length} {tab === 'rollen' ? 'rollen' : 'personages'}
      </p>

      <ItemList items={zichtbaar} weergave={weergave} onOpen={navigeer} />

      {(rol || personage) && (
        <Detail
          sleutel={rol?.id ?? personage?.id ?? ''}
          titelId="detail-titel"
          onSluit={() => navigeer(HREF_LIJST)}
        >
          {rol && <RolDetail rol={rol} onOpen={navigeer} />}
          {personage && <PersonageDetail personage={personage} onOpen={navigeer} />}
        </Detail>
      )}
    </div>
  )
}
