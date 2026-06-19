import * as THREE from 'three'

// Live, per-frame cast/lure state. Kept OUT of zustand on purpose: it updates
// every frame and only the 3D scene reads it, so React never needs to re-render
// for it. The HUD-facing scalars (power, tension, distance) live in the store.
export const castSim = {
  bobber: new THREE.Vector3(), // world position of the lure/bobber
  vel: new THREE.Vector3(), // velocity while in flight
  active: false, // bobber exists (in flight or floating)
  inWater: false, // has splashed down
  rippleT: 0, // seconds since splashdown (drives the ring)
  action: 0, // 0..1 lure action from twitching (attracts fish), decays
  lineLen: 0, // length of line let out — the bobber is tethered within this of the rod tip
  token: null, // equipped lure/bait gear token — gates which species will bite
  stealth: 1, // line stealth multiplier on bite chance
  attract: 0.5, // lure/bait appeal multiplier on bite chance
  landX: 0,
  landZ: 0,
}

export function resetCast() {
  castSim.active = false
  castSim.inWater = false
  castSim.rippleT = 0
  castSim.action = 0
  castSim.lineLen = 0
  castSim.vel.set(0, 0, 0)
}
