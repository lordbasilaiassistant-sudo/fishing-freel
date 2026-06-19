import * as THREE from 'three'
import { castSim } from './cast.js'
import { speciesInArea, gearMatches } from '../fishing/fish.js'
import { clock, timeMatch } from './clock.js'

// Fish behaviour states.
export const FS = { ROAM: 0, INTEREST: 1, NIBBLE: 2, HOOKED: 3, CAUGHT: 4, FLEE: 5 }

export const lake = {
  fish: [],
  pendingBite: null, // a fish just committed — consumed by the casting system
  active: null, // the fish currently engaged (nibbling / hooked / caught)
  fight: null, // live fight state for the hooked fish
}

const LAKE_R = 73 // keep fish inside this radius

export function spawnFish(count = 16, area = 'stillwater') {
  lake.fish.length = 0
  lake.pendingBite = null
  lake.active = null
  lake.fight = null
  const pool = speciesInArea(area)
  if (!pool.length) return
  const total = pool.reduce((n, s) => n + s.spawnWeight, 0)
  for (let i = 0; i < count; i++) {
    let r = Math.random() * total
    let sp = pool[0]
    for (const c of pool) {
      r -= c.spawnWeight
      if (r <= 0) {
        sp = c
        break
      }
    }
    const [minW, maxW] = sp.weightKg
    const ang = Math.random() * Math.PI * 2
    const rad = 9 + Math.random() * 58
    lake.fish.push({
      sp,
      size: minW + Math.random() * (maxW - minW),
      pos: new THREE.Vector3(Math.cos(ang) * rad, -0.05 - Math.random() * 0.08, Math.sin(ang) * rad),
      heading: Math.random() * Math.PI * 2,
      speed: 1.1 + Math.random() * 1.5,
      state: FS.ROAM,
      t: Math.random() * 100,
      cruiseDepth: -0.05 - Math.random() * 0.08, // backs just break the surface so they're visible
      wanderTimer: 0,
      cooldown: 0,
      fleeTimer: 0,
    })
  }
}

function steerToCenterIfOut(f) {
  if (Math.hypot(f.pos.x, f.pos.z) > LAKE_R) {
    f.heading = Math.atan2(-f.pos.z, -f.pos.x)
  }
}

export function updateLake(dt, t) {
  const lureActive = castSim.active && castSim.inWater
  const engaged = lake.active

  for (const f of lake.fish) {
    f.t += dt
    if (f.cooldown > 0) f.cooldown -= dt

    // engaged fish (nibble/hooked/caught) are positioned by FishSchool relative
    // to the lure, so skip the wander integration for them.
    if (f === engaged && (f.state === FS.NIBBLE || f.state === FS.HOOKED || f.state === FS.CAUGHT)) {
      continue
    }

    switch (f.state) {
      case FS.ROAM: {
        f.wanderTimer -= dt
        if (f.wanderTimer <= 0) {
          f.heading += (Math.random() - 0.5) * 1.1
          f.wanderTimer = 1.5 + Math.random() * 2.6
        }
        steerToCenterIfOut(f)
        f.pos.x += Math.cos(f.heading) * f.speed * dt
        f.pos.z += Math.sin(f.heading) * f.speed * dt
        f.pos.y += (f.cruiseDepth - f.pos.y) * Math.min(1, dt * 0.7)

        if (lureActive && !engaged && f.cooldown <= 0 && gearMatches(f.sp, castSim.token)) {
          const d = Math.hypot(castSim.bobber.x - f.pos.x, castSim.bobber.z - f.pos.z)
          const detect = 9 + f.size + castSim.action * 6 // twitching the lure widens its draw
          const tm = timeMatch(f.sp.timeOfDay, clock.t) // night fish bite at night, etc.
          const appeal = (0.6 + castSim.attract * 0.8) * castSim.stealth // bait appeal + line stealth
          if (d < detect && Math.random() < dt * (0.5 + castSim.action * 1.2 - f.sp.strength * 0.3) * tm * appeal) {
            f.state = FS.INTEREST
          }
        }
        break
      }
      case FS.INTEREST: {
        if (!lureActive || engaged) {
          f.state = FS.ROAM
          f.cooldown = 2
          break
        }
        const dx = castSim.bobber.x - f.pos.x
        const dz = castSim.bobber.z - f.pos.z
        const d = Math.hypot(dx, dz)
        f.heading = Math.atan2(dz, dx)
        const sp = f.speed * 1.35
        f.pos.x += Math.cos(f.heading) * sp * dt
        f.pos.z += Math.sin(f.heading) * sp * dt
        f.pos.y += (-0.04 - f.pos.y) * Math.min(1, dt * 1.3)
        if (d < 0.8) {
          f.state = FS.NIBBLE
          lake.active = f
          lake.pendingBite = f
        } else if (d > 18) {
          f.state = FS.ROAM
          f.cooldown = 3
        }
        break
      }
      case FS.FLEE: {
        f.fleeTimer -= dt
        f.pos.x += Math.cos(f.heading) * f.speed * 2.4 * dt
        f.pos.z += Math.sin(f.heading) * f.speed * 2.4 * dt
        f.pos.y += (f.cruiseDepth - f.pos.y) * Math.min(1, dt * 1.5)
        steerToCenterIfOut(f)
        if (f.fleeTimer <= 0) f.state = FS.ROAM
        break
      }
      default:
        break
    }
  }
}

// Convert a living fish into catch/fight data (shape matches rollFish + sellValue).
export function fishToData(f) {
  const sp = f.sp
  const [minW, maxW] = sp.weightKg
  const weight = Math.round(f.size * 100) / 100
  const ratio = (f.size - minW) / Math.max(0.01, maxW - minW)
  return {
    id: sp.id,
    name: sp.name,
    weight,
    lengthCm: Math.round(18 + weight * 13),
    strength: sp.strength,
    baseValue: sp.baseValue,
    sizeRatio: ratio,
    xp: Math.round(sp.xp * (0.8 + ratio * 0.6)),
  }
}

// ---------------------------------------------------------------------------
// The fight: a hooked fish actively swims — runs in varied directions, dives &
// bulldogs, leaps + headshakes (can throw the hook if you crank too hard), and
// thrashes, tiring over time. The line tethers it to the player; reeling/pumping
// shortens the tether and tension responds to what the fish is doing.
// ---------------------------------------------------------------------------
const clampF = (v, a, b) => Math.max(a, Math.min(b, v))
export const FIGHT = { HOLD: 0, RUN: 1, JUMP: 2, DIVE: 3, THRASH: 4 }

function pickBehavior(sp, stamina, pressure = 0) {
  if (stamina < 0.18) return Math.random() < 0.7 ? FIGHT.HOLD : FIGHT.THRASH
  const r = Math.random()
  const jumpy = sp.strength
  const run = 0.28 + pressure * 0.32 // horsing it (high tension) provokes a run
  if (r < run) return FIGHT.RUN
  if (r < run + (0.16 + pressure * 0.12) * jumpy) return FIGHT.JUMP
  if (r < run + 0.34) return FIGHT.DIVE // slack lets it dive for cover
  if (r < run + 0.52) return FIGHT.THRASH
  return FIGHT.HOLD
}
function behaviorDuration(b, stamina) {
  switch (b) {
    case FIGHT.RUN: return (0.8 + Math.random() * 1.5) * (0.5 + stamina * 0.5)
    case FIGHT.JUMP: return 0.85
    case FIGHT.DIVE: return 1.0 + Math.random() * 1.4
    case FIGHT.THRASH: return 0.5 + Math.random() * 0.6
    default: return 1.0 + Math.random() * 1.6
  }
}
function behaviorForce(b, sp) {
  const s = sp.strength
  switch (b) {
    case FIGHT.RUN: return 0.6 + s * 0.5
    case FIGHT.JUMP: return 0.45 + s * 0.4
    case FIGHT.DIVE: return 0.5 + s * 0.5
    case FIGHT.THRASH: return 0.3 + s * 0.3
    default: return 0.14 + s * 0.16
  }
}

export function startFight(playerX, playerZ) {
  const f = lake.active
  if (!f) return
  const d = Math.max(7, Math.hypot(f.pos.x - playerX, f.pos.z - playerZ))
  f.state = FS.HOOKED
  lake.fight = {
    tether: d, maxDist: d, distance: d,
    tension: 0.18, stamina: 1, maxTension: 0.18,
    behavior: FIGHT.RUN, timer: 0.6,
    vx: 0, vz: 0, vy: 0, threw: false, justJumped: false,
    slipping: false, spooled: false,
  }
}

const _d = new THREE.Vector3()
export function updateFight(dt, t, playerX, playerZ, reeling, pumping, rodLoad, tackle) {
  const f = lake.active
  const fight = lake.fight
  if (!f || !fight) return
  const sp = f.sp
  fight.justJumped = false
  // drag setting (slips before the line breaks); pressure = how hard you're pulling
  const dragMax = Math.min(0.45 + tackle.drag * 0.55, tackle.lineStrength - 0.12)
  const pressure = clampF(fight.tension / Math.max(0.2, dragMax), 0, 1)

  fight.timer -= dt
  if (fight.timer <= 0) {
    fight.behavior = pickBehavior(sp, fight.stamina, pressure)
    fight.timer = behaviorDuration(fight.behavior, fight.stamina) * (pressure > 0.7 && fight.behavior === FIGHT.HOLD ? 0.4 : 1)
    if (fight.behavior === FIGHT.RUN) {
      const ang = Math.atan2(f.pos.z - playerZ, f.pos.x - playerX) + (Math.random() - 0.5) * 1.7
      const spd = (1.6 + sp.strength * 2.6) * (0.4 + fight.stamina * 0.6)
      fight.vx = Math.cos(ang) * spd
      fight.vz = Math.sin(ang) * spd
    } else if (fight.behavior === FIGHT.JUMP) {
      fight.vy = 2.4 + Math.random() * 1.4
      fight.justJumped = true
    } else if (fight.behavior === FIGHT.DIVE) {
      fight.vy = -1.7
    }
  }

  const running = fight.behavior === FIGHT.RUN || fight.behavior === FIGHT.JUMP

  if (fight.behavior === FIGHT.RUN) {
    f.pos.x += fight.vx * dt
    f.pos.z += fight.vz * dt
    f.pos.y += (-0.12 - f.pos.y) * Math.min(1, dt * 2)
  } else if (fight.behavior === FIGHT.JUMP) {
    fight.vy -= 9.2 * dt
    f.pos.y += fight.vy * dt
    f.pos.x += fight.vx * 0.35 * dt
    f.pos.z += fight.vz * 0.35 * dt
    if (f.pos.y < -0.06 && fight.vy < 0) {
      f.pos.y = -0.06
      fight.behavior = FIGHT.THRASH
      fight.timer = 0.5
    }
  } else if (fight.behavior === FIGHT.DIVE) {
    f.pos.y += fight.vy * dt
    if (f.pos.y < -4.5) f.pos.y = -4.5
  } else {
    f.pos.y += (-0.16 - f.pos.y) * Math.min(1, dt * 1.4)
    if (fight.behavior === FIGHT.THRASH) {
      f.pos.x += Math.sin(t * 18) * 0.05
      f.pos.z += Math.cos(t * 16) * 0.05
    }
  }

  // keep inside the lake
  const rr = Math.hypot(f.pos.x, f.pos.z)
  if (rr > 72) {
    f.pos.x *= 72 / rr
    f.pos.z *= 72 / rr
  }

  // tether constraint — keep the fish within the line that's currently out
  _d.set(f.pos.x - playerX, 0, f.pos.z - playerZ)
  let dist = _d.length()
  if (dist > fight.tether) {
    _d.normalize()
    f.pos.x = playerX + _d.x * fight.tether
    f.pos.z = playerZ + _d.z * fight.tether
    dist = fight.tether
  }
  fight.distance = dist

  if (running && (fight.vx || fight.vz)) f.heading = Math.atan2(fight.vz, fight.vx)
  else f.heading = Math.atan2(f.pos.z - playerZ, f.pos.x - playerX)

  // ---- drag-limited tension (dragMax computed at top) ----
  // The drag slips (pays out line) before the line ever snaps, so a small fish
  // can't break the line. A green fish surges harder the closer it gets.
  const surge = 1 + (1 - fight.distance / Math.max(1, fight.maxDist)) * 0.4
  const fishForce = behaviorForce(fight.behavior, sp) * (0.45 + fight.stamina * 0.55) * (running ? 1.5 : 1) * surge
  const playerPull = (reeling ? 0.12 : 0) + rodLoad * 0.2
  const demand = fishForce + playerPull

  let pull = 0
  if (demand > dragMax) {
    // drag SLIPS: line pays out, tension pinned at the drag setting (line safe)
    fight.tension = dragMax
    fight.tether += dt * (demand - dragMax) * 4.5
    fight.slipping = true
  } else {
    fight.tension = demand
    fight.slipping = false
    const lp = tackle.landingPower || 0.55
    if (reeling) pull += dt * (1.4 + (1 - sp.strength) * 0.8 + lp * 0.5) // reel gear ratio + rod/hook power
    if (pumping) pull += dt * (0.6 + rodLoad * 1.4 + lp * 0.3)
  }
  fight.tether = Math.max(0, fight.tether - pull)

  // stamina: tires while fighting the drag or being worked; recovers on slack
  if (fight.slipping) fight.stamina -= dt * 0.05
  else if (reeling || pumping) fight.stamina -= dt * 0.035
  else fight.stamina += dt * 0.025
  fight.stamina = clampF(fight.stamina, 0, 1)
  fight.maxTension = Math.max(fight.maxTension, fight.tension) // peak load (for clean-landing bonus)

  // a strong fish that takes ALL your line spools you and gets away
  if (fight.tether >= (tackle.lineCapacity || 90) * 0.97) fight.spooled = true

  // a jump can throw the hook only if you horse it on a tight line — bow to it!
  // a stronger hookset (landingPower) holds better.
  const throwOdds = Math.max(0.2, 1.0 - (tackle.landingPower || 0.55) * 0.4)
  if (fight.behavior === FIGHT.JUMP && reeling && fight.tension > dragMax * 0.95 && Math.random() < dt * throwOdds) {
    fight.threw = true
  }
}

// Release the engaged fish (missed bite, snapped line, or after a catch).
export function releaseActive(flee = true) {
  const f = lake.active
  if (f) {
    if (flee) {
      // dart away from the lure
      f.heading = Math.atan2(f.pos.z - castSim.bobber.z, f.pos.x - castSim.bobber.x)
      f.state = FS.FLEE
      f.fleeTimer = 2.5
    } else {
      f.state = FS.ROAM
    }
    f.cooldown = 5
  }
  lake.active = null
  lake.pendingBite = null
}
