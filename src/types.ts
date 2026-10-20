export type Alliantie = 'Goed' | 'Neutraal' | 'Slecht' | 'Gelinkt'
/** Naam van een thema, zoals 'Star Trek'. Komt uit de data, dus er kunnen thema's bijkomen. */
export type Thema = string

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
}

/** Personage of eigen uitwerking. */
export interface Personage {
  id: string
  /** null = eigen uitwerking zonder personagenaam. */
  naam: string | null
  rol: string | null
  /**
   * Ids van de algemene rollen waar dit een variant van is; leeg als het zelfstandig is.
   * Dit is de enige plek waar de koppeling staat: de varianten van een rol worden hieruit afgeleid.
   */
  rolIds: string[]
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
