import { useCallback, useEffect, useState } from 'react'

export type Route =
  | { soort: 'lijst' }
  | { soort: 'rol'; id: string }
  | { soort: 'personage'; id: string }

/** '#/rol/jager' wordt rol-id 'rol-jager'; '#/personage/xander-buffy' wordt 'pers-xander-buffy'. */
export function leesRoute(hash: string): Route {
  const m = /^#\/(rol|personage)\/([a-z0-9-]+)\/?$/.exec(hash)
  if (!m) return { soort: 'lijst' }
  return m[1] === 'rol'
    ? { soort: 'rol', id: `rol-${m[2]}` }
    : { soort: 'personage', id: `pers-${m[2]}` }
}

export const hrefRol = (id: string) => `#/rol/${id.replace(/^rol-/, '')}`
export const hrefPersonage = (id: string) => `#/personage/${id.replace(/^pers-/, '')}`
export const HREF_LIJST = '#/'

export function useRoute() {
  const [route, setRoute] = useState<Route>(() => leesRoute(window.location.hash))

  useEffect(() => {
    const bijwerken = () => setRoute(leesRoute(window.location.hash))
    window.addEventListener('hashchange', bijwerken)
    window.addEventListener('popstate', bijwerken)
    return () => {
      window.removeEventListener('hashchange', bijwerken)
      window.removeEventListener('popstate', bijwerken)
    }
  }, [])

  const navigeer = useCallback((href: string) => {
    window.history.pushState(null, '', href)
    setRoute(leesRoute(href))
  }, [])

  return [route, navigeer] as const
}

/** Gewone linkermuisklik: dan nemen wij het over; bij ctrl/cmd-klik laten we de browser zijn werk doen. */
export function isGewoneKlik(e: React.MouseEvent): boolean {
  return e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey
}
