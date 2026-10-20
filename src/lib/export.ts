import { personagePerId, rolPerId } from './data'

/** Eén rol of personage in de vorm waarin we het kopiëren en exporteren. */
export interface Uitvoer {
  id: string
  soort: 'Rol' | 'Personage'
  /** Leeg bij een eigen uitwerking zonder personagenaam. */
  naam: string
  /** Bij personages de eigen rolnaam (bijvoorbeeld 'Dokter'); leeg bij algemene rollen. */
  rol: string
  thema: string
  alliantie: string
  omschrijving: string
  krachten: string
  winconditie: string
}

export function naarUitvoer(id: string): Uitvoer | null {
  const r = rolPerId.get(id)
  if (r) {
    return {
      id,
      soort: 'Rol',
      naam: r.naam,
      rol: '',
      thema: '',
      alliantie: r.alliantie ?? '',
      omschrijving: r.omschrijving,
      krachten: r.krachten,
      winconditie: r.winconditie,
    }
  }
  const p = personagePerId.get(id)
  if (p) {
    return {
      id,
      soort: 'Personage',
      naam: p.naam ?? '',
      rol: p.rol ?? '',
      thema: p.thema ?? '',
      alliantie: p.alliantieTekst ?? p.alliantie ?? '',
      omschrijving: p.omschrijving,
      krachten: p.krachten,
      winconditie: p.winconditie,
    }
  }
  return null
}

/** Eén rol in het tekstformaat van de bronbestanden. Lege velden worden weggelaten. */
export function maakRolTekst(u: Uitvoer): string {
  const regels: [string, string][] = [
    ['Naam', u.naam],
    ['Rol', u.rol],
    ['Alliantie', u.alliantie],
    ['Omschrijving', u.omschrijving],
    ['Rolkrachten', u.krachten],
    ['Winconditie', u.winconditie],
  ]
  return regels
    .filter(([, waarde]) => waarde.trim() !== '')
    .map(([label, waarde]) => `*${label}:* ${waarde.trim()}`)
    .join('\n')
}

/** Alle gekozen rollen achter elkaar, met een lege regel ertussen. */
export function maakTekst(ids: string[]): string {
  return ids
    .flatMap((id) => naarUitvoer(id) ?? [])
    .map(maakRolTekst)
    .join('\n\n')
}

/** Maakt een .xlsx-bestand en laat de browser het downloaden. De bibliotheek wordt pas dan geladen. */
export async function downloadExcel(ids: string[], bestandsnaam = 'weerwolven-rollenlijst.xlsx') {
  const { default: schrijfExcel } = await import('write-excel-file/universal')
  const uitvoer = ids.flatMap((id) => naarUitvoer(id) ?? [])

  const kop = ['Tekst', 'Soort', 'Naam', 'Rol', 'Thema', 'Alliantie', 'Omschrijving', 'Rolkrachten', 'Winconditie']
  const rijen = [
    kop.map((value) => ({ value, fontWeight: 'bold' as const })),
    ...uitvoer.map((u) =>
      [
        maakRolTekst(u),
        u.soort,
        u.naam,
        u.rol,
        u.thema,
        u.alliantie,
        u.omschrijving,
        u.krachten,
        u.winconditie,
      ].map((value) => ({ type: String, value, wrap: true, alignVertical: 'top' as const })),
    ),
  ]

  const blob = await schrijfExcel(rijen, {
    sheet: 'Rollenlijst',
    columns: [{ width: 70 }, { width: 11 }, { width: 22 }, { width: 22 }, { width: 16 }, { width: 14 }, { width: 50 }, { width: 50 }, { width: 40 }],
    stickyRowsCount: 1,
  }).toBlob()

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = bestandsnaam
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}
