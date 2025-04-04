// src/components/OverviewScene/GameBoard.jsx
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import Planet from './Planet'
import Warp from './Warp'
import React, { useRef, useMemo } from 'react'
import HUD from '../HUD/HUD'

// Starfield component for the background
function Starfield() {
  const starsRef = useRef()
  
  useFrame(({ clock }) => {
    if (starsRef.current) {
      // Slow rotation of the starfield for a dynamic effect
      starsRef.current.rotation.y = clock.getElapsedTime() * 0.02
    }
  })
  
  return (
    <Stars 
      ref={starsRef}
      radius={100} 
      depth={50} 
      count={5000} 
      factor={4} 
      saturation={0} 
      fade 
      speed={1}
    />
  )
}

// Individual star with custom geometry for the foreground
function ForegroundStar({ position, size, color, twinkleSpeed, movementSpeed, movementRadius }) {
  const meshRef = useRef()
  const initialPosition = useRef(position)
  
  useFrame(({ clock }) => {
    if (meshRef.current) {
      const time = clock.getElapsedTime()
      
      // Make the star twinkle by slightly adjusting its scale
      const twinkle = 0.7 + Math.sin(time * twinkleSpeed) * 0.3
      meshRef.current.scale.set(twinkle, twinkle, twinkle)
      
      // Make the star float around in a small, random path
      const [x0, y0, z0] = initialPosition.current
      
      // Create a unique, random-looking movement pattern for each star
      // Using sin and cos with different frequencies and phase offsets
      const xOffset = Math.sin(time * movementSpeed) * movementRadius
      const yOffset = Math.cos(time * movementSpeed * 0.8 + 1.0) * movementRadius
      const zOffset = Math.sin(time * movementSpeed * 0.6 + 2.0) * movementRadius
      
      meshRef.current.position.set(
        x0 + xOffset,
        y0 + yOffset,
        z0 + zOffset
      )
    }
  })
  
  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[size, 8, 8]} />
      <meshBasicMaterial color={color} />
    </mesh>
  )
}

// Component to generate a layer of foreground stars
function ForegroundStars({ count = 100, minDist = 5, maxDist = 20 }) {
  // Generate random star positions in a 3D space
  const stars = useMemo(() => {
    return Array.from({ length: count }).map(() => {
      // Create random position in a sphere around the scene
      const theta = Math.random() * Math.PI * 2 // full circle
      const phi = Math.acos(2 * Math.random() - 1) // for even distribution on sphere
      const distance = minDist + Math.random() * (maxDist - minDist)
      const x = distance * Math.sin(phi) * Math.cos(theta)
      const y = distance * Math.sin(phi) * Math.sin(theta)
      const z = distance * Math.cos(phi)
      
      return {
        position: [x, y, z],
        size: 0.01 + Math.random() * 0.03, // smaller star sizes
        color: Math.random() > 0.9 ? 
               ['#f8e3a3', '#f0c7e8', '#a3ccf8'][Math.floor(Math.random() * 3)] : // some colored stars
               '#ffffff', // most stars are white
        twinkleSpeed: 0.5 + Math.random() * 2, // random twinkle speed
        movementSpeed: 0.1 + Math.random() * 0.2, // random movement speed
        movementRadius: 0.2 + Math.random() * 0.8 // random movement radius
      }
    })
  }, [count, minDist, maxDist])
  
  return (
    <group>
      {stars.map((props, i) => (
        <ForegroundStar key={i} {...props} />
      ))}
    </group>
  )
}

export default function GameBoard() {
  const totalPlayers = 6
  const planetsPerPlayer = 5
  const radius = 12  // Increased radius of the main circle around the warp

  const players = [
    'red', 'blue', 'yellow', 'green', 'magenta', 'cyan'
  ]

  // Function to get circular positions
  const generatePlanetPositions = () => {
    const allPositions = []
    
    // The angle span for each player's territory
    const playerAngleSpan = (2 * Math.PI) / totalPlayers
    
    for (let p = 0; p < totalPlayers; p++) {
      // Starting angle for this player's segment
      const startAngle = p * playerAngleSpan
      
      // For each player, create planets along the same circle but in an arc
      for (let i = 0; i < planetsPerPlayer; i++) {
        // Use a smaller portion of the player's segment for planets (40%)
        // This clusters the planets of the same color closer together
        const arcFraction = 0.4
        
        // Leave larger gaps between different colored planet groups (60% of span is gap)
        
        // Map planet index to a position along the arc
        const t = i / (planetsPerPlayer - 1)  // t goes from 0 to 1
        
        // Calculate the center point of this player's arc
        const midAngle = startAngle + (playerAngleSpan / 2)
        
        // Calculate the angle for this planet - centered around the midpoint of the player's segment
        const angle = midAngle + (playerAngleSpan * arcFraction * (t - 0.5))
        
        // Calculate position on the main circle
        const x = radius * Math.cos(angle)
        const z = radius * Math.sin(angle)
        
        allPositions.push({
          position: [x, 0, z],
          color: players[p]
        })
      }
    }
    return allPositions
  }

  const planetPositions = generatePlanetPositions()

  return (
    <div className="h-screen relative">
      <Canvas camera={{ position: [0, 15, 15], fov: 60 }}>
        {/* Starfield background */}
        <Starfield />
        
        {/* Scene lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 10, 5]} intensity={0.6} />
        
        {/* Warp and planets */}
        <Warp />
        {planetPositions.map((planet, i) => (
          <Planet key={i} position={planet.position} color={planet.color} />
        ))}
        
        {/* Foreground stars with custom geometry */}
        <ForegroundStars count={150} minDist={3} maxDist={20} />
        
        {/* Controls */}
        <OrbitControls enableZoom={true} minDistance={5} maxDistance={40} />
      </Canvas>
      
      {/* HUD overlay */}
      <HUD />
    </div>
  )
}
