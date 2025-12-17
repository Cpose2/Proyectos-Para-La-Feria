import { Tile, TileType } from './types';

// Generate a simple loop board (20 tiles)
// Visualized as a rectangle perimeter
export const BOARD_SIZE = 20;

export const INITIAL_BOARD: Tile[] = Array.from({ length: BOARD_SIZE }, (_, i) => {
  let type = TileType.NORMAL;
  if (i === 0) type = TileType.START;
  else if (i === 5 || i === 15) type = TileType.DANGER;
  else if (i === 10) type = TileType.STAR; // Halfway point
  else if (i % 4 === 0) type = TileType.CHANCE;

  return {
    id: i,
    type,
    x: 0, // Coordinates calculated in component
    y: 0
  };
});

export const AVATARS = [
  { id: 'robot', name: 'Robo-Dev', emoji: '🤖', color: 'bg-blue-500' },
  { id: 'alien', name: 'Alien-Coder', emoji: '👾', color: 'bg-green-500' },
  { id: 'cat', name: 'Nyan-Script', emoji: '🐱', color: 'bg-yellow-500' },
  { id: 'fox', name: 'Firefox', emoji: '🦊', color: 'bg-orange-500' },
  { id: 'ninja', name: 'Git-Ninja', emoji: '🥷', color: 'bg-gray-800' },
  { id: 'wizard', name: 'React-Wizard', emoji: '🧙', color: 'bg-purple-600' },
];