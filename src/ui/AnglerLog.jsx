import { useEffect } from 'react'
import { useGame, PHASES } from '../state/useGame.js'
import { SPECIES } from '../fishing/fish.js'
import { AREAS } from '../world/areas.js'
import './tackle.css'

const FIGHT_PHASES = [PHASES.AIMING, PHASES.CASTING, PHASES.BITE, PHASES.REELING]

export function AnglerLog() {
  const bench = useGame((s) => s.bench)
  const caught = useGame((s) => s.caughtSpecies)

  useEffect(() => {
    const onKey = (e) => {
      if (e.code !== 'KeyL') return
      const g = useGame.getState()
      if (g.bench === 'log') g.setBench(null)
      else if (!g.bench && !FIGHT_PHASES.includes(g.phase)) {
        document.exitPointerLock?.()
        g.setBench('log')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  if (bench !== 'log') return null
  const close = () => useGame.getState().setBench(null)
  const total = SPECIES.filter((s) => caught[s.id]).length

  return (
    <div className="bench-overlay" onMouseDown={(e) => { if (e.target.classList.contains('bench-overlay')) close() }}>
      <div className="log-panel">
        <div className="bench-top">
          <div className="settings-title">ANGLER&apos;S LOG</div>
          <div className="log-total">{total} / {SPECIES.length} species</div>
          <button className="bench-close" onClick={close}>✕</button>
        </div>
        <div className="log-body">
          {AREAS.map((area) => {
            const list = SPECIES.filter((s) => s.area === area.id)
            const got = list.filter((s) => caught[s.id]).length
            return (
              <div key={area.id} className="log-area">
                <div className="log-area-head">
                  {area.name} <span>{got}/{list.length}</span>
                </div>
                <div className="log-grid">
                  {list.map((s) => {
                    const n = caught[s.id] || 0
                    return (
                      <div key={s.id} className={`log-card${n ? ' got' : ''}`}>
                        <div className="lg-name">{n ? s.name : '???'}</div>
                        <div className="lg-meta">{n ? `caught ×${n}` : 'undiscovered'}</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
        <div className="bench-hint">[L] / [Esc] to close</div>
      </div>
    </div>
  )
}
