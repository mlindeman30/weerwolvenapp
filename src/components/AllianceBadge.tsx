import type { Alliantie } from '../types'

function alliantieLabel(a: Alliantie | null): string {
  return a ?? 'Onbekend'
}

export function AllianceBadge({ alliantie }: { alliantie: Alliantie | null }) {
  const klasse = (alliantie ?? 'onbekend').toLowerCase()
  return <span className={`badge badge-${klasse}`}>{alliantieLabel(alliantie)}</span>
}
