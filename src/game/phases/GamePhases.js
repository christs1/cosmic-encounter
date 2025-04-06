// Game phases for Cosmic Encounter
const GamePhases = {
  START: {
    id: 1,
    name: 'Start',
    description: 'Beginning of turn. Draw a card and retrieve ships from the warp.',
    actions: ['Draw one card', 'Retrieve one ship from the warp'],
    next: 'DESTINY'
  },
  
  DESTINY: {
    id: 2,
    name: 'Destiny',
    description: 'Draw a destiny card to determine which player you will encounter.',
    actions: ['Draw a destiny card', 'Identify opponent'],
    next: 'LAUNCH'
  },
  
  LAUNCH: {
    id: 3,
    name: 'Launch',
    description: 'Launch 1-4 ships from your colonies to the encounter.',
    actions: ['Select 1-4 ships to send', 'Place ships in the hyperspace gate'],
    next: 'ALLIANCE'
  },
  
  ALLIANCE: {
    id: 4,
    name: 'Alliance',
    description: 'Players may ally with the main players in the encounter.',
    actions: ['Invite allies', 'Accept/decline alliance offers', 'Commit ships to alliances'],
    next: 'PLANNING'
  },
  
  PLANNING: {
    id: 5,
    name: 'Planning',
    description: 'Both main players select and reveal encounter cards.',
    actions: ['Select encounter card', 'Play any pre-reveal artifacts or flares', 'Reveal cards simultaneously'],
    next: 'REVELATION'
  },
  
  REVELATION: {
    id: 6,
    name: 'Revelation',
    description: 'Resolve the encounter based on the revealed cards.',
    actions: ['Calculate attack totals or negotiate', 'Determine winner or deal outcome', 'Gain rewards or suffer consequences'],
    next: 'RESOLUTION'
  },
  
  RESOLUTION: {
    id: 7,
    name: 'Resolution',
    description: 'Resolve the aftermath and check for another encounter.',
    actions: ['Move ships as appropriate', 'Draw rewards', 'Check for victory', 'Possibly start second encounter'],
    next: 'START'
  }
};

// Array of phases in order
export const PhasesList = [
  GamePhases.START,
  GamePhases.DESTINY,
  GamePhases.LAUNCH,
  GamePhases.ALLIANCE,
  GamePhases.PLANNING,
  GamePhases.REVELATION,
  GamePhases.RESOLUTION
];

// Helper function to get phase by ID
export function getPhaseById(id) {
  return PhasesList.find(phase => phase.id === id) || GamePhases.START;
}

// Helper function to get next phase
export function getNextPhase(currentPhaseId) {
  const currentIndex = PhasesList.findIndex(phase => phase.id === currentPhaseId);
  if (currentIndex === -1) return GamePhases.START;
  
  const nextIndex = (currentIndex + 1) % PhasesList.length;
  return PhasesList[nextIndex];
}

export default GamePhases; 