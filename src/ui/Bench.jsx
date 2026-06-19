import { useState, useEffect } from 'react'
import { useGame, PHASES } from '../state/useGame.js'
import { CATALOG, SLOTS, itemById } from '../tackle/catalog.js'
import './tackle.css'

// Category tabs. The 'bait' slot is shared by lures + baits, split into two tabs.
const TABS = [
  { key: 'rod', label: 'Rods', slot: 'rod', list: CATALOG.rods },
  { key: 'reel', label: 'Reels', slot: 'reel', list: CATALOG.reels },
  { key: 'line', label: 'Lines', slot: 'line', list: CATALOG.lines },
  { key: 'hook', label: 'Hooks', slot: 'hook', list: CATALOG.hooks },
  { key: 'lure', label: 'Lures', slot: 'bait', list: CATALOG.lures },
  { key: 'bait', label: 'Baits', slot: 'bait', list: CATALOG.baits },
  { key: 'holder', label: 'Holders', slot: 'holder', list: CATALOG.holders },
]
const FIGHT_PHASES = [PHASES.AIMING, PHASES.CASTING, PHASES.BITE, PHASES.REELING]

export function Bench() {
  const bench = useGame((s) => s.bench)
  const money = useGame((s) => s.money)
  const level = useGame((s) => s.level)
  const owned = useGame((s) => s.owned)
  const loadout = useGame((s) => s.loadout)
  const consumables = useGame((s) => s.consumables)
  const [tab, setTab] = useState('rod')
  const [selId, setSelId] = useState(null)

  // open/close hotkeys — blocked while a fish is on
  useEffect(() => {
    const onKey = (e) => {
      const g = useGame.getState()
      if (e.code === 'KeyI' || e.code === 'KeyB' || e.code === 'Tab') {
        if (e.code === 'Tab') e.preventDefault()
        if (g.bench) {
          g.setBench(null)
        } else if (FIGHT_PHASES.includes(g.phase)) {
          g.patch({ message: 'Land your fish first' })
        } else {
          document.exitPointerLock?.()
          g.setBench('box')
          g.advanceQuest('open_tackle_box')
        }
      }
      // Escape is owned by the Settings panel (single handler avoids races).
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  if (bench !== 'box' && bench !== 'shop') return null
  const shop = bench === 'shop'
  const tabDef = TABS.find((t) => t.key === tab)
  const visible = tabDef.list.filter((i) => shop || owned.includes(i.id))
  const sel = (selId && itemById(selId)) || visible[0] || tabDef.list[0]

  const setMode = (m) => {
    useGame.getState().setBench(m)
    if (m === 'shop') useGame.getState().advanceQuest('open_shop')
  }
  const doEquip = (item) => {
    useGame.getState().equip(item.slot, item.id)
    useGame.getState().advanceQuest('equip')
  }
  const doBuy = (item) => {
    const had = useGame.getState().owned.includes(item.id)
    useGame.getState().buy(item)
    if (!had && useGame.getState().owned.includes(item.id)) useGame.getState().advanceQuest('buy_item')
  }

  const actionFor = (item) => {
    const equipped = loadout[item.slot] === item.id
    const isOwned = owned.includes(item.id)
    if (equipped) return <div className="bd-action is-equipped">EQUIPPED</div>
    if (isOwned) return <button className="bd-action" onClick={() => doEquip(item)}>EQUIP</button>
    if (level < item.unlockLevel) return <div className="bd-action bad">Reach Level {item.unlockLevel}</div>
    if (money < item.price) return <div className="bd-action bad">Need ${item.price - money} more</div>
    return <button className="bd-action buy" onClick={() => doBuy(item)}>BUY · ${item.price}</button>
  }

  return (
    <div className="bench-overlay" onMouseDown={(e) => { if (e.target.classList.contains('bench-overlay')) useGame.getState().setBench(null) }}>
      <div className="bench">
        <div className="bench-top">
          <div className="bench-modes">
            <button className={!shop ? 'on' : ''} onClick={() => setMode('box')}>TACKLE BOX</button>
            <button className={shop ? 'on' : ''} onClick={() => setMode('shop')}>SHOP</button>
          </div>
          <div className="bench-money">${money.toLocaleString()}</div>
          <button className="bench-close" onClick={() => useGame.getState().setBench(null)}>✕</button>
        </div>

        <div className="bench-body">
          <div className="bench-tabs">
            {TABS.map((t) => (
              <button key={t.key} className={tab === t.key ? 'on' : ''} onClick={() => { setTab(t.key); setSelId(null) }}>{t.label}</button>
            ))}
          </div>

          <div className="bench-grid">
            {visible.length === 0 && <div className="bench-empty">No {tabDef.label.toLowerCase()} owned yet — switch to the Shop.</div>}
            {visible.map((i) => {
              const equipped = loadout[i.slot] === i.id
              const isOwned = owned.includes(i.id)
              const locked = level < i.unlockLevel
              return (
                <button key={i.id} className={`bench-card t-${i.tier}${equipped ? ' equipped' : ''}${sel && sel.id === i.id ? ' sel' : ''}${locked ? ' locked' : ''}`} onClick={() => setSelId(i.id)}>
                  <div className="bc-name">{i.name}</div>
                  <div className="bc-foot">
                    <span className="bc-tier">{i.tier}</span>
                    {equipped ? <span className="bc-badge">●</span>
                      : isOwned ? <span className="bc-owned">owned</span>
                        : locked ? <span className="bc-lock">Lv{i.unlockLevel}</span>
                          : <span className={`bc-price${money >= i.price ? '' : ' bad'}`}>${i.price}</span>}
                  </div>
                </button>
              )
            })}
          </div>

          <div className="bench-detail">
            {sel && (
              <>
                <div className="bd-name">{sel.name}</div>
                <div className="bd-tier">{sel.tier}{sel.consumable ? ` · ${consumables[sel.id] || 0} in box` : ''}</div>
                <div className="bd-blurb">{sel.blurb}</div>
                <div className="bd-specs">
                  {Object.entries(sel.specs || {}).map(([k, v]) => (
                    <span key={k}><b>{k}</b> {String(v)}</span>
                  ))}
                  {sel.token && <span><b>catches</b> {sel.token.replace(/_/g, ' ')}</span>}
                </div>
                {actionFor(sel)}
              </>
            )}
          </div>
        </div>

        <div className="bench-loadout">
          {SLOTS.map((s) => {
            const it = itemById(loadout[s])
            return (
              <div key={s} className="bl-slot">
                <span className="bl-label">{s}</span>
                <span className="bl-item">{it ? it.name : '—'}</span>
              </div>
            )
          })}
        </div>
        <div className="bench-hint">[I] / [Esc] close · [TACKLE BOX] your gear · [SHOP] buy more</div>
      </div>
    </div>
  )
}
