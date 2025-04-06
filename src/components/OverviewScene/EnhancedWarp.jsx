import { useEffect, useState, useRef, useMemo } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { blackHoleShader } from '../../shaders/blackHoleShader'
import { eventHorizonShader } from '../../shaders/eventHorizonShader'
import { polarConeShader } from '../../shaders/polarConeShader'

export default function EnhancedWarp({ textures, scale = 1 }) {
  const blackHoleRef = useRef()
  const glowRef = useRef()
  const topConeRef = useRef()
  const bottomConeRef = useRef()
  const disksRef = useRef([])
  const lightsRef = useRef([])
  const timeRef = useRef(0)

  // Create a fallback texture if needed
  const fallbackTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = 32
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, 32, 32)
    const texture = new THREE.CanvasTexture(canvas)
    return texture
  }, [])

  const accretionTexture = useMemo(() => {
    if (textures && textures.accretionTexture) {
      return textures.accretionTexture
    }
    
    // Create a fallback texture
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = 64
    const ctx = canvas.getContext('2d')
    
    // Create concentric rings
    for (let i = 0; i < 32; i++) {
      const radius = i * 2
      ctx.beginPath()
      ctx.arc(32, 32, radius, 0, Math.PI * 2)
      ctx.strokeStyle = i % 2 ? 'rgba(255,100,0,0.5)' : 'rgba(255,200,0,0.3)'
      ctx.lineWidth = 1.5
      ctx.stroke()
    }
    
    const texture = new THREE.CanvasTexture(canvas)
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping
    return texture
  }, [textures])

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
      if (light) {
        const angle = timeRef.current * 0.0005 + (i / 4) * Math.PI * 2
        light.position.x = Math.cos(angle) * 5 * scale
        light.position.z = Math.sin(angle) * 5 * scale
      }
    })

    // Rotate disks
    disksRef.current.forEach((disk, index) => {
      if (disk) {
        disk.rotation.z += 0.0003 * (1 + index * 0.1)
      }
    })
  })
  
  // Adjust cone size based on scale
  const coneHeight = 15 * scale
  const coneRadius = 4 * scale

  // If textures aren't loaded yet, show a simple fallback
  if (!textures || (!textures.cloudTexture && !fallbackTexture)) {
    return (
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[1.5 * scale, 32, 32]} />
        <meshStandardMaterial color="yellow" />
      </mesh>
    );
  }

  // Use either the loaded texture or fallback
  const cloudTexture = textures?.cloudTexture || fallbackTexture

  // Create a modified version of the shaders with fixed rendering settings
  const modifiedBlackHoleShader = {
    ...blackHoleShader,
    transparent: true,
    depthWrite: true, // Enable depth write to fix z-fighting
    side: THREE.FrontSide,
    blending: THREE.AdditiveBlending
  };

  const modifiedEventHorizonShader = {
    ...eventHorizonShader,
    transparent: true,
    depthWrite: false, 
    side: THREE.FrontSide,
    blending: THREE.AdditiveBlending
  };

  return (
    <group>
      {/* Black hole core */}
      <mesh ref={blackHoleRef}>
        <sphereGeometry args={[2.5 * scale, 64, 64]} />
        <shaderMaterial attach="material" {...modifiedBlackHoleShader} />
      </mesh>

      {/* Event horizon glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[2.8 * scale, 32, 32]} />
        <shaderMaterial attach="material" {...modifiedEventHorizonShader} />
      </mesh>

      {/* Polar cones */}
      <mesh ref={topConeRef} position={[0, 10 * scale, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[coneRadius, coneHeight, 32, 1, true]} />
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

      <mesh ref={bottomConeRef} position={[0, -10 * scale, 0]}>
        <coneGeometry args={[coneRadius, coneHeight, 32, 1, true]} />
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
          <ringGeometry args={[2 * scale, 8 * scale, 64]} />
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
      <pointLight color={0xff9500} intensity={0.4} distance={50 * scale} />
      {Array.from({ length: 4 }).map((_, i) => {
        const angle = (i / 4) * Math.PI * 2
        return (
          <pointLight
            key={i}
            ref={el => lightsRef.current[i] = el}
            color={0xff6600}
            intensity={0.15}
            distance={30 * scale}
            position={[Math.cos(angle) * 5 * scale, 0, Math.sin(angle) * 5 * scale]}
          />
        )
      })}
    </group>
  )
} 