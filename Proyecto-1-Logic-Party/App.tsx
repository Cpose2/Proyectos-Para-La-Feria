import React, { useState, useEffect, useRef } from 'react';
import PlayerSetup from './components/PlayerSetup';
import Board from './components/Board';
import Dice from './components/Dice';
import ChallengeModal from './components/ChallengeModal';
import { GamePhase, GameState, Player, TileType, Challenge } from './types';
import { INITIAL_BOARD, BOARD_SIZE } from './constants';
import { generateChallenge } from './services/geminiService';
import { Trophy, History, Coins, Star, Activity, Volume2, VolumeX } from 'lucide-react';
import { playSound, setSoundMuted } from './utils/soundEffects';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    players: [],
    currentPlayerIndex: 0,
    phase: GamePhase.SETUP,
    turnCount: 1,
    maxTurns: 10,
    board: INITIAL_BOARD,
    currentChallenge: null,
    lastDiceRoll: null,
    winner: null,
    messages: []
  });

  const [isRolling, setIsRolling] = useState(false);
  const [isLoadingChallenge, setIsLoadingChallenge] = useState(false);
  
  // Audio state
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize Music
  useEffect(() => {
    // URL for a playful, "Mario Party" style board game loop
    // Using 'Fun and Games' style track
    audioRef.current = new Audio('https://assets.mixkit.co/music/preview/mixkit-happy-times-158.mp3');
    audioRef.current.loop = true;
    audioRef.current.volume = 0.2; // 20% volume for better background blend

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const toggleMusic = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    setSoundMuted(newMuted); // Sync SFX mute state

    if (!audioRef.current) return;
    
    if (!newMuted) {
      audioRef.current.play().catch(e => console.log("Audio play failed:", e));
    } else {
      audioRef.current.pause();
    }
  };

  // Helper to add log messages
  const logMessage = (msg: string) => {
    setGameState(prev => ({
      ...prev,
      messages: [msg, ...prev.messages].slice(0, 5)
    }));
  };

  const handleStartGame = (players: Player[], maxTurns: number) => {
    setGameState(prev => ({
      ...prev,
      players,
      maxTurns,
      phase: GamePhase.ROLL_DICE,
      messages: ["¡El juego ha comenzado!"]
    }));

    playSound('turn');

    // Start music on user interaction (Start Game)
    if (audioRef.current && !isMuted) {
        audioRef.current.play().catch(e => console.log("Autoplay prevented:", e));
    }
  };

  const rollDice = () => {
    if (gameState.phase !== GamePhase.ROLL_DICE) return;

    setIsRolling(true);
    
    // Simulate roll sound effect loop
    const rollSoundInterval = setInterval(() => {
      playSound('dice');
    }, 150);

    // Simulate roll duration
    setTimeout(() => {
      clearInterval(rollSoundInterval);
      const roll = Math.floor(Math.random() * 6) + 1;
      setIsRolling(false);
      setGameState(prev => ({
        ...prev,
        lastDiceRoll: roll,
        phase: GamePhase.MOVING
      }));
      logMessage(`${gameState.players[gameState.currentPlayerIndex].name} sacó un ${roll}.`);
      movePlayer(roll);
    }, 1000);
  };

  const movePlayer = (steps: number) => {
    let currentSteps = 0;
    
    const moveInterval = setInterval(() => {
      currentSteps++;
      playSound('step'); // Step sound
      
      setGameState(prev => {
        const players = [...prev.players];
        const player = players[prev.currentPlayerIndex];
        
        // Circular board logic
        player.position = (player.position + 1) % BOARD_SIZE;
        
        return { ...prev, players };
      });

      if (currentSteps >= steps) {
        clearInterval(moveInterval);
        handleTileEvent();
      }
    }, 400);
  };

  const handleTileEvent = async () => {
    // Wait a moment after landing
    await new Promise(r => setTimeout(r, 500));
    playSound('pop');

    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    const tile = gameState.board[currentPlayer.position];

    let challengeType = "easy";
    if (tile.type === TileType.DANGER) challengeType = "hard";
    if (tile.type === TileType.STAR) challengeType = "medium";

    // Star logic: If land on star, can buy it?
    // For simplicity, Star tile gives a Star directly if challenge passed.
    
    setIsLoadingChallenge(true);
    setGameState(prev => ({ ...prev, phase: GamePhase.CHALLENGE }));

    const challenge = await generateChallenge(challengeType);
    
    setIsLoadingChallenge(false);
    setGameState(prev => ({
      ...prev,
      currentChallenge: challenge
    }));
  };

  const handleChallengeComplete = (success: boolean) => {
    setGameState(prev => {
      const players = [...prev.players];
      const player = players[prev.currentPlayerIndex];
      const tile = prev.board[player.position];

      // Update Stats
      player.stats.totalQuestions++;
      if (success) player.stats.correctAnswers++;

      // Rewards
      if (success) {
        if (tile.type === TileType.STAR) {
          player.stars += 1;
          logMessage(`¡${player.name} ganó una Estrella! ⭐`);
        } else if (tile.type === TileType.DANGER) {
            player.coins += 20;
            logMessage(`¡${player.name} superó el peligro y ganó 20 monedas!`);
        } else {
          player.coins += 10;
          logMessage(`${player.name} respondió bien (+10 monedas).`);
        }
      } else {
        logMessage(`${player.name} falló el reto.`);
        // Optional: Move back? Lose coins?
      }

      return {
        ...prev,
        players,
        currentChallenge: null,
        phase: GamePhase.TURN_END
      };
    });

    // Check end of turn immediately
    nextTurn();
  };

  const nextTurn = () => {
    setGameState(prev => {
      let nextIndex = prev.currentPlayerIndex + 1;
      let nextTurnCount = prev.turnCount;
      let nextPhase = GamePhase.ROLL_DICE;

      if (nextIndex >= prev.players.length) {
        nextIndex = 0;
        nextTurnCount++;
      }

      // Check Game Over
      if (nextTurnCount > prev.maxTurns) {
        // Determine winner
        const sortedPlayers = [...prev.players].sort((a, b) => {
            if (b.stars !== a.stars) return b.stars - a.stars;
            return b.coins - a.coins;
        });
        
        // Play Win Sound
        setTimeout(() => playSound('win'), 500);

        return {
          ...prev,
          phase: GamePhase.GAME_OVER,
          winner: sortedPlayers[0]
        };
      }
      
      // Play Turn Change Sound
      if (nextPhase === GamePhase.ROLL_DICE) {
          setTimeout(() => playSound('turn'), 500);
      }

      return {
        ...prev,
        currentPlayerIndex: nextIndex,
        turnCount: nextTurnCount,
        phase: nextPhase,
        lastDiceRoll: null
      };
    });
  };

  if (gameState.phase === GamePhase.SETUP) {
    return <PlayerSetup onStartGame={handleStartGame} />;
  }

  if (gameState.phase === GamePhase.GAME_OVER) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-800 flex items-center justify-center p-4 text-white">
        <div className="bg-white text-gray-800 p-10 rounded-3xl shadow-2xl max-w-2xl w-full text-center">
          <Trophy className="w-24 h-24 mx-auto text-yellow-500 mb-6" />
          <h1 className="text-5xl font-bold mb-2">¡Juego Terminado!</h1>
          <p className="text-xl text-gray-500 mb-8">Y el gran programador es...</p>
          
          <div className="bg-indigo-50 rounded-2xl p-6 mb-8 border-2 border-indigo-100">
            <div className="text-6xl mb-4">{gameState.winner?.avatar}</div>
            <h2 className="text-3xl font-bold text-indigo-700">{gameState.winner?.name}</h2>
            <div className="flex justify-center gap-6 mt-4">
               <div className="flex items-center gap-2"><Star className="w-5 h-5 text-yellow-500" /> {gameState.winner?.stars} Estrellas</div>
               <div className="flex items-center gap-2"><Coins className="w-5 h-5 text-yellow-500" /> {gameState.winner?.coins} Monedas</div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-gray-600">Ranking Final</h3>
            {[...gameState.players].sort((a,b) => b.stars - a.stars || b.coins - a.coins).map((p, i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-400">#{i+1}</span>
                        <span>{p.avatar} {p.name}</span>
                    </div>
                    <div className="text-sm font-bold text-gray-600">
                        {p.stars} ⭐ / {p.coins} 🪙
                    </div>
                </div>
            ))}
          </div>

          <button 
            onClick={() => window.location.reload()} 
            className="mt-8 bg-indigo-600 text-white px-8 py-3 rounded-full font-bold hover:bg-indigo-700 transition"
          >
            Jugar de nuevo
          </button>
        </div>
      </div>
    );
  }

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Bar */}
      <header className="bg-white shadow-sm p-4 flex justify-between items-center z-10">
        <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-indigo-600 hidden sm:block">Logic Party</h1>
            <span className="bg-gray-100 px-3 py-1 rounded-full text-sm font-medium text-gray-600">
                Turno {gameState.turnCount} / {gameState.maxTurns}
            </span>
            <button 
                onClick={toggleMusic}
                className="ml-2 p-2 rounded-full hover:bg-gray-100 text-indigo-600 transition-colors"
                title={isMuted ? "Activar Música" : "Silenciar Música"}
            >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
        </div>
        
        <div className="flex gap-4 overflow-x-auto pb-2 sm:pb-0">
          {gameState.players.map((p, i) => (
            <div 
                key={p.id} 
                className={`flex items-center gap-2 px-3 py-1 rounded-full border transition-all ${
                    i === gameState.currentPlayerIndex ? `border-2 ${p.color} bg-gray-50 shadow-md scale-105` : 'border-gray-200 opacity-70'
                }`}
            >
              <span className="text-xl">{p.avatar}</span>
              <div className="flex flex-col leading-none">
                <span className="text-xs font-bold text-gray-700">{p.name}</span>
                <div className="flex gap-2 text-[10px] text-gray-500">
                    <span className="flex items-center">⭐ {p.stars}</span>
                    <span className="flex items-center">🪙 {p.coins}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </header>

      {/* Main Game Area */}
      <main className="flex-1 p-4 flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto w-full">
        {/* Left: Board */}
        <div className="flex-1 flex items-center justify-center">
          <Board players={gameState.players} />
        </div>

        {/* Right: Controls & Info */}
        <div className="w-full lg:w-80 flex flex-col gap-6">
          
          {/* Action Card */}
          <div className="bg-white rounded-2xl shadow-xl p-6 flex flex-col items-center justify-center min-h-[200px] border border-gray-100">
            {gameState.phase === GamePhase.ROLL_DICE ? (
              <>
                <h2 className="text-xl font-bold text-gray-800 mb-4">Turno de {currentPlayer.name}</h2>
                <Dice 
                  rolling={isRolling} 
                  value={gameState.lastDiceRoll} 
                  onRoll={rollDice} 
                  disabled={isRolling} 
                />
              </>
            ) : gameState.phase === GamePhase.MOVING ? (
              <div className="text-center animate-bounce">
                <span className="text-4xl">{currentPlayer.avatar}</span>
                <p className="font-bold text-indigo-600 mt-2">Avanzando...</p>
              </div>
            ) : gameState.phase === GamePhase.CHALLENGE ? (
              <div className="text-center">
                <Activity className="w-10 h-10 text-orange-500 mx-auto animate-pulse mb-2" />
                <p className="font-bold text-gray-600">Preparando reto...</p>
              </div>
            ) : (
                <p className="text-gray-400">Espere...</p>
            )}
          </div>

          {/* Event Log */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 flex-1">
            <h3 className="font-bold text-gray-500 text-sm mb-3 flex items-center gap-2">
                <History className="w-4 h-4" /> Registro
            </h3>
            <div className="space-y-2">
              {gameState.messages.map((msg, idx) => (
                <div key={idx} className="text-sm p-2 bg-gray-50 rounded-lg text-gray-700 border-l-2 border-indigo-300">
                  {msg}
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>

      {/* Loading Overlay */}
      {isLoadingChallenge && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center flex-col">
            <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
            <h2 className="text-xl font-bold text-indigo-800">Generando Reto con IA...</h2>
            <p className="text-gray-500">Analizando lógica de programación</p>
        </div>
      )}

      {/* Challenge Modal */}
      {gameState.currentChallenge && (
        <ChallengeModal 
          challenge={gameState.currentChallenge} 
          player={currentPlayer}
          onComplete={handleChallengeComplete}
        />
      )}
    </div>
  );
};

export default App;