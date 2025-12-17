import React, { useState } from 'react';
import { Challenge, ChallengeType, Player } from '../types';
import { Code, CheckCircle, XCircle } from 'lucide-react';

interface ChallengeModalProps {
  challenge: Challenge;
  player: Player;
  onComplete: (success: boolean) => void;
}

const ChallengeModal: React.FC<ChallengeModalProps> = ({ challenge, player, onComplete }) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [orderedItems, setOrderedItems] = useState<string[]>(
    challenge.type === ChallengeType.ORDER_LOGIC ? [...(challenge.options || [])] : []
  );
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // For Order Logic, simple click to swap mechanism
  const [swapSource, setSwapSource] = useState<number | null>(null);

  const handleSubmit = () => {
    let correct = false;

    if (challenge.type === ChallengeType.MULTIPLE_CHOICE || challenge.type === ChallengeType.DEBUGGING) {
      if (selectedOption === challenge.correctAnswer) {
        correct = true;
      }
    } else if (challenge.type === ChallengeType.ORDER_LOGIC) {
      // Compare arrays
      const answerArray = challenge.correctAnswer as string[];
      if (JSON.stringify(orderedItems) === JSON.stringify(answerArray)) {
        correct = true;
      }
    }

    setIsCorrect(correct);
    setHasSubmitted(true);
  };

  const handleFinish = () => {
    onComplete(isCorrect);
  };

  const handleSwap = (index: number) => {
    if (hasSubmitted) return;
    if (swapSource === null) {
      setSwapSource(index);
    } else {
      const newItems = [...orderedItems];
      const temp = newItems[swapSource];
      newItems[swapSource] = newItems[index];
      newItems[index] = temp;
      setOrderedItems(newItems);
      setSwapSource(null);
    }
  };

  // Helper to determine class for options based on state
  const getOptionClass = (opt: string) => {
    if (hasSubmitted) {
        if (opt === challenge.correctAnswer) {
            return 'bg-green-100 border-green-600 text-green-900 font-bold shadow-sm'; // Correct answer
        }
        if (selectedOption === opt && !isCorrect) {
            return 'bg-red-100 border-red-600 text-red-900 font-bold shadow-sm'; // Wrong selection
        }
        return 'border-gray-200 text-gray-400 opacity-60'; // Irrelevant options
    }

    if (selectedOption === opt) {
        return 'border-indigo-600 bg-indigo-50 text-indigo-900 font-bold shadow-md'; // Selected active
    }

    return 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50 text-gray-900'; // Default
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className={`p-6 text-white flex justify-between items-center ${player.color}`}>
          <div className="flex items-center gap-3">
            <span className="text-4xl">{player.avatar}</span>
            <div>
              <h2 className="text-2xl font-bold">Turno de {player.name}</h2>
              <p className="opacity-90 text-sm font-medium uppercase tracking-wide">
                {challenge.type === ChallengeType.ORDER_LOGIC ? "Ordena el algoritmo" : "Pregunta de lógica"}
              </p>
            </div>
          </div>
          <div className="bg-white/20 px-4 py-2 rounded-lg font-bold">
            {challenge.difficulty === 'easy' ? 'Fácil' : challenge.difficulty === 'medium' ? 'Media' : 'Difícil'}
          </div>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-4">{challenge.question}</h3>

          {challenge.codeSnippet && (
            <div className="bg-slate-900 text-green-400 p-4 rounded-lg font-mono text-sm mb-6 border border-slate-700 shadow-inner">
              <pre className="whitespace-pre-wrap">{challenge.codeSnippet}</pre>
            </div>
          )}

          {/* Interaction Area */}
          <div className="space-y-3">
            {(challenge.type === ChallengeType.MULTIPLE_CHOICE || challenge.type === ChallengeType.DEBUGGING) && (
              <div className="grid grid-cols-1 gap-3">
                {challenge.options?.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => !hasSubmitted && setSelectedOption(opt)}
                    disabled={hasSubmitted}
                    className={`p-4 rounded-xl text-left border-2 transition-all ${getOptionClass(opt)}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}

            {challenge.type === ChallengeType.ORDER_LOGIC && (
              <div className="space-y-2">
                <p className="text-sm text-gray-600 mb-2 font-medium">Haz clic en dos bloques para intercambiar sus posiciones:</p>
                {orderedItems.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSwap(idx)}
                    className={`p-3 rounded-lg border-2 cursor-pointer font-mono text-sm transition-all select-none ${
                      swapSource === idx 
                        ? 'border-indigo-600 bg-indigo-100 text-indigo-900 scale-105 shadow-lg z-10 font-bold' 
                        : 'border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-900'
                    } ${hasSubmitted ? (isCorrect ? 'border-green-400 bg-green-50 text-green-900' : 'border-red-400 bg-red-50 text-red-900') : ''}`}
                  >
                    <span className="inline-block w-6 text-gray-500 font-bold">{idx + 1}.</span> {item}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Feedback Section */}
          {hasSubmitted && (
            <div className={`mt-6 p-4 rounded-xl flex items-start gap-3 ${isCorrect ? 'bg-green-100 text-green-900 border border-green-200' : 'bg-red-100 text-red-900 border border-red-200'}`}>
              {isCorrect ? <CheckCircle className="w-6 h-6 flex-shrink-0 text-green-600" /> : <XCircle className="w-6 h-6 flex-shrink-0 text-red-600" />}
              <div>
                <h4 className="font-bold text-lg mb-1">{isCorrect ? '¡Correcto!' : 'Ups, incorrecto'}</h4>
                <p className="text-sm leading-relaxed opacity-90">{challenge.explanation}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end">
          {!hasSubmitted ? (
            <button
              onClick={handleSubmit}
              disabled={!selectedOption && challenge.type !== ChallengeType.ORDER_LOGIC}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              Comprobar Respuesta
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="bg-gray-800 hover:bg-gray-900 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-transform active:scale-95"
            >
              Continuar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChallengeModal;