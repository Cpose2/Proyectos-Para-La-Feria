export enum GamePhase {
  SETUP = 'SETUP',
  ROLL_DICE = 'ROLL_DICE',
  MOVING = 'MOVING',
  CHALLENGE = 'CHALLENGE',
  TURN_END = 'TURN_END',
  GAME_OVER = 'GAME_OVER'
}

export enum TileType {
  NORMAL = 'NORMAL', // Blue: Basic logic question
  DANGER = 'DANGER', // Red: Hard question or penalty
  CHANCE = 'CHANCE', // Green: Random event
  STAR = 'STAR',     // Yellow: Buy a star / Big reward
  START = 'START'
}

export enum ChallengeType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  ORDER_LOGIC = 'ORDER_LOGIC', // Sort lines of code
  DEBUGGING = 'DEBUGGING', // Find the error
  PSEUDOCODE = 'PSEUDOCODE' // Fill in the blank
}

export interface Player {
  id: number;
  name: string;
  avatar: string; // Emoji or color code
  color: string;
  coins: number;
  stars: number;
  position: number; // Index on the board
  stats: {
    correctAnswers: number;
    totalQuestions: number;
  };
}

export interface Tile {
  id: number;
  type: TileType;
  x: number; // For visual layout if needed, though we might use grid index
  y: number;
}

export interface Challenge {
  question: string;
  type: ChallengeType;
  options?: string[]; // For multiple choice
  correctAnswer: string | string[];
  explanation: string;
  codeSnippet?: string; // Code context
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface GameState {
  players: Player[];
  currentPlayerIndex: number;
  phase: GamePhase;
  turnCount: number;
  maxTurns: number;
  board: Tile[];
  currentChallenge: Challenge | null;
  lastDiceRoll: number | null;
  winner: Player | null;
  messages: string[]; // Log of events
}