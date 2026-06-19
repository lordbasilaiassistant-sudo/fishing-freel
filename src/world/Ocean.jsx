import { useMemo } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import * as THREE from 'three'
import { Water } from 'three/addons/objects/Water.js'

/**
 * The hero. three.js's battle-tested ocean shader: planar reflections of the
 * sky + terrain, animated normal-map ripples, and physically-placed sun
 * specular glitter that tracks the directional light. Tuned to a lake palette.
 *
 * `sunDirection` is a unit Vector3 shared with the sky + sun light so the
 * glitter lands exactly where the sun is.
 */
export function Ocean({
  sunDirection,
  waterColor = '#2d4a52',
  distortionScale = 2.6,
  waveScale = 3,
  size = 4000,
  polarized = 0, // 0..1 — polarized eyewear cuts surface glare to reveal fish
}) {
  const normals = useLoader(
    THREE.TextureLoader,
    `${import.meta.env.BASE_URL}textures/waternormals.jpg`,
  )

  const water = useMemo(() => {
    normals.wrapS = normals.wrapT = THREE.RepeatWrapping
    const geom = new THREE.PlaneGeometry(size, size)
    const w = new Water(geom, {
      // Reflection target kept tiny: the surface is distorted by the normal
      // map, so detail there is invisible but each frame costs a full scene
      // re-render from the mirror camera.
      textureWidth: 128,
      textureHeight: 128,
      waterNormals: normals,
      sunDirection: new THREE.Vector3(0, 1, 0),
      sunColor: 0xffffff,
      waterColor: new THREE.Color(waterColor).getHex(),
      distortionScale,
      fog: true,
    })
    w.rotation.x = -Math.PI / 2
    w.position.y = 0
    return w
  }, [normals, size])

  // Live-tune color/distortion/wave-density from leva without rebuilding the mesh.
  // Polarized eyewear kills the blinding sun-specular glitter and calms the
  // chop so cruising fish stop hiding behind glare/reflection.
  useMemo(() => {
    const u = water.material.uniforms
    const glareCut = 1 - 0.9 * polarized // dim the sun hotspot
    u.waterColor.value.set(waterColor)
    u.sunColor.value.setRGB(glareCut, glareCut, glareCut)
    u.distortionScale.value = distortionScale * (1 - 0.5 * polarized)
    u.size.value = waveScale // higher = smaller, more detailed ripples
  }, [water, waterColor, distortionScale, waveScale, polarized])

  useFrame((_, dt) => {
    const u = water.material.uniforms
    // Clamp dt so a tab-switch hitch doesn't fast-forward the swell.
    u.time.value += Math.min(dt, 0.05)
    if (sunDirection) u.sunDirection.value.copy(sunDirection).normalize()
  })

  return <primitive object={water} />
}
