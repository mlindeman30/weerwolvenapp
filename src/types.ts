export type Alliantie = 'Goed' | 'Neutraal' | 'Slecht' | 'Gelinkt'
export type Thema = 'Star Trek' | 'Avatar' | 'Stardew Valley' | 'Buffy'

/** Algemene rol (bijvoorbeeld Jager) met varianten eronder. */
export interface Rol {
  id: string
  naam: string
  omschrijving: string
  /** Alleen gevuld voor rollen die uit eigen tekst komen; Sheet1-rollen hebben geen alliantie. */
  alliantie: Alliantie | null
  krachten: string
  winconditie: string
  /** true = niet uit Sheet1, maar uit eigen tekst toegevoegd. */
  nieuw: boolean
  /** Velden die nog aangevuld moeten worden. */
  aanTeVullen: string[]
  /** Ids van personages/uitwerkingen die een variant of voorbeeld zijn van deze rol. */
  varianten: string[]
}

/** Personage of eigen uitwerking. */
export interface Personage {
  id: string
  /** null = eigen uitwerking zonder personagenaam. */
  naam: string | null
  rol: string | null
  /** Id van de algemene rol waar dit een variant van is, of null als het zelfstandig is. */
  rolId: string | null
  thema: Thema | null
  alliantie: Alliantie | null
  /** Originele alliantietekst als de alliantie 'Gelinkt' is. */
  alliantieTekst: string | null
  omschrijving: string
  krachten: string
  winconditie: string
  /** Herkomst in het bronbestand. */
  bron: string
  aanTeVullen: string[]
}

export interface RollenData {
  rollen: Rol[]
  personages: Personage[]
}
