// src/components/OverviewScene/GameBoard.jsx
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Grid } from '@react-three/drei'
import React, { useRef, useMemo, useState, useEffect } from 'react'
import EnhancedPlanet from './EnhancedPlanet'
import EnhancedWarp from './EnhancedWarp'
import EnhancedSpaceship from './EnhancedSpaceship'
import EnhancedStarfield from './EnhancedStarfield'
import EnhancedBackground from './EnhancedBackground'
import { loadTextures } from '../utils/textureLoader'

// Cyan grid component
function CyanGrid() {
  return (
    <Grid
      cellSize={2}
      cellThickness={0.3}
      cellColor="#00ffff"
      sectionSize={10}
      sectionThickness={0.5}
      sectionColor="#008080"
      fadeDistance={80}
      fadeStrength={1}
      infiniteGrid
      position={[0, -5, 0]}
    />
  )
}

// Custom camera controls with constraints
function ConstrainedControls({ radius }) {
  const controlsRef = useRef()
  
  // The maximum distance should be enough to see all planets
  const maxDistance = radius * 2.5
  
  // The minimum distance should allow seeing a group of planets clearly
  const minDistance = radius * 0.5
  
  // Limit vertical rotation to keep the view focused on the game plane
  const minPolarAngle = Math.PI * 0.1 // Slightly above the horizontal plane
  const maxPolarAngle = Math.PI * 0.5 // Maximum 90 degrees (looking straight down)
  
  return (
    <OrbitControls
      ref={controlsRef}
      enableZoom={true}
      minDistance={minDistance}
      maxDistance={maxDistance}
      minPolarAngle={minPolarAngle}
      maxPolarAngle={maxPolarAngle}
      enableDamping={true}
      dampingFactor={0.05}
      rotateSpeed={0.7}
      zoomSpeed={1.0}
      enablePan={false} // Disable panning to keep center focused
      makeDefault
    />
  )
}

// Main scene component that loads textures and renders all game objects
function GameScene() {
  const [textures, setTextures] = useState(null)
  const [loadingTextures, setLoadingTextures] = useState(true)
  const totalPlayers = 6
  const planetsPerPlayer = 5
  const radius = 12  // Radius of the main circle around the warp

  const players = [
    'red', 'blue', 'yellow', 'green', 'magenta', 'cyan'
  ]

  // Load textures
  useEffect(() => {
    setLoadingTextures(true);
    loadTextures().then(loadedTextures => {
      console.log("Textures loaded for game scene", loadedTextures);
      setTextures(loadedTextures);
      setLoadingTextures(false);
    }).catch(error => {
      console.error("Error loading textures:", error);
      setLoadingTextures(false);
    });
  }, []);

  // Function to get circular positions
  const planetPositions = useMemo(() => {
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
          color: players[p],
          id: `${players[p]}-${i}`
        })
      }
    }
    
    return allPositions
  }, [])

  // Create positions for ships (4 per planet)
  const shipPositions = useMemo(() => {
    if (!planetPositions) return [];
    
    const ships = [];
    planetPositions.forEach((planet, planetIndex) => {
      // Place 4 ships per planet
      for (let i = 0; i < 4; i++) {
        ships.push({
          color: planet.color,
          planetPosition: planet.position,
          shipIndex: i,
          id: `${planet.id}-ship-${i}`
        });
      }
    });
    
    return ships;
  }, [planetPositions]);

  useEffect(() => {
    console.log("Ship positions:", shipPositions.length); 
  }, [shipPositions]);

  return (
    <>
      {/* Starfield and Background */}
      <EnhancedStarfield />
      <EnhancedBackground textures={textures} />
      
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      
      {/* Enhanced Warp (Black Hole) */}
      <EnhancedWarp textures={textures} scale={0.6} />
      
      {/* Grid */}
      <CyanGrid />
      
      {/* Planets */}
      {planetPositions.map((planet) => (
        <EnhancedPlanet
          key={planet.id}
          position={planet.position}
          color={planet.color}
          textures={textures}
          scale={0.4}
        />
      ))}
      
      {/* Ships - Debug output if ships aren't rendering */}
      {console.log("Rendering ships:", shipPositions.length)}
      {shipPositions.map((ship) => (
        <EnhancedSpaceship
          key={ship.id}
          position={[0, 0, 0]} // Provide initial position
          color={ship.color}
          textures={textures}
          planetPosition={ship.planetPosition}
          shipIndex={ship.shipIndex}
        />
      ))}
    </>
  )
}

export default function GameBoard() {
  return (
    <Canvas 
      camera={{ position: [0, 15, 20], fov: 60 }}
      gl={{ antialias: true, logarithmicDepthBuffer: true }}
      dpr={[1, 2]} // Responsive DPR based on device capability
      style={{ background: '#000000' }}
    >
      <GameScene />
      <ConstrainedControls radius={12} />
    </Canvas>
  )
}
