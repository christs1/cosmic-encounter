import { useMemo } from 'react'
import * as THREE from 'three'
import { createStarPointTexture } from '../utils/textureLoader'

export default function EnhancedStarfield() {
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