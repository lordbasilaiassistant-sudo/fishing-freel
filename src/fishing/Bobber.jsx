import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { castSim } from '../sim/cast.js'
import { useGame, PHASES } from '../state/useGame.js'

const _v = new THREE.Vector3()
const _tipW = new THREE.Vector3()
const _seg = new THREE.Vector3()
const CAT_SEGS = 7 // catenary samples between rod tip and lure

/**
 * Renders the lure/bobber, the fishing line, and the splashdown ripple. The
 * line is threaded through the rod hardware: reel -> each guide ring -> rod tip
 * -> lure, so it follows the blank (and its bend) the way real line runs through
 * the eyelets, instead of cutting straight from the reel to the tip. Always
 * shows the strung reel->guides->tip run; extends to the lure while a cast is out.
 */
export function Bobber({ tipRef, reelRef, guideRefs }) {
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

    // line: reel -> each guide ring -> rod tip -> lure
    if (line.current && tipRef.current && reelRef.current) {
      const p = line.current.geometry.attributes.position
      let n = 0
      const push = (v) => p.setXYZ(n++, v.x, v.y, v.z)

      reelRef.current.getWorldPosition(_v)
      push(_v)
      const guides = guideRefs?.current || []
      for (let i = 1; i < guides.length; i++) {
        if (guides[i]) push(guides[i].getWorldPosition(_v))
      }
      tipRef.current.getWorldPosition(_tipW)
      push(_tipW)

      if (castSim.active) {
        // tip -> lure with a gravity belly: slack line sags, a taut/fighting
        // line pulls straight. sag = how much more line is out than the straight
        // gap, eased by tension while a fish is on.
        const dist = _tipW.distanceTo(castSim.bobber)
        let sag = Math.min(Math.max(0, castSim.lineLen - dist) * 0.5, dist * 0.3)
        const st = useGame.getState()
        if (st.phase === PHASES.REELING) sag *= 1 - 0.85 * st.tension
        for (let i = 1; i < CAT_SEGS; i++) {
          const t = i / CAT_SEGS
          _seg.lerpVectors(_tipW, castSim.bobber, t)
          _seg.y -= sag * 4 * t * (1 - t) // parabolic droop, max at mid-span
          push(_seg)
        }
        push(castSim.bobber)
      }

      p.needsUpdate = true
      line.current.geometry.setDrawRange(0, n)
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
          {/* reel + ~7 guides + tip + catenary samples + lure; drawRange per frame */}
          <bufferAttribute attach="attributes-position" args={[new Float32Array(96), 3]} />
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
