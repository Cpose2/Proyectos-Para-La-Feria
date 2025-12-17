
export enum GameState {
  MENU = 'MENU',
  INTRO = 'INTRO',
  LEVEL_SELECT = 'LEVEL_SELECT',
  EXTRAS = 'EXTRAS',
  PLAYING = 'PLAYING',
  PAUSED_FOR_QUESTION = 'PAUSED_FOR_QUESTION',
  LEVEL_COMPLETE = 'LEVEL_COMPLETE',
  GAME_OVER = 'GAME_OVER',
  VICTORY = 'VICTORY'
}

export interface PhysicsEntity {
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number;
  vy: number;
  color: string;
  type: 'player' | 'platform' | 'bug' | 'jumper' | 'shooter' | 'hider' | 'projectile' | 'coin' | 'floor' | 'endflag' | 'gate' | 'boss' | 'key' | 'locked_door' | 'treasure' | 'health_drop' | 'checkpoint';
  isDead?: boolean;
  animationOffset?: number; 
  hp?: number;     // For bosses
  maxHp?: number;  // For health bar rendering
  state?: 'idle' | 'attack' | 'hidden'; // For Hider/Shooter AI
  timer?: number; // For AI intervals
  isActive?: boolean; // For Checkpoints
}

export interface Player extends PhysicsEntity {
  isGrounded: boolean;
  facingRight: boolean;
  health: number;
  score: number;
  coyoteTimer: number;
  hasKey: boolean;
  isDying?: boolean; // New prop for death animation
  checkpointX?: number; // Respawn X
  checkpointY?: number; // Respawn Y
}

export interface Question {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  topic: string;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  text?: string;
}

export interface GameMod {
  id: string;
  name: string;
  description: string;
  price: number;
  active: boolean;
}