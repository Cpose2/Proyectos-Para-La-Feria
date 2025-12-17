import React, { useState } from 'react';
import { Player } from '../types';
import { AVATARS } from '../constants';
import { Users, Play, Trash2 } from 'lucide-react';

interface PlayerSetupProps {
  onStartGame: (players: Player[], maxTurns: number) => void;
}

const PlayerSetup: React.FC<PlayerSetupProps> = ({ onStartGame }) => {
  const [selectedAvatars, setSelectedAvatars] = useState<string[]>([]);
  const [players, setPlayers] = useState<Partial<Player>[]>([]);
  const [maxTurns, setMaxTurns] = useState(10);
  const [playerName, setPlayerName] = useState('');

  const addPlayer = (avatarId: string) => {
    if (players.length >= 4) return;
    const avatar = AVATARS.find(a => a.id === avatarId);
    if (!avatar) return;

    const newPlayer: Partial<Player> = {
      id: players.length + 1,
      name: playerName || `Jugador ${players.length + 1}`,
      avatar: avatar.emoji,
      color: avatar.color,
      coins: 10,
      stars: 0,
      position: 0,
      stats: { correctAnswers: 0, totalQuestions: 0 }
    };

    setPlayers([...players, newPlayer]);
    setSelectedAvatars([...selectedAvatars, avatarId]);
    setPlayerName('');
  };

  const removePlayer = (index: number) => {
    const playerToRemove = players[index];
    if (!playerToRemove || !playerToRemove.avatar) return;

    // Release the avatar back to the pool
    const avatarDef = AVATARS.find(a => a.emoji === playerToRemove.avatar);
    if (avatarDef) {
        setSelectedAvatars(prev => prev.filter(id => id !== avatarDef.id));
    }
    
    // Remove player
    setPlayers(prev => prev.filter((_, i) => i !== index));
  };

  const handleStart = () => {
    if (players.length > 0) {
      onStartGame(players as Player[], maxTurns);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-500 to-purple-700 text-white p-4">
      <div className="bg-white text-gray-800 p-8 rounded-2xl shadow-2xl max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-indigo-600 mb-2">Logic Party 🎉</h1>
          <p className="text-gray-500">Configura tu partida y elige tus personajes</p>
        </div>

        <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">Duración (Turnos)</label>
            <input 
                type="range" 
                min="5" 
                max="30" 
                value={maxTurns} 
                onChange={(e) => setMaxTurns(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="text-center mt-2 font-bold text-indigo-600">{maxTurns} Turnos</div>
        </div>

        <div className="mb-8 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" /> Agregar Jugadores ({players.length}/4)
          </h2>
          
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Escribe el nombre aquí..."
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 bg-white placeholder-gray-400"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              disabled={players.length >= 4}
            />
          </div>

          <p className="text-sm text-gray-500 mb-3">Haz clic en un avatar para unirte:</p>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {AVATARS.map((avatar) => (
              <button
                key={avatar.id}
                onClick={() => addPlayer(avatar.id)}
                disabled={selectedAvatars.includes(avatar.id) || players.length >= 4}
                className={`p-3 rounded-xl text-2xl transition-all transform hover:scale-105 ${
                  selectedAvatars.includes(avatar.id) 
                    ? 'opacity-30 cursor-not-allowed bg-gray-200' 
                    : `${avatar.color} text-white shadow-lg hover:shadow-xl`
                }`}
                title={avatar.name}
              >
                {avatar.emoji}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3 mb-8">
          {players.map((p, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="flex items-center gap-3">
                <span className={`w-10 h-10 flex items-center justify-center rounded-full ${p.color} text-xl text-white`}>
                  {p.avatar}
                </span>
                <span className="font-bold text-gray-700">{p.name}</span>
              </div>
              
              <button 
                onClick={() => removePlayer(idx)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors group"
                title="Eliminar jugador"
              >
                 <Trash2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </button>
            </div>
          ))}
          {players.length === 0 && (
            <div className="text-center text-gray-400 py-4">Agrega al menos 1 jugador para comenzar</div>
          )}
        </div>

        <button
          onClick={handleStart}
          disabled={players.length === 0}
          className={`w-full py-4 rounded-xl font-bold text-xl flex items-center justify-center gap-2 transition-all ${
            players.length > 0 
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg transform hover:-translate-y-1' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <Play className="w-6 h-6" /> ¡Comenzar Juego!
        </button>
      </div>
    </div>
  );
};

export default PlayerSetup;