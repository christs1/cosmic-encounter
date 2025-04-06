import { initialState } from '../state/initialState';

// Default aliens and cards as fallback
const DEFAULT_ALIENS = [{ id: 1, name: 'Mirror' }, { id: 5, name: 'Inferno' }];
const DEFAULT_CARDS = [
  { id: 1, type: 'attack', value: 8, instanceId: 'card_1' },
  { id: 2, type: 'attack', value: 12, instanceId: 'card_2' },
  { id: 3, type: 'negotiate', instanceId: 'card_3' }
];
const DEFAULT_DESTINY_CARDS = [{ type: 'color', value: 'red', instanceId: 'destiny_1' }];

/**
 * Fisher-Yates shuffle algorithm for randomizing arrays
 * @param {Array} array - The array to shuffle
 * @returns {Array} A new shuffled array
 */
function shuffle(array) {
  const newArray = [...array]; // Create a copy to avoid mutating the original
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

/**
 * Expands cards based on their count property
 * For example, a card with count: 5 will create 5 separate instances with unique IDs
 * @param {Array} cards - Array of card definition objects
 * @returns {Array} Expanded array with individual card instances
 */
function expandCardCounts(cards) {
  if (!cards || !Array.isArray(cards)) {
    console.warn("Invalid cards data provided to expandCardCounts");
    return [];
  }
  
  const expandedCards = [];
  cards.forEach(card => {
    const count = card.count || 1;
    for (let i = 0; i < count; i++) {
      // Create a unique instance of this card
      expandedCards.push({
        ...card,
        instanceId: `${card.id}_${i + 1}`, // Add a unique instance ID
      });
    }
  });
  
  console.log(`Expanded ${cards.length} card definitions into ${expandedCards.length} instances`);
  return expandedCards;
}

// Available player colors with fallback
const PLAYER_COLORS = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];

/**
 * Helper function to identify the local player in a game session
 * @param {Array} players - Array of player objects
 * @returns {Object|null} The local player object or null if not found
 */
export function getLocalPlayer(players) {
  // If any player is explicitly marked as local, return that one
  const explicitLocalPlayer = players.find(p => p.isLocal);
  if (explicitLocalPlayer) return explicitLocalPlayer;
  
  // Otherwise, default to the first player
  return players[0] || null;
}

/**
 * Main game setup function - initializes the game state
 * @param {Array} playerConfigs - Array of player configuration objects
 * @returns {Promise<Object>} Initialized game state
 */
export async function setupGame(playerConfigs) {
  console.log("Setting up game with player configs:", playerConfigs);
  const numPlayers = playerConfigs.length;
  
  // Validate player count
  if (numPlayers < 1 || numPlayers > 6) {
    throw new Error("Invalid number of players (must be 1-6)");
  }

  // Initialize with defaults in case data loading fails
  let allAliens = [...DEFAULT_ALIENS];
  let allCards = [...DEFAULT_CARDS];
  let allDestinyCards = [...DEFAULT_DESTINY_CARDS];

  try {
    // --- Load Alien Data ---
    try {
      console.log("Loading alien data...");
      const aliensResponse = await fetch('/data/aliens.json');
      
      if (!aliensResponse.ok) {
        throw new Error(`Failed to load aliens: ${aliensResponse.status} ${aliensResponse.statusText}`);
      }
      
      const aliensData = await aliensResponse.json();
      
      // Validate alien data structure
      if (!aliensData.aliens || !Array.isArray(aliensData.aliens) || aliensData.aliens.length === 0) {
        throw new Error("Invalid alien data format or empty aliens array");
      }
      
      allAliens = aliensData.aliens;
      console.log(`Successfully loaded ${allAliens.length} aliens from JSON`);
      // Add debug log with alien names and IDs
      console.log("[Setup] Loaded aliens:", allAliens.map(a => `${a.name}(ID:${a.id})`).join(', '));
    } catch (error) {
      console.warn("Could not load alien data, using defaults:", error);
    }
    
    // --- Load Card Data ---
    try {
      console.log("Loading card data...");
      const cardsResponse = await fetch('/data/cards.json');
      
      if (!cardsResponse.ok) {
        throw new Error(`Failed to load cards: ${cardsResponse.status} ${cardsResponse.statusText}`);
      }
      
      const cardsData = await cardsResponse.json();
      
      // Validate card data structure
      if (!cardsData.cards || !Array.isArray(cardsData.cards) || cardsData.cards.length === 0) {
        throw new Error("Invalid card data format or empty cards array");
      }
      
      // Expand card counts to create multiple instances
      allCards = expandCardCounts(cardsData.cards);
      console.log(`Successfully loaded and expanded to ${allCards.length} cards`);
      // Add debug log with card type distribution
      console.log("[Setup] Card distribution:", 
        Object.entries(allCards.reduce((acc, card) => {
          acc[card.type] = (acc[card.type] || 0) + 1;
          return acc;
        }, {})).map(([type, count]) => `${type}:${count}`).join(', ')
      );
      
      // Load destiny cards if available
      if (cardsData.destinyCards && Array.isArray(cardsData.destinyCards) && cardsData.destinyCards.length > 0) {
        allDestinyCards = expandCardCounts(cardsData.destinyCards);
        console.log(`Successfully loaded and expanded to ${allDestinyCards.length} destiny cards`);
      } else {
        console.warn("No valid destiny cards found, using defaults");
      }
    } catch (error) {
      console.warn("Could not load card data, using defaults:", error);
    }

    // --- Initialize Players ---
    console.log("Initializing player data...");
    const players = playerConfigs.map((config, index) => ({
      id: config.userId || `Player_${index + 1}`, // Use provided ID or generate one
      color: config.color || PLAYER_COLORS[index % PLAYER_COLORS.length], // Use provided color or assign from available colors
      alienId: null, // Will be assigned randomly
      ships: { home: 5 }, // Start with 5 ships in home system
      hand: [],
      warp: 0,
      planets: [`home_${index}`], // Each player starts controlling their home system
      isLocal: config.isLocal || false, // Flag to identify the local player
    }));
    
    // --- Assign Random Aliens with Guaranteed Uniqueness ---
    console.log("Assigning aliens to players...");
    
    // Ensure we have enough aliens for all players
    if (allAliens.length < numPlayers) {
      console.warn(`Not enough aliens (${allAliens.length}) for all players (${numPlayers}), some aliens may be duplicated`);
    }
    
    // Use a Set to track assigned alien IDs and ensure uniqueness
    const assignedAlienIds = new Set();
    const availableAliens = shuffle([...allAliens]);
    
    players.forEach((player) => {
      let assignedAlien = null;
      
      // Try to find an unassigned alien
      for (let i = 0; i < availableAliens.length; i++) {
        const alien = availableAliens[i];
        if (!assignedAlienIds.has(alien.id)) {
          assignedAlien = alien;
          assignedAlienIds.add(alien.id);
          availableAliens.splice(i, 1); // Remove from available pool
          break;
        }
      }
      
      // If no unassigned alien found (unlikely), pick randomly from all aliens
      if (!assignedAlien && availableAliens.length > 0) {
        assignedAlien = availableAliens.shift();
      }
      
      if (assignedAlien) {
        player.alienId = assignedAlien.id;
        console.log(`Assigned ${assignedAlien.name} (ID: ${assignedAlien.id}) to ${player.id}`);
      } else {
        console.warn(`Could not assign an alien to ${player.id}`);
      }
    });

    // --- Prepare and Shuffle Decks ---
    console.log("Preparing card decks...");
    const deck = shuffle([...allCards]);
    const destinyDeck = shuffle([...allDestinyCards]);
    
    // Debug log for first few cards in shuffled deck
    console.log("[Setup] First 3 cards after shuffle:", deck.slice(0, 3).map(c => 
      `${c.type}${c.value ? `(${c.value})` : ''}:${c.instanceId}`).join(', ')
    );

    // --- Deal Initial Hand of Cards ---
    console.log("Dealing initial hands to players...");
    const CARDS_PER_HAND = 8;
    
    // Check if we have enough cards for all players
    const totalCardsNeeded = numPlayers * CARDS_PER_HAND;
    if (deck.length < totalCardsNeeded) {
      console.warn(`Warning: Not enough cards (${deck.length}) to fully deal ${CARDS_PER_HAND} cards to ${numPlayers} players`);
    }
    
    players.forEach((player, playerIndex) => {
      // Calculate how many cards this player should get (fair distribution if limited)
      const cardsToTake = Math.min(
        CARDS_PER_HAND, 
        Math.floor(deck.length / (numPlayers - playerIndex))
      );
      
      for (let i = 0; i < cardsToTake; i++) {
        if (deck.length > 0) {
          player.hand.push(deck.pop());
        } else {
          console.warn(`Deck ran out during deal for player ${player.id}!`);
          break;
        }
      }
      
      console.log(`Dealt ${player.hand.length} cards to ${player.id}`);
    });

    // --- Select Random Starting Player ---
    const currentPlayerIndex = Math.floor(Math.random() * numPlayers);
    console.log(`Randomly selected ${players[currentPlayerIndex].id} as the starting player`);

    // --- Return Initialized Game State ---
    return {
      ...initialState, // Start with the default structure
      players,
      deck,
      destinyDeck,
      currentPlayerIndex,
      currentPhase: 1, // Ensure game starts at phase 1
      gameStarted: true,
    };
  } catch (error) {
    console.error("Error in setupGame:", error);
    // Fall back to synchronous setup with default values if async fails
    return setupGameSync(playerConfigs);
  }
}

/**
 * Synchronous fallback version of setup (uses default data)
 * Used if the async setupGame fails for any reason
 * @param {Array} playerConfigs - Array of player configuration objects
 * @returns {Object} Initialized game state with default values
 */
function setupGameSync(playerConfigs) {
  console.warn("Using synchronous fallback setup with default data");
  const numPlayers = playerConfigs.length;
  
  // --- Basic Player Initialization ---
  const players = playerConfigs.map((config, index) => ({
    id: config.userId || `Player_${index + 1}`,
    color: config.color || PLAYER_COLORS[index % PLAYER_COLORS.length],
    alienId: null,
    ships: { home: 5 },
    hand: [],
    warp: 0,
    planets: [`home_${index}`],
    isLocal: config.isLocal || false,
  }));

  // --- Assign Default Aliens with Tracked Assignment ---
  const assignedAlienIds = new Set();
  const availableAliens = shuffle([...DEFAULT_ALIENS]);
  
  players.forEach((player) => {
    let assignedAlien = null;
    
    // Try to find an unassigned alien from defaults
    for (let i = 0; i < availableAliens.length; i++) {
      const alien = availableAliens[i];
      if (!assignedAlienIds.has(alien.id)) {
        assignedAlien = alien;
        assignedAlienIds.add(alien.id);
        availableAliens.splice(i, 1);
        break;
      }
    }
    
    // If no unique alien available, just use any remaining alien
    if (!assignedAlien && availableAliens.length > 0) {
      assignedAlien = availableAliens.shift();
    }
    
    if (assignedAlien) {
      player.alienId = assignedAlien.id;
      console.log(`[Fallback] Assigned alien ID ${assignedAlien.id} to ${player.id}`);
    }
  });

  // --- Deal Default Cards (unique per player if possible) ---
  const shuffledDefaultCards = shuffle([...DEFAULT_CARDS]);
  const CARDS_PER_HAND = Math.min(8, Math.floor(shuffledDefaultCards.length / numPlayers));
  
  players.forEach((player, index) => {
    // Take a slice of the shuffled default cards
    const startIdx = index * CARDS_PER_HAND;
    const endIdx = Math.min(startIdx + CARDS_PER_HAND, shuffledDefaultCards.length);
    
    if (startIdx < shuffledDefaultCards.length) {
      player.hand = shuffledDefaultCards.slice(startIdx, endIdx).map(card => ({
        ...card,
        instanceId: `${card.id}_${index}_${Math.random().toString(36).substr(2, 5)}` // Ensure unique instanceId
      }));
    }
  });

  // Randomly select starting player
  const currentPlayerIndex = Math.floor(Math.random() * numPlayers);
  console.log(`[Fallback] Randomly selected ${players[currentPlayerIndex].id} as the starting player`);

  return {
    ...initialState,
    players,
    deck: [], // Empty deck since we've distributed all default cards
    destinyDeck: [...DEFAULT_DESTINY_CARDS],
    currentPlayerIndex,
    currentPhase: 1,
    gameStarted: true,
  };
}
