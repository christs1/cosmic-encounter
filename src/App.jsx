import React, { useReducer, useState, useEffect, useRef } from 'react';
import GameBoard from './components/OverviewScene/GameBoard';
import HUD from './components/HUD/HUD';
import { StartScreen } from './components/Screens';
import { initialState } from './game/state/initialState';
import { gameReducer } from './game/state/gameReducer';
import { setupGame, getLocalPlayer } from './game/logic/setup';
import { getPhaseById } from './game/phases/GamePhases';

function App() {
  // Initialize game state
  const [gameState, dispatch] = useReducer(gameReducer, initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [logMessages, setLogMessages] = useState([]);
  const [notification, setNotification] = useState(null);
  const logEndRef = useRef(null);

  // Override console.log to capture messages for on-screen display
  useEffect(() => {
    const originalConsoleLog = console.log;
    
    console.log = (...args) => {
      // Call the original console.log
      originalConsoleLog(...args);
      
      // Format the arguments into a string message
      const message = args.map(arg => {
        if (typeof arg === 'object') {
          return JSON.stringify(arg, null, 2);
        }
        return String(arg);
      }).join(' ');
      
      // Add timestamp and update log messages
      const timestamp = new Date().toLocaleTimeString();
      setLogMessages(prev => [...prev.slice(-50), `[${timestamp}] ${message}`]);
    };
    
    // Restore original console.log on cleanup
    return () => {
      console.log = originalConsoleLog;
    };
  }, []);

  // Auto-scroll log to bottom
  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logMessages]);

  // Display notification for important game events
  useEffect(() => {
    // Listen for phase changes
    if (gameStarted && gameState.currentPhase) {
      const phase = getPhaseById(gameState.currentPhase);
      if (phase) {
        showNotification(`Phase ${gameState.currentPhase}: ${phase.name}`, 'phase');
      }
    }
  }, [gameState.currentPhase, gameStarted]);

  // Display notification for player turn changes
  useEffect(() => {
    if (gameStarted && gameState.players && gameState.players.length > 0) {
      const currentPlayer = gameState.players[gameState.currentPlayerIndex];
      if (currentPlayer) {
        // Only show when phase is 1 (START) to avoid duplicate notifications
        if (gameState.currentPhase === 1) {
          showNotification(`${currentPlayer.id}'s Turn`, 'player', currentPlayer.color);
        }
      }
    }
  }, [gameState.currentPlayerIndex, gameState.currentPhase, gameStarted]);

  // Function to show notifications
  const showNotification = (message, type = 'info', color = null) => {
    setNotification({
      message,
      type,
      color,
      id: Date.now() // Unique ID for animation tracking
    });
    
    // Automatically hide notification after 3 seconds
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  // Handle starting a new game
  const handleStartGame = async (playerConfigs) => {
    try {
      setLoading(true);
      
      const initializedState = await setupGame(playerConfigs);
      dispatch({ type: 'SETUP_GAME', payload: initializedState });
      
      // Set game as started after a brief delay for transition
      setTimeout(() => {
        setGameStarted(true);
        setLoading(false);
        
        // Show game started notification
        if (initializedState.players && initializedState.players.length > 0) {
          const startingPlayer = initializedState.players[initializedState.currentPlayerIndex];
          showNotification(`Game Started! ${startingPlayer.id} goes first`, 'system');
        }
      }, 500);
    } catch (err) {
      console.error('Failed to initialize game:', err);
      setError(err.message || 'Failed to initialize game');
      setLoading(false);
    }
  };

  // Handle advancing the phase
  const handleAdvancePhase = () => {
    dispatch({ type: 'ADVANCE_PHASE' });
  };

  // Get the local player
  const localPlayer = gameState.players && gameState.players.length > 0 
    ? getLocalPlayer(gameState.players) 
    : null;
    
  // Get current phase info
  const currentPhase = getPhaseById(gameState.currentPhase);

  // Show loading screen
  if (loading) {
    return <div className="h-screen w-screen bg-black text-white flex items-center justify-center">Loading Cosmic Encounter...</div>;
  }

  // Show error screen
  if (error) {
    return <div className="h-screen w-screen bg-black text-white flex items-center justify-center">Error: {error}</div>;
  }

  // Show start screen or game based on state
  return (
    <div className="h-screen w-screen bg-black overflow-hidden relative">
      {!gameStarted ? (
        <StartScreen onStartGame={handleStartGame} />
      ) : (
        <>
          <GameBoard />
          
          {/* HUD with the local player's alien ID */}
          {localPlayer && (
            <HUD 
              alienId={localPlayer.alienId} 
              currentPhase={gameState.currentPhase}
              playerColor={localPlayer.color}
              cards={localPlayer.hand}
            />
          )}
          
          {/* Debug UI - Positioned on the left side */}
          <div className="absolute top-0 left-0 bg-black bg-opacity-80 text-white p-4 text-xs z-50 m-4 rounded-md border border-blue-800 max-w-xs">
            <h3 className="font-bold mb-2 text-blue-400">DEBUG UI</h3>
            <div className="mb-4">
              <div>Phase: <span className="text-orange-300">{currentPhase?.name} ({gameState.currentPhase})</span></div>
              <div className="text-xs text-gray-400 mt-1">{currentPhase?.description}</div>
              <div className="mt-2">Current Player: <span className="text-cyan-300">{gameState.players[gameState.currentPlayerIndex]?.id}</span></div>
              <div>Players: {gameState.players.length}</div>
            </div>
            
            <button 
              onClick={handleAdvancePhase}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded text-xs w-full"
            >
              Advance Phase
            </button>
          </div>
          
          {/* Console Log Display - Positioned on the right side */}
          <div className="absolute top-0 right-0 bg-black bg-opacity-80 text-white p-4 text-xs z-50 m-4 rounded-md border border-blue-800 max-w-sm max-h-[500px] overflow-y-auto">
            <h3 className="font-bold mb-2 text-blue-400 sticky top-0 bg-black bg-opacity-90 py-1">CONSOLE OUTPUT</h3>
            <div className="space-y-1 font-mono">
              {logMessages.map((msg, index) => (
                <div 
                  key={index} 
                  className="text-xs text-gray-300 break-words whitespace-pre-wrap"
                >
                  {msg}
                </div>
              ))}
              <div ref={logEndRef} />
            </div>
          </div>
          
          {/* Notifications */}
          {notification && (
            <div className="absolute top-[15%] left-1/2 transform -translate-x-1/2 z-50 pointer-events-none">
              <div 
                className={`px-8 py-4 rounded-lg text-center text-xl font-bold whitespace-nowrap animate-fade-in-out`}
                style={{ 
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  border: notification.color ? `2px solid ${notification.color}` : '2px solid #3b82f6',
                  color: notification.color || '#ffffff',
                  boxShadow: '0 0 20px rgba(0, 0, 0, 0.5)',
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
                  animation: 'fadeInOut 3s ease forwards'
                }}
              >
                {notification.message}
              </div>
            </div>
          )}
        </>
      )}
      
      {/* Global CSS for animations */}
      <style jsx global>{`
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateY(-20px); }
          10% { opacity: 1; transform: translateY(0); }
          80% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}

export default App;
