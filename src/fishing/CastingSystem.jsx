import { useEffect, useRef } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGame, PHASES } from '../state/useGame.js'
import { castSim, resetCast, triggerSplash } from '../sim/cast.js'
import { lake, fishToData, releaseActive, startFight, updateFight, FS } from '../sim/lake.js'
import { heightAt } from '../world/terrainHeight.js'
import { sellValue } from './fish.js'
import { equippedToken, itemById } from '../tackle/catalog.js'
import { sfx } from '../audio/sound.js'

const GRAVITY = 22
const CHARGE_PERIOD = 1.4
const RAMP_TIME = 1.0
const clamp = (v, a, b) => Math.max(a, Math.min(b, v))
function powerAt(t, style) {
  if (style === 'oscillate') {
    const x = (t % CHARGE_PERIOD) / CHARGE_PERIOD
    return x < 0.5 ? x * 2 : (1 - x) * 2
  }
  // ramp-hold (default): build to full over RAMP_TIME and hold there
  return Math.min(1, t / RAMP_TIME)
}

const _tip = new THREE.Vector3()
const _dir = new THREE.Vector3()
const _land = new THREE.Vector3()

/**
 * IRL-style controls + fight.
 *   LEFT (mouse / Space) : hold-charge-release to CAST; hold to REEL.
 *   RIGHT (mouse / KeyE) : twitch the lure (waiting), set the hook (bite),
 *                          pump/lift the rod (fight).
 * The fight is pump-and-reel: lift the loaded rod to gain line when the fish
 * isn't running, reel to take up the slack, and ease off during runs or the
 * line snaps. The hooked fish itself drives tension via its runs + stamina.
 */
export function CastingSystem({ tipRef }) {
  const camera = useThree((s) => s.camera)
  const leftHeld = useRef(false)
  const rightHeld = useRef(false)
  const scrollReelUntil = useRef(0) // ms timestamp; scroll-wheel reel pulse
  const chargeT = useRef(0)
  const biteWindowEnd = useRef(0)
  const nextSurge = useRef(0)
  const surgeEnd = useRef(0)

  useEffect(() => {
    const launch = (power) => {
      if (tipRef.current) tipRef.current.getWorldPosition(_tip)
      else _tip.copy(camera.position)
      camera.getWorldDirection(_dir)
      _dir.y += 0.45
      _dir.normalize()
      const g0 = useGame.getState()
      const tk = g0.tackle
      const speed = 12 + tk.castDistance * 12 + power * (22 + tk.castDistance * 20) // better rods cast farther
      castSim.bobber.copy(_tip)
      castSim.vel.copy(_dir).multiplyScalar(speed)
      castSim.active = true
      castSim.inWater = false
      castSim.rippleT = 0
      castSim.action = 0
      castSim.stealth = tk.stealth
      castSim.attract = tk.attract
      // out of bait? no fish will bite until you restock
      const baitItem = itemById(g0.loadout.bait)
      const outOfBait = baitItem?.consumable && (g0.consumables[baitItem.id] || 0) <= 0
      castSim.token = outOfBait ? null : equippedToken(g0.loadout)
      if (outOfBait) g0.patch({ message: `Out of ${baitItem.name} — restock at the Shop  [I]` })
      g0.advanceQuest('cast')
      sfx.cast()
    }

    const setHook = () => {
      const g = useGame.getState()
      startFight(camera.position.x, camera.position.z)
      g.patch({ tension: 0.18, fishDistance: 1, fishStamina: 1, rodLoad: 0, reeling: false })
      g.setPhase(PHASES.REELING)
      g.advanceQuest('set_hook')
    }

    const leftDown = () => {
      const g = useGame.getState()
      switch (g.phase) {
        case PHASES.IDLE:
          leftHeld.current = true
          chargeT.current = 0
          g.patch({ message: null })
          g.setPhase(PHASES.AIMING)
          break
        case PHASES.WAITING:
        case PHASES.REELING:
          leftHeld.current = g.settings.reelMode === 'toggle' ? !leftHeld.current : true
          break
        case PHASES.LANDED: {
          // release the caught fish back into the lake, reset
          const f = lake.active
          if (f) {
            const a = Math.random() * 6.28
            const r = 16 + Math.random() * 48
            f.pos.set(Math.cos(a) * r, f.cruiseDepth, Math.sin(a) * r)
            f.state = FS.ROAM
            f.cooldown = 6
          }
          lake.active = null
          resetCast()
          g.patch({ lastCatch: null, tension: 0, fishDistance: 1, fishStamina: 1, rodLoad: 0, message: null, reeling: false })
          g.setPhase(PHASES.IDLE)
          break
        }
      }
    }
    const leftUp = () => {
      const g = useGame.getState()
      if (g.phase === PHASES.AIMING && leftHeld.current) {
        leftHeld.current = false
        launch(powerAt(chargeT.current, g.settings.castMeterStyle))
        g.setCastPower(0)
        g.setPhase(PHASES.CASTING)
      } else if (g.settings.reelMode !== 'toggle') {
        leftHeld.current = false // toggle mode keeps reeling until clicked again
      }
    }
    const rightDown = () => {
      const g = useGame.getState()
      rightHeld.current = true
      if (g.phase === PHASES.WAITING) {
        castSim.action = 1 // twitch / jig
        g.advanceQuest('twitch')
      } else if (g.phase === PHASES.BITE) setHook()
    }
    const rightUp = () => {
      rightHeld.current = false
    }

    const onKeyDown = (e) => {
      if (e.repeat || useGame.getState().bench) return
      if (e.code === 'Space') { e.preventDefault(); leftDown() }
      else if (e.code === 'KeyE') { e.preventDefault(); rightDown() }
    }
    const onKeyUp = (e) => {
      if (useGame.getState().bench) return
      if (e.code === 'Space') leftUp()
      else if (e.code === 'KeyE') rightUp()
    }
    const onMouseDown = (e) => {
      if (!document.pointerLockElement) return
      if (e.button === 0) leftDown()
      else if (e.button === 2) rightDown()
    }
    const onMouseUp = (e) => {
      if (!document.pointerLockElement) return
      if (e.button === 0) leftUp()
      else if (e.button === 2) rightUp()
    }
    const onContext = (e) => e.preventDefault()
    const onWheel = (e) => {
      const g = useGame.getState()
      if (g.settings.scrollWheelReel && e.deltaY < 0 && (g.phase === PHASES.REELING || g.phase === PHASES.WAITING)) {
        scrollReelUntil.current = performance.now() + 220
      }
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mouseup', onMouseUp)
    window.addEventListener('contextmenu', onContext)
    window.addEventListener('wheel', onWheel, { passive: true })
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mouseup', onMouseUp)
      window.removeEventListener('contextmenu', onContext)
      window.removeEventListener('wheel', onWheel)
    }
  }, [camera, tipRef])

  useFrame((state, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05)
    const t = state.clock.elapsedTime
    const g = useGame.getState()
    const reelingNow = leftHeld.current || performance.now() < scrollReelUntil.current

    if (castSim.action > 0) castSim.action = Math.max(0, castSim.action - dt * 0.6)

    switch (g.phase) {
      case PHASES.AIMING:
        if (leftHeld.current) {
          chargeT.current += dt
          g.setCastPower(powerAt(chargeT.current, g.settings.castMeterStyle))
        }
        break

      case PHASES.CASTING: {
        castSim.vel.y -= GRAVITY * dt
        castSim.bobber.addScaledVector(castSim.vel, dt)
        // land where the lure actually hits: the water surface (y=0) over the
        // lake, or the ground if it's over dry land.
        const gh = heightAt(castSim.bobber.x, castSim.bobber.z)
        const surface = Math.max(0, gh)
        if (castSim.bobber.y <= surface) {
          castSim.bobber.y = surface
          castSim.landX = castSim.bobber.x
          castSim.landZ = castSim.bobber.z
          castSim.vel.set(0, 0, 0)
          castSim.rippleT = 0
          if (tipRef.current) tipRef.current.getWorldPosition(_tip)
          else _tip.copy(camera.position)
          castSim.lineLen = _tip.distanceTo(castSim.bobber) // line let out by this cast
          if (gh < -0.05) {
            castSim.inWater = true // real water → fish can bite
            sfx.splash()
            triggerSplash(castSim.landX, castSim.landZ, 1)
            g.setPhase(PHASES.WAITING)
          } else {
            castSim.inWater = false // on the bank → no fishing, reel it in
            g.patch({ message: 'On dry land — reel it in' })
            g.setPhase(PHASES.WAITING)
          }
        }
        break
      }

      case PHASES.WAITING: {
        castSim.rippleT += dt
        if (tipRef.current) tipRef.current.getWorldPosition(_tip)
        else _tip.copy(camera.position)

        // reeling pays line back onto the reel (shortens what's out)
        if (reelingNow) {
          castSim.lineLen = Math.max(0, castSim.lineLen - 7.0 * dt)
          sfx.reelTick(dt)
        }

        // the bobber is tethered within lineLen of the rod tip: walk away or swing
        // the rod and a taut line drags it toward you.
        _dir.copy(castSim.bobber).sub(_tip)
        const d = _dir.length()
        if (d > castSim.lineLen && d > 1e-4) {
          _dir.multiplyScalar(castSim.lineLen / d)
          castSim.bobber.copy(_tip).add(_dir)
          const ghb = heightAt(castSim.bobber.x, castSim.bobber.z)
          castSim.inWater = ghb < -0.05
          castSim.bobber.y = castSim.inWater ? 0 : Math.max(0, ghb)
          castSim.landX = castSim.bobber.x
          castSim.landZ = castSim.bobber.z
        } else if (castSim.inWater) {
          castSim.bobber.y =
            Math.sin(t * 2.0) * 0.04 + (castSim.action > 0 ? Math.sin(t * 30) * 0.06 * castSim.action : 0)
        }

        // fully retrieved → idle
        if (castSim.lineLen <= 1.3) {
          resetCast()
          releaseActive(false)
          g.patch({ message: null, reeling: false })
          g.setPhase(PHASES.IDLE)
          break
        }

        if (castSim.inWater && lake.pendingBite) {
          lake.pendingBite = null
          g.patch({ currentFish: fishToData(lake.active) })
          biteWindowEnd.current = t + 1.8
          g.setPhase(PHASES.BITE)
          sfx.bite()
        } else if (g.reeling !== reelingNow) {
          g.patch({ reeling: reelingNow }) // drive reel/rod anim while retrieving
        }
        break
      }

      case PHASES.BITE: {
        if (tipRef.current) tipRef.current.getWorldPosition(_tip)
        else _tip.copy(camera.position)
        _dir.copy(castSim.bobber).sub(_tip)
        const d = _dir.length()
        if (d > castSim.lineLen && d > 1e-4) {
          _dir.multiplyScalar(castSim.lineLen / d)
          castSim.bobber.copy(_tip).add(_dir)
          castSim.landX = castSim.bobber.x
          castSim.landZ = castSim.bobber.z
        }
        castSim.bobber.y = -0.16 + Math.sin(t * 20) * 0.05 // yanked under by the nibble
        if (t > biteWindowEnd.current) {
          releaseActive(true)
          g.patch({ currentFish: null, message: 'It got away…' })
          g.setPhase(PHASES.WAITING)
        }
        break
      }

      case PHASES.REELING: {
        const f = g.currentFish
        if (!f || !lake.active || !lake.fight) {
          resetCast()
          g.setPhase(PHASES.IDLE)
          break
        }
        // pump the rod with Right; reel with Left. The hooked fish swims itself.
        const rodLoad = rightHeld.current
          ? Math.min(1, g.rodLoad + dt * 1.7)
          : Math.max(0, g.rodLoad - dt * 2.2)
        updateFight(dt, t, camera.position.x, camera.position.z, reelingNow, rightHeld.current, rodLoad, g.tackle)
        const fight = lake.fight

        // the line tracks the fish (lure in its mouth)
        castSim.bobber.copy(lake.active.pos)
        castSim.lineLen = fight.distance
        const lineOut = Math.max(0, Math.min(1, fight.distance / fight.maxDist))
        g.patch({ tension: fight.tension, fishDistance: lineOut, fishStamina: fight.stamina, rodLoad, reeling: reelingNow })

        // fight audio + spray: jump splashes, drag-slip ratchet, reel clicks
        if (fight.justJumped) {
          sfx.bigSplash()
          triggerSplash(lake.active.pos.x, lake.active.pos.z, 1.7)
        }
        if (fight.slipping) sfx.reelTick(dt, true)
        else if (reelingNow) sfx.reelTick(dt, false)

        if (fight.spooled) {
          sfx.snap()
          releaseActive(true)
          resetCast()
          g.patch({ currentFish: null, tension: 0, fishDistance: 1, fishStamina: 1, rodLoad: 0, reeling: false, message: 'Spooled! It took all your line.' })
          g.setPhase(PHASES.IDLE)
        } else if (fight.threw) {
          sfx.bigSplash()
          releaseActive(true)
          resetCast()
          g.patch({ currentFish: null, tension: 0, fishDistance: 1, fishStamina: 1, rodLoad: 0, reeling: false, message: 'It threw the hook!' })
          g.setPhase(PHASES.IDLE)
        } else if (fight.tension >= g.tackle.lineStrength + 0.06) {
          sfx.snap()
          g.useConsumable(g.loadout.hook) // lost the hook on the break
          releaseActive(true)
          resetCast()
          g.patch({ currentFish: null, tension: 0, fishDistance: 1, fishStamina: 1, rodLoad: 0, reeling: false, message: 'Line snapped!' })
          g.setPhase(PHASES.IDLE)
        } else if (fight.tether <= 1.6 && fight.distance <= 2.4) {
          lake.active.state = FS.CAUGHT
          sfx.catch()
          const first = !g.caughtSpecies?.[f.id]
          const condition = g.tension > g.tackle.lineStrength * 0.9 ? 0.85 : 1
          const clean = (fight.maxTension || 1) < 0.55 // never stressed the drag
          const cb = clean ? 1.3 : 1
          const sale = Math.round(sellValue(f, condition) * (first ? 2 : 1) * cb)
          const xpGain = Math.round(f.xp * (first ? 2 : 1) * cb)
          g.addXp(xpGain)
          g.addMoney(sale)
          g.recordCatch(f)
          g.useConsumable(g.loadout.bait) // the fish ate the bait
          g.logCatch(f)
          g.advanceQuest('land_fish', { target: f.id, weight: f.weight })
          g.advanceQuest('catch_species', { target: f.id, weight: f.weight })
          g.advanceQuest('catch_min_weight', { target: f.id, weight: f.weight })
          if (g.tension < g.tackle.lineStrength * 0.9) g.advanceQuest('land_no_snap', { target: f.id })
          g.patch({ lastCatch: { ...f, money: sale, xpGain, first, clean }, tension: 0, rodLoad: 0, reeling: false, message: null })
          g.setPhase(PHASES.LANDED)
        }
        break
      }
    }
  })

  return null
}
