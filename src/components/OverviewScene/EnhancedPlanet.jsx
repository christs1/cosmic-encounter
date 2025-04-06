import { useEffect, useState, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'

// Planet color mappings - increase brightness by roughly 3x
const PLANET_COLORS = {
  'red': new THREE.Color(0xff9999),
  'blue': new THREE.Color(0x9999ff),
  'green': new THREE.Color(0x99ff99),
  'yellow': new THREE.Color(0xffff99),
  'magenta': new THREE.Color(0xff99ff),
  'cyan': new THREE.Color(0x99ffff),
}

// Increase atmosphere glow intensity by about 3x
const ATMOSPHERE_COLORS = {
  'red': new THREE.Color(0xffcccc),
  'blue': new THREE.Color(0xccccff),
  'green': new THREE.Color(0xccffcc),
  'yellow': new THREE.Color(0xffffcc),
  'magenta': new THREE.Color(0xffccff),
  'cyan': new THREE.Color(0xccffff),
}

export default function EnhancedPlanet({ position, color, scale = 0.5, textures }) {
  const cloudRef = useRef()
  const planetColor = PLANET_COLORS[color] || new THREE.Color(0xeeeeee);
  const atmosphereColor = ATMOSPHERE_COLORS[color] || new THREE.Color(0xffffff);

  useFrame((state, delta) => {
    if (cloudRef.current) {
      cloudRef.current.rotation.y += delta * 0.1
    }
  })

  // If textures aren't loaded yet, show a simple fallback
  if (!textures || !textures.earthTexture || !textures.cloudTexture) {
    return (
      <mesh position={position}>
        <sphereGeometry args={[scale, 32, 32]} />
        <meshStandardMaterial color={planetColor} emissive={planetColor} emissiveIntensity={0.3} />
      </mesh>
    );
  }

  return (
    <group position={position}>
      {/* Planet */}
      <mesh>
        <sphereGeometry args={[1.575 * scale, 32, 32]} />
        <meshPhongMaterial
          map={textures.earthTexture}
          color={planetColor}
          bumpMap={textures.earthTexture}
          bumpScale={0.05}
          specular={new THREE.Color(0x777777)}
          shininess={15}
          emissive={new THREE.Color(planetColor).multiplyScalar(0.3)}
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Clouds */}
      <mesh ref={cloudRef}>
        <sphereGeometry args={[1.6065 * scale, 32, 32]} />
        <meshPhongMaterial
          map={textures.cloudTexture}
          transparent
          opacity={0.6}
          emissive={planetColor}
          emissiveIntensity={0.6}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Atmosphere */}
      <mesh>
        <sphereGeometry args={[1.7325 * scale, 32, 32]} />
        <meshPhongMaterial
          color={atmosphereColor}
          transparent
          opacity={0.4}
          side={THREE.BackSide}
          emissive={atmosphereColor}
          emissiveIntensity={0.8}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  )
} 