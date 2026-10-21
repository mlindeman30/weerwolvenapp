import type { ListItem } from './items'

export type Criterium = 'naam' | 'varianten' | 'alliantie'
export type Richting = 'oplopend' | 'aflopend'

const ALLIANTIE_VOLGORDE: Record<string, number> = { Goed: 0, Neutraal: 1, Slecht: 2, Gelinkt: 3 }

const opNaam = (a: ListItem, b: ListItem) => a.titel.localeCompare(b.titel, 'nl', { sensitivity: 'base' })

/** Waarde waarop gesorteerd wordt. Alliantie loopt op van Goed naar Slecht, daarna Gelinkt en onbekend. */
function waarde(item: ListItem, criterium: Criterium): number {
  if (criterium === 'varianten') return item.aantalVarianten
  return ALLIANTIE_VOLGORDE[item.alliantie ?? ''] ?? 4
}

/** Sorteert een kopie van de lijst. Bij gelijke waarde geldt altijd A-Z op naam. */
export function sorteerItems(items: ListItem[], criterium: Criterium, richting: Richting): ListItem[] {
  const teken = richting === 'oplopend' ? 1 : -1
  if (criterium === 'naam') return [...items].sort((a, b) => teken * opNaam(a, b))
  return [...items].sort((a, b) => teken * (waarde(a, criterium) - waarde(b, criterium)) || opNaam(a, b))
}

/** Richting die bij een nieuw criterium het meest voor de hand ligt: meeste varianten eerst, anders oplopend. */
export const standaardRichting = (criterium: Criterium): Richting =>
  criterium === 'varianten' ? 'aflopend' : 'oplopend'
