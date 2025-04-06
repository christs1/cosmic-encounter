import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useLoader } from '@react-three/fiber'

const PLANET_COLORS = {
  RED: new THREE.Color(0xff4444),
  BLUE: new THREE.Color(0x4444ff),
  GREEN: new THREE.Color(0x44ff44),
  YELLOW: new THREE.Color(0xffff44),
}

function Planet({ color, angle }) {
  const planetRef = useRef()
  const cloudRef = useRef()
  const radius = 20 // Match the radius used in Spaceships component

  // Load textures
  const earthTexture = useLoader(THREE.TextureLoader, '/textures/earth.jpg')
  const cloudTexture = useLoader(THREE.TextureLoader, '/textures/clouds.png')

  useFrame((state, delta) => {
    if (planetRef.current) {
      // Calculate planet position
      const x = radius * Math.cos(angle)
      const z = radius * Math.sin(angle)
      planetRef.current.position.set(x, 0, z)

      // Slow rotation
      planetRef.current.rotation.y += delta * 0.1
    }

    if (cloudRef.current) {
      // Rotate clouds slightly faster than planet
      cloudRef.current.rotation.y += delta * 0.15
    }
  })

  return (
    <group ref={planetRef}>
      {/* Planet body */}
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[1, 64, 64]} />
        <meshPhongMaterial
          map={earthTexture}
          bumpMap={earthTexture}
          bumpScale={0.1}
          specularMap={earthTexture}
          specular={new THREE.Color(0x666666)}
          shininess={10}
          color={PLANET_COLORS[color]}
        />
      </mesh>

      {/* Cloud layer */}
      <mesh ref={cloudRef}>
        <sphereGeometry args={[1.05, 64, 64]} />
        <meshPhongMaterial
          map={cloudTexture}
          transparent
          opacity={0.4}
          depthWrite={false}
          side={THREE.DoubleSide}
          color={PLANET_COLORS[color]}
        />
      </mesh>

      {/* Atmosphere glow */}
      <mesh>
        <sphereGeometry args={[1.2, 32, 32]} />
        <meshPhongMaterial
          color={PLANET_COLORS[color]}
          transparent
          opacity={0.1}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  )
}

export default function Planets() {
  return (
    <>
      {['RED', 'BLUE', 'GREEN', 'YELLOW'].map((color, colorIndex) => {
        const centerAngle = (colorIndex * Math.PI) / 2

        return Array.from({ length: 5 }).map((_, planetIndex) => {
          const planetAngle = centerAngle - Math.PI / 8 + (planetIndex * Math.PI) / 16

          return (
            <Planet
              key={`${color}-${planetIndex}`}
              color={color}
              angle={planetAngle}
            />
          )
        })
      })}
    </>
  )
} 