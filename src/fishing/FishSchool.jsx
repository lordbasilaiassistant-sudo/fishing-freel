import { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { lake, updateLake, spawnFish, FS } from '../sim/lake.js'
import { castSim } from '../sim/cast.js'
import { useGame } from '../state/useGame.js'

const COLORS = {
  bluegill: '#5e7d8a',
  pumpkinseed: '#7a9a4e',
  brown_bullhead: '#5a4a38',
  largemouth_pond: '#4a6b3a',
  common_carp: '#9a7d4a',
  yellow_perch: '#c0972f',
  crappie: '#7d8a6a',
  largemouth_bass: '#3f5a34',
  rainbow_trout: '#8a9bb0',
  walleye: '#9a8a55',
  channel_catfish: '#6a6256',
  northern_pike: '#5a6b3a',
  brook_trout: '#7a5a4a',
  rainbow_trout_river: '#8a9bb0',
  smallmouth_bass: '#6a6440',
  walleye_river: '#9a8a55',
  brown_trout: '#7d6440',
  muskie: '#5f6a48',
}

const _fwd = new THREE.Vector3()
const _target = new THREE.Vector3()

/**
 * The living lake: spawns fish, runs their AI every frame, and renders + animates
 * them. Fish cruise with their backs at the surface (visible over the opaque
 * water), converge on the lure when interested, thrash when hooked, and are
 * lifted out in front of the camera when caught.
 */
export function FishSchool() {
  const groups = useRef([])
  const tails = useRef([])
  const camera = useThree((s) => s.camera)

  // Spawn the current area's fish; re-spawn (and re-render the school) on travel.
  const currentArea = useGame((s) => s.currentArea)
  useMemo(() => spawnFish(16, currentArea), [currentArea])

  useFrame((state, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05)
    const t = state.clock.elapsedTime
    updateLake(dt, t)
    const g = useGame.getState()
    const active = lake.active

    for (let i = 0; i < lake.fish.length; i++) {
      const f = lake.fish[i]
      const grp = groups.current[i]
      if (!grp) continue

      if (f === active) {
        if (f.state === FS.NIBBLE) {
          f.pos.x = castSim.bobber.x + Math.sin(t * 6) * 0.18
          f.pos.z = castSim.bobber.z + Math.cos(t * 6) * 0.18
          f.pos.y = -0.12 + Math.sin(t * 10) * 0.04
          f.heading = Math.atan2(castSim.bobber.z - f.pos.z, castSim.bobber.x - f.pos.x)
        } else if (f.state === FS.CAUGHT) {
          camera.getWorldDirection(_fwd)
          _target.copy(camera.position).addScaledVector(_fwd, 1.5)
          _target.y -= 0.15
          f.pos.lerp(_target, Math.min(1, dt * 3))
          f.heading += dt * 0.5
        }
      }

      grp.position.copy(f.pos)
      grp.rotation.y = -f.heading
      grp.rotation.z =
        f.state === FS.CAUGHT
          ? Math.sin(t * 7) * 0.35
          : f.state === FS.HOOKED
            ? Math.sin(t * 15) * 0.22 // head-shake on the line
            : 0
      grp.visible =
        f.pos.y > -0.22 ||
        f.state === FS.NIBBLE ||
        f.state === FS.HOOKED // CAUGHT hidden — the catch card is the moment (crude model)

      const tail = tails.current[i]
      if (tail) {
        const swish = f.state === FS.HOOKED || f.state === FS.FLEE ? 1.5 : 0.6
        tail.rotation.y = Math.sin(t * 8 * f.speed + i) * 0.5 * swish
      }
    }
  })

  return (
    <group>
      {lake.fish.map((f, i) => {
        const L = 0.28 + f.size * 0.12
        const color = COLORS[f.sp.id] || '#5e7d8a'
        return (
          <group key={i} ref={(el) => (groups.current[i] = el)} visible={false}>
            {/* body — tall + laterally thin (fish), nose +X */}
            <mesh scale={[L * 0.52, L * 0.22, L * 0.085]} castShadow>
              <sphereGeometry args={[1, 14, 12]} />
              <meshStandardMaterial color={color} roughness={0.42} metalness={0.06} />
            </mesh>
            {/* dorsal fin */}
            <mesh position={[L * 0.03, L * 0.2, 0]} rotation={[0, 0, -0.3]} scale={[1, 1, 0.05]}>
              <coneGeometry args={[L * 0.09, L * 0.18, 3]} />
              <meshStandardMaterial color={color} roughness={0.6} />
            </mesh>
            {/* tail fin (swishes) — tall vertical fan */}
            <group position={[-L * 0.5, 0, 0]} ref={(el) => (tails.current[i] = el)}>
              <mesh rotation={[0, 0, Math.PI / 2]} scale={[1, 1, 0.06]}>
                <coneGeometry args={[L * 0.2, L * 0.36, 3]} />
                <meshStandardMaterial color={color} roughness={0.6} />
              </mesh>
            </group>
          </group>
        )
      })}
    </group>
  )
}
