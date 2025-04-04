import React from 'react'

export default function PhaseDisplay({ currentPhase = 1 }) {
  // Game phases in order
  const phases = [
    { id: 1, name: "START" },
    { id: 2, name: "REGROUP" },
    { id: 3, name: "DESTINY" },
    { id: 4, name: "LAUNCH" },
    { id: 5, name: "ALLIANCE" },
    { id: 6, name: "PLANNING" },
    { id: 7, name: "REVEAL" },
    { id: 8, name: "RESOLUTION" }
  ];

  return (
    <div className="pointer-events-auto">
      <div 
        className="relative rounded-md overflow-hidden bg-black"
        style={{
          width: '680px',
          border: '3px solid rgba(0, 200, 255, 0.8)',
          boxShadow: '0 0 20px rgba(0, 200, 255, 0.5)'
        }}
      >
        {/* Phase Header and Phases in a single row */}
        <div className="flex items-center">
          <div 
            className="font-bold text-lg px-4 py-2 border-r-2 border-cyan-800"
            style={{
              background: 'linear-gradient(90deg, rgba(0,0,0,0.7) 0%, rgba(0,60,120,0.7) 100%)',
              width: '80px'
            }}
          >
            PHASE:
          </div>
          
          <div className="flex flex-1 justify-between bg-black">
            {phases.map(phase => (
              <div 
                key={phase.id}
                className={`relative px-2 py-2 text-xs font-semibold transition-all duration-200 ${
                  currentPhase === phase.id 
                    ? 'text-orange-300' 
                    : 'text-gray-500'
                }`}
                style={{
                  textAlign: 'center',
                  borderBottom: currentPhase === phase.id 
                    ? '2px solid rgba(255, 140, 0, 0.8)' 
                    : '2px solid transparent',
                  background: currentPhase === phase.id 
                    ? 'linear-gradient(to bottom, rgba(80, 40, 0, 0.4), rgba(40, 20, 0, 0.2))' 
                    : 'transparent'
                }}
              >
                {phase.name}
                {currentPhase === phase.id && (
                  <div 
                    className="absolute bottom-0 left-0 right-0 h-0.5"
                    style={{
                      background: 'linear-gradient(to right, rgba(255, 140, 0, 0), rgba(255, 140, 0, 0.8), rgba(255, 140, 0, 0))',
                      animation: 'pulsate 2s ease-in-out infinite'
                    }}
                  ></div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Card Corner Effects */}
        <div className="absolute top-0 left-0 w-5 h-5 z-10">
          <div className="absolute top-0 left-0 w-5 h-1 bg-cyan-400"></div>
          <div className="absolute top-0 left-0 w-1 h-5 bg-cyan-400"></div>
        </div>
        <div className="absolute top-0 right-0 w-5 h-5 z-10">
          <div className="absolute top-0 right-0 w-5 h-1 bg-cyan-400"></div>
          <div className="absolute top-0 right-0 w-1 h-5 bg-cyan-400"></div>
        </div>
        <div className="absolute bottom-0 left-0 w-5 h-5 z-10">
          <div className="absolute bottom-0 left-0 w-5 h-1 bg-cyan-400"></div>
          <div className="absolute bottom-0 left-0 w-1 h-5 bg-cyan-400"></div>
        </div>
        <div className="absolute bottom-0 right-0 w-5 h-5 z-10">
          <div className="absolute bottom-0 right-0 w-5 h-1 bg-cyan-400"></div>
          <div className="absolute bottom-0 right-0 w-1 h-5 bg-cyan-400"></div>
        </div>
        
        {/* Animation styles */}
        <style jsx>{`
          @keyframes pulsate {
            0%, 100% { opacity: 0.6; }
            50% { opacity: 1; }
          }
        `}</style>
      </div>
    </div>
  )
}
