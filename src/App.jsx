import { Suspense, useMemo, useRef, useEffect } from 'react'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { Sky, Stats, Loader, AdaptiveDpr, PerformanceMonitor } from '@react-three/drei'
import {
  EffectComposer,
  Bloom,
  Vignette,
  ToneMapping,
  SMAA,
} from '@react-three/postprocessing'
import { ToneMappingMode } from 'postprocessing'
import { useControls, Leva } from 'leva'
import * as THREE from 'three'
import { useGame } from './state/useGame.js'
import { clock, advanceClock, computeSun, dayFactor, worldSun } from './sim/clock.js'
import { Ocean } from './world/Ocean.jsx'
import { Terrain } from './world/Terrain.jsx'
import { Dock } from './world/Dock.jsx'
import { Player } from './player/Player.jsx'
import { FishingRod } from './player/FishingRod.jsx'
import { CastingSystem } from './fishing/CastingSystem.jsx'
import { Bobber } from './fishing/Bobber.jsx'
import { FishSchool } from './fishing/FishSchool.jsx'
import { SplashFX } from './fishing/SplashFX.jsx'
import { Hud } from './ui/Hud.jsx'
import { Bench } from './ui/Bench.jsx'
import { Settings } from './ui/Settings.jsx'
import { MapPanel } from './ui/MapPanel.jsx'
import { AnglerLog } from './ui/AnglerLog.jsx'

export default function App() {
  return (
    <>
      <Canvas
        shadows
        dpr={[0.6, 1]}
        performance={{ min: 0.5 }}
        gl={{ antialias: false, powerPreference: 'high-performance' }}
        camera={{ position: [0, 2.4, 70], fov: 55, near: 0.1, far: 4000 }}
      >
        <Scene />
      </Canvas>
      <Hud />
      <Bench />
      <Settings />
      <MapPanel />
      <AnglerLog />
      <PolarizedTint />
      {/* dev-only tuning panel, hidden from players (flip to false to tune) */}
      <Leva hidden />
      <Loader />
    </>
  )
}

// Subtle full-screen lens tint while polarized eyewear is equipped — sells the
// "shades on" read and lifts perceived contrast without washing out the scene.
// Strongest at the top of the frame, where sky glare lives.
function PolarizedTint() {
  const polarized = useGame((s) => s.tackle.polarized || 0)
  if (polarized <= 0) return null
  return (
    <div
      aria-hidden
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 5,
        background:
          'linear-gradient(to bottom, rgba(28,38,46,0.22), rgba(28,38,46,0.05) 45%, rgba(20,30,28,0.10))',
        opacity: Math.min(1, 0.35 + polarized * 0.65),
      }}
    />
  )
}

// Sets the camera's (vertical) FOV from settings.fov treated as a HORIZONTAL
// target, recomputed on resize — a wide 90° default reads far less cramped.
function FovRig() {
  const camera = useThree((s) => s.camera)
  const size = useThree((s) => s.size)
  const fovH = useGame((s) => s.settings.fov)
  useEffect(() => {
    const aspect = size.width / Math.max(1, size.height)
    const vFov = (2 * Math.atan(Math.tan((fovH * Math.PI) / 360) / aspect) * 180) / Math.PI
    camera.fov = THREE.MathUtils.clamp(vFov, 40, 100)
    camera.updateProjectionMatrix()
  }, [camera, size.width, size.height, fovH])
  return null
}

// Day/night driver: advances the clock and updates the sun light, sky dome,
// hemisphere fill, fog, and background so the lake has a living daily rhythm.
const _dayCol = new THREE.Color('#fff4e2')
const _duskCol = new THREE.Color('#ff8a4a')
const _nightCol = new THREE.Color('#46598a')
const _skyDay = new THREE.Color('#bcd3e0')
const _skyNight = new THREE.Color('#0c1530')

function TimeSystem({ sunLight, skyRef, hemiRef }) {
  const scene = useThree((s) => s.scene)
  useFrame((_, dtRaw) => {
    advanceClock(Math.min(dtRaw, 0.05))
    const t = clock.t
    computeSun(t, worldSun)
    const day = dayFactor(t) // 0 night .. 1 noon
    const lowSun = THREE.MathUtils.clamp(worldSun.y * 3, 0, 1)

    if (sunLight.current) {
      const yPos = Math.max(worldSun.y, 0.12) // never light from below
      sunLight.current.position.set(worldSun.x * 140, yPos * 140, worldSun.z * 140)
      sunLight.current.intensity = 0.06 + day * 3.1
      if (worldSun.y > 0) sunLight.current.color.copy(_duskCol).lerp(_dayCol, lowSun)
      else sunLight.current.color.copy(_nightCol)
    }
    const sky = skyRef.current
    if (sky && sky.material && sky.material.uniforms && sky.material.uniforms.sunPosition) {
      sky.material.uniforms.sunPosition.value.copy(worldSun)
    }
    if (hemiRef.current) hemiRef.current.intensity = 0.16 + day * 0.5
    const skyMix = 0.12 + day * 0.88
    if (scene.fog) scene.fog.color.copy(_skyNight).lerp(_skyDay, skyMix)
    if (scene.background && scene.background.copy) scene.background.copy(_skyNight).lerp(_skyDay, skyMix)
  })
  return null
}

function Scene() {
  const tipRef = useRef()
  const reelRef = useRef()
  const guideRefs = useRef([]) // line-guide ring centers, butt→tip (filled by FishingRod)

  const sunLight = useRef()
  const skyRef = useRef()
  const hemiRef = useRef()

  const polarized = useGame((s) => s.tackle.polarized || 0) // equipped sunglasses/brim

  const { waterColor, distortion, waveScale } = useControls('Water', {
    waterColor: '#1f4a55',
    distortion: { value: 3.2, min: 0, max: 8, step: 0.1 },
    waveScale: { value: 3, min: 0.5, max: 8, step: 0.1 },
  })
  const { bloom, fogDensity } = useControls('Look', {
    bloom: { value: 0.8, min: 0, max: 3, step: 0.01 },
    fogDensity: { value: 0.0012, min: 0, max: 0.01, step: 0.0001 },
  })

  return (
    <>
      <color attach="background" args={['#bcd3e0']} />
      <fogExp2 attach="fog" args={['#cdd9e0', fogDensity]} />

      <Sky
        ref={skyRef}
        sunPosition={[worldSun.x, worldSun.y, worldSun.z]}
        turbidity={5}
        rayleigh={2.4}
        mieCoefficient={0.005}
        mieDirectionalG={0.86}
        distance={3000}
      />

      <hemisphereLight ref={hemiRef} args={['#bcd6ff', '#3a4a32', 0.5]} />
      <directionalLight
        ref={sunLight}
        position={[worldSun.x * 140, worldSun.y * 140, worldSun.z * 140]}
        intensity={3}
        color="#fff4e2"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-near={1}
        shadow-camera-far={240}
        shadow-camera-left={-60}
        shadow-camera-right={60}
        shadow-camera-top={60}
        shadow-camera-bottom={-60}
        shadow-bias={-0.0005}
      />
      <TimeSystem sunLight={sunLight} skyRef={skyRef} hemiRef={hemiRef} />

      <Suspense fallback={null}>
        <Ocean
          sunDirection={worldSun}
          waterColor={waterColor}
          distortionScale={distortion}
          waveScale={waveScale}
          polarized={polarized}
        />
        <Terrain />
        <Dock />
      </Suspense>

      <Player start={[0, 72]} />
      <FovRig />
      <FishingRod tipRef={tipRef} reelRef={reelRef} guideRefs={guideRefs} />
      <CastingSystem tipRef={tipRef} />
      <Bobber tipRef={tipRef} reelRef={reelRef} guideRefs={guideRefs} />
      <FishSchool />
      <SplashFX />

      <EffectComposer multisampling={0} disableNormalPass>
        <Bloom
          mipmapBlur
          intensity={bloom}
          luminanceThreshold={0.78}
          luminanceSmoothing={0.25}
        />
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      </EffectComposer>

      {/* auto-scale render resolution to hold framerate on integrated GPUs */}
      <PerformanceMonitor />
      <AdaptiveDpr pixelated />

      <Stats />
    </>
  )
}
