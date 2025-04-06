export function advancePhase(currentState) {
    let { currentPhase, currentPlayerIndex, players } = currentState;
    
    currentPhase += 1;
    
    if (currentPhase > 8) {
      // End of turn, move to next player
      currentPhase = 1; // Reset to Start Turn phase
      currentPlayerIndex = (currentPlayerIndex + 1) % players.length; // Move to next player, wrap around
    }
    
    // Return the updated state
    return {
      ...currentState,
      currentPhase,
      currentPlayerIndex,
    };
  }
  
  // TODO: Add more game logic functions here (e.g., setupGame, handlePhaseAction)
  