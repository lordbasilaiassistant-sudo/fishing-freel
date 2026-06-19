import { useEffect } from 'react'
import { useGame, PHASES } from '../state/useGame.js'
import { AREAS } from '../world/areas.js'
import './tackle.css'

const FIGHT_PHASES = [PHASES.AIMING, PHASES.CASTING, PHASES.BITE, PHASES.REELING]

export function MapPanel() {
  const bench = useGame((s) => s.bench)
  const unlocked = useGame((s) => s.unlockedAreas)
  const current = useGame((s) => s.currentArea)
  const level = useGame((s) => s.level)

  useEffect(() => {
    const onKey = (e) => {
      if (e.code !== 'KeyM') return
      const g = useGame.getState()
      if (g.bench === 'map') g.setBench(null)
      else if (!g.bench && !FIGHT_PHASES.includes(g.phase)) {
        document.exitPointerLock?.()
        g.setBench('map')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  if (bench !== 'map') return null
  const close = () => useGame.getState().setBench(null)
  const travel = (id) => {
    const g = useGame.getState()
    g.travelTo(id)
    g.advanceQuest('fast_travel', { target: id })
    g.setBench(null)
  }

  return (
    <div className="bench-overlay" onMouseDown={(e) => { if (e.target.classList.contains('bench-overlay')) close() }}>
      <div className="map-panel">
        <div className="bench-top">
          <div className="settings-title">MAP · FAST TRAVEL</div>
          <button className="bench-close" onClick={close}>✕</button>
        </div>
        <div className="map-canvas">
          {AREAS.map((a) => {
            const isUnlocked = unlocked.includes(a.id)
            const isCurrent = current === a.id
            return (
              <div
                key={a.id}
                className={`map-pin${isCurrent ? ' current' : ''}${isUnlocked ? '' : ' locked'}`}
                style={{ left: `${a.map.x * 100}%`, top: `${a.map.y * 100}%` }}
              >
                <div className="pin-dot" />
                <div className="pin-card">
                  <div className="pin-name">{a.name}</div>
                  <div className="pin-blurb">{a.blurb}</div>
                  {isCurrent ? (
                    <div className="pin-here">You are here</div>
                  ) : isUnlocked ? (
                    <button className="pin-go" onClick={() => travel(a.id)}>Travel here</button>
                  ) : (
                    <div className="pin-lock">🔒 Reach Level {a.unlockLevel}</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
        <div className="bench-hint">[M] / [Esc] to close</div>
      </div>
    </div>
  )
}
