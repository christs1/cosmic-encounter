import React, { useState, useEffect } from 'react';

// This component displays the current player's alien information
export default function AlienInfo({ playerId = 1 }) {
  const [alienInfo, setAlienInfo] = useState({
    name: 'Loading...',
    description: 'Alien information loading...',
    color: '#888',
    avatar: null
  });
  
  const [isLoading, setIsLoading] = useState(true);
  
  // Load alien data from the JSON file
  useEffect(() => {
    const loadAlienInfo = async () => {
      try {
        // Fetch alien data from the JSON file
        const response = await fetch('/data/aliens.json');
        
        if (!response.ok) {
          throw new Error(`Failed to load alien data: ${response.status}`);
        }
        
        const data = await response.json();
        const playerAlien = data.aliens.find(alien => alien.playerId === playerId);
        
        if (playerAlien) {
          setAlienInfo(playerAlien);
        } else {
          console.warn(`No alien found for player ID ${playerId}, using default`);
          // Use the first alien as a fallback
          setAlienInfo(data.aliens[0]);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load alien information:', error);
        // Fallback to default data if loading fails
        setAlienInfo({
          name: 'Unknown Alien',
          description: 'Data corrupted or unavailable. This mysterious species remains unidentified.',
          color: '#7e57c2',
          avatar: '❓'
        });
        setIsLoading(false);
      }
    };
    
    loadAlienInfo();
  }, [playerId]);
  
  // Display the power tooltip on hover
  const [showPower, setShowPower] = useState(false);
  
  // For debugging - fallback to hardcoded data if fetch fails
  useEffect(() => {
    // If still loading after 2 seconds, use fallback data
    const timer = setTimeout(() => {
      if (isLoading) {
        console.log("Using fallback alien data due to loading timeout");
        setAlienInfo({
          name: 'Cosmic Entity',
          description: 'A mysterious being with the power to bend space and time. This alien can manipulate the fabric of reality to their advantage.',
          color: '#7e57c2',
          avatar: '👾',
          power: 'Once per turn, can move one of their ships to any planet.'
        });
        setIsLoading(false);
      }
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [isLoading]);
  
  return (
    <div 
      className="p-4 bg-gray-800 bg-opacity-80 rounded-lg text-white max-w-xs shadow-lg relative border border-indigo-900"
      onMouseEnter={() => setShowPower(true)}
      onMouseLeave={() => setShowPower(false)}
      style={{ minWidth: '280px' }}
    >
      <div className="flex items-start space-x-3">
        {/* Alien avatar/icon */}
        <div 
          className="w-12 h-12 rounded-full flex items-center justify-center text-2xl border border-white"
          style={{ backgroundColor: alienInfo.color }}
        >
          {alienInfo.avatar || '?'}
        </div>
        
        <div className="flex-1">
          {/* Alien name */}
          <h3 className="font-bold text-lg uppercase tracking-wider">
            {isLoading ? 'LOADING...' : alienInfo.name}
          </h3>
          
          {/* Alien description */}
          <p className="text-sm text-gray-300 mt-1">
            {alienInfo.description}
          </p>
        </div>
      </div>
      
      {/* Power tooltip */}
      {showPower && alienInfo.power && (
        <div className="absolute left-0 top-full mt-2 p-3 bg-gray-900 bg-opacity-90 rounded text-sm border border-gray-700 w-full z-10">
          <span className="text-yellow-400 font-bold">Power:</span> {alienInfo.power}
        </div>
      )}
    </div>
  );
}
