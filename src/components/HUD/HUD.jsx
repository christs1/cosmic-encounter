// src/components/HUD/HUD.jsx
import React from 'react'
import AlienInfo from './AlienInfo'

// Only including AlienInfo for now, will add other components as they're implemented
export default function HUD() {
  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none text-white font-mono z-50">
      <div className="absolute top-4 left-4 pointer-events-auto">
        <AlienInfo />
      </div>
      
      {/* Other HUD components will be added here as they are implemented */}
    </div>
  )
}
