import React, { useState, useCallback, useEffect, useRef } from 'react';
import GameCanvas from './components/GameCanvas';
import QuestionModal from './components/QuestionModal';
import { fetchCodingQuestion, generateBinaryQuestion } from './services/geminiService';
import { GameState, GameMod, Question } from './types';
import { Heart, Terminal, Grid, Settings, Lock, ShoppingCart, Play, Skull, Trophy, Volume2, Gamepad2, MoreVertical, Database, Home, ArrowRight, Loader2, Bot } from 'lucide-react';
import { audioSynth } from './utils/audio';

// Base de datos de hechos curiosos de informática para mostrar como recompensa
const CS_FACTS = [
  "INFO: Los arrays siempre empiezan en el índice 0.",
  "INFO: HTML no es un lenguaje de programación, es de marcado.",
  "INFO: 'Bug' viene de una polilla real encontrada en una computadora en 1947.",
  "INFO: La primera programadora de la historia fue Ada Lovelace.",
  "INFO: CPU significa Unidad Central de Procesamiento.",
  "INFO: RAM es memoria volátil; se borra al apagar la PC.",
  "INFO: 1 Byte son 8 Bits.",
  "INFO: Python se llama así por los Monty Python, no la serpiente.",
  "INFO: Ctrl+Z es la herramienta más poderosa del desarrollador.",
  "INFO: Linux es el kernel, GNU es el sistema operativo.",
  "INFO: 404 significa 'No Encontrado'.",
  "INFO: En binario, 1 + 1 = 10.",
  "INFO: Un 'loop infinito' nunca termina (¡Cuidado!).",
  "INFO: Git es una máquina del tiempo para tu código.",
  "INFO: WiFi no significa 'Wireless Fidelity', no significa nada.",
  "INFO: El primer videojuego fue 'Tennis for Two' (1958).",
  "INFO: SQL se usa para hablar con bases de datos.",
  "INFO: 'Hola Mundo' es el primer programa clásico.",
  "INFO: La nube es solo la computadora de otra persona.",
  "INFO: 1024 bytes hacen 1 Kilobyte (en sistema binario)."
];

const AVAILABLE_MODS: GameMod[] = [
  { id: 'moon_gravity', name: 'Moon Gravity', description: 'Low gravity jumps', price: 2000, active: false },
  { id: 'speed_runner', name: 'Speed Runner', description: 'Move 2x faster', price: 3000, active: false },
  { id: 'super_jump', name: 'Super Jump', description: 'Jump higher', price: 4000, active: false },
  { id: 'big_head', name: 'Big Head', description: 'Funny visual effect', price: 1000, active: false },
  { id: 'matrix_mode', name: 'Matrix Mode', description: 'The code is real', price: 5000, active: false },
  { id: 'magnet', name: 'Magnet', description: 'Attract coins (WIP)', price: 6000, active: false },
  { id: 'shield', name: 'Shield', description: 'Start with 1 extra hit', price: 7000, active: false },
  { id: 'double_jump', name: 'Air Jump', description: 'Jump infinitely in mid-air', price: 8000, active: false },
  { id: 'death_touch', name: 'Death Touch', description: 'Insta-kill enemies', price: 15000, active: false },
  { id: 'triple_score', name: 'Score x3', description: 'Earn points faster', price: 10000, active: false },
  { id: 'god_mode', name: 'God Mode', description: 'Invincibility', price: 20000, active: false },
];

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [score, setScore] = useState(0);
  const [health, setHealth] = useState(3);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [maxLevelReached, setMaxLevelReached] = useState(1);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [highScore, setHighScore] = useState(0); 
  const [isInfiniteCoins, setIsInfiniteCoins] = useState(false);
  const [mods, setMods] = useState<GameMod[]>(AVAILABLE_MODS);
  const [gameKey, setGameKey] = useState(0); // Forcing remounts
  const [hasSeenIntro, setHasSeenIntro] = useState(false);

  // Interaction State to handle rewards/penalties
  const [interactionResult, setInteractionResult] = useState<{ id: number, success: boolean } | null>(null);

  // Educational System State
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);
  const [activeFact, setActiveFact] = useState<string | null>(null);
  const factTimeoutRef = useRef<number | null>(null);

  // Extras Tab State
  const [activeExtrasTab, setActiveExtrasTab] = useState<'mods' | 'sounds'>('mods');

  // Dev Console State
  const [showDevConsole, setShowDevConsole] = useState(false);
  const [devCommand, setDevCommand] = useState('');

  // Info Modal state
  const [showCredits, setShowCredits] = useState(false);
  
  // Konami Code State
  const [konamiIndex, setKonamiIndex] = useState(0);
  const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];


  useEffect(() => {
     if (score > highScore) setHighScore(score);
  }, [score]);

  // Global Key Listener (Dev Console & Konami)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        // Dev Console Toggle (Ctrl + 1)
        if (e.ctrlKey && e.key === '1') {
            e.preventDefault();
            setShowDevConsole(prev => !prev);
        }

        // Konami Code Logic
        if (e.key === konamiCode[konamiIndex]) {
           const next = konamiIndex + 1;
           if (next === konamiCode.length) {
               // Activate Secrets
               setIsInfiniteCoins(true);
               audioSynth.play1Up();
               setMods(prev => prev.map(m => m.id === 'god_mode' ? { ...m, active: true } : m));
               setKonamiIndex(0);
               setActiveFact("CHEAT ACTIVATED: GOD MODE & INFINITE COINS");
               setTimeout(() => setActiveFact(null), 3000);
           } else {
               setKonamiIndex(next);
           }
        } else {
           setKonamiIndex(0);
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [konamiIndex]);

  const handleDevCommandSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const cmd = devCommand.trim();
      
      if (cmd === '/FreeLevels') {
          setMaxLevelReached(30);
          setGameCompleted(true); // Unlock mods immediately
          audioSynth.playCoin(); 
      } else if (cmd === '/Rich') {
          setHighScore(999999);
          setScore(999999);
          audioSynth.playCoin();
      } else if (cmd === '/infCoins') {
          setIsInfiniteCoins(true);
          setHighScore(999999999);
          audioSynth.play1Up();
      }

      setDevCommand('');
      setShowDevConsole(false);
  };

  // RESTORED: Educational Question System
  const handleGameInteraction = useCallback(async (type: 'key' | 'secret' | 'boss') => {
      // Pause game physics immediately
      setGameState(GameState.PAUSED_FOR_QUESTION);
      // Set loading state to show spinner
      setIsLoadingQuestion(true);
      
      try {
          // 40% chance of Binary question (fast), 60% chance of AI coding question
          let question: Question;
          if (Math.random() > 0.4) {
             question = await fetchCodingQuestion('easy');
          } else {
             question = generateBinaryQuestion();
          }
          setCurrentQuestion(question);
      } catch (e) {
          // Fallback
          setCurrentQuestion(generateBinaryQuestion());
      } finally {
          setIsLoadingQuestion(false);
      }
  }, []);

  const handleQuestionAnswer = (isCorrect: boolean) => {
      if (isCorrect) {
          audioSynth.play1Up();
          setScore(s => s + 1000); // Bonus Points for knowledge
          
          // Show fact as reward
          const randomFact = CS_FACTS[Math.floor(Math.random() * CS_FACTS.length)];
          setActiveFact(randomFact);
          if (factTimeoutRef.current) clearTimeout(factTimeoutRef.current);
          factTimeoutRef.current = window.setTimeout(() => setActiveFact(null), 4000);

      } else {
          audioSynth.playFail();
          setHealth(h => Math.max(0, h - 1));
      }
      
      // Notify canvas of result to handle physics/logic (give key or knockback)
      setInteractionResult({ id: Date.now(), success: isCorrect });

      setCurrentQuestion(null);
      setGameState(GameState.PLAYING);
  };

  const handleNextLevel = () => {
      if (currentLevel < 30) {
        const next = currentLevel + 1;
        setCurrentLevel(next);
        if (next > maxLevelReached) setMaxLevelReached(next);
        setGameKey(k => k + 1);
        setGameState(GameState.PLAYING);
      } else {
        setGameCompleted(true);
        setGameState(GameState.VICTORY);
      }
  };

  const handleVictoryReturn = () => {
      setGameCompleted(true);
      setGameState(GameState.MENU);
  };

  const startNewGame = () => {
    setScore(0);
    setHealth(3);
    setCurrentLevel(1);
    setGameKey(k => k + 1);
    setActiveFact(null);
    setCurrentQuestion(null);
    setIsLoadingQuestion(false);
    setInteractionResult(null);
    
    // Play intro first time or if level 1
    if (!hasSeenIntro && !gameCompleted) {
      setGameState(GameState.INTRO);
    } else {
      setGameState(GameState.PLAYING);
      audioSynth.init();
      audioSynth.startMusic();
    }
  };
  
  const handleIntroComplete = () => {
      setHasSeenIntro(true);
      setGameState(GameState.PLAYING);
      audioSynth.init();
      audioSynth.startMusic();
  };

  const retryGame = () => {
    setHealth(3);
    setGameKey(k => k + 1);
    setGameState(GameState.PLAYING);
    setActiveFact(null);
    setCurrentQuestion(null);
    setInteractionResult(null);
    audioSynth.startMusic();
  };

  const selectLevel = (lvl: number) => {
    setCurrentLevel(lvl);
    setHealth(3);
    setGameKey(k => k + 1);
    setGameState(GameState.PLAYING);
    setActiveFact(null);
    setCurrentQuestion(null);
    setInteractionResult(null);
    audioSynth.init();
    audioSynth.startMusic();
  };

  const toggleMod = (id: string) => {
      setMods(prev => prev.map(m => m.id === id ? { ...m, active: !m.active } : m));
  };

  const buyMod = (id: string, price: number) => {
      if (isInfiniteCoins || highScore >= price) {
          if (!isInfiniteCoins) setHighScore(h => h - price);
          setMods(prev => prev.map(m => m.id === id ? { ...m, active: true } : m));
          audioSynth.playCoin();
      }
  };

  // SoundBoard Handlers
  const playSoundEffect = (type: string) => {
      audioSynth.init();
      switch(type) {
          case 'vine': audioSynth.playVineBoom(); break;
          case 'horn': audioSynth.playAirHorn(); break;
          case 'fail': audioSynth.playFail(); break;
          case 'jump': audioSynth.playJump(); break;
          case 'coin': audioSynth.playCoin(); break;
          case '1up': audioSynth.play1Up(); break;
          case 'music': audioSynth.startMusic(); break;
          case 'stop': audioSynth.stopMusic(); break;
      }
  };

  // New function to update health respecting max 99
  const updateHealth = (newHealth: number) => {
      const clamped = Math.min(Math.max(newHealth, 0), 99);
      setHealth(clamped);
  };

  return (
    <div className="min-h-screen bg-[#111] flex flex-col items-center justify-center font-[Press Start 2P] overflow-hidden">
      {/* DEV CONSOLE OVERLAY */}
      {showDevConsole && (
        <div className="fixed top-0 left-0 w-full z-[100] bg-black/90 border-b-2 border-green-500 shadow-[0_0_20px_rgba(0,255,0,0.5)]">
            <form onSubmit={handleDevCommandSubmit} className="flex items-center p-2 gap-2 max-w-5xl mx-auto">
                <Terminal size={16} className="text-green-500 animate-pulse" />
                <span className="text-green-600 text-sm">ADMIN_SHELL{'>'}</span>
                <input 
                    autoFocus
                    type="text" 
                    value={devCommand}
                    onChange={(e) => setDevCommand(e.target.value)}
                    placeholder="Enter command..."
                    className="bg-transparent border-none outline-none text-green-400 font-mono w-full text-sm"
                    autoComplete="off"
                />
            </form>
        </div>
      )}

      {/* CREDITS MODAL */}
      {showCredits && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur" onClick={() => setShowCredits(false)}>
              <div className="bg-slate-800 p-8 rounded border border-blue-500 max-w-md text-center" onClick={e => e.stopPropagation()}>
                  <h2 className="text-xl text-blue-400 mb-4">SUPER DEV BROS</h2>
                  <p className="text-white text-xs leading-6 mb-4">
                      Desarrollado para la Feria de Informática.
                      <br/>
                      ¡Gracias por jugar!
                  </p>
                  <button onClick={() => setShowCredits(false)} className="bg-slate-700 px-4 py-2 text-white text-xs rounded">CERRAR</button>
              </div>
          </div>
      )}

      <div className="w-full h-screen max-w-5xl aspect-video relative flex items-center justify-center">
        
        <div className="relative w-full h-full max-h-[100vh]">
          {/* HUD - Floating inside the game container */}
          {(gameState === GameState.PLAYING || gameState === GameState.PAUSED_FOR_QUESTION) && (
            <div className="absolute top-2 left-2 right-2 flex justify-between items-center z-10 pointer-events-none">
               <div className="flex gap-2 text-white">
                  <div className="flex items-center gap-2 bg-slate-900/80 px-2 py-1 md:px-4 md:py-2 rounded border border-slate-600 shadow-lg backdrop-blur-sm">
                     <div className="text-yellow-400 font-bold flex items-center gap-2">
                        <span className="text-[10px] md:text-xs">PTS</span>
                        <span className="text-sm md:text-xl font-mono">{score.toString().padStart(6, '0')}</span>
                     </div>
                  </div>
                  <div className="hidden md:flex items-center gap-2 bg-slate-900/80 px-4 py-2 rounded border border-slate-600 shadow-lg backdrop-blur-sm">
                      <span className="text-blue-400 text-xs">LEVEL {currentLevel}/30</span>
                  </div>
               </div>
               {/* NEW LIVES HUD */}
               <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-1 md:px-4 md:py-2 rounded border border-slate-600 shadow-lg backdrop-blur-sm text-white">
                  <div className="flex items-center gap-2">
                    <Bot size={24} className={health > 0 ? "text-blue-400" : "text-red-500"} />
                    <span className="text-xs md:text-sm">x</span>
                    <span className={`text-sm md:text-xl font-mono ${health === 0 ? "text-red-500 animate-pulse" : "text-white"}`}>
                        {health.toString().padStart(2, '0')}
                    </span>
                  </div>
               </div>
            </div>
          )}
          
          {/* LOADING SPINNER OVERLAY */}
          {gameState === GameState.PAUSED_FOR_QUESTION && isLoadingQuestion && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                  <div className="flex flex-col items-center gap-4 animate-pulse">
                      <Loader2 size={48} className="text-green-500 animate-spin" />
                      <span className="text-green-400 font-mono text-sm uppercase">Generando Desafío...</span>
                  </div>
              </div>
          )}

          {/* QUESTION MODAL (PAUSE OVERLAY) */}
          {gameState === GameState.PAUSED_FOR_QUESTION && currentQuestion && !isLoadingQuestion && (
              <QuestionModal question={currentQuestion} onAnswer={handleQuestionAnswer} />
          )}

          {/* EDUCATIONAL FACT NOTIFICATION (REWARD) */}
          {activeFact && (
              <div className="absolute top-16 left-0 right-0 z-20 flex justify-center px-4 pointer-events-none animate-slide-in">
                  <div className="bg-slate-900/90 border-l-4 border-green-500 p-4 rounded shadow-[0_4px_20px_rgba(0,0,0,0.5)] max-w-lg backdrop-blur flex items-start gap-3">
                      <Database className="text-green-500 shrink-0 mt-1" size={20} />
                      <div className="flex flex-col">
                          <span className="text-green-500 text-[10px] font-bold mb-1">DATA FRAGMENT ACQUIRED</span>
                          <p className="text-white text-xs leading-5 font-mono">{activeFact}</p>
                      </div>
                  </div>
              </div>
          )}
          
          {/* SKIP INTRO BUTTON */}
          {gameState === GameState.INTRO && (
             <div className="absolute top-4 right-4 z-50">
                 <button 
                     onClick={handleIntroComplete}
                     className="bg-white/20 hover:bg-white/40 backdrop-blur text-white px-4 py-2 rounded border border-white/50 flex items-center gap-2 font-bold text-xs"
                 >
                     SKIP INTRO <ArrowRight size={16} />
                 </button>
             </div>
          )}

          <GameCanvas 
            key={gameKey}
            initialScore={score}
            initialHealth={health}
            gameState={gameState} 
            setGameState={setGameState}
            onInteraction={handleGameInteraction}
            onScoreUpdate={setScore}
            onHealthUpdate={updateHealth}
            level={currentLevel}
            activeMods={mods}
            onIntroComplete={handleIntroComplete}
            interactionResult={interactionResult}
          />

          {/* MENUS & OVERLAYS */}
          
          {gameState === GameState.MENU && (
            <div className="absolute inset-0 bg-slate-900/95 flex flex-col items-center justify-center text-center p-8 z-10">
               <h1 className="text-3xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500 mb-8 font-[Press Start 2P]">SUPER DEV BROS</h1>
               
               <div className="flex gap-4">
                   <button onClick={startNewGame} className="px-4 py-3 md:px-8 md:py-4 bg-blue-600 text-white text-xs md:text-base font-bold rounded hover:bg-blue-500 flex items-center gap-2 shadow-[0_0_15px_rgba(37,99,235,0.5)]">
                       <Play size={20} /> {gameCompleted ? 'REINICIAR SISTEMA' : 'START GAME'}
                   </button>
                   <button onClick={() => setGameState(GameState.LEVEL_SELECT)} className="px-4 py-3 md:px-8 md:py-4 bg-slate-700 text-white text-xs md:text-base font-bold rounded hover:bg-slate-600 flex items-center gap-2">
                       <Grid size={20} /> LEVELS
                   </button>
               </div>

               <div className="absolute bottom-8 right-8">
                   {gameCompleted ? (
                       <button onClick={() => setGameState(GameState.EXTRAS)} className="text-white hover:text-green-400 animate-pulse bg-slate-800 p-2 rounded">
                           <MoreVertical size={32} />
                       </button>
                   ) : (
                       <button onClick={() => setShowCredits(true)} className="text-slate-500 hover:text-white transition-colors">
                           <Settings size={32} />
                       </button>
                   )}
               </div>
            </div>
          )}

          {gameState === GameState.LEVEL_SELECT && (
             <div className="absolute inset-0 bg-slate-900 flex flex-col p-8 z-20 overflow-y-auto">
                 <div className="flex justify-between items-center mb-6">
                     <h2 className="text-2xl text-white">SELECT LEVEL</h2>
                     <button onClick={() => setGameState(GameState.MENU)} className="text-white hover:text-red-400">CLOSE</button>
                 </div>
                 <div className="grid grid-cols-5 md:grid-cols-6 gap-2">
                     {[...Array(30)].map((_, i) => {
                         const lvl = i + 1;
                         const locked = lvl > maxLevelReached;
                         return (
                             <button 
                                key={lvl}
                                onClick={() => !locked && selectLevel(lvl)}
                                disabled={locked}
                                className={`aspect-square flex items-center justify-center rounded border ${locked ? 'bg-slate-800 border-slate-700 text-slate-600 cursor-not-allowed' : 'bg-blue-900 border-blue-500 text-white hover:bg-blue-800'}`}
                             >
                                 {locked ? <Lock size={16} /> : lvl}
                             </button>
                         )
                     })}
                 </div>
             </div>
          )}

          {gameState === GameState.EXTRAS && (
             <div className="absolute inset-0 bg-slate-900 flex flex-col p-8 z-20 overflow-y-auto">
                 {/* Header */}
                 <div className="flex justify-between items-center mb-4">
                     <h2 className="text-xl md:text-2xl text-green-400">EXTRAS_MENU</h2>
                     <div className="text-yellow-400 flex items-center gap-2 text-xs md:text-sm">
                         BANK: {isInfiniteCoins ? <span className="text-2xl">∞</span> : `${highScore} pts`}
                     </div>
                     <button onClick={() => setGameState(GameState.MENU)} className="text-white hover:text-red-400 text-xs md:text-sm">CLOSE</button>
                 </div>

                 {/* Tabs */}
                 <div className="flex gap-2 mb-6 border-b border-slate-700 pb-2">
                     <button 
                        onClick={() => setActiveExtrasTab('mods')}
                        className={`px-4 py-2 flex items-center gap-2 ${activeExtrasTab === 'mods' ? 'bg-green-600 text-white' : 'bg-slate-800 text-slate-400'} rounded-t transition-colors`}
                     >
                        <Gamepad2 size={16} /> MODS
                     </button>
                     <button 
                        onClick={() => setActiveExtrasTab('sounds')}
                        className={`px-4 py-2 flex items-center gap-2 ${activeExtrasTab === 'sounds' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400'} rounded-t transition-colors`}
                     >
                        <Volume2 size={16} /> SOUNDBOARD
                     </button>
                 </div>
                 
                 {/* MODS CONTENT */}
                 {activeExtrasTab === 'mods' && (
                    <div className="grid gap-4">
                        {mods.map(mod => (
                            <div key={mod.id} className="flex justify-between items-center bg-slate-800 p-4 rounded border border-slate-700">
                                <div>
                                    <h3 className="text-white text-sm md:text-lg mb-1">{mod.name}</h3>
                                    <p className="text-slate-400 text-[10px] md:text-xs">{mod.description}</p>
                                </div>
                                {mod.active ? (
                                    <button onClick={() => toggleMod(mod.id)} className="px-4 py-2 bg-green-600 text-white text-[10px] md:text-xs rounded">ACTIVE</button>
                                ) : (
                                    <button 
                                        onClick={() => buyMod(mod.id, mod.price)}
                                        disabled={!isInfiniteCoins && highScore < mod.price}
                                        className={`px-4 py-2 text-[10px] md:text-xs rounded flex items-center gap-2 ${isInfiniteCoins || highScore >= mod.price ? 'bg-yellow-600 text-white hover:bg-yellow-500' : 'bg-slate-700 text-slate-500'}`}
                                    >
                                        <ShoppingCart size={14} /> {mod.price}
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                 )}

                 {/* SOUNDBOARD CONTENT */}
                 {activeExtrasTab === 'sounds' && (
                     <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                         <div className="col-span-full text-slate-400 text-xs mb-2">MEMES</div>
                         <button onClick={() => playSoundEffect('vine')} className="bg-slate-700 p-4 rounded hover:bg-purple-900 border border-slate-600 text-white">BOOM</button>
                         <button onClick={() => playSoundEffect('horn')} className="bg-slate-700 p-4 rounded hover:bg-purple-900 border border-slate-600 text-white">AIR HORN</button>
                         <button onClick={() => playSoundEffect('fail')} className="bg-slate-700 p-4 rounded hover:bg-purple-900 border border-slate-600 text-white">FAIL</button>
                         
                         <div className="col-span-full text-slate-400 text-xs mb-2 mt-4">CLASSICS</div>
                         <button onClick={() => playSoundEffect('jump')} className="bg-slate-700 p-4 rounded hover:bg-blue-900 border border-slate-600 text-white">JUMP</button>
                         <button onClick={() => playSoundEffect('coin')} className="bg-slate-700 p-4 rounded hover:bg-yellow-900 border border-slate-600 text-white">COIN</button>
                         <button onClick={() => playSoundEffect('1up')} className="bg-slate-700 p-4 rounded hover:bg-green-900 border border-slate-600 text-white">1-UP</button>

                         <div className="col-span-full text-slate-400 text-xs mb-2 mt-4">LOOPS</div>
                         <button onClick={() => playSoundEffect('music')} className="bg-green-800 p-4 rounded hover:bg-green-700 border border-green-600 text-white flex items-center justify-center gap-2"><Play size={16}/> PLAY MUSIC</button>
                         <button onClick={() => playSoundEffect('stop')} className="bg-red-800 p-4 rounded hover:bg-red-700 border border-red-600 text-white flex items-center justify-center gap-2"><Settings size={16}/> STOP</button>
                     </div>
                 )}
             </div>
          )}

          {gameState === GameState.LEVEL_COMPLETE && (
             <div className="absolute inset-0 bg-blue-900/95 flex flex-col items-center justify-center text-center p-8 z-10">
                 <Trophy size={80} className="text-yellow-400 mb-6 animate-bounce" />
                 <h2 className="text-3xl text-white mb-4">LEVEL {currentLevel} CLEARED!</h2>
                 <div className="flex gap-4 mt-8">
                    <button onClick={() => setGameState(GameState.MENU)} className="bg-slate-700 px-6 py-3 rounded text-white flex gap-2"><Home size={20}/> MENU</button>
                    <button onClick={handleNextLevel} className="bg-green-600 px-6 py-3 rounded text-white flex gap-2">NEXT <ArrowRight size={20}/></button>
                 </div>
             </div>
          )}

          {gameState === GameState.VICTORY && (
             <div className="absolute inset-0 bg-green-900/95 flex flex-col items-center justify-center text-center p-8 z-10">
                 <h2 className="text-4xl text-white mb-6 glitch-text">SYSTEM RESTORED</h2>
                 <p className="text-green-200 mb-8">KERNEL PANIC DEFEATED.</p>
                 <button onClick={handleVictoryReturn} className="px-8 py-4 bg-white text-green-900 font-bold rounded">RETURN TO MENU</button>
             </div>
          )}

          {gameState === GameState.GAME_OVER && (
             <div className="absolute inset-0 bg-red-950/90 flex flex-col items-center justify-center text-center p-8 z-10">
                 <Skull size={80} className="text-red-500 mb-4 animate-bounce" />
                 <h2 className="text-5xl text-white mb-4">FATAL ERROR</h2>
                 <button onClick={retryGame} className="mt-8 px-8 py-4 bg-white text-red-900 font-bold rounded">RETRY</button>
                 <button onClick={() => setGameState(GameState.MENU)} className="mt-4 text-white underline">MENU</button>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;