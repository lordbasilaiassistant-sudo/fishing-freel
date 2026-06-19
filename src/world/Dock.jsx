import { useMemo } from 'react'

/**
 * A simple procedural wooden dock jutting from the +Z shore out over the water.
 * The player stands near the water end (~z=70). Deck top sits at y=0.6, posts
 * drop into the lake. Replaced later with a CC0 model, but this reads clean.
 */
export function Dock() {
  const planks = useMemo(() => {
    const arr = []
    const zStart = 84 // on the shore
    const zEnd = 63 // out over the water
    const len = 1.0
    const gap = 0.07
    for (let z = zEnd; z <= zStart; z += len + gap) arr.push(z)
    return arr
  }, [])

  const posts = useMemo(
    () => [
      [-2.3, 64], [2.3, 64],
      [-2.3, 71], [2.3, 71],
      [-2.3, 78], [2.3, 78],
      [-2.3, 84], [2.3, 84],
    ],
    [],
  )

  return (
    <group>
      {planks.map((z, i) => (
        <mesh key={i} position={[0, 0.6, z]} castShadow receiveShadow>
          <boxGeometry args={[5, 0.14, 1.0]} />
          <meshStandardMaterial
            color={i % 2 ? '#6f5638' : '#785c3b'}
            roughness={0.88}
            metalness={0}
          />
        </mesh>
      ))}

      {/* side stringers */}
      {[-2.45, 2.45].map((x, i) => (
        <mesh key={'s' + i} position={[x, 0.45, 73.5]} castShadow receiveShadow>
          <boxGeometry args={[0.18, 0.3, 22]} />
          <meshStandardMaterial color="#5b462d" roughness={0.9} />
        </mesh>
      ))}

      {/* support posts into the water */}
      {posts.map(([x, z], i) => (
        <mesh key={'p' + i} position={[x, -1.4, z]} castShadow>
          <cylinderGeometry args={[0.17, 0.2, 4, 8]} />
          <meshStandardMaterial color="#46371f" roughness={0.95} />
        </mesh>
      ))}
    </group>
  )
}
