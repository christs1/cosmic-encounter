import { useEffect, useState, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { loadTextures } from '../utils/textureLoader'

const PLANET_COLORS = {
  RED: new THREE.Color(0xff4444),
  BLUE: new THREE.Color(0x4444ff),
  GREEN: new THREE.Color(0x44ff44),
  YELLOW: new THREE.Color(0xffff44),
}

const ATMOSPHERE_COLORS = {
  RED: new THREE.Color(0xff8888),
  BLUE: new THREE.Color(0x8888ff),
  GREEN: new THREE.Color(0x88ff88),
  YELLOW: new THREE.Color(0xffff88),
}

function Planet({ position, planetColor, atmosphereColor, scale = 0.4, textures }) {
  const cloudRef = useRef()

  useFrame((state, delta) => {
    if (cloudRef.current) {
      cloudRef.current.rotation.y += delta * 0.1
    }
  })

  return (
    <group position={position}>
      {/* Planet */}
      <mesh>
        <sphereGeometry args={[1.575 * scale, 32, 32]} />
        <meshPhongMaterial
          map={textures.earthTexture}
          color={planetColor}
        />
      </mesh>

      {/* Clouds */}
      <mesh ref={cloudRef}>
        <sphereGeometry args={[1.6065 * scale, 32, 32]} />
        <meshPhongMaterial
          map={textures.cloudTexture}
          transparent
          opacity={0.4}
          emissive={planetColor}
          emissiveIntensity={0.2}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Atmosphere */}
      <mesh>
        <sphereGeometry args={[1.7325 * scale, 32, 32]} />
        <meshPhongMaterial
          color={atmosphereColor}
          transparent
          opacity={0.2}
          side={THREE.BackSide}
          emissive={atmosphereColor}
          emissiveIntensity={0.3}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  )
}

export default function PlanetGroups() {
  const [textures, setTextures] = useState(null)

  useEffect(() => {
    loadTextures().then(setTextures)
  }, [])

  if (!textures) return null

  return (
    <>
      {['RED', 'BLUE', 'GREEN', 'YELLOW'].map((color, colorIndex) => {
        const centerAngle = (colorIndex * Math.PI) / 2
        const radius = 20

        return Array.from({ length: 5 }).map((_, i) => {
          const angle = centerAngle - Math.PI / 8 + (i * Math.PI) / 16
          const x = radius * Math.cos(angle)
          const z = radius * Math.sin(angle)
          const position = new THREE.Vector3(x, 0, z)

          return (
            <Planet
              key={`${color}-${i}`}
              position={position}
              planetColor={PLANET_COLORS[color]}
              atmosphereColor={ATMOSPHERE_COLORS[color]}
              scale={0.48}
              textures={textures}
            />
          )
        })
      })}
    </>
  )
} 