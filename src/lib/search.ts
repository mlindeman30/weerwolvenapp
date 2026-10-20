/** Kleine letters en zonder accenten, zodat 'Geïnfecteerde' ook op 'geinfecteerde' gevonden wordt. */
export function normaliseer(tekst: string): string {
  return tekst.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()
}

/** Alle woorden uit de zoekopdracht moeten ergens in de zoektekst voorkomen. */
export function komtOvereen(zoektekst: string, zoekopdracht: string): boolean {
  const woorden = normaliseer(zoekopdracht).split(/\s+/).filter(Boolean)
  return woorden.every((woord) => zoektekst.includes(woord))
}
