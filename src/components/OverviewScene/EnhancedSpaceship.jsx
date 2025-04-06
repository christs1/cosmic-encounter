import { useRef, useEffect } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'

// Spaceship color mappings
const SHIP_COLORS = {
  'red': new THREE.Color(0xff9999),
  'blue': new THREE.Color(0x9999ff),
  'green': new THREE.Color(0x99ff99),
  'yellow': new THREE.Color(0xffff99),
  'magenta': new THREE.Color(0xff99ff),
  'cyan': new THREE.Color(0x99ffff),
}

export default function EnhancedSpaceship({ position, color, textures, planetPosition, shipIndex = 0 }) {
  const shipRef = useRef()
  const orbitRef = useRef({
    angle: (shipIndex * Math.PI * 2) / 4, // Evenly space ships around each planet
    radius: 2, // Reduce radius slightly
  })
  
  const shipColor = SHIP_COLORS[color] || new THREE.Color(0xeeeeee);
  
  // Debug initialization
  useEffect(() => {
    console.log(`Ship created - Color: ${color}, Planet position: ${planetPosition}`);
  }, []);

  useFrame((state, delta) => {
    if (!shipRef.current) return;
    
    const orbit = orbitRef.current;
    
    // Update ship orbit angle
    orbit.angle += delta * 0.5;
    
    // For ships not attached to planets, just rotate them in place
    if (!planetPosition) {
      shipRef.current.position.set(position[0], position[1], position[2]);
      shipRef.current.rotation.y += delta * 0.2;
      return;
    }
    
    try {
      // Calculate vertical circular orbit relative to planet center
      const orbitY = orbit.radius * Math.sin(orbit.angle);
      const orbitForward = orbit.radius * Math.cos(orbit.angle);

      // Using a simplified orbit calculation
      const planetPos = new THREE.Vector3(
        planetPosition[0],
        planetPosition[1],
        planetPosition[2]
      );
      
      // Calculate position on orbit - simplified approach
      const angleFromCenter = Math.atan2(planetPos.z, planetPos.x);
      const orbitX = planetPos.x + Math.cos(angleFromCenter + orbit.angle) * orbit.radius;
      const orbitZ = planetPos.z + Math.sin(angleFromCenter + orbit.angle) * orbit.radius;
      
      // Update ship position - keep ships slightly above planets
      shipRef.current.position.set(orbitX, orbitY + 1.0, orbitZ);
      
      // Make ship face toward planet
      shipRef.current.lookAt(planetPos);
      
      // Add slight tilt based on orbit position
      shipRef.current.rotation.x += 0.2 * Math.sin(orbit.angle);
    } catch (error) {
      console.error("Error in ship orbit calculation:", error);
    }
  });

  // If textures aren't loaded yet, show a simple fallback
  if (!textures || !textures.saucerTexture) {
    return (
      <mesh position={position} ref={shipRef}>
        <boxGeometry args={[0.5, 0.15, 0.5]} />
        <meshStandardMaterial color={shipColor} emissive={shipColor} emissiveIntensity={0.5} />
      </mesh>
    );
  }

  return (
    <group ref={shipRef} position={position}>
      {/* Main saucer body */}
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.5, 0.45, 0.08, 32]} />
        <meshPhongMaterial 
          map={textures.saucerTexture}
          color={shipColor} 
          shininess={100}
          emissive={shipColor.clone().multiplyScalar(0.5)}
          emissiveIntensity={0.3}
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
          map={textures.saucerTexture}
          color={shipColor} 
          opacity={0.9}
          transparent 
          shininess={100} 
        />
      </mesh>

      {/* Glow ring */}
      <mesh position={[0, 0.04, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.48, 0.02, 16, 32]} />
        <meshPhongMaterial
          color={shipColor}
          emissive={shipColor}
          emissiveIntensity={0.7}
          transparent
          opacity={0.7}
        />
      </mesh>
    </group>
  );
} 