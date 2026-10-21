import { variantenPerRol } from '../lib/items'
import { isGewoneKlik } from '../lib/route'
import type { Rol } from '../types'
import { AllianceBadge } from './AllianceBadge'
import { AanTeVullen, Sectie } from './Sectie'

interface Props {
  rol: Rol
  onOpen: (href: string) => void
}

export function RolDetail({ rol, onOpen }: Props) {
  const varianten = variantenPerRol.get(rol.id) ?? []
  return (
    <>
      <header className="detail-kop">
        <h2 id="detail-titel">{rol.naam}</h2>
        <p className="item-meta">
          Algemene rol <AllianceBadge alliantie={rol.alliantie} />
        </p>
        <AanTeVullen velden={rol.aanTeVullen} />
      </header>
      <Sectie titel="Omschrijving" tekst={rol.omschrijving} />
      <Sectie titel="Rolkrachten" tekst={rol.krachten} />
      <Sectie titel="Winconditie" tekst={rol.winconditie} />
      {varianten.length > 0 && (
        <section className="sectie">
          <h3>
            Varianten en voorbeelden <span className="aantal">{varianten.length}</span>
          </h3>
          <ul className="varianten">
            {varianten.map((v) => (
              <li key={v.id}>
                <a
                  href={v.href}
                  className="variant"
                  onClick={(e) => {
                    if (isGewoneKlik(e)) {
                      e.preventDefault()
                      onOpen(v.href)
                    }
                  }}
                >
                  <span className="variant-kop">
                    <strong>{v.titel}</strong>
                    <AllianceBadge alliantie={v.alliantie} />
                  </span>
                  <span className="item-meta">
                    {v.subtitel}
                    {v.subtitel && v.thema ? ' · ' : ''}
                    {v.thema}
                    {!v.subtitel && !v.thema ? 'Geen thema' : ''}
                  </span>
                  {v.snippet && <span className="item-tekst">{v.snippet}</span>}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  )
}
