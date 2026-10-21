import { REPO } from '../config'
import { personagePerId, rolPerId } from './data'

export type VoorstelSoort = 'nieuwe-rol' | 'nieuw-personage' | 'wijziging' | 'koppeling'

export const SOORT_LABEL: Record<VoorstelSoort, string> = {
  'nieuwe-rol': 'Nieuwe algemene rol',
  'nieuw-personage': 'Nieuw personage of eigen uitwerking',
  wijziging: 'Wijziging van een bestaand item',
  koppeling: 'Koppeling tussen personage en rol',
}

export type VeldNaam = 'naam' | 'rol' | 'thema' | 'alliantie' | 'omschrijving' | 'krachten' | 'winconditie'

export const VELD_LABEL: Record<VeldNaam, string> = {
  naam: 'Naam',
  rol: 'Rol',
  thema: 'Thema',
  alliantie: 'Alliantie',
  omschrijving: 'Omschrijving',
  krachten: 'Rolkrachten',
  winconditie: 'Winconditie',
}

export type Velden = Partial<Record<VeldNaam, string>> & { rolIds?: string[] }

/** Een voorstel zoals het in het GitHub-issue komt. De Action leest later het JSON-blok. */
export interface Voorstel {
  versie: 1
  soort: VoorstelSoort
  /** Id van het bestaande item, bij een wijziging of koppeling. */
  doel?: string
  velden: Velden
  toelichting: string
  indiener: string
}

const NAAM_VAN = (id: string) => rolPerId.get(id)?.naam ?? personagePerId.get(id)?.naam ?? personagePerId.get(id)?.rol ?? id

export function maakIssue(v: Voorstel): { titel: string; body: string } {
  const doelNaam = v.doel ? NAAM_VAN(v.doel) : null
  const titel =
    v.soort === 'nieuwe-rol'
      ? `Voorstel: nieuwe rol – ${v.velden.naam ?? ''}`
      : v.soort === 'nieuw-personage'
        ? `Voorstel: nieuw personage – ${v.velden.naam || v.velden.rol || 'eigen uitwerking'}`
        : v.soort === 'wijziging'
          ? `Voorstel: wijziging – ${doelNaam}`
          : `Voorstel: koppeling – ${doelNaam}`

  const regels: string[] = [`**Soort:** ${SOORT_LABEL[v.soort]}`]
  if (doelNaam) regels.push(`**Betreft:** ${doelNaam} (\`${v.doel}\`)`)
  regels.push('')
  for (const naam of Object.keys(VELD_LABEL) as VeldNaam[]) {
    const waarde = v.velden[naam]
    if (waarde) regels.push(`**${VELD_LABEL[naam]}:** ${waarde}`)
  }
  if (v.velden.rolIds) {
    const namen = v.velden.rolIds.map((id) => `${NAAM_VAN(id)} (\`${id}\`)`)
    regels.push(`**Gekoppelde rollen:** ${namen.length > 0 ? namen.join(', ') : '(geen: zelfstandig)'}`)
  }
  if (v.toelichting) regels.push('', `**Toelichting:** ${v.toelichting}`)
  if (v.indiener) regels.push('', `**Ingediend door:** ${v.indiener}`)
  regels.push(
    '',
    '---',
    'Machineleesbaar deel, niet aanpassen:',
    '',
    '```json',
    JSON.stringify(v, null, 2),
    '```',
  )
  return { titel, body: regels.join('\n') }
}

/** Link waarmee GitHub een nieuw issue opent met titel en tekst al ingevuld. */
export function issueUrl(titel: string, body: string | null): string {
  const basis = `https://github.com/${REPO}/issues/new`
  const params = new URLSearchParams({ title: titel, labels: 'voorstel' })
  if (body !== null) params.set('body', body)
  return `${basis}?${params.toString()}`
}

/** Boven deze lengte weigert GitHub de link; dan laten we de tekst plakken. */
export const MAX_URL_LENGTE = 7000
