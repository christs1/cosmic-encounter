import { useEffect, useState, useRef, useMemo } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import Planets from './Planets'
import Spaceships from './Spaceships'
import { loadTextures } from '../utils/textureLoader'
import { blackHoleShader } from '../shaders/blackHoleShader'
import { eventHorizonShader } from '../shaders/eventHorizonShader'
import { polarConeShader } from '../shaders/polarConeShader'

function BlackHole({ cloudTexture }) {
  const blackHoleRef = useRef()
  const glowRef = useRef()
  const topConeRef = useRef()
  const bottomConeRef = useRef()
  const disksRef = useRef([])
  const lightsRef = useRef([])
  const timeRef = useRef(0)

  // Load accretion disk texture
  const accretionTexture = useMemo(() => {
    const texture = new THREE.TextureLoader().load('/textures/accretiontexture.png')
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    return texture
  }, [])

  useFrame((state, delta) => {
    timeRef.current += delta

    // Update shader uniforms
    if (blackHoleRef.current) {
      blackHoleRef.current.material.uniforms.time.value = timeRef.current
    }
    if (glowRef.current) {
      glowRef.current.material.uniforms.time.value = timeRef.current
    }
    if (topConeRef.current) {
      topConeRef.current.material.uniforms.time.value = timeRef.current
      topConeRef.current.rotation.y += 0.005
    }
    if (bottomConeRef.current) {
      bottomConeRef.current.material.uniforms.time.value = timeRef.current
      bottomConeRef.current.rotation.y -= 0.005
    }

    // Animate outer lights
    lightsRef.current.forEach((light, i) => {
      const angle = timeRef.current * 0.0005 + (i / 4) * Math.PI * 2
      light.position.x = Math.cos(angle) * 5
      light.position.z = Math.sin(angle) * 5
    })

    // Rotate disks
    disksRef.current.forEach((disk, index) => {
      if (disk) {
        disk.rotation.z += 0.0003 * (1 + index * 0.1)
      }
    })
  })

  return (
    <group>
      {/* Black hole core */}
      <mesh ref={blackHoleRef}>
        <sphereGeometry args={[2.5, 64, 64]} />
        <shaderMaterial attach="material" {...blackHoleShader} />
      </mesh>

      {/* Event horizon glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[2.8, 32, 32]} />
        <shaderMaterial attach="material" {...eventHorizonShader} />
      </mesh>

      {/* Polar cones */}
      <mesh ref={topConeRef} position={[0, 10, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[4, 15, 32, 1, true]} />
        <shaderMaterial
          attach="material"
          transparent
          depthWrite={false}
          {...polarConeShader}
          uniforms={{
            ...polarConeShader.uniforms,
            cloudTexture: { value: cloudTexture },
            isTop: { value: 1.0 }
          }}
        />
      </mesh>

      <mesh ref={bottomConeRef} position={[0, -10, 0]}>
        <coneGeometry args={[4, 15, 32, 1, true]} />
        <shaderMaterial
          attach="material"
          transparent
          depthWrite={false}
          {...polarConeShader}
          uniforms={{
            ...polarConeShader.uniforms,
            cloudTexture: { value: cloudTexture },
            isTop: { value: 0.0 }
          }}
        />
      </mesh>

      {/* Accretion disks */}
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh
          key={i}
          ref={el => disksRef.current[i] = el}
          rotation={[Math.PI / 2 + (i * 0.08) - 0.3, 0, 0]}
          scale={1 + i * 0.06}
        >
          <ringGeometry args={[2, 8, 64]} />
          <meshPhongMaterial
            map={accretionTexture}
            emissive={new THREE.Color(0xff6600)}
            emissiveIntensity={0.15}
            side={THREE.DoubleSide}
            transparent
            opacity={0.3}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            shininess={15}
          />
        </mesh>
      ))}

      {/* Lights */}
      <ambientLight intensity={0.1} />
      <pointLight color={0xff9500} intensity={0.4} distance={50} />
      {Array.from({ length: 4 }).map((_, i) => {
        const angle = (i / 4) * Math.PI * 2
        return (
          <pointLight
            key={i}
            ref={el => lightsRef.current[i] = el}
            color={0xff6600}
            intensity={0.15}
            distance={30}
            position={[Math.cos(angle) * 5, 0, Math.sin(angle) * 5]}
          />
        )
      })}
    </group>
  )
}

function createStarPointTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 32
  canvas.height = 32
  const ctx = canvas.getContext('2d')
  
  ctx.beginPath()
  ctx.arc(16, 16, 14, 0, Math.PI * 2)
  ctx.fillStyle = 'white'
  ctx.fill()
  
  const texture = new THREE.Texture(canvas)
  texture.needsUpdate = true
  return texture
}

function Starfield() {
  const starCount = 13000
  const pointTexture = useMemo(() => createStarPointTexture(), [])

  const { positions, colors, sizes } = useMemo(() => {
    const positions = new Float32Array(starCount * 3)
    const colors = new Float32Array(starCount * 3)
    const sizes = new Float32Array(starCount)

    for (let i = 0; i < starCount; i++) {
      const i3 = i * 3
      
      // Position stars with bias towards camera view
      if (i < starCount * 0.3) {
        positions[i3] = (Math.random() - 0.5) * 200
        positions[i3 + 1] = (Math.random() - 0.5) * 200
        positions[i3 + 2] = (Math.random() - 0.5) * 200
      } else {
        positions[i3] = (Math.random() - 0.5) * 2000
        positions[i3 + 1] = (Math.random() - 0.5) * 2000
        positions[i3 + 2] = (Math.random() - 0.5) * 2000
      }

      // Vary star colors between white and slight blue tint
      const colorFactor = Math.random() * 0.2
      const brightness = 0.9
      colors[i3] = brightness
      colors[i3 + 1] = brightness
      colors[i3 + 2] = brightness + colorFactor * brightness

      // Calculate distance-based size with random variation
      const distanceFromCenter = Math.sqrt(
        positions[i3] * positions[i3] +
        positions[i3 + 1] * positions[i3 + 1] +
        positions[i3 + 2] * positions[i3 + 2]
      )
      
      // Random size factor between 0.3 and 1.0
      const randomSizeFactor = 0.3 + Math.random() * 0.7
      
      // Closer stars are slightly larger but still small
      if (distanceFromCenter < 200) {
        sizes[i] = (Math.random() * 0.2 + 0.15) * randomSizeFactor
      } else {
        sizes[i] = (Math.random() * 0.15 + 0.1) * randomSizeFactor
      }
    }

    return { positions, colors, sizes }
  }, [])

  return (
    <points renderOrder={-2000}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={sizes.length}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={{
          pointTexture: { value: pointTexture }
        }}
        vertexShader={`
          attribute float size;
          attribute vec3 color;
          varying vec3 vColor;
          
          void main() {
              vColor = color;
              vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
              gl_Position = projectionMatrix * mvPosition;
              gl_PointSize = size * (300.0 / -mvPosition.z);
          }
        `}
        fragmentShader={`
          uniform sampler2D pointTexture;
          varying vec3 vColor;
          
          void main() {
              vec2 uv = vec2(gl_PointCoord.x, 1.0 - gl_PointCoord.y);
              vec4 tex = texture2D(pointTexture, uv);
              if (tex.r < 0.5) discard;
              gl_FragColor = vec4(vColor, tex.r);
          }
        `}
      />
    </points>
  )
}

function Background({ nebulaTexture }) {
  return (
    <mesh renderOrder={-1500}>
      <sphereGeometry args={[1000, 96, 96]} />
      <meshBasicMaterial
        map={nebulaTexture}
        side={THREE.BackSide}
        transparent={false}
        depthWrite={false}
        color={new THREE.Color(0.65, 0.65, 0.65)}
      />
    </mesh>
  )
}

export default function Scene() {
  const [textures, setTextures] = useState(null)

  useEffect(() => {
    loadTextures().then(setTextures)
  }, [])

  if (!textures) return null

  return (
    <>
      {/* Lights */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />

      {/* Background layers */}
      <Starfield />
      <Background nebulaTexture={textures.nebulaTexture} />

      {/* Game Elements */}
      <BlackHole cloudTexture={textures.cloudTexture} />
      <Planets />
      <Spaceships />
    </>
  )
} 