import React, { useState, useEffect } from 'react';

// This component displays the current player's alien information
export default function AlienInfo({ playerId = 1 }) {
  const [alienInfo, setAlienInfo] = useState({
    name: 'Loading...',
    description: 'Alien information loading...',
    color: '#888',
    avatar: null,
    imagePath: null
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
          avatar: '❓',
          imagePath: null
        });
        setIsLoading(false);
      }
    };
    
    loadAlienInfo();
  }, [playerId]);
  
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
          power: 'Once per turn, can move one of their ships to any planet.',
          imagePath: '/images/aliens/cosmic_entity.png'
        });
        setIsLoading(false);
      }
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [isLoading]);
  
  // Display the power tooltip on hover
  const [showPower, setShowPower] = useState(false);
  
  return (
    <div 
      className="relative rounded-lg shadow-lg overflow-hidden"
      onMouseEnter={() => setShowPower(true)}
      onMouseLeave={() => setShowPower(false)}
      style={{
        width: '320px',
        background: 'linear-gradient(180deg, rgba(48, 52, 63, 0.95) 0%, rgba(30, 34, 42, 0.95) 100%)',
        border: '1px solid rgba(83, 92, 121, 0.3)',
        backdropFilter: 'blur(4px)',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
      }}
    >
      {/* Header bar - metallic style */}
      <div 
        className="flex items-center justify-between px-4 py-2"
        style={{
          background: 'linear-gradient(90deg, #1e232b 0%, #2c3341 50%, #1e232b 100%)', 
          borderBottom: '1px solid rgba(83, 92, 121, 0.5)',
          boxShadow: 'inset 0 -1px 0 rgba(0, 0, 0, 0.3)'
        }}
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_5px_rgba(74,222,128,0.7)]"></div>
          <span className="text-xs font-bold tracking-wider text-gray-300 uppercase">Species Analysis</span>
        </div>
        <div className="text-xs text-gray-400">ID: {playerId.toString().padStart(4, '0')}</div>
      </div>
      
      {/* Main content */}
      <div className="p-4">
        <div className="flex items-start space-x-4">
          {/* Alien avatar with fancy border */}
          <div 
            className="relative"
            style={{
              padding: '2px',
              background: `linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(83, 92, 121, 0.1) 100%)`,
              borderRadius: '50%',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
            }}
          >
            {alienInfo.imagePath ? (
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center overflow-hidden"
                style={{ 
                  backgroundColor: alienInfo.color,
                  boxShadow: `inset 0 2px 10px rgba(0, 0, 0, 0.5), 0 0 15px ${alienInfo.color}40`
                }}
              >
                <img 
                  src={alienInfo.imagePath} 
                  alt={alienInfo.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.warn(`Image failed to load: ${alienInfo.imagePath}`);
                    e.target.style.display = 'none';
                    e.target.parentNode.textContent = alienInfo.avatar || '?';
                  }}
                />
              </div>
            ) : (
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
                style={{ 
                  backgroundColor: alienInfo.color,
                  boxShadow: `inset 0 2px 10px rgba(0, 0, 0, 0.5), 0 0 15px ${alienInfo.color}40`
                }}
              >
                {alienInfo.avatar || '?'}
              </div>
            )}
          </div>
          
          <div className="flex-1">
            {/* Alien name with tech effect */}
            <h3 
              className="font-bold text-lg uppercase tracking-wider"
              style={{
                color: '#e2e8f0',
                textShadow: '0 0 5px rgba(255, 255, 255, 0.3)',
                letterSpacing: '0.05em'
              }}
            >
              {isLoading ? 'SCANNING...' : alienInfo.name}
            </h3>
            
            {/* Technical scanlines effect */}
            <div className="w-full h-1 my-2" style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(83, 92, 121, 0.5) 20%, rgba(83, 92, 121, 0.5) 80%, transparent 100%)'
            }}></div>
            
            {/* Alien description with space theme */}
            <p 
              className="text-sm mt-1"
              style={{ color: '#a4b0c5', lineHeight: '1.4' }}
            >
              {alienInfo.description}
            </p>
          </div>
        </div>
      </div>
      
      {/* Bottom indicator bar */}
      <div 
        className="px-4 py-2 flex justify-between items-center text-xs" 
        style={{
          background: 'rgba(22, 26, 32, 0.8)',
          borderTop: '1px solid rgba(83, 92, 121, 0.2)'
        }}
      >
        <span className="text-green-400">■ ONLINE</span>
        <span className="text-gray-400">HOVER FOR ABILITIES</span>
      </div>
      
      {/* Power tooltip - tech style */}
      {showPower && alienInfo.power && (
        <div 
          className="absolute left-0 top-full mt-2 p-4 z-10 rounded"
          style={{
            background: 'linear-gradient(180deg, rgba(22, 26, 32, 0.95) 0%, rgba(17, 20, 25, 0.95) 100%)',
            border: '1px solid rgba(83, 92, 121, 0.3)',
            backdropFilter: 'blur(4px)',
            boxShadow: '0 10px 20px rgba(0, 0, 0, 0.5)',
            width: '100%'
          }}
        >
          <div className="flex items-center mb-2">
            <div className="w-1 h-4 bg-yellow-400 mr-2" style={{ boxShadow: '0 0 8px rgba(250, 204, 21, 0.8)' }}></div>
            <span className="text-yellow-400 font-bold uppercase tracking-wider text-sm">Galactic Power</span>
          </div>
          <p className="text-gray-300 text-sm">{alienInfo.power}</p>
        </div>
      )}
    </div>
  );
}
