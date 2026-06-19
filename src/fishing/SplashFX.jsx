import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { castSim } from '../sim/cast.js'

// Pooled water droplets thrown up by a splash event (cast plop, fish jump).
// One InstancedMesh, recycled — cheap enough for integrated GPUs.
const N = 22
const _m = new THREE.Matrix4()
const _p = new THREE.Vector3()
const _q = new THREE.Quaternion()
const _s = new THREE.Vector3()
const FAR = new THREE.Vector3(0, -1000, 0)

export function SplashFX() {
  const mesh = useRef()
  const seen = useRef(-1)
  const parts = useMemo(
    () => Array.from({ length: N }, () => ({ x: 0, y: -1000, z: 0, vx: 0, vy: 0, vz: 0, life: 1, max: 1 })),
    [],
  )

  useFrame((_, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05)

    // new splash? spawn a crown of droplets at the event position
    const ev = castSim.splash
    if (ev && ev.id !== seen.current) {
      seen.current = ev.id
      const count = Math.min(N, Math.round(9 + ev.power * 9))
      let spawned = 0
      for (const p of parts) {
        if (spawned >= count) break
        p.x = ev.x + (Math.random() - 0.5) * 0.14
        p.z = ev.z + (Math.random() - 0.5) * 0.14
        p.y = 0.02
        const ang = Math.random() * Math.PI * 2
        const out = (0.5 + Math.random() * 1.2) * (0.6 + ev.power * 0.6)
        p.vx = Math.cos(ang) * out
        p.vz = Math.sin(ang) * out
        p.vy = (1.5 + Math.random() * 1.9) * (0.7 + ev.power * 0.5)
        p.life = 0
        p.max = 0.45 + Math.random() * 0.4
        spawned++
      }
    }

    if (!mesh.current) return
    let any = false
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i]
      if (p.life < p.max) {
        any = true
        p.life += dt
        p.vy -= 11 * dt
        p.x += p.vx * dt
        p.y += p.vy * dt
        p.z += p.vz * dt
        if (p.y <= 0 && p.vy < 0) p.life = p.max // fell back into the water
        const k = 1 - p.life / p.max
        const sc = 0.015 + 0.03 * k
        _m.compose(_p.set(p.x, p.y, p.z), _q, _s.set(sc, sc, sc))
      } else {
        _m.compose(FAR, _q, _s.set(0.0001, 0.0001, 0.0001))
      }
      mesh.current.setMatrixAt(i, _m)
    }
    mesh.current.instanceMatrix.needsUpdate = true
    mesh.current.visible = any
  })

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, N]} frustumCulled={false} visible={false}>
      <sphereGeometry args={[1, 6, 5]} />
      <meshStandardMaterial color="#e6f3f6" roughness={0.35} transparent opacity={0.9} />
    </instancedMesh>
  )
}
