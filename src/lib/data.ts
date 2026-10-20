import data from '../data/roles.json'
import type { Personage, Rol, RollenData } from '../types'

const { rollen, personages } = data as RollenData

export { rollen, personages }
export const rolPerId = new Map<string, Rol>(rollen.map((r) => [r.id, r]))
export const personagePerId = new Map<string, Personage>(personages.map((p) => [p.id, p]))
