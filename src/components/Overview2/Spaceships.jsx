import { useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { useLoader } from '@react-three/fiber'

const SHIP_COLORS = {
  RED: new THREE.Color(0xff4444),
  BLUE: new THREE.Color(0x4444ff),
  GREEN: new THREE.Color(0x44ff44),
  YELLOW: new THREE.Color(0xffff44),
}

function Spaceship({ color, planetIndex, planetAngle, shipIndex }) {
  const shipRef = useRef()
  const orbitRef = useRef({
    angle: (shipIndex * Math.PI * 2) / 4, // Evenly space 4 ships around each planet
    radius: 3, // Orbit radius
  })

  // Load the saucer texture
  const texture = useLoader(THREE.TextureLoader, '/textures/saucertexture.png')
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(1, 1)

  useFrame((state, delta) => {
    const orbit = orbitRef.current
    const planetRadius = 20

    // Calculate planet position
    const planetX = planetRadius * Math.cos(planetAngle)
    const planetZ = planetRadius * Math.sin(planetAngle)

    // Update ship orbit angle
    orbit.angle += delta * 0.5

    // Calculate vertical circular orbit relative to planet center
    const orbitY = orbit.radius * Math.sin(orbit.angle)
    const orbitForward = orbit.radius * Math.cos(orbit.angle)
    
    // Calculate the forward direction vector from planet center
    const forwardX = Math.cos(planetAngle)
    const forwardZ = Math.sin(planetAngle)
    
    // Calculate final position by moving forward/backward along planet's radius direction
    const finalX = planetX + (orbitForward * forwardX)
    const finalZ = planetZ + (orbitForward * forwardZ)

    if (shipRef.current) {
      // Position relative to planet
      shipRef.current.position.set(
        finalX,
        orbitY,
        finalZ
      )

      // Calculate ship orientation to follow vertical orbit
      const tangentY = orbit.radius * Math.cos(orbit.angle)
      const tangentForward = -orbit.radius * Math.sin(orbit.angle)
      
      // Create rotation matrix for proper orientation
      const direction = new THREE.Vector3(
        tangentForward * forwardX,
        tangentY,
        tangentForward * forwardZ
      ).normalize()
      
      const matrix = new THREE.Matrix4()
      const quaternion = new THREE.Quaternion()
      
      // Make ships face their direction of travel
      quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), direction)
      matrix.makeRotationFromQuaternion(quaternion)
      shipRef.current.setRotationFromMatrix(matrix)
    }
  })

  return (
    <group ref={shipRef}>
      {/* Main saucer body */}
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.5, 0.45, 0.08, 32]} />
        <meshPhongMaterial 
          map={texture}
          color={color} 
          shininess={100}
        />
      </mesh>

      {/* Top dome (glass) */}
      <mesh position={[0, 0.12, 0]}>
        <sphereGeometry args={[0.2, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transparent
          opacity={0.4}
          metalness={0.1}
          roughness={0.4}
          transmission={0.6}
          thickness={0.2}
          envMapIntensity={0.5}
          clearcoat={0.5}
          clearcoatRoughness={0.4}
          attenuationColor={new THREE.Color(0xffffff)}
          attenuationDistance={0.5}
        />
      </mesh>

      {/* Bottom dome */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.15, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
        <meshPhongMaterial 
          map={texture}
          color={color} 
          opacity={0.9}
          transparent 
          shininess={100} 
        />
      </mesh>

      {/* Glow ring */}
      <mesh position={[0, 0.04, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.48, 0.02, 16, 32]} />
        <meshPhongMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* Bottom rim detail */}
      <mesh position={[0, 0.01, 0]}>
        <cylinderGeometry args={[0.47, 0.43, 0.02, 32]} />
        <meshPhongMaterial 
          map={texture}
          color={color} 
          shininess={100}
        />
      </mesh>
    </group>
  )
}

export default function Spaceships() {
  return (
    <>
      {['RED', 'BLUE', 'GREEN', 'YELLOW'].map((color, colorIndex) => {
        const centerAngle = (colorIndex * Math.PI) / 2

        return Array.from({ length: 5 }).map((_, planetIndex) => {
          const planetAngle = centerAngle - Math.PI / 8 + (planetIndex * Math.PI) / 16

          return Array.from({ length: 4 }).map((_, shipIndex) => (
            <Spaceship
              key={`${color}-${planetIndex}-${shipIndex}`}
              color={color}
              planetIndex={planetIndex}
              planetAngle={planetAngle}
              shipIndex={shipIndex}
            />
          ))
        })
      })}
    </>
  )
} 