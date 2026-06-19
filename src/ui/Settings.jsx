import { useEffect } from 'react'
import { useGame, PHASES } from '../state/useGame.js'
import { setSoundEnabled } from '../audio/sound.js'
import './tackle.css'

const FIGHT_PHASES = [PHASES.AIMING, PHASES.CASTING, PHASES.BITE, PHASES.REELING]

function Row({ label, children }) {
  return (
    <div className="set-row">
      <label>{label}</label>
      {children}
    </div>
  )
}

export function Settings() {
  const bench = useGame((s) => s.bench)
  const settings = useGame((s) => s.settings)
  const setSetting = useGame((s) => s.setSetting)

  // single owner of Escape: close any overlay, else open Settings
  useEffect(() => {
    const onKey = (e) => {
      if (e.code !== 'Escape') return
      const g = useGame.getState()
      if (g.bench) g.setBench(null)
      else if (!FIGHT_PHASES.includes(g.phase)) {
        document.exitPointerLock?.()
        g.setBench('settings')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  if (bench !== 'settings') return null
  const close = () => useGame.getState().setBench(null)

  return (
    <div className="bench-overlay" onMouseDown={(e) => { if (e.target.classList.contains('bench-overlay')) close() }}>
      <div className="settings-panel">
        <div className="bench-top">
          <div className="settings-title">SETTINGS</div>
          <button className="bench-close" onClick={close}>✕</button>
        </div>

        <div className="settings-body">
          <div className="set-group">Mouse &amp; Camera</div>
          <Row label="Look Sensitivity">
            <input type="range" min={0.2} max={2.5} step={0.05} value={settings.sensitivity}
              onChange={(e) => setSetting('sensitivity', parseFloat(e.target.value))} />
            <span className="set-val">{settings.sensitivity.toFixed(2)}×</span>
          </Row>
          <Row label="Field of View">
            <input type="range" min={70} max={100} step={1} value={settings.fov}
              onChange={(e) => setSetting('fov', parseInt(e.target.value, 10))} />
            <span className="set-val">{settings.fov}°</span>
          </Row>
          <Row label="Invert Look Y">
            <button className={`set-toggle${settings.invertLookY ? ' on' : ''}`}
              onClick={() => setSetting('invertLookY', !settings.invertLookY)}>{settings.invertLookY ? 'ON' : 'OFF'}</button>
          </Row>

          <div className="set-group">Fishing Controls</div>
          <Row label="Cast Meter">
            <div className="set-choice">
              <button className={settings.castMeterStyle === 'ramp-hold' ? 'on' : ''} onClick={() => setSetting('castMeterStyle', 'ramp-hold')}>Hold</button>
              <button className={settings.castMeterStyle === 'oscillate' ? 'on' : ''} onClick={() => setSetting('castMeterStyle', 'oscillate')}>Timing</button>
            </div>
          </Row>
          <Row label="Reel Input">
            <div className="set-choice">
              <button className={settings.reelMode === 'hold' ? 'on' : ''} onClick={() => setSetting('reelMode', 'hold')}>Hold</button>
              <button className={settings.reelMode === 'toggle' ? 'on' : ''} onClick={() => setSetting('reelMode', 'toggle')}>Toggle</button>
            </div>
          </Row>
          <Row label="Reel with Scroll Wheel">
            <button className={`set-toggle${settings.scrollWheelReel ? ' on' : ''}`}
              onClick={() => setSetting('scrollWheelReel', !settings.scrollWheelReel)}>{settings.scrollWheelReel ? 'ON' : 'OFF'}</button>
          </Row>

          <div className="set-group">Audio</div>
          <Row label="Sound">
            <button className={`set-toggle${settings.sound ? ' on' : ''}`}
              onClick={() => { const v = !settings.sound; setSetting('sound', v); setSoundEnabled(v) }}>{settings.sound ? 'ON' : 'OFF'}</button>
          </Row>

          <button className="settings-reset" onClick={() => { useGame.getState().resetSettings(); setSoundEnabled(true) }}>Reset to Defaults</button>
        </div>
        <div className="bench-hint">[Esc] to close</div>
      </div>
    </div>
  )
}
