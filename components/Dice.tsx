import React, { useState, useEffect } from 'react';

interface DiceProps {
  rolling: boolean;
  value: number | null;
  onRoll: () => void;
  disabled: boolean;
}

const Dice: React.FC<DiceProps> = ({ rolling, value, onRoll, disabled }) => {
  const [displayValue, setDisplayValue] = useState(1);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (rolling) {
      interval = setInterval(() => {
        setDisplayValue(Math.floor(Math.random() * 6) + 1);
        setRotation({
          x: Math.random() * 360,
          y: Math.random() * 360
        });
      }, 100);
    } else if (value) {
      setDisplayValue(value);
      // Reset rotation to show face clearly (simplified for 2D representation within 3D context)
      setRotation({ x: 0, y: 0 }); 
    }
    return () => clearInterval(interval);
  }, [rolling, value]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-24 h-24 perspective-dice">
        <div 
          className="w-full h-full relative transition-transform duration-200 ease-linear transform-style-3d"
        >
          {/* Simple Dice visual - using a bg image or simple CSS flex dots */}
          <div className={`w-full h-full bg-white rounded-xl border-2 border-gray-300 shadow-[0_10px_20px_rgba(0,0,0,0.2)] flex items-center justify-center text-5xl font-bold text-indigo-600 transition-all ${rolling ? 'scale-90 rotate-12' : 'scale-100'}`}>
            {rolling ? '?' : displayValue}
          </div>
        </div>
      </div>
      
      <button
        onClick={onRoll}
        disabled={disabled}
        className={`px-8 py-3 rounded-full font-bold text-lg shadow-lg transition-all ${
          disabled 
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
            : 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white transform hover:-translate-y-1 active:scale-95'
        }`}
      >
        {rolling ? 'Rodando...' : 'Lanzar Dado'}
      </button>
    </div>
  );
};

export default Dice;