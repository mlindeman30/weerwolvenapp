import type { Alliantie, Thema } from '../types'
import { personages, rolPerId, rollen } from './data'
import { hrefPersonage, hrefRol } from './route'
import { normaliseer } from './search'

/** Eén regel of kaart in de lijst, voor zowel rollen als personages. */
export interface ListItem {
  id: string
  href: string
  /** Alleen bij personages: ids van de algemene rollen waar dit een variant van is. */
  rolIds: string[]
  titel: string
  subtitel: string | null
  /** Bijvoorbeeld 'Variant van Jager' of 'Variant van Kapitein en Weerwolf'. */
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

const aantalPerRol = new Map<string, number>()
for (const p of personages) {
  for (const id of p.rolIds) aantalPerRol.set(id, (aantalPerRol.get(id) ?? 0) + 1)
}

function noemLijst(namen: string[]): string {
  return namen.length > 1 ? `${namen.slice(0, -1).join(', ')} en ${namen[namen.length - 1]}` : namen[0]
}

export const rolItems: ListItem[] = rollen
  .map<ListItem>((r) => ({
    id: r.id,
    href: hrefRol(r.id),
    rolIds: [],
    titel: r.naam,
    subtitel: null,
    verwijzing: null,
    alliantie: r.alliantie,
    thema: null,
    snippet: kort(r.omschrijving || r.krachten),
    aantalVarianten: aantalPerRol.get(r.id) ?? 0,
    zoektekst: normaliseer([r.naam, r.omschrijving, r.krachten].join(' ')),
  }))
  .sort(sorteer)

export const personageItems: ListItem[] = personages
  .map<ListItem>((p) => {
    const eigenUitwerking = p.naam === null
    return {
      id: p.id,
      href: hrefPersonage(p.id),
      rolIds: p.rolIds,
      titel: p.naam ?? p.rol ?? 'Onbekend',
      subtitel: eigenUitwerking ? 'Eigen uitwerking' : p.rol,
      verwijzing:
        p.rolIds.length > 0
          ? `Variant van ${noemLijst(p.rolIds.map((id) => rolPerId.get(id)?.naam ?? id))}`
          : null,
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


/** Varianten per algemene rol, afgeleid uit het veld rolIds van de personages (A-Z). */
export const variantenPerRol = new Map<string, ListItem[]>()
for (const item of personageItems) {
  for (const id of item.rolIds) {
    const lijst = variantenPerRol.get(id) ?? []
    lijst.push(item)
    variantenPerRol.set(id, lijst)
  }
}
