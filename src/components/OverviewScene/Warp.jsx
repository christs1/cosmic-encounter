// src/components/OverviewScene/Warp.jsx
export default function Warp() {
    return (
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[1.5, 32, 32]} />
        <meshStandardMaterial color="yellow" />
      </mesh>
    )
  }
  