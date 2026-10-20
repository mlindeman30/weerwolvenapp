import { rolPerId } from '../lib/data'
import { hrefRol, isGewoneKlik } from '../lib/route'
import type { Personage } from '../types'
import { AllianceBadge } from './AllianceBadge'
import { Sectie } from './Sectie'

interface Props {
  personage: Personage
  onOpen: (href: string) => void
}

export function PersonageDetail({ personage: p, onOpen }: Props) {
  const rol = p.rolId ? rolPerId.get(p.rolId) : undefined
  const titel = p.naam ?? p.rol ?? 'Onbekend'
  return (
    <>
      <header className="detail-kop">
        <h2 id="detail-titel">{titel}</h2>
        <p className="item-meta">
          {p.naam === null ? 'Eigen uitwerking' : (p.rol ?? 'Personage')}
          {' · '}
          {p.thema ?? 'Geen thema'} <AllianceBadge alliantie={p.alliantie} />
        </p>
        {p.alliantieTekst && <p className="item-meta">Alliantie: {p.alliantieTekst}</p>}
        {rol && (
          <p className="item-verwijzing">
            Variant van{' '}
            <a
              href={hrefRol(rol.id)}
              onClick={(e) => {
                if (isGewoneKlik(e)) {
                  e.preventDefault()
                  onOpen(hrefRol(rol.id))
                }
              }}
            >
              {rol.naam}
            </a>
          </p>
        )}
      </header>
      <Sectie titel="Omschrijving" tekst={p.omschrijving} />
      <Sectie titel="Rolkrachten" tekst={p.krachten} />
      <Sectie titel="Winconditie" tekst={p.winconditie} />
    </>
  )
}
