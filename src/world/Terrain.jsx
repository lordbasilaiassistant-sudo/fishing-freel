import { useMemo } from 'react'
import * as THREE from 'three'
import { heightAt } from './terrainHeight.js'

// Lake basin: one displaced plane (see terrainHeight.js) that dips below the
// water plane (y=0) in the middle and rises into banks + hills past the shore.
const SAND = new THREE.Color('#b9a677')
const GRASS = new THREE.Color('#5b7a3a')
const GRASS_DARK = new THREE.Color('#3f5a2b')
const ROCK = new THREE.Color('#6b6453')

export function Terrain() {
  const geom = useMemo(() => {
    const size = 640
    const seg = 150
    const g = new THREE.PlaneGeometry(size, size, seg, seg)
    g.rotateX(-Math.PI / 2)

    const pos = g.attributes.position
    const colors = new Float32Array(pos.count * 3)
    const c = new THREE.Color()

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const z = pos.getZ(i)
      const h = heightAt(x, z)
      pos.setY(i, h)

      // Wet sand at the waterline -> grass -> rock on the peaks.
      if (h < 0.6) {
        c.copy(SAND)
      } else if (h < 7) {
        c.copy(GRASS).lerp(GRASS_DARK, (Math.sin(x * 1.7 + z * 1.3) * 0.5 + 0.5) * 0.4)
      } else {
        c.copy(GRASS).lerp(ROCK, THREE.MathUtils.clamp((h - 7) / 12, 0, 1))
      }
      colors[i * 3] = c.r
      colors[i * 3 + 1] = c.g
      colors[i * 3 + 2] = c.b
    }

    g.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    g.computeVertexNormals()
    return g
  }, [])

  return (
    <mesh geometry={geom} receiveShadow castShadow>
      <meshStandardMaterial vertexColors roughness={0.96} metalness={0} />
    </mesh>
  )
}
