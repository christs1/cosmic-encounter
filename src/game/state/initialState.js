export const initialState = {
  players: [], // Array of player objects { id, color, alienId, ships: { location: count }, hand: [], warp: 0, planets: [] }
  currentPlayerIndex: 0,
  currentPhase: 1, // Start phase
  deck: [], // Array of card objects
  discardPile: [],
  encounter: null, // { attackerId, defenderId, allies: [], attackerShips: {}, defenderShips: {}, attackerCard: null, defenderCard: null, result: null }
  destinyDeck: [], // Array of destiny card objects
  gameStarted: false,
  winner: null,
};

// TODO: Implement phase-specific action handlers for each game phase
// Initial setup and "Start Turn" phase have been implemented in setup.js
// Next steps: Implement logic for DESTINY, LAUNCH, ALLIANCE, PLANNING, REVELATION, and RESOLUTION phases
