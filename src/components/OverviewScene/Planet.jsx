// src/components/OverviewScene/Planet.jsx
export default function Planet({ position, color }) {
    return (
      <mesh position={position}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color={color} />
      </mesh>
    )
  }
  