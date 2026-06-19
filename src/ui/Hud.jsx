import { useState, useEffect } from 'react'
import { useGame, PHASES, xpToNext } from '../state/useGame.js'
import { clock, hourString } from '../sim/clock.js'
import { itemById } from '../tackle/catalog.js'
import { QuestTracker } from './QuestTracker.jsx'
import './hud.css'

// in-game time of day (the clock ticks in a sim ref; poll it once a second)
function ClockReadout() {
  const [, tick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), 1000)
    return () => clearInterval(id)
  }, [])
  return <div className="clock-chip">{hourString(clock.t)}</div>
}

const HINTS = {
  [PHASES.IDLE]: 'Hold  Left-click  to cast   ·   WASD move   ·   mouse look',
  [PHASES.AIMING]: 'Release  to cast at the chosen power',
  [PHASES.CASTING]: '',
  [PHASES.WAITING]: 'Right-click  to twitch the lure   ·   hold  Left-click  to reel in',
  [PHASES.BITE]: '',
  [PHASES.REELING]: 'Hold  Right-click  to pump the rod   ·   Left-click  to reel   ·   ease off on runs',
  [PHASES.LANDED]: '',
}

export function Hud() {
  const phase = useGame((s) => s.phase)
  const power = useGame((s) => s.castPower)
  const level = useGame((s) => s.level)
  const xp = useGame((s) => s.xp)
  const money = useGame((s) => s.money)
  const tension = useGame((s) => s.tension)
  const dist = useGame((s) => s.fishDistance)
  const stamina = useGame((s) => s.fishStamina)
  const rodLoad = useGame((s) => s.rodLoad)
  const fish = useGame((s) => s.currentFish)
  const lastCatch = useGame((s) => s.lastCatch)
  const message = useGame((s) => s.message)
  const locked = useGame((s) => s.locked)
  const started = useGame((s) => s.started)
  const bench = useGame((s) => s.bench)
  const tackle = useGame((s) => s.tackle)
  const meterStyle = useGame((s) => s.settings.castMeterStyle)
  const loadout = useGame((s) => s.loadout)
  const consumables = useGame((s) => s.consumables)

  const next = xpToNext(level)
  const xpPct = Math.min(100, (xp / next) * 100)
  const baitItem = itemById(loadout.bait)
  const baitQty = baitItem?.consumable ? consumables[baitItem.id] || 0 : null
  const fighting = phase === PHASES.REELING && fish

  return (
    <div className="hud">
      {started && !locked && !bench && <div className="resume-hint">Click to resume · mouse look</div>}

      {!started && !bench && (
        <div className="start-overlay">
          <div className="start-card">
            <div className="start-title">FishingF&apos;reel</div>
            <div className="start-sub">click to look around</div>
            <div className="start-controls">
              <span><b>WASD</b> move</span>
              <span><b>Mouse</b> look</span>
              <span><b>L-click</b> cast / reel</span>
              <span><b>R-click</b> twitch / hook / pump</span>
              <span><b>I</b> tackle box</span>
              <span><b>M</b> map</span>
              <span><b>L</b> log</span>
              <span><b>Esc</b> settings</span>
            </div>
          </div>
        </div>
      )}

      <div className="hud-top">
        <div className="lvl-badge">LV {level}</div>
        <div className="money-badge">${money.toLocaleString()}</div>
        <div className="xp-track">
          <span className="xp-fill" style={{ width: `${xpPct}%` }} />
          <span className="xp-text">{xp} / {next} XP</span>
        </div>
        <div className="tackle-chip">🎣 {tackle.name}</div>
        {baitItem && (
          <div className={`clock-chip${baitQty === 0 ? ' empty' : ''}`}>
            {baitItem.name}{baitQty != null ? ` ×${baitQty}` : ''}
          </div>
        )}
        <ClockReadout />
      </div>

      <QuestTracker />

      {phase === PHASES.AIMING && (
        <div className="cast-meter">
          <div className="cast-meter-label">CAST POWER</div>
          <div className="cast-meter-track">
            <span className="cast-meter-fill" style={{ width: `${power * 100}%` }} />
          </div>
        </div>
      )}

      {phase === PHASES.BITE && (
        <div className="bite-flash">
          FISH&nbsp;ON!
          <span>Right-click to set the hook</span>
        </div>
      )}

      {fighting && (
        <div className="fight">
          <div className="fight-name">{fish.name} · {fish.weight} kg</div>
          <div className="fight-row">
            <label>LINE</label>
            <div className="bar">
              <span
                className={`fill tension ${tension > tackle.lineStrength * 0.85 ? 'danger' : ''}`}
                style={{ width: `${Math.min(100, (tension / tackle.lineStrength) * 100)}%` }}
              />
            </div>
          </div>
          <div className="fight-row">
            <label>ROD</label>
            <div className="bar">
              <span className="fill rod" style={{ width: `${rodLoad * 100}%` }} />
            </div>
          </div>
          <div className="fight-row">
            <label>TIRED</label>
            <div className="bar">
              <span className="fill stam" style={{ width: `${(1 - stamina) * 100}%` }} />
            </div>
          </div>
          <div className="fight-row">
            <label>FISH&nbsp;IN</label>
            <div className="bar">
              <span className="fill landed" style={{ width: `${(1 - dist) * 100}%` }} />
            </div>
          </div>
        </div>
      )}

      {phase === PHASES.LANDED && <div className="catch-dim" />}
      {phase === PHASES.LANDED && lastCatch && (
        <div className="catch-card">
          <div className="catch-title">{lastCatch.first ? 'NEW SPECIES!' : 'NICE CATCH'}</div>
          <div className="catch-name">{lastCatch.name}</div>
          <div className="catch-stats">
            <span>{lastCatch.weight} kg</span>
            <span>{lastCatch.lengthCm} cm</span>
            <span className="catch-xp">+{lastCatch.xpGain ?? lastCatch.xp} XP</span>
            {lastCatch.money != null && <span className="catch-money">+${lastCatch.money}</span>}
          </div>
          {(lastCatch.first || lastCatch.clean) && (
            <div className="catch-badges">
              {lastCatch.first && <span className="cb-first">FIRST CATCH ×2</span>}
              {lastCatch.clean && <span className="cb-clean">CLEAN LANDING +30%</span>}
            </div>
          )}
          <div className="catch-cont">Press&nbsp; [Space] &nbsp;to keep fishing</div>
        </div>
      )}

      {message && phase !== PHASES.LANDED && <div className="msg-banner">{message}</div>}

      <div className="crosshair" />
      <div className="hud-hint">
        {phase === PHASES.AIMING
          ? meterStyle === 'oscillate'
            ? 'Release at peak power'
            : 'Hold to build power · release to cast'
          : HINTS[phase] || ''}
      </div>
    </div>
  )
}
