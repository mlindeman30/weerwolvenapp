import { useEffect, useMemo, useState } from 'react'
import { Detail } from './components/Detail'
import { ItemList, type Weergave } from './components/ItemList'
import { MijnLijst } from './components/MijnLijst'
import type { Optie } from './components/MultiSelect'
import { PersonageDetail } from './components/PersonageDetail'
import { RolDetail } from './components/RolDetail'
import { Toolbar } from './components/Toolbar'
import { Trek } from './components/Trek'
import { personagePerId, rolPerId } from './lib/data'
import { personageItems, rolItems, type ListItem } from './lib/items'
import { HREF_LIJST, useRoute } from './lib/route'
import { komtOvereen } from './lib/search'

type Tab = 'rollen' | 'personages' | 'lijst'

const ONBEKEND = '__onbekend__'
const GEEN_THEMA = '__geen_thema__'

const alliantieWaarde = (item: ListItem) => item.alliantie ?? ONBEKEND
const themaWaarde = (item: ListItem) => item.thema ?? GEEN_THEMA

/** Een lege keuze betekent: geen beperking. */
const past = (gekozen: string[], waarde: string) => gekozen.length === 0 || gekozen.includes(waarde)

/**
 * Maakt de opties voor een filter uit de data: alfabetisch, met 'Onbekend' of 'Geen thema' als laatste.
 * De aantallen tellen alleen de items die ook aan de andere filters voldoen.
 */
function maakOpties(
  alleItems: ListItem[],
  tellenItems: ListItem[],
  waardeVan: (item: ListItem) => string,
  speciaal: { waarde: string; label: string },
): Optie[] {
  const waarden = new Set(alleItems.map(waardeVan))
  const gewone = [...waarden]
    .filter((w) => w !== speciaal.waarde)
    .sort((a, b) => a.localeCompare(b, 'nl', { sensitivity: 'base' }))
  const volgorde = waarden.has(speciaal.waarde) ? [...gewone, speciaal.waarde] : gewone
  return volgorde.map((waarde) => ({
    waarde,
    label: waarde === speciaal.waarde ? speciaal.label : waarde,
    aantal: tellenItems.filter((i) => waardeVan(i) === waarde).length,
  }))
}

function leesWeergave(): Weergave {
  try {
    return localStorage.getItem('weergave') === 'lijst' ? 'lijst' : 'kaarten'
  } catch {
    return 'kaarten'
  }
}

export default function App() {
  const [route, navigeer] = useRoute()
  // Bij een rechtstreekse link naar een personage starten we in het juiste tabblad.
  const [tab, setTab] = useState<Tab>(route.soort === 'personage' ? 'personages' : 'rollen')
  const [zoekopdracht, setZoekopdracht] = useState('')
  const [gekozenAlliantie, setGekozenAlliantie] = useState<string[]>([])
  const [gekozenThema, setGekozenThema] = useState<string[]>([])
  const [weergave, setWeergave] = useState<Weergave>(leesWeergave)

  const [gekozen, setGekozen] = useState<Set<string>>(() => new Set())
  const [getrokken, setGetrokken] = useState<ListItem | null>(null)

  function wissel(id: string) {
    setGekozen((vorige) => {
      const nieuw = new Set(vorige)
      if (!nieuw.delete(id)) nieuw.add(id)
      return nieuw
    })
  }

  function trek() {
    // Uit alle rollen en personages samen, zonder filters.
    const alles = [...rolItems, ...personageItems]
    setGetrokken(alles[Math.floor(Math.random() * alles.length)])
  }

  const lijstRollen = rolItems.filter((i) => gekozen.has(i.id))
  const lijstPersonages = personageItems.filter((i) => gekozen.has(i.id))

  // In het tabblad Mijn lijst is er geen lijst om te filteren; we gebruiken dan de rollen als basis.
  const items = tab === 'personages' ? personageItems : rolItems
  const metThema = tab === 'personages'

  const gevonden = useMemo(
    () => items.filter((i) => komtOvereen(i.zoektekst, zoekopdracht)),
    [items, zoekopdracht],
  )

  const alliantieOpties = useMemo(
    () =>
      maakOpties(
        items,
        gevonden.filter((i) => !metThema || past(gekozenThema, themaWaarde(i))),
        alliantieWaarde,
        { waarde: ONBEKEND, label: 'Onbekend' },
      ),
    [items, gevonden, metThema, gekozenThema],
  )
  const themaOpties = useMemo(
    () =>
      metThema
        ? maakOpties(
            items,
            gevonden.filter((i) => past(gekozenAlliantie, alliantieWaarde(i))),
            themaWaarde,
            { waarde: GEEN_THEMA, label: 'Geen thema' },
          )
        : undefined,
    [items, gevonden, metThema, gekozenAlliantie],
  )

  // Een keuze die in dit tabblad niet bestaat (bijvoorbeeld 'Gelinkt' bij Rollen) telt niet mee.
  const alliantie = gekozenAlliantie.filter((w) => alliantieOpties.some((o) => o.waarde === w))
  const thema = metThema ? gekozenThema.filter((w) => themaOpties?.some((o) => o.waarde === w)) : []

  const zichtbaar = gevonden.filter(
    (i) => past(alliantie, alliantieWaarde(i)) && (!metThema || past(thema, themaWaarde(i))),
  )
  const filtersActief = alliantie.length > 0 || thema.length > 0

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

      <div className="trek-balk">
        <button type="button" className="chip" onClick={trek}>
          Trek een willekeurige rol
        </button>
      </div>
      {getrokken && (
        <Trek
          item={getrokken}
          soort={rolPerId.has(getrokken.id) ? 'Rol' : 'Personage'}
          inLijst={gekozen.has(getrokken.id)}
          onOpen={navigeer}
          onOpnieuw={trek}
          onWissel={() => wissel(getrokken.id)}
          onSluit={() => setGetrokken(null)}
        />
      )}

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
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'lijst'}
          className={`tab${tab === 'lijst' ? ' actief' : ''}`}
          onClick={() => setTab('lijst')}
        >
          Mijn lijst <span className="aantal">{gekozen.size}</span>
        </button>
      </div>

      {tab === 'lijst' ? (
        <MijnLijst
          rollen={lijstRollen}
          personages={lijstPersonages}
          weergave={weergave}
          gekozen={gekozen}
          onWissel={wissel}
          onLeeg={() => setGekozen(new Set())}
          onOpen={navigeer}
        />
      ) : (
        <>
      <Toolbar
        zoekopdracht={zoekopdracht}
        onZoekopdracht={setZoekopdracht}
        alliantieOpties={alliantieOpties}
        alliantie={alliantie}
        onAlliantie={setGekozenAlliantie}
        themaOpties={themaOpties}
        thema={thema}
        onThema={setGekozenThema}
        weergave={weergave}
        onWeergave={kiesWeergave}
      />

      <p className="resultaat" aria-live="polite">
        {zichtbaar.length} van {items.length} {tab === 'rollen' ? 'rollen' : 'personages'}
        {filtersActief && (
          <>
            {' · '}
            <button
              type="button"
              className="link-knop"
              onClick={() => {
                setGekozenAlliantie([])
                setGekozenThema([])
              }}
            >
              Filters wissen
            </button>
          </>
        )}
      </p>

      <ItemList items={zichtbaar} weergave={weergave} onOpen={navigeer} gekozen={gekozen} onWissel={wissel} />
        </>
      )}

      {(rol || personage) && (
        <Detail
          sleutel={rol?.id ?? personage?.id ?? ''}
          titelId="detail-titel"
          onSluit={() => navigeer(HREF_LIJST)}
          inLijst={gekozen.has(rol?.id ?? personage?.id ?? '')}
          onWissel={() => wissel(rol?.id ?? personage?.id ?? '')}
        >
          {rol && <RolDetail rol={rol} onOpen={navigeer} />}
          {personage && <PersonageDetail personage={personage} onOpen={navigeer} />}
        </Detail>
      )}
    </div>
  )
}
