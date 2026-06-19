import { useRef, useMemo } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { useGame, PHASES } from '../state/useGame.js'

const SEGMENTS = 8
const BLANK_BASE = 0.42 // y where the blank starts (above the grip)
const BLANK_LEN = 2.5
const SEG_LEN = BLANK_LEN / SEGMENTS

/**
 * First-person rod. The blank is a CHAIN of linked segments; each bends a small
 * fraction of the total, weighted toward the tip, so the rod forms a smooth
 * continuous curve (not a single hinge). The rig follows the camera; the body
 * tilts when pumping; the reel + handle spin while reeling.
 *
 * Convention: bend > 0 bows the tip TOWARD the lure (forward/down); bend < 0
 * loads the rod back. tipRef sits at the end of the last segment (line origin).
 */
export function FishingRod({ tipRef, reelRef, guideRefs }) {
  const camera = useThree((s) => s.camera)
  const rig = useRef()
  const body = useRef()
  const spool = useRef()
  const reelCrank = useRef()
  const lineWrap = useRef()
  const lineFrac = useRef(1)
  const segs = useRef([])
  const bend = useRef(0)
  const tilt = useRef(0)
  const castT = useRef(0)

  // per-segment bend weights, increasing toward the tip (sum = 1)
  const weights = useMemo(() => {
    const raw = Array.from({ length: SEGMENTS }, (_, i) => i + 1)
    const sum = raw.reduce((a, b) => a + b, 0)
    return raw.map((w) => w / sum)
  }, [])

  // build the segment chain bottom→tip (nested groups)
  const chain = useMemo(() => {
    // tip-top guide at the very end (line origin sits just past it)
    let node = (
      <group position={[0, SEG_LEN, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.011, 0.0035, 8, 14]} />
          <meshStandardMaterial color="#0b0c10" metalness={0.85} roughness={0.25} />
        </mesh>
        <object3D ref={tipRef} position={[0, 0.018, 0]} />
      </group>
    )
    for (let i = SEGMENTS - 1; i >= 0; i--) {
      const rTop = 0.02 - (0.02 - 0.004) * ((i + 1) / SEGMENTS)
      const rBot = 0.02 - (0.02 - 0.004) * (i / SEGMENTS)
      const guideR = 0.028 - 0.02 * (i / SEGMENTS) // line guides bigger near the butt
      node = (
        <group
          key={i}
          ref={(el) => (segs.current[i] = el)}
          position={i === 0 ? [0, BLANK_BASE, 0] : [0, SEG_LEN, 0]}
        >
          <mesh position={[0, SEG_LEN / 2, 0]}>
            <cylinderGeometry args={[rTop, rBot, SEG_LEN, 12]} />
            <meshStandardMaterial color="#16171c" metalness={0.5} roughness={0.3} />
          </mesh>
          {i > 0 && (
            <group position={[0, SEG_LEN * 0.5, guideR]}>
              {/* guide standoff foot */}
              <mesh position={[0, 0, -guideR * 0.5]}>
                <boxGeometry args={[0.004, 0.01, guideR]} />
                <meshStandardMaterial color="#0b0c10" metalness={0.6} roughness={0.4} />
              </mesh>
              {/* guide ring */}
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[guideR * 0.5, 0.0028, 6, 12]} />
                <meshStandardMaterial color="#0b0c10" metalness={0.85} roughness={0.25} />
              </mesh>
              {/* ring center — the line threads through this point */}
              <object3D ref={(el) => (guideRefs.current[i] = el)} />
            </group>
          )}
          {node}
        </group>
      )
    }
    return node
  }, [tipRef, weights, guideRefs])

  useFrame((state, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05)
    const t = state.clock.elapsedTime
    const g = useGame.getState()

    if (rig.current) {
      rig.current.position.copy(camera.position)
      rig.current.quaternion.copy(camera.quaternion)
      rig.current.visible = g.phase !== PHASES.LANDED // hide the rod behind the catch card
    }

    let targetBend = Math.sin(t * 1.2) * 0.03
    let targetTilt = 0
    let spin = 0
    let directBend = null

    switch (g.phase) {
      case PHASES.AIMING:
        castT.current = 0
        targetBend = -(0.18 + g.castPower * 0.5)
        targetTilt = -g.castPower * 0.3
        break
      case PHASES.CASTING: {
        castT.current += dt
        const ct = castT.current
        if (ct < 0.05) directBend = -0.55
        else if (ct < 0.16) directBend = -0.55 + ((ct - 0.05) / 0.11) * 1.5
        else directBend = 0.95 + Math.min((ct - 0.16) / 0.5, 1) * (0.08 - 0.95)
        break
      }
      case PHASES.WAITING:
        targetBend = 0.1 + (g.reeling ? 0.14 : 0) // light line load; more while reeling
        if (g.reeling) spin = dt * 14
        break
      case PHASES.BITE:
        targetBend = 0.24 + Math.sin(t * 22) * 0.13
        break
      case PHASES.REELING:
        targetBend = 0.3 + g.tension * 0.95
        targetTilt = g.rodLoad * 0.4
        if (g.reeling) spin = dt * 16
        break
      default:
        break
    }

    if (directBend !== null) bend.current = directBend
    else bend.current += (targetBend - bend.current) * Math.min(1, dt * 10)
    tilt.current += (targetTilt - tilt.current) * Math.min(1, dt * 9)

    // distribute the total bend across the chain (flip: +bend bows toward lure)
    for (let i = 0; i < SEGMENTS; i++) {
      const s = segs.current[i]
      if (s) s.rotation.x = -bend.current * weights[i]
    }
    if (body.current) body.current.rotation.x = tilt.current
    if (spool.current) spool.current.rotation.y += spin
    if (reelCrank.current) reelCrank.current.rotation.y += spin

    // line spooled on the reel: full at rest, drops as the fish takes line,
    // climbs back as you reel in — a visible read on line off/on the spool.
    let target = 1
    if (g.phase === PHASES.CASTING || g.phase === PHASES.WAITING || g.phase === PHASES.BITE) target = 0.82
    else if (g.phase === PHASES.REELING) target = 0.45 + (1 - g.fishDistance) * 0.55
    lineFrac.current += (target - lineFrac.current) * Math.min(1, dt * 5)
    if (lineWrap.current) {
      const r = 0.062 + lineFrac.current * 0.03
      lineWrap.current.scale.set(r / 0.07, 1, r / 0.07) // base wrap radius 0.07
    }
  })

  return (
    <group ref={rig}>
      {/* viewmodel fill light so the rod & reel are always readable, regardless
          of sun angle — short range so it barely touches the scene */}
      <pointLight position={[0.3, 0.05, -0.4]} intensity={0.6} distance={2.8} decay={2} color="#fff2e0" />
      <group position={[0.5, -0.42, -0.85]} rotation={[-0.98, 0.14, 0.16]}>
        <group ref={body}>
          {/* cork grip */}
          <mesh position={[0, 0.2, 0]}>
            <cylinderGeometry args={[0.05, 0.045, 0.4, 16]} />
            <meshStandardMaterial color="#c4924f" roughness={0.9} />
          </mesh>
          {/* reel seat */}
          <mesh position={[0, 0.4, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 0.1, 12]} />
            <meshStandardMaterial color="#3a3f47" metalness={0.6} roughness={0.4} />
          </mesh>
          {/* reel foot / stem connecting the reel to the rod */}
          <mesh position={[0, 0.42, 0.05]} rotation={[0.5, 0, 0]}>
            <boxGeometry args={[0.03, 0.09, 0.02]} />
            <meshStandardMaterial color="#3a4048" metalness={0.7} roughness={0.4} />
          </mesh>
          {/* reel slung under the rod */}
          <group position={[0, 0.43, 0.1]} rotation={[Math.PI / 2, 0, 0]}>
            {/* housing (static) */}
            <mesh>
              <cylinderGeometry args={[0.088, 0.088, 0.05, 24]} />
              <meshStandardMaterial color="#525a66" metalness={0.78} roughness={0.28} />
            </mesh>
            {/* rotor ring around the spool (spinning-reel look) */}
            <mesh position={[0, 0.028, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.078, 0.008, 10, 22]} />
              <meshStandardMaterial color="#3a4048" metalness={0.8} roughness={0.3} />
            </mesh>
            {/* spinning spool assembly */}
            <group ref={spool}>
              <mesh position={[0, 0.032, 0]}>
                <cylinderGeometry args={[0.095, 0.095, 0.012, 24]} />
                <meshStandardMaterial color="#b3bbc7" metalness={0.85} roughness={0.25} />
              </mesh>
              <mesh position={[0, -0.032, 0]}>
                <cylinderGeometry args={[0.095, 0.095, 0.012, 24]} />
                <meshStandardMaterial color="#b3bbc7" metalness={0.85} roughness={0.25} />
              </mesh>
              {/* wound line — radius animates with line on/off the spool */}
              <mesh ref={lineWrap}>
                <cylinderGeometry args={[0.07, 0.07, 0.052, 24]} />
                <meshStandardMaterial color="#e8dec2" roughness={0.7} metalness={0} />
              </mesh>
            </group>
            {/* crank handle (spins while reeling) */}
            <group ref={reelCrank} position={[0, 0.06, 0]}>
              <mesh position={[0.06, 0, 0]}>
                <boxGeometry args={[0.12, 0.014, 0.014]} />
                <meshStandardMaterial color="#1b1d22" metalness={0.5} roughness={0.5} />
              </mesh>
              <mesh position={[0.12, 0, 0]}>
                <sphereGeometry args={[0.022, 10, 10]} />
                <meshStandardMaterial color="#101216" metalness={0.4} roughness={0.6} />
              </mesh>
            </group>
          </group>

          {/* line exit point off the reel (line origin) */}
          <object3D ref={reelRef} position={[0, 0.5, 0.05]} />

          {/* flexing blank (segment chain) */}
          {chain}
        </group>
      </group>
    </group>
  )
}
