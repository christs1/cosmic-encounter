import React, { useState } from 'react';
import { PhasesList, getPhaseById } from '../../game/phases/GamePhases';

export default function PhaseDisplay({ currentPhase = 1 }) {
  const [hoveredPhase, setHoveredPhase] = useState(null);
  
  // Get current phase details
  const currentPhaseDetails = getPhaseById(currentPhase);
  
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
            {PhasesList.map(phase => (
              <div 
                key={phase.id}
                className={`relative px-2 py-2 text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  currentPhase === phase.id 
                    ? 'text-orange-300' 
                    : 'text-gray-500 hover:text-gray-300'
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
                onMouseEnter={() => setHoveredPhase(phase)}
                onMouseLeave={() => setHoveredPhase(null)}
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
        
        {/* Phase description (shown when hovering) */}
        {hoveredPhase && (
          <div 
            className="absolute z-20 rounded-md p-3 text-xs"
            style={{
              top: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '80%',
              marginTop: '5px',
              background: 'rgba(0, 20, 40, 0.9)',
              border: '1px solid rgba(0, 150, 255, 0.5)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(4px)'
            }}
          >
            <div className="font-bold text-orange-300 mb-1">{hoveredPhase.name}</div>
            <div className="text-gray-200 mb-2">{hoveredPhase.description}</div>
            {hoveredPhase.actions && (
              <div>
                <div className="text-cyan-400 font-semibold mb-1">Actions:</div>
                <ul className="text-gray-300 list-disc pl-4">
                  {hoveredPhase.actions.map((action, index) => (
                    <li key={index}>{action}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
        
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
      </div>
    </div>
  );
}
