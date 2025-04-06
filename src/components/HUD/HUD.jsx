// src/components/HUD/HUD.jsx
import React, { useState, useEffect, useRef } from 'react'
import PhaseDisplay from './PhaseDisplay'
import Inventory from './Inventory'
import './HUD.css'

// Alien HUD component that displays info about the current player's alien
export default function HUD({ alienId = 5, currentPhase = 1, playerColor = 'blue', cards = [] }) {
  const [aliens, setAliens] = useState([]);
  const [selectedAlien, setSelectedAlien] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imagePath, setImagePath] = useState('');
  const [triedPaths, setTriedPaths] = useState([]);
  const [minimized, setMinimized] = useState(false);
  const [playerCards, setPlayerCards] = useState([]);
  const imgRef = useRef(null);
  
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
            const alien = data.aliens.find(alien => alien.id === alienId);
            if (alien) {
              setSelectedAlien(alien);
              console.log(`Selected alien ID ${alienId}: ${alien.name}`);
              // Add detailed debug log for loaded alien data
              console.log(`[HUD] Loaded alien data: ID=${alien.id}, Name=${alien.name}, Power=${alien.power || 'N/A'}, Image=${alien.imagePath || 'N/A'}`);
            } else {
              console.warn(`Alien ID ${alienId} not found, defaulting to first alien`);
              setSelectedAlien(data.aliens[0]);
            }
          }
        }
      } catch (error) {
        console.error('Failed to load alien information:', error);
      }
    };
    
    loadAlienData();
  }, [alienId]);

  // Update player cards when cards prop changes
  useEffect(() => {
    if (cards && cards.length > 0) {
      console.log("Received player cards:", cards);
      setPlayerCards(cards);
    } else {
      setPlayerCards([]);
    }
  }, [cards]);

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
  }, [selectedAlien]);

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
  
  // Toggle minimized state
  const toggleMinimize = () => {
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
            animation: 'scanline 8s linear infinite'
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
        <PhaseDisplay currentPhase={currentPhase} />
      </div>
      
      {/* Inventory at bottom */}
      <div className="absolute bottom-6 left-0 right-0">
        <Inventory cards={playerCards} />
      </div>
      
      {/* Alien Card on left side with minimize functionality */}
      {selectedAlien && (
        <div className="absolute top-6 left-6 pointer-events-auto">
          <div 
            className={`relative rounded-md overflow-hidden bg-black transition-all duration-300 ${minimized ? 'alien-card-minimized' : ''}`}
            style={{
              width: minimized ? '180px' : '280px',
              border: `3px solid ${playerColor || 'rgba(0, 200, 255, 0.8)'}`,
              boxShadow: '0 0 20px rgba(0, 200, 255, 0.5)'
            }}
          >
            {/* Alien Name Header with Minimize Button */}
            <div 
              className="w-full text-center py-2 px-3 font-bold text-lg flex justify-between items-center"
              style={{
                backgroundColor: 'rgba(0, 20, 40, 0.8)',
                borderBottom: minimized ? 'none' : '2px solid rgba(0, 150, 200, 0.5)'
              }}
            >
              <span>{selectedAlien.name}</span>
              <button 
                onClick={toggleMinimize}
                className="text-xs bg-blue-800 hover:bg-blue-700 px-2 py-1 rounded transition"
              >
                {minimized ? '+' : '-'}
              </button>
            </div>
            
            {/* Alien Card Body - conditionally render the entire content */}
            {!minimized && (
              <div className="bg-black bg-opacity-80 p-3">
                {/* Alien Image Section */}
                <div className="mb-3 h-40 flex justify-center items-center bg-gray-900 rounded overflow-hidden">
                  {imageLoaded && !imageError ? (
                    <img 
                      ref={imgRef}
                      src={imagePath} 
                      alt={selectedAlien.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : imageError ? (
                    <div className="text-center p-4 text-red-400">
                      <div className="text-xs">Image not available</div>
                    </div>
                  ) : (
                    <div className="text-center p-4 text-gray-400">
                      <div className="text-xs">Loading image...</div>
                    </div>
                  )}
                </div>
                
                {/* Alien Details Section */}
                <div className="text-sm space-y-2">
                  <div className="text-yellow-400 font-bold">{selectedAlien.power}</div>
                  <div className="text-gray-300 text-xs">{selectedAlien.description}</div>
                  
                  {/* Additional Info Section */}
                  <div className="mt-4 border-t border-blue-900 pt-2 text-xs text-gray-400">
                    <div>
                      <span className="text-cyan-400">Type:</span> {selectedAlien.type}
                    </div>
                    <div>
                      <span className="text-cyan-400">Usage:</span> {selectedAlien.usage}
                    </div>
                    <div className="mt-2 italic">
                      "{selectedAlien.flavor}"
                    </div>
                  </div>
                </div>
              </div>
            )}
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
