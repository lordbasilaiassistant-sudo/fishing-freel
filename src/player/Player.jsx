import { useEffect, useRef } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGame } from '../state/useGame.js'
import { groundY, standable, EYE_HEIGHT } from '../world/terrainHeight.js'
import { initAudio, setSoundEnabled } from '../audio/sound.js'

const clamp = (v, a, b) => Math.max(a, Math.min(b, v))
const BASE_SENS = 0.0022 // multiplied by settings.sensitivity (1.0 = this)
const WALK = 5.5 // m/s

/**
 * First-person rig: FPS-style free mouse-look (click to capture cursor) + WASD
 * walking on the real ground/dock. Eye height follows terrain. Yaw 0 looks out
 * across the lake (-Z).
 */
export function Player({ start = [0, 72] }) {
  const camera = useThree((s) => s.camera)
  const gl = useThree((s) => s.gl)
  const yaw = useRef(0)
  const pitch = useRef(-0.13)
  const keys = useRef({})
  const moved = useRef(false) // fire the tutorial 'move' event once
  const pos = useRef(new THREE.Vector2(start[0], start[1]))
  const setLocked = useGame((s) => s.setLocked)

  useEffect(() => {
    camera.position.set(pos.current.x, groundY(pos.current.x, pos.current.y) + EYE_HEIGHT, pos.current.y)
    const dom = gl.domElement

    const onClick = () => {
      initAudio() // first user gesture unlocks Web Audio
      setSoundEnabled(useGame.getState().settings.sound) // honor the saved mute
      if (document.pointerLockElement !== dom) dom.requestPointerLock?.()
    }
    const onMove = (e) => {
      if (document.pointerLockElement !== dom) return
      const st = useGame.getState().settings
      const sens = BASE_SENS * (st.sensitivity || 1)
      yaw.current -= e.movementX * sens
      pitch.current = clamp(pitch.current - e.movementY * sens * (st.invertLookY ? -1 : 1), -1.1, 0.42)
    }
    const onLock = () => {
      const isLocked = document.pointerLockElement === dom
      setLocked(isLocked)
      if (isLocked) useGame.getState().advanceQuest('pointer_lock')
    }
    const kd = (e) => { keys.current[e.code] = true }
    const ku = (e) => { keys.current[e.code] = false }

    dom.addEventListener('click', onClick)
    document.addEventListener('mousemove', onMove)
    document.addEventListener('pointerlockchange', onLock)
    window.addEventListener('keydown', kd)
    window.addEventListener('keyup', ku)
    return () => {
      dom.removeEventListener('click', onClick)
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('pointerlockchange', onLock)
      window.removeEventListener('keydown', kd)
      window.removeEventListener('keyup', ku)
    }
  }, [camera, gl, setLocked])

  useFrame((_, dtRaw) => {
    if (useGame.getState().bench) return // frozen while the tackle box is open
    const dt = Math.min(dtRaw, 0.05)
    const k = keys.current
    let f = (k['KeyW'] ? 1 : 0) - (k['KeyS'] ? 1 : 0)
    let s = (k['KeyD'] ? 1 : 0) - (k['KeyA'] ? 1 : 0)

    if (f || s) {
      if (!moved.current) {
        moved.current = true
        useGame.getState().advanceQuest('move')
      }
      const len = Math.hypot(f, s)
      f /= len
      s /= len
      const sinY = Math.sin(yaw.current)
      const cosY = Math.cos(yaw.current)
      const fx = -sinY, fz = -cosY // forward (look dir on XZ)
      const rx = cosY, rz = -sinY // right
      const nx = pos.current.x + (fx * f + rx * s) * WALK * dt
      const nz = pos.current.y + (fz * f + rz * s) * WALK * dt
      if (standable(nx, nz)) pos.current.set(nx, nz)
      else if (standable(nx, pos.current.y)) pos.current.x = nx
      else if (standable(pos.current.x, nz)) pos.current.y = nz
    }

    const targetY = groundY(pos.current.x, pos.current.y) + EYE_HEIGHT
    camera.position.x = pos.current.x
    camera.position.z = pos.current.y
    camera.position.y += (targetY - camera.position.y) * Math.min(1, dt * 12)
    camera.quaternion.setFromEuler(new THREE.Euler(pitch.current, yaw.current, 0, 'YXZ'))
  })

  return null
}
