import type { Alliantie, Thema } from '../types'
import { personages, rolPerId, rollen } from './data'
import { hrefPersonage, hrefRol } from './route'
import { normaliseer } from './search'

/** Eén regel of kaart in de lijst, voor zowel rollen als personages. */
export interface ListItem {
  id: string
  href: string
  titel: string
  subtitel: string | null
  /** Bijvoorbeeld 'Variant van Jager'. */
  verwijzing: string | null
  alliantie: Alliantie | null
  thema: Thema | null
  snippet: string
  aantalVarianten: number
  zoektekst: string
}

function kort(tekst: string, max = 150): string {
  const schoon = tekst.replace(/\s+/g, ' ').trim()
  if (schoon.length <= max) return schoon
  const knip = schoon.slice(0, max)
  return knip.slice(0, knip.lastIndexOf(' ') > 60 ? knip.lastIndexOf(' ') : max) + '…'
}

function sorteer(a: ListItem, b: ListItem): number {
  return a.titel.localeCompare(b.titel, 'nl', { sensitivity: 'base' })
}

export const rolItems: ListItem[] = rollen
  .map<ListItem>((r) => ({
    id: r.id,
    href: hrefRol(r.id),
    titel: r.naam,
    subtitel: null,
    verwijzing: null,
    alliantie: r.alliantie,
    thema: null,
    snippet: kort(r.omschrijving || r.krachten),
    aantalVarianten: r.varianten.length,
    zoektekst: normaliseer([r.naam, r.omschrijving, r.krachten].join(' ')),
  }))
  .sort(sorteer)

export const personageItems: ListItem[] = personages
  .map<ListItem>((p) => {
    const eigenUitwerking = p.naam === null
    return {
      id: p.id,
      href: hrefPersonage(p.id),
      titel: p.naam ?? p.rol ?? 'Onbekend',
      subtitel: eigenUitwerking ? 'Eigen uitwerking' : p.rol,
      verwijzing: p.rolId ? `Variant van ${rolPerId.get(p.rolId)?.naam ?? p.rolId}` : null,
      alliantie: p.alliantie,
      thema: p.thema,
      snippet: kort(p.omschrijving || p.krachten),
      aantalVarianten: 0,
      zoektekst: normaliseer(
        [p.naam, p.rol, p.thema, p.omschrijving, p.krachten].filter(Boolean).join(' '),
      ),
    }
  })
  .sort(sorteer)

export const personageItemPerId = new Map(personageItems.map((i) => [i.id, i]))
