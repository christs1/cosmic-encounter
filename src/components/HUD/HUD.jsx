// src/components/HUD/HUD.jsx
import React, { useState, useEffect, useRef } from 'react'
import PhaseDisplay from './PhaseDisplay'
import Inventory from './Inventory'

// Alien HUD component that displays info about the current player's alien
export default function HUD({ alienId = 3 }) {
  const [aliens, setAliens] = useState([]);
  const [selectedAlienIndex, setSelectedAlienIndex] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imagePath, setImagePath] = useState('');
  const [triedPaths, setTriedPaths] = useState([]);
  const [minimized, setMinimized] = useState(false);
  const imgRef = useRef(null);
  
  // Current selected alien data
  const selectedAlien = aliens[selectedAlienIndex] || null;
  
  // Load alien data from the JSON file
  useEffect(() => {
    const loadAlienData = async () => {
      try {
        const response = await fetch('/data/aliens.json');
        if (!response.ok) {
          throw new Error(`Failed to load alien data: ${response.status}`);
        }
        const data = await response.json();
        if (data.aliens && data.aliens.length > 0) {
          setAliens(data.aliens);
          console.log("Loaded aliens:", data.aliens);
          
          // If alienId is specified, find the matching alien
          if (alienId) {
            const index = data.aliens.findIndex(alien => alien.id === alienId);
            if (index !== -1) {
              setSelectedAlienIndex(index);
              console.log(`Selected alien ID ${alienId} at index ${index}`);
            } else {
              console.warn(`Alien ID ${alienId} not found, defaulting to first alien`);
            }
          }
        }
      } catch (error) {
        console.error('Failed to load alien information:', error);
      }
    };
    
    loadAlienData();
  }, [alienId]);

  // Reset image state when switching aliens and try different paths
  useEffect(() => {
    setImageError(false);
    setImageLoaded(false);
    setTriedPaths([]);
    
    if (selectedAlien?.imagePath) {
      // Original path from the JSON
      const originalPath = selectedAlien.imagePath.startsWith('/')
        ? selectedAlien.imagePath
        : `/${selectedAlien.imagePath}`;
      
      // Extract the alien name from the JSON or the path
      const alienName = selectedAlien.name ? selectedAlien.name.toLowerCase() : 'unknown';
      
      // Generate possible paths to try
      const possiblePaths = [
        originalPath,                                     // Original path from JSON
        `/images/aliens/${alienName}.png`,               // Standard location with name
        `/data/images/aliens/${alienName}.png`,          // Data folder with name
        `/mirror.png`,                                    // Legacy path for Mirror alien
      ];
      
      console.log("Will try these image paths:", possiblePaths);
      setTriedPaths(possiblePaths);
      
      // Start with the first path
      setImagePath(possiblePaths[0]);
    } else {
      setImagePath('');
    }
  }, [selectedAlienIndex, selectedAlien]);

  // Try the next path when an image fails to load
  const tryNextPath = () => {
    const currentIndex = triedPaths.indexOf(imagePath);
    if (currentIndex < triedPaths.length - 1) {
      const nextPath = triedPaths[currentIndex + 1];
      console.log(`Trying next path (${currentIndex + 1}/${triedPaths.length}): ${nextPath}`);
      setImagePath(nextPath);
      setImageError(false);
    } else {
      console.error("All possible image paths failed to load");
    }
  };

  // Additional effect to preload the image when the path changes
  useEffect(() => {
    if (imagePath) {
      console.log("Preloading image from path:", imagePath);
      
      const img = new Image();
      img.onload = () => {
        console.log("Image loaded successfully:", imagePath);
        setImageLoaded(true);
        setImageError(false);
      };
      
      img.onerror = (e) => {
        console.error("Failed to preload image:", imagePath, e);
        setImageError(true);
        setImageLoaded(false);
        tryNextPath();
      };
      
      img.src = imagePath;
    }
  }, [imagePath]);

  // Helper function to cycle through available aliens (for testing)
  const cycleToNextAlien = () => {
    if (aliens.length > 1) {
      setSelectedAlienIndex((prevIndex) => (prevIndex + 1) % aliens.length);
    }
  };
  
  // Toggle minimized state
  const toggleMinimized = () => {
    setMinimized(!minimized);
  };

  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none text-white font-mono z-50">
      {/* Screen overlay effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30 mix-blend-overlay">
        {/* Scanlines effect */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(255, 255, 255, 0.03) 1px, rgba(255, 255, 255, 0.03) 2px)',
            backgroundSize: '100% 2px',
          }}
        />
        
        {/* Subtle vignette */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle, transparent 25%, rgba(0, 0, 0, 0.4) 100%)',
          }}
        />
      </div>
      
      {/* Corner decorations */}
      <div className="absolute top-0 left-0 w-24 h-24 pointer-events-none opacity-60">
        <div className="absolute top-0 left-0 w-12 h-1 bg-cyan-500"></div>
        <div className="absolute top-0 left-0 w-1 h-12 bg-cyan-500"></div>
      </div>
      
      <div className="absolute top-0 right-0 w-24 h-24 pointer-events-none opacity-60">
        <div className="absolute top-0 right-0 w-12 h-1 bg-cyan-500"></div>
        <div className="absolute top-0 right-0 w-1 h-12 bg-cyan-500"></div>
      </div>
      
      <div className="absolute bottom-0 left-0 w-24 h-24 pointer-events-none opacity-60">
        <div className="absolute bottom-0 left-0 w-12 h-1 bg-cyan-500"></div>
        <div className="absolute bottom-0 left-0 w-1 h-12 bg-cyan-500"></div>
      </div>
      
      <div className="absolute bottom-0 right-0 w-24 h-24 pointer-events-none opacity-60">
        <div className="absolute bottom-0 right-0 w-12 h-1 bg-cyan-500"></div>
        <div className="absolute bottom-0 right-0 w-1 h-12 bg-cyan-500"></div>
      </div>
      
      {/* HUD Components */}
      <div className="absolute top-6 left-1/2 transform -translate-x-1/2 pointer-events-auto">
        <PhaseDisplay />
      </div>
      
      {/* Inventory at bottom */}
      <div className="absolute bottom-6 left-0 right-0">
        <Inventory />
      </div>
      
      {/* Alien Card on left side with minimize functionality */}
      {selectedAlien && (
        <div className="absolute top-6 left-6 pointer-events-auto">
          <div 
            className="relative rounded-md overflow-hidden bg-black transition-all duration-300"
            style={{
              width: '280px',
              border: '3px solid rgba(0, 200, 255, 0.8)',
              boxShadow: '0 0 20px rgba(0, 200, 255, 0.5)'
            }}
          >
            {/* Alien Name Header with Minimize Button */}
            <div 
              className="w-full text-center py-2 px-3 font-bold text-lg flex justify-between items-center"
              style={{
                borderBottom: minimized ? 'none' : '2px solid rgba(0, 200, 255, 0.8)',
                background: 'linear-gradient(90deg, rgba(0,0,0,0.7) 0%, rgba(0,60,120,0.7) 50%, rgba(0,0,0,0.7) 100%)'
              }}
            >
              <span 
                className="flex-grow text-left"
              >
                {selectedAlien.name.toUpperCase()}
              </span>
              
              <div className="flex items-center">
                <button 
                  className="w-5 h-5 flex items-center justify-center rounded bg-cyan-900 hover:bg-cyan-800 text-cyan-400 text-xs"
                  onClick={toggleMinimized}
                >
                  {minimized ? '+' : '-'}
                </button>
              </div>
            </div>
            
            {/* Collapsible content */}
            <div 
              className="overflow-hidden transition-all duration-300"
              style={{ 
                maxHeight: minimized ? '0' : '1000px',
                opacity: minimized ? 0 : 1
              }}
            >
              {/* Alien Image Section with full-size display */}
              <div className="bg-black overflow-hidden" style={{ height: '260px' }}>
                {imageError && triedPaths.indexOf(imagePath) === triedPaths.length - 1 ? (
                  <div className="text-center p-2">
                    <div className="text-4xl">👽</div>
                    <div className="text-xs text-gray-400 mt-2">Image could not be loaded</div>
                    <div className="text-xs text-gray-500 mt-1 max-w-full break-words">
                      Current path: {imagePath}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      Tried all {triedPaths.length} possible paths
                    </div>
                  </div>
                ) : (
                  <div 
                    className="relative w-full h-full overflow-hidden"
                  >
                    {/* Main image - enlarged to extend beyond borders */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <img 
                        ref={imgRef}
                        src={imagePath}
                        alt={selectedAlien.name}
                        className="object-contain"
                        style={{ 
                          width: '380px', // Even larger to extend more outside container
                          height: '380px', // Even larger to extend more outside container
                          filter: 'drop-shadow(0 0 10px rgba(0, 200, 255, 0.4))'
                        }}
                        onLoad={() => {
                          console.log("Image loaded successfully in DOM:", imagePath);
                          setImageLoaded(true);
                        }}
                        onError={(e) => {
                          console.error("Image failed to load in DOM:", imagePath, e);
                          setImageError(true);
                        }}
                      />
                    </div>
                    
                    {/* Subtle tech border effects on top of the image */}
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-700 to-transparent z-10"></div>
                      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-700 to-transparent z-10"></div>
                      <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-transparent via-cyan-700 to-transparent z-10"></div>
                      <div className="absolute right-0 top-0 h-full w-1 bg-gradient-to-b from-transparent via-cyan-700 to-transparent z-10"></div>
                    </div>
                    
                    {/* Scan line effect */}
                    <div 
                      className="absolute inset-0 pointer-events-none overflow-hidden opacity-10 z-10"
                      style={{
                        background: 'repeating-linear-gradient(to bottom, transparent, transparent 5px, rgba(0, 200, 255, 0.5) 5px, rgba(0, 200, 255, 0.5) 6px)',
                        animation: 'scanline 8s linear infinite',
                      }}
                    ></div>
                    
                    {/* Corner markers */}
                    <div className="absolute top-0 left-0 w-8 h-8 z-10">
                      <div className="absolute top-0 left-0 w-8 h-1 bg-cyan-500 opacity-60"></div>
                      <div className="absolute top-0 left-0 w-1 h-8 bg-cyan-500 opacity-60"></div>
                    </div>
                    
                    <div className="absolute top-0 right-0 w-8 h-8 z-10">
                      <div className="absolute top-0 right-0 w-8 h-1 bg-cyan-500 opacity-60"></div>
                      <div className="absolute top-0 right-0 w-1 h-8 bg-cyan-500 opacity-60"></div>
                    </div>
                    
                    <div className="absolute bottom-0 left-0 w-8 h-8 z-10">
                      <div className="absolute bottom-0 left-0 w-8 h-1 bg-cyan-500 opacity-60"></div>
                      <div className="absolute bottom-0 left-0 w-1 h-8 bg-cyan-500 opacity-60"></div>
                    </div>
                    
                    <div className="absolute bottom-0 right-0 w-8 h-8 z-10">
                      <div className="absolute bottom-0 right-0 w-8 h-1 bg-cyan-500 opacity-60"></div>
                      <div className="absolute bottom-0 right-0 w-1 h-8 bg-cyan-500 opacity-60"></div>
                    </div>
                    
                    {/* Animation styles */}
                    <style jsx>{`
                      @keyframes scanline {
                        0% { transform: translateY(-100%); }
                        100% { transform: translateY(100%); }
                      }
                    `}</style>
                  </div>
                )}
              </div>
              
              {/* Power Name Section Header (formerly Description) */}
              <div 
                className="w-full text-center py-2 px-3 font-bold"
                style={{
                  borderTop: '2px solid rgba(0, 200, 255, 0.8)',
                  borderBottom: '2px solid rgba(0, 200, 255, 0.8)',
                  background: 'linear-gradient(90deg, rgba(0,0,0,0.7) 0%, rgba(0,60,120,0.7) 50%, rgba(0,0,0,0.7) 100%)'
                }}
              >
                {selectedAlien.power.toUpperCase()}
              </div>
              
              {/* Alien Description Text */}
              <div 
                className="p-3 text-sm overflow-y-auto"
                style={{ 
                  maxHeight: '200px',
                  background: 'rgba(0, 0, 0, 0.85)'
                }}
              >
                {selectedAlien.description}
                
                {/* Additional details */}
                <div className="mt-3 pt-3 border-t border-gray-700 text-gray-400 text-xs">
                  <div><span className="text-cyan-400">Type:</span> {selectedAlien.type}</div>
                  <div><span className="text-cyan-400">Timing:</span> {selectedAlien.timing.phase} phase, {selectedAlien.timing.trigger}</div>
                  <div><span className="text-cyan-400">Usage:</span> {selectedAlien.usage}</div>
                </div>
                
                {/* Flavor text in italics */}
                <div className="mt-3 italic text-gray-500 text-xs">
                  {selectedAlien.flavor}
                </div>
              </div>
            </div>
            
            {/* Corner effects on the card */}
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
      )}
      
      {/* Game version and system status */}
      <div 
        className="absolute bottom-4 left-4 text-xs opacity-70"
        style={{ 
          color: '#a4b0c5',
          textShadow: '0 0 5px rgba(0, 0, 0, 0.5)'
        }}
      >
        COSMIC ENCOUNTER v0.1.0 // SYSTEMS NOMINAL
      </div>
    </div>
  )
}
