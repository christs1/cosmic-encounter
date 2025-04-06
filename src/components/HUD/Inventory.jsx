import React from 'react'

// Inventory component that displays player cards in slots
export default function Inventory({ cards = [] }) {
  // Create 8 slots (filled with cards or empty)
  const MAX_SLOTS = 8;
  const slots = Array(MAX_SLOTS).fill(null).map((_, index) => {
    return index < cards.length ? cards[index] : null;
  });

  return (
    <div className="pointer-events-auto flex justify-center">
      {/* Slots container */}
      <div className="flex items-center">
        {slots.map((card, index) => (
          <div 
            key={index}
            className="relative w-32 h-32 flex items-center justify-center border-2 border-cyan-900 rounded mx-1 overflow-hidden"
            style={{
              background: card ? getCardBackground(card.type) : 'rgba(0, 0, 0, 0.5)',
              transition: 'all 0.2s ease'
            }}
          >
            {card ? (
              // Card content
              <div className="w-full h-full flex flex-col items-center justify-between p-2">
                <div className="text-xl font-bold text-white">
                  {card.type === 'attack' ? card.value : ''}
                </div>
                <div className="text-center">
                  <div className="text-sm uppercase font-bold">
                    {card.name || card.type}
                  </div>
                  {card.type === 'attack' && (
                    <div className="text-xs mt-1">ATTACK</div>
                  )}
                </div>
              </div>
            ) : (
              // Empty slot indicator
              <div className="text-cyan-700 opacity-30 text-6xl">+</div>
            )}
            
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

// Helper function to get card background based on type
function getCardBackground(cardType) {
  switch (cardType) {
    case 'attack':
      return 'linear-gradient(135deg, rgba(180, 30, 30, 0.9) 0%, rgba(100, 10, 10, 0.9) 100%)';
    case 'negotiate':
      return 'linear-gradient(135deg, rgba(30, 150, 30, 0.9) 0%, rgba(10, 80, 10, 0.9) 100%)';
    case 'reinforcement':
      return 'linear-gradient(135deg, rgba(30, 30, 180, 0.9) 0%, rgba(10, 10, 100, 0.9) 100%)';
    case 'artifact':
      return 'linear-gradient(135deg, rgba(150, 30, 150, 0.9) 0%, rgba(80, 10, 80, 0.9) 100%)';
    case 'flare':
      return 'linear-gradient(135deg, rgba(190, 150, 30, 0.9) 0%, rgba(100, 80, 10, 0.9) 100%)';
    default:
      return 'rgba(40, 40, 40, 0.8)';
  }
}
