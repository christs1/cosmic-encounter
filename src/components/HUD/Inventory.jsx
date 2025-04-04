import React from 'react'

// Placeholder component - will be implemented later
export default function Inventory() {
  // 8 inventory slots
  const slots = Array(8).fill(null);

  return (
    <div className="pointer-events-auto flex justify-center">
      {/* Slots container */}
      <div className="flex items-center">
        {slots.map((_, index) => (
          <div 
            key={index}
            className="relative w-32 h-32 flex items-center justify-center border-2 border-cyan-900 rounded mx-1"
            style={{
              background: 'rgba(0, 20, 40, 0.8)',
              boxShadow: '0 0 15px rgba(0, 50, 80, 0.5), inset 0 0 15px rgba(0, 50, 80, 0.5)'
            }}
          >
            {/* Empty slot indicator */}
            <div className="text-cyan-700 opacity-30 text-6xl">+</div>
            
            {/* Slot number */}
            <div className="absolute bottom-2 right-2 text-sm text-cyan-600">
              {index + 1}
            </div>
            
            {/* Corner markers */}
            <div className="absolute top-0 left-0 w-6 h-6">
              <div className="absolute top-0 left-0 w-6 h-1 bg-cyan-500 opacity-60"></div>
              <div className="absolute top-0 left-0 w-1 h-6 bg-cyan-500 opacity-60"></div>
            </div>
            <div className="absolute top-0 right-0 w-6 h-6">
              <div className="absolute top-0 right-0 w-6 h-1 bg-cyan-500 opacity-60"></div>
              <div className="absolute top-0 right-0 w-1 h-6 bg-cyan-500 opacity-60"></div>
            </div>
            <div className="absolute bottom-0 left-0 w-6 h-6">
              <div className="absolute bottom-0 left-0 w-6 h-1 bg-cyan-500 opacity-60"></div>
              <div className="absolute bottom-0 left-0 w-1 h-6 bg-cyan-500 opacity-60"></div>
            </div>
            <div className="absolute bottom-0 right-0 w-6 h-6">
              <div className="absolute bottom-0 right-0 w-6 h-1 bg-cyan-500 opacity-60"></div>
              <div className="absolute bottom-0 right-0 w-1 h-6 bg-cyan-500 opacity-60"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
