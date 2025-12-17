import React from 'react';
import { Tile, TileType, Player } from '../types';
import { INITIAL_BOARD, BOARD_SIZE } from '../constants';
import { Star, AlertTriangle, HelpCircle, Gift } from 'lucide-react';

interface BoardProps {
  players: Player[];
}

const Board: React.FC<BoardProps> = ({ players }) => {
  // Helper to determine position on a 6x5 grid based on index 0-19
  // We want a loop around the edge
  // Top row: 0-5
  // Right col: 6-8
  // Bottom row: 9-14 (reversed)
  // Left col: 15-19 (reversed vertical)
  
  const getGridPosition = (index: number) => {
    const width = 6;
    const height = 5;

    // Top Row (0-5)
    if (index < width) return { col: index + 1, row: 1 };
    // Right Col (6-8)
    if (index < width + (height - 2)) return { col: width, row: index - width + 2 };
    // Bottom Row (9-14)
    if (index < width + (height - 2) + width) {
      const offset = index - (width + height - 2);
      return { col: width - offset, row: height };
    }
    // Left Col (15-19)
    const offset = index - (width + height - 2 + width);
    return { col: 1, row: height - 1 - offset };
  };

  const getTileColor = (type: TileType) => {
    switch (type) {
      case TileType.START: return 'bg-green-400 border-green-600';
      case TileType.DANGER: return 'bg-red-400 border-red-600';
      case TileType.STAR: return 'bg-yellow-400 border-yellow-600';
      case TileType.CHANCE: return 'bg-purple-400 border-purple-600';
      default: return 'bg-blue-400 border-blue-600';
    }
  };

  const getTileIcon = (type: TileType) => {
    switch (type) {
      case TileType.START: return <span className="text-xs font-bold">GO</span>;
      case TileType.DANGER: return <AlertTriangle className="w-5 h-5 text-white" />;
      case TileType.STAR: return <Star className="w-5 h-5 text-white" />;
      case TileType.CHANCE: return <HelpCircle className="w-5 h-5 text-white" />;
      default: return null;
    }
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto aspect-[6/5] bg-sky-100 rounded-3xl border-8 border-sky-300 p-8 shadow-inner">
      <div 
        className="grid grid-cols-6 grid-rows-5 gap-4 w-full h-full"
      >
        {/* Center Logo/Area */}
        <div className="col-start-2 col-end-6 row-start-2 row-end-5 bg-white/50 rounded-2xl flex items-center justify-center">
            <div className="text-center opacity-70">
                <h2 className="text-4xl font-bold text-sky-600 mb-2">LOGIC LAND</h2>
                <p className="text-sky-800 font-medium">¡Avanza y aprende!</p>
            </div>
        </div>

        {INITIAL_BOARD.map((tile) => {
          const { col, row } = getGridPosition(tile.id);
          const playersHere = players.filter(p => p.position === tile.id);

          return (
            <div
              key={tile.id}
              style={{ gridColumn: col, gridRow: row }}
              className={`relative flex items-center justify-center rounded-2xl border-b-4 shadow-lg transition-transform ${getTileColor(tile.type)}`}
            >
              {getTileIcon(tile.type)}
              
              {/* Tile Number (Optional) */}
              <span className="absolute top-1 left-2 text-[10px] text-white/70 font-bold">
                {tile.id}
              </span>

              {/* Players on this tile */}
              <div className="absolute -top-3 -right-3 flex flex-wrap justify-end gap-1 w-20 pointer-events-none">
                {playersHere.map((p) => (
                  <div 
                    key={p.id} 
                    className={`w-8 h-8 rounded-full border-2 border-white shadow-md flex items-center justify-center text-lg z-10 ${p.color}`}
                    title={p.name}
                  >
                    {p.avatar}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Board;