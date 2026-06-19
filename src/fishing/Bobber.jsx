import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { castSim } from '../sim/cast.js'
import { useGame, PHASES } from '../state/useGame.js'

const _tip = new THREE.Vector3()
const _reel = new THREE.Vector3()

/**
 * Renders the lure/bobber, the fishing line, and the splashdown ripple. The
 * line is a 3-point poly: reel -> rod tip -> lure, so it reads as line coming
 * off the reel and up the rod (not just spawning at the tip). Always shows the
 * reel->tip run; extends to the lure while a cast is out.
 */
export function Bobber({ tipRef, reelRef }) {
  const bob = useRef()
  const line = useRef()
  const ripple = useRef()

  useFrame(() => {
    const landed = useGame.getState().phase === PHASES.LANDED // clean catch card — hide rig

    // bobber
    if (bob.current) {
      bob.current.position.copy(castSim.bobber)
      bob.current.visible = castSim.active && !landed
    }

    // line: reel -> rod tip -> lure
    if (line.current && tipRef.current && reelRef.current) {
      reelRef.current.getWorldPosition(_reel)
      tipRef.current.getWorldPosition(_tip)
      const p = line.current.geometry.attributes.position
      p.setXYZ(0, _reel.x, _reel.y, _reel.z)
      p.setXYZ(1, _tip.x, _tip.y, _tip.z)
      if (castSim.active) p.setXYZ(2, castSim.bobber.x, castSim.bobber.y, castSim.bobber.z)
      else p.setXYZ(2, _tip.x, _tip.y, _tip.z)
      p.needsUpdate = true
      line.current.visible = !landed
    }

    // ripple ring on the water
    if (ripple.current) {
      const show = castSim.active && castSim.inWater && !landed
      ripple.current.visible = show
      if (show) {
        const t = castSim.rippleT % 1.7
        const s = 0.4 + t * 2.4
        ripple.current.scale.set(s, s, s)
        ripple.current.position.set(castSim.landX, 0.03, castSim.landZ)
        ripple.current.material.opacity = Math.max(0, 0.45 * (1 - t / 1.7))
      }
    }
  })

  return (
    <group>
      <group ref={bob} visible={false}>
        <mesh position={[0, 0.05, 0]}>
          <sphereGeometry args={[0.1, 16, 12]} />
          <meshStandardMaterial color="#d8392c" roughness={0.5} />
        </mesh>
        <mesh position={[0, -0.05, 0]}>
          <sphereGeometry args={[0.1, 16, 12]} />
          <meshStandardMaterial color="#f3f3f3" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.2, 0]}>
          <cylinderGeometry args={[0.012, 0.012, 0.2, 6]} />
          <meshStandardMaterial color="#c62222" />
        </mesh>
      </group>

      <line ref={line} frustumCulled={false} visible={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[new Float32Array(9), 3]} />
        </bufferGeometry>
        <lineBasicMaterial color="#eef3f5" transparent opacity={0.55} />
      </line>

      <mesh ref={ripple} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
        <ringGeometry args={[0.34, 0.5, 40]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.4} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
    </group>
  )
}
