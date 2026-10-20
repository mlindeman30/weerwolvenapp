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
  const rollen = p.rolIds.flatMap((id) => rolPerId.get(id) ?? [])
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
        {rollen.length > 0 && (
          <p className="item-verwijzing">
            Variant van{' '}
            {rollen.map((rol, i) => (
              <span key={rol.id}>
                {i > 0 && (i === rollen.length - 1 ? ' en ' : ', ')}
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
              </span>
            ))}
          </p>
        )}
      </header>
      <Sectie titel="Omschrijving" tekst={p.omschrijving} />
      <Sectie titel="Rolkrachten" tekst={p.krachten} />
      <Sectie titel="Winconditie" tekst={p.winconditie} />
    </>
  )
}
