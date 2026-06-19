import { useGame } from '../state/useGame.js'
import { QUESTS } from '../quests/quests.js'
import { speciesById } from '../fishing/fish.js'
import { areaById } from '../world/areas.js'

function objLabel(o) {
  const sp = typeof o.target === 'string' ? speciesById(o.target) : null
  switch (o.type) {
    case 'pointer_lock': return 'Click the screen to look around'
    case 'move': return 'Walk with WASD'
    case 'cast': return 'Hold Left-click and release to cast'
    case 'set_hook': return 'Right-click to set the hook on a bite'
    case 'land_fish': return 'Reel in and land a fish'
    case 'twitch': return 'Right-click to twitch the lure'
    case 'catch_species': return `Catch a ${sp ? sp.name : o.target}`
    case 'catch_min_weight': return `Land a ${sp ? sp.name : o.target} over ${o.minWeightKg} kg`
    case 'land_no_snap': return `Land a ${sp ? sp.name : o.target} without snapping`
    case 'open_tackle_box': return 'Open the tackle box  [I]'
    case 'equip': return 'Equip a piece of gear'
    case 'open_shop': return 'Open the shop'
    case 'buy_item': return 'Buy a piece of gear'
    case 'reach_level': return `Reach level ${o.target}`
    case 'fast_travel': return `Fast-travel to ${areaById(o.target)?.name || o.target}`
    default: return o.type
  }
}

export function QuestTracker() {
  const questIndex = useGame((s) => s.questIndex)
  const progress = useGame((s) => s.questProgress)
  const q = QUESTS[questIndex]

  if (!q) {
    return (
      <div className="quest-tracker">
        <div className="qt-title">Master Angler 🎣</div>
        <div className="qt-teach">Every quest complete.</div>
      </div>
    )
  }

  return (
    <div className="quest-tracker">
      <div className="qt-head">QUEST {questIndex + 1} / {QUESTS.length}{q.tutorial ? ' · TUTORIAL' : ''}</div>
      <div className="qt-title">{q.title}</div>
      <div className="qt-teach">{q.teaches}</div>
      <ul className="qt-objs">
        {q.objectives.map((o, i) => {
          const cur = progress[`${q.id}:${i}`] || 0
          const done = cur >= o.count
          return (
            <li key={i} className={done ? 'done' : ''}>
              <span className="qt-check">{done ? '✓' : '○'}</span>
              <span className="qt-text">
                {objLabel(o)}
                {o.count > 1 ? ` (${Math.min(cur, o.count)}/${o.count})` : ''}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
