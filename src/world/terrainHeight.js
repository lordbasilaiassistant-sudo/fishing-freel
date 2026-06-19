import * as THREE from 'three'

// Shared lake-basin height field, used by the terrain mesh AND the player so
// you walk on the real ground. Water surface is y=0.
export const LAKE_RADIUS = 78

export function heightAt(x, z) {
  const r = Math.hypot(x, z)
  let h = (r - LAKE_RADIUS) * 0.14
  h -= 7 * Math.exp(-(r * r) / (2 * 42 * 42))
  const hill =
    Math.sin(x * 0.045) * Math.cos(z * 0.05) +
    0.5 * Math.sin(x * 0.09 + 2) * Math.cos(z * 0.085 + 1) +
    0.25 * Math.sin(x * 0.21 + 0.5) * Math.cos(z * 0.19)
  const mask = THREE.MathUtils.clamp((r - LAKE_RADIUS - 6) / 32, 0, 1)
  h += hill * 7 * mask
  return Math.min(h, 30)
}

// The dock footprint (matches Dock.jsx): deck at y=0.6 from z=63..84, width 5.
const DOCK = { halfW: 2.5, zMin: 62.5, zMax: 84, deckY: 0.6 }

export function onDock(x, z) {
  return Math.abs(x) <= DOCK.halfW && z >= DOCK.zMin && z <= DOCK.zMax
}

// Ground height to stand on (dock deck, or land — never below the water line).
export function groundY(x, z) {
  if (onDock(x, z)) return DOCK.deckY
  return Math.max(heightAt(x, z), 0)
}

// Can the player stand here? On the dock, or on land that isn't deep water.
export function standable(x, z) {
  return onDock(x, z) || heightAt(x, z) > -0.6
}

export const EYE_HEIGHT = 1.7
