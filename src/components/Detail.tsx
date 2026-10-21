import { useEffect, useRef, useState, type ReactNode } from 'react'

interface Props {
  /** Verandert als er een andere rol of personage getoond wordt; dan scrollen we terug naar boven. */
  sleutel: string
  titelId: string
  onSluit: () => void
  /** Terug naar het vorige venster; sluit het venster als er geen vorige is. */
  onTerug: () => void
  /** Staat dit item in 'Mijn lijst'? */
  inLijst: boolean
  onWissel: () => void
  children: ReactNode
}

export function Detail({ sleutel, titelId, onSluit, onTerug, inLijst, onWissel, children }: Props) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialoog = ref.current
    if (dialoog && !dialoog.open) {
      dialoog.showModal()
      // Focus op het venster zelf, zodat er geen focusrand om de eerste knop springt.
      dialoog.focus()
    }
    return () => {
      if (dialoog?.open) dialoog.close()
    }
  }, [])

  useEffect(() => {
    ref.current?.scrollTo(0, 0)
  }, [sleutel])

  return (
    <dialog
      ref={ref}
      className="detail"
      aria-labelledby={titelId}
      tabIndex={-1}
      onCancel={(e) => {
        e.preventDefault()
        onSluit()
      }}
      onClick={(e) => {
        if (e.target === ref.current) onSluit()
      }}
    >
      <div className="detail-balk">
        <span className="balk-acties">
          <button type="button" className="sluit terug" onClick={onTerug} aria-label="Terug">
            ←
          </button>
          <KopieerLink />
          <button type="button" className={`chip${inLijst ? ' actief' : ''}`} aria-pressed={inLijst} onClick={onWissel}>
            {inLijst ? 'In mijn lijst' : 'Voeg toe aan mijn lijst'}
          </button>
        </span>
        <button type="button" className="sluit" onClick={onSluit} aria-label="Sluiten">
          ✕
        </button>
      </div>
      <div className="detail-inhoud">{children}</div>
    </dialog>
  )
}

function KopieerLink() {
  const [status, setStatus] = useState<'rust' | 'gelukt' | 'mislukt'>('rust')

  async function kopieer() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setStatus('gelukt')
    } catch {
      setStatus('mislukt')
    }
    window.setTimeout(() => setStatus('rust'), 2500)
  }

  return (
    <span className="kopieer">
      <button type="button" className="chip" onClick={kopieer}>
        Kopieer link
      </button>
      <span className="kopieer-status" role="status">
        {status === 'gelukt' && 'Link gekopieerd'}
        {status === 'mislukt' && 'Kopiëren mislukt: kopieer de link uit de adresbalk'}
      </span>
    </span>
  )
}
