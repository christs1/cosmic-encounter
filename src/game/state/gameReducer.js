import { getNextPhase } from '../phases/GamePhases';

// Main game reducer
export function gameReducer(state, action) {
  switch (action.type) {
    case 'SETUP_GAME':
      return { ...action.payload };
      
    case 'ADVANCE_PHASE':
      const nextPhase = action.phaseId || getNextPhase(state.currentPhase).id;
      const currentPhaseName = getPhaseById(state.currentPhase)?.name || state.currentPhase;
      const nextPhaseName = getPhaseById(nextPhase)?.name || nextPhase;
      
      // Add debug log for phase transition
      console.log(`[GameReducer] Phase transition: ${state.currentPhase} (${currentPhaseName}) → ${nextPhase} (${nextPhaseName})`);
      
      // Check if we're completing a full cycle (transitioning from RESOLUTION back to START)
      // RESOLUTION is typically the last phase (assume it's phase 7)
      const isFullCycle = state.currentPhase === 7 && nextPhase === 1;
      
      // If completing a full cycle, advance to the next player
      let nextPlayerIndex = state.currentPlayerIndex;
      
      if (isFullCycle && state.players.length > 0) {
        nextPlayerIndex = (state.currentPlayerIndex + 1) % state.players.length;
        console.log(`[GameReducer] Player turn changing: ${state.players[state.currentPlayerIndex].id} → ${state.players[nextPlayerIndex].id}`);
      }
      
      return {
        ...state,
        currentPhase: nextPhase,
        currentPlayerIndex: nextPlayerIndex,
        // Reset any phase-specific state
        encounter: state.currentPhase === 7 ? null : state.encounter
      };
      
    case 'DRAW_CARD':
      // If deck is empty, try to reshuffle discard pile if available
      if (state.deck.length === 0) {
        // If no cards in discard pile either, return state unchanged
        if (state.discardPile.length === 0) {
          console.warn("Cannot draw card: Deck and discard pile are both empty");
          return state;
        }
        
        // Reshuffle discard pile into deck
        console.log("Reshuffling discard pile into deck");
        const newDeck = [...state.discardPile].sort(() => Math.random() - 0.5);
        
        // Update state with reshuffled deck and empty discard pile
        const stateWithReshuffledDeck = {
          ...state,
          deck: newDeck,
          discardPile: []
        };
        
        // Recursively call this action with the updated state
        return gameReducer(stateWithReshuffledDeck, action);
      }
      
      const drawnCard = state.deck[0];
      const updatedDeck = state.deck.slice(1);
      const playerIndex = action.playerIndex || state.currentPlayerIndex;
      
      // Verify valid player index
      if (playerIndex < 0 || playerIndex >= state.players.length) {
        console.error(`Invalid player index: ${playerIndex}`);
        return state;
      }
      
      console.log(`Player ${state.players[playerIndex].id} draws a ${drawnCard.type} card`);
      
      const updatedPlayers = state.players.map((player, index) => {
        if (index === playerIndex) {
          return {
            ...player,
            hand: [...player.hand, drawnCard]
          };
        }
        return player;
      });
      
      return {
        ...state,
        players: updatedPlayers,
        deck: updatedDeck
      };
      
    case 'DRAW_DESTINY':
      if (state.destinyDeck.length === 0) return state;
      
      const drawnDestiny = state.destinyDeck[0];
      const updatedDestinyDeck = state.destinyDeck.slice(1);
      
      // Determine opponent based on destiny card
      let opponentIndex = null;
      
      if (drawnDestiny.type === 'color') {
        // Find player with matching color
        opponentIndex = state.players.findIndex(
          player => player.color === drawnDestiny.value && 
                   state.currentPlayerIndex !== player.index
        );
      } else if (drawnDestiny.type === 'wild') {
        // Player chooses opponent - to be implemented later
        // For now, just choose the next player
        opponentIndex = (state.currentPlayerIndex + 1) % state.players.length;
      }
      
      // If no valid opponent found, choose the next player
      if (opponentIndex === null || opponentIndex === -1) {
        opponentIndex = (state.currentPlayerIndex + 1) % state.players.length;
      }
      
      return {
        ...state,
        destinyDeck: updatedDestinyDeck,
        encounter: {
          ...state.encounter,
          attackerId: state.players[state.currentPlayerIndex].id,
          defenderId: state.players[opponentIndex].id,
          destinyCard: drawnDestiny
        }
      };
      
    case 'RETRIEVE_SHIP_FROM_WARP':
      const playerToRetrieve = action.playerId || state.players[state.currentPlayerIndex].id;
      
      const updatedPlayersAfterRetrieve = state.players.map(player => {
        if (player.id === playerToRetrieve && player.warp > 0) {
          return {
            ...player,
            ships: {
              ...player.ships,
              home: (player.ships.home || 0) + 1
            },
            warp: player.warp - 1
          };
        }
        return player;
      });
      
      return {
        ...state,
        players: updatedPlayersAfterRetrieve
      };
      
    case 'SELECT_ENCOUNTER_CARD':
      const { playerId, cardInstanceId } = action;
      
      // Validate the action data
      if (!playerId || !cardInstanceId) return state;
      
      // Find the player and the card
      const playerToSelect = state.players.find(p => p.id === playerId);
      if (!playerToSelect) return state;
      
      const selectedCard = playerToSelect.hand.find(c => c.instanceId === cardInstanceId);
      if (!selectedCard) return state;
      
      // Determine if player is attacker or defender
      const isAttacker = playerId === state.encounter?.attackerId;
      const isDefender = playerId === state.encounter?.defenderId;
      
      if (!isAttacker && !isDefender) return state;
      
      // Remove card from player's hand
      const updatedPlayerSelect = {
        ...playerToSelect,
        hand: playerToSelect.hand.filter(c => c.instanceId !== cardInstanceId)
      };
      
      // Update players array with this player change
      const updatedPlayersSelect = state.players.map(p => 
        p.id === playerId ? updatedPlayerSelect : p
      );
      
      // Update the encounter with the selected card
      const updatedEncounter = {
        ...state.encounter,
        ...(isAttacker ? { attackerCard: selectedCard } : {}),
        ...(isDefender ? { defenderCard: selectedCard } : {})
      };
      
      return {
        ...state,
        players: updatedPlayersSelect,
        encounter: updatedEncounter
      };
    
    default:
      return state;
  }
}

// Helper function to get phase information by ID
function getPhaseById(phaseId) {
  // This is a simplified version - we should import the actual implementation
  const phases = {
    1: { name: "Start" },
    2: { name: "Destiny" },
    3: { name: "Launch" },
    4: { name: "Alliance" },
    5: { name: "Planning" },
    6: { name: "Reveal" },
    7: { name: "Resolution" }
  };
  
  return phases[phaseId] || { name: "Unknown" };
}

export default gameReducer; 