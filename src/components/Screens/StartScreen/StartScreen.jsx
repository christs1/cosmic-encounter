import React, { useState } from 'react';
import './StartScreen.css';

const StartScreen = ({ onStartGame }) => {
  const [playerCount, setPlayerCount] = useState(4);
  const [isStarting, setIsStarting] = useState(false);
  
  const handleStartGame = () => {
    setIsStarting(true);
    
    // Create player configuration based on selected options
    const playerConfigs = Array(playerCount).fill(null).map((_, index) => ({
      userId: `player${index + 1}`,
      isLocal: index === 0, // First player is always local
      color: getPlayerColor(index)
    }));
    
    // Slight delay for animation
    setTimeout(() => {
      onStartGame(playerConfigs);
    }, 1000);
  };
  
  const getPlayerColor = (index) => {
    const colors = ['red', 'blue', 'green', 'yellow', 'magenta', 'cyan'];
    return colors[index % colors.length];
  };
  
  return (
    <div className="start-screen">
      <div className="stars-bg"></div>
      
      {/* Title */}
      <div className="game-title">
        <h1>COSMIC ENCOUNTER</h1>
        <div className="title-underline"></div>
      </div>
      
      {/* Menu container */}
      <div className={`menu-container ${isStarting ? 'menu-fade-out' : ''}`}>
        <div className="menu-card">
          <h2>New Game</h2>
          
          {/* Player count selection */}
          <div className="menu-section">
            <label>Number of Players</label>
            <div className="player-count-selector">
              {[3, 4, 5, 6].map(count => (
                <button
                  key={count}
                  className={`count-button ${playerCount === count ? 'selected' : ''}`}
                  onClick={() => setPlayerCount(count)}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>
          
          {/* Start button */}
          <button 
            className="start-button"
            onClick={handleStartGame}
            disabled={isStarting}
          >
            {isStarting ? 'Launching...' : 'Start Game'}
          </button>
          
          {/* Game version */}
          <div className="game-version">v0.1.0</div>
        </div>
      </div>
    </div>
  );
};

export default StartScreen; 