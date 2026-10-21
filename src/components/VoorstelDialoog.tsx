import { useEffect, useMemo, useRef, useState } from 'react'
import { personages, personagePerId, rolPerId } from '../lib/data'
import { personageItems, rolItems } from '../lib/items'
import {
  MAX_URL_LENGTE,
  SOORT_LABEL,
  VELD_LABEL,
  issueUrl,
  maakIssue,
  type VeldNaam,
  type Velden,
  type Voorstel,
  type VoorstelSoort,
} from '../lib/voorstel'
import { RolKiezer } from './RolKiezer'

interface Props {
  /** Bij een voorstel vanuit het detail: het item waar het over gaat. */
  startDoel?: string
  onSluit: () => void
}

type Invoer = Record<VeldNaam, string>
const LEEG: Invoer = { naam: '', rol: '', thema: '', alliantie: '', omschrijving: '', krachten: '', winconditie: '' }
const themas = [...new Set(personages.map((p) => p.thema).filter((t): t is string => !!t))].sort((a, b) =>
  a.localeCompare(b, 'nl', { sensitivity: 'base' }),
)

/** De huidige waarden van een bestaand item, als uitgangspunt voor een wijziging. */
function basisVan(id: string): { invoer: Invoer; rolIds: string[] } {
  const r = rolPerId.get(id)
  if (r) {
    return {
      invoer: { ...LEEG, naam: r.naam, alliantie: r.alliantie ?? '', omschrijving: r.omschrijving, krachten: r.krachten, winconditie: r.winconditie },
      rolIds: [],
    }
  }
  const p = personagePerId.get(id)
  if (p) {
    return {
      invoer: {
        naam: p.naam ?? '',
        rol: p.rol ?? '',
        thema: p.thema ?? '',
        alliantie: p.alliantie && p.alliantie !== 'Gelinkt' ? p.alliantie : '',
        omschrijving: p.omschrijving,
        krachten: p.krachten,
        winconditie: p.winconditie,
      },
      rolIds: p.rolIds,
    }
  }
  return { invoer: LEEG, rolIds: [] }
}

const gelijk = (a: string[], b: string[]) => a.length === b.length && a.every((x) => b.includes(x))

export function VoorstelDialoog({ startDoel, onSluit }: Props) {
  const ref = useRef<HTMLDialogElement>(null)
  const [soort, setSoort] = useState<VoorstelSoort>(startDoel ? 'wijziging' : 'nieuwe-rol')
  const [doel, setDoel] = useState(startDoel ?? '')
  const [invoer, setInvoer] = useState<Invoer>(() => (startDoel ? basisVan(startDoel).invoer : LEEG))
  const [rolIds, setRolIds] = useState<string[]>(() => (startDoel ? basisVan(startDoel).rolIds : []))
  const [toelichting, setToelichting] = useState('')
  const [indiener, setIndiener] = useState('')
  const [melding, setMelding] = useState('')
  const [fout, setFout] = useState('')

  useEffect(() => {
    const d = ref.current
    if (d && !d.open) d.showModal()
    return () => {
      if (d?.open) d.close()
    }
  }, [])

  const basis = useMemo(() => (doel ? basisVan(doel) : null), [doel])
  const doelIsRol = doel.startsWith('rol-')

  function kiesSoort(s: VoorstelSoort) {
    setSoort(s)
    setDoel('')
    setInvoer(LEEG)
    setRolIds([])
    setFout('')
    setMelding('')
  }

  function kiesDoel(id: string) {
    setDoel(id)
    const b = id ? basisVan(id) : null
    setInvoer(b?.invoer ?? LEEG)
    setRolIds(b?.rolIds ?? [])
  }

  const zet = (veld: VeldNaam) => (e: { target: { value: string } }) =>
    setInvoer((i) => ({ ...i, [veld]: e.target.value }))

  /** Welke velden doen mee: bij nieuw alle ingevulde, bij een wijziging alleen de aangepaste. */
  function bouw(): { voorstel?: Voorstel; fout?: string } {
    const velden: Velden = {}
    const alle = Object.keys(LEEG) as VeldNaam[]
    if (soort === 'nieuwe-rol' || soort === 'nieuw-personage') {
      for (const v of alle) if (invoer[v].trim()) velden[v] = invoer[v].trim()
      if (soort === 'nieuwe-rol') {
        delete velden.rol
        delete velden.thema
        if (!velden.naam) return { fout: 'Vul de naam van de rol in.' }
      } else {
        if (!velden.naam && !velden.rol) return { fout: 'Vul een naam of een rol in.' }
        if (rolIds.length > 0) velden.rolIds = rolIds
      }
      if (!velden.omschrijving) return { fout: 'Vul een omschrijving in.' }
    } else {
      if (!doel || !basis) return { fout: 'Kies eerst het bestaande item.' }
      if (soort === 'wijziging') {
        for (const v of alle) if (invoer[v].trim() !== basis.invoer[v].trim()) velden[v] = invoer[v].trim()
        if (Object.keys(velden).length === 0) return { fout: 'Je hebt nog niets aangepast.' }
      } else {
        if (gelijk(rolIds, basis.rolIds)) return { fout: 'Je hebt de koppeling nog niet aangepast.' }
        velden.rolIds = rolIds
      }
    }
    return {
      voorstel: { versie: 1, soort, doel: doel || undefined, velden, toelichting: toelichting.trim(), indiener: indiener.trim() },
    }
  }

  async function dienIn() {
    const { voorstel, fout: f } = bouw()
    if (!voorstel) {
      setFout(f ?? '')
      setMelding('')
      return
    }
    setFout('')
    const { titel, body } = maakIssue(voorstel)
    const url = issueUrl(titel, body)
    if (url.length <= MAX_URL_LENGTE) {
      window.open(url, '_blank', 'noopener')
      setMelding('GitHub is geopend met je voorstel. Klik daar op "Submit new issue" om het te versturen.')
      return
    }
    try {
      await navigator.clipboard.writeText(body)
      window.open(issueUrl(titel, null), '_blank', 'noopener')
      setMelding('Je voorstel is te lang voor een link. De tekst is gekopieerd: plak die in het issue dat GitHub opent.')
    } catch {
      setMelding('Je voorstel is te lang voor een link en kopiëren is niet gelukt. Kort de tekst in of probeer het opnieuw.')
    }
  }

  const tekstveld = (veld: VeldNaam, rijen = 3) => (
    <label className="veld" key={veld}>
      <span>{VELD_LABEL[veld]}</span>
      <textarea rows={rijen} value={invoer[veld]} onChange={zet(veld)} />
    </label>
  )
  const regelveld = (veld: VeldNaam, lijst?: string) => (
    <label className="veld" key={veld}>
      <span>{VELD_LABEL[veld]}</span>
      <input type="text" value={invoer[veld]} onChange={zet(veld)} list={lijst} />
    </label>
  )
  const alliantieVeld = (
    <label className="veld" key="alliantie">
      <span>Alliantie</span>
      <select value={invoer.alliantie} onChange={zet('alliantie')}>
        <option value="">Onbekend</option>
        <option value="Goed">Goed</option>
        <option value="Neutraal">Neutraal</option>
        <option value="Slecht">Slecht</option>
      </select>
    </label>
  )

  const doelKeuze = (alleenPersonages: boolean) => (
    <label className="veld">
      <span>Bestaand item</span>
      <select value={doel} onChange={(e) => kiesDoel(e.target.value)}>
        <option value="">Kies een item…</option>
        {!alleenPersonages && (
          <optgroup label="Rollen">
            {rolItems.map((i) => (
              <option key={i.id} value={i.id}>
                {i.titel}
              </option>
            ))}
          </optgroup>
        )}
        <optgroup label="Personages">
          {personageItems.map((i) => (
            <option key={i.id} value={i.id}>
              {i.titel}
              {i.thema ? ` (${i.thema})` : ''}
            </option>
          ))}
        </optgroup>
      </select>
    </label>
  )

  return (
    <dialog
      ref={ref}
      className="detail voorstel"
      aria-labelledby="voorstel-titel"
      tabIndex={-1}
      onCancel={(e) => {
        e.preventDefault()
        onSluit()
      }}
      onClick={(e) => {
        if (e.target === ref.current) onSluit()
      }}
    >
      <div className="detail-balk">
        <strong id="voorstel-titel">Voorstel doen</strong>
        <button type="button" className="sluit" onClick={onSluit} aria-label="Sluiten">
          ✕
        </button>
      </div>
      <form
        className="detail-inhoud voorstel-formulier"
        onSubmit={(e) => {
          e.preventDefault()
          void dienIn()
        }}
      >
        <p className="item-meta">
          Je voorstel komt als issue in GitHub terecht en wordt pas op de site gezet nadat het is goedgekeurd. Voor
          indienen heb je op dit moment een GitHub-account nodig.
        </p>

        <label className="veld">
          <span>Wat wil je voorstellen?</span>
          <select value={soort} onChange={(e) => kiesSoort(e.target.value as VoorstelSoort)}>
            {(Object.keys(SOORT_LABEL) as VoorstelSoort[]).map((s) => (
              <option key={s} value={s}>
                {SOORT_LABEL[s]}
              </option>
            ))}
          </select>
        </label>

        {soort === 'nieuwe-rol' && (
          <>
            {regelveld('naam')}
            {alliantieVeld}
            {tekstveld('omschrijving')}
            {tekstveld('krachten')}
            {tekstveld('winconditie')}
          </>
        )}

        {soort === 'nieuw-personage' && (
          <>
            {regelveld('naam')}
            <p className="item-meta veld-uitleg">Laat de naam leeg voor een eigen uitwerking zonder personagenaam.</p>
            {regelveld('rol')}
            {regelveld('thema', 'thema-lijst')}
            <datalist id="thema-lijst">
              {themas.map((t) => (
                <option key={t} value={t} />
              ))}
            </datalist>
            {alliantieVeld}
            {tekstveld('omschrijving')}
            {tekstveld('krachten')}
            {tekstveld('winconditie')}
            <div className="veld">
              <span>Variant van (algemene rollen)</span>
              <RolKiezer geselecteerd={rolIds} onWijzig={setRolIds} />
            </div>
          </>
        )}

        {soort === 'wijziging' && (
          <>
            {doelKeuze(false)}
            {doel && (
              <>
                <p className="item-meta veld-uitleg">Pas aan wat anders moet; alleen gewijzigde velden gaan mee.</p>
                {regelveld('naam')}
                {!doelIsRol && regelveld('rol')}
                {!doelIsRol && regelveld('thema', 'thema-lijst')}
                <datalist id="thema-lijst">
                  {themas.map((t) => (
                    <option key={t} value={t} />
                  ))}
                </datalist>
                {alliantieVeld}
                {tekstveld('omschrijving')}
                {tekstveld('krachten')}
                {tekstveld('winconditie')}
              </>
            )}
          </>
        )}

        {soort === 'koppeling' && (
          <>
            {doelKeuze(true)}
            {doel && (
              <div className="veld">
                <span>Variant van (algemene rollen)</span>
                <RolKiezer geselecteerd={rolIds} onWijzig={setRolIds} />
              </div>
            )}
          </>
        )}

        <label className="veld">
          <span>Toelichting (optioneel)</span>
          <textarea rows={2} value={toelichting} onChange={(e) => setToelichting(e.target.value)} />
        </label>
        <label className="veld">
          <span>Je naam (optioneel)</span>
          <input type="text" value={indiener} onChange={(e) => setIndiener(e.target.value)} />
        </label>

        {fout && (
          <p className="aanvul-melding" role="alert">
            {fout}
          </p>
        )}
        {melding && (
          <p className="item-meta" role="status">
            {melding}
          </p>
        )}
        <div className="trek-acties">
          <button type="submit" className="chip actief">
            Dien in via GitHub
          </button>
          <button type="button" className="chip" onClick={onSluit}>
            Annuleren
          </button>
        </div>
      </form>
    </dialog>
  )
}
