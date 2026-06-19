import * as THREE from 'three'

// Day/night clock. t in 0..1 over one in-game day (0=midnight, 0.25=sunrise,
// 0.5=noon, 0.75=sunset). One day = DAY_SECONDS real seconds.
export const clock = { t: 0.32 } // start mid-morning
export const DAY_SECONDS = 600 // 10 real minutes per day
export const worldSun = new THREE.Vector3()

export function advanceClock(dt) {
  clock.t = (clock.t + dt / DAY_SECONDS) % 1
}

// Sun direction (unit) from time: rises in the east, arcs over, sets; below the
// horizon at night.
export function computeSun(t, out) {
  const el = Math.sin((t - 0.25) * Math.PI * 2) * 1.2 // elevation angle (rad), peaks ~noon
  const az = t * Math.PI * 2 // azimuth sweeps across the day
  const ce = Math.cos(el)
  out.set(Math.cos(az) * ce, Math.sin(el), Math.sin(az) * ce)
  if (out.lengthSq() > 0) out.normalize()
  return out
}

// 0 at night, 1 at noon — smooth through dawn/dusk.
export function dayFactor(t) {
  return THREE.MathUtils.clamp(Math.sin((t - 0.25) * Math.PI * 2), 0, 1)
}

// How well a species' feeding window matches the current time (0..1).
export function timeMatch(timeOfDay, t) {
  const day = dayFactor(t) // 1 noon .. 0 night
  // crepuscular weight: peaks near sunrise (0.25) and sunset (0.75)
  const dawn = Math.exp(-(((t - 0.25 + 1) % 1) ** 2) / 0.004)
  const dusk = Math.exp(-(((t - 0.75 + 1) % 1) ** 2) / 0.004)
  const crep = Math.min(1, dawn + dusk)
  switch (timeOfDay) {
    case 'day': return 0.3 + day * 0.7
    case 'night': return 0.3 + (1 - day) * 0.7
    case 'dawn_dusk': return 0.35 + crep * 0.65
    case 'dusk_night': return 0.3 + Math.min(1, crep + (1 - day)) * 0.7
    default: return 1 // 'all'
  }
}

export function hourString(t) {
  const totalMin = Math.floor(t * 24 * 60)
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  const ampm = h < 12 ? 'AM' : 'PM'
  let h12 = h % 12
  if (h12 === 0) h12 = 12
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`
}
