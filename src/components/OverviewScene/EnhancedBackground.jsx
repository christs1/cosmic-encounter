import * as THREE from 'three'

export default function EnhancedBackground({ textures }) {
  // If nebula texture is not available, use a dark blue color
  const fallbackColor = new THREE.Color(0x050a15)

  return (
    <mesh renderOrder={-1500}>
      <sphereGeometry args={[1000, 96, 96]} />
      <meshBasicMaterial
        map={textures?.nebulaTexture}
        side={THREE.BackSide}
        transparent={false}
        depthWrite={false}
        color={textures?.nebulaTexture ? new THREE.Color(0x7a7a7a) : fallbackColor}
      />
    </mesh>
  )
} 