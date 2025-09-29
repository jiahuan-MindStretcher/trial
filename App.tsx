
import React, { useState, useRef, useCallback } from 'react';
import { GAME_DATA } from './constants';
import { evaluateCharacterDrawing } from './services/geminiService';
import type { EvaluationResult, Scene } from './types';
import DrawingCanvas from './components/DrawingCanvas';
import type { DrawingCanvasRef } from './components/DrawingCanvas';
import { LoadingSpinner, BrushIcon, RedoIcon } from './components/Icons';

const App: React.FC = () => {
  const [currentSceneId, setCurrentSceneId] = useState<string>('START');
  const [totalScore, setTotalScore] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canvasRef = useRef<DrawingCanvasRef>(null);

  const currentScene: Scene = GAME_DATA[currentSceneId];

  const handleResetGame = () => {
    setCurrentSceneId('START');
    setTotalScore(0);
    setEvaluationResult(null);
    setError(null);
    setIsLoading(false);
  };

  const handleChoice = useCallback((nextSceneId: string) => {
    setEvaluationResult(null);
    setError(null);
    if (GAME_DATA[nextSceneId]) {
      setCurrentSceneId(nextSceneId);
    } else {
      console.error(`Scene ${nextSceneId} not found!`);
    }
  }, []);

  const handleSubmitDrawing = async () => {
    if (!canvasRef.current || !currentScene.characterChallenge) return;

    const imageDataUrl = canvasRef.current.toDataURL();
    // Prevent submission of empty canvas
    if (canvasRef.current.isEmpty()) {
        setError("The canvas is empty. Please write the character.");
        return;
    }
    
    setIsLoading(true);
    setError(null);
    setEvaluationResult(null);

    try {
      const result = await evaluateCharacterDrawing(
        currentScene.characterChallenge.character,
        imageDataUrl.split(',')[1] // Send only base64 data
      );
      setEvaluationResult(result);

      if (result.isCorrect) {
        setTotalScore((prev) => prev + result.score);
        setTimeout(() => {
          if (currentScene.characterChallenge?.onSuccess) {
            handleChoice(currentScene.characterChallenge.onSuccess);
          }
        }, 2500);
      } else {
         if (currentScene.characterChallenge?.onFail) {
            // allows retry
         }
      }
    } catch (err) {
      setError('The AI calligraphy master is meditating. Please try again later.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearCanvas = () => {
    if (canvasRef.current) {
      canvasRef.current.clearCanvas();
      setError(null);
    }
  };

  const renderEvaluation = () => {
    if (!evaluationResult) return null;
    const isSuccess = evaluationResult.isCorrect;
    const borderColor = isSuccess ? 'border-green-500' : 'border-red-500';
    const textColor = isSuccess ? 'text-green-300' : 'text-red-300';
  
    return (
      <div className={`mt-4 border-l-4 ${borderColor} bg-gray-800 p-4 rounded-r-lg shadow-lg animate-fade-in`}>
        <p className="font-bold text-lg mb-2">The Master's Verdict:</p>
        <p className={`text-2xl font-klee font-bold ${textColor}`}>Score: {evaluationResult.score}/10</p>
        <p className="mt-1 italic">"{evaluationResult.feedback}"</p>
        {isSuccess && currentScene.characterChallenge?.onSuccess && (
            <p className="mt-3 text-green-400 font-semibold animate-pulse">Excellent! The path forward is revealed...</p>
        )}
        {!isSuccess && (
             <p className="mt-3 text-yellow-400 font-semibold">Focus and try again. You can do it!</p>
        )}
      </div>
    );
  };
  

  const renderContent = () => {
    if (currentScene.isEnd) {
        return (
             <div className="text-center p-6 bg-gray-800 rounded-xl shadow-2xl">
                <h2 className="text-3xl font-bold text-yellow-400 mb-4 font-klee">{currentScene.title}</h2>
                <p className="text-lg mb-6 whitespace-pre-line">{currentScene.text}</p>
                <p className="text-2xl font-semibold text-white mb-8">Final Score: {totalScore}</p>
                <button
                    onClick={handleResetGame}
                    className="bg-yellow-500 text-gray-900 font-bold py-3 px-6 rounded-lg hover:bg-yellow-400 transition-transform transform hover:scale-105 shadow-lg focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:ring-opacity-50"
                >
                    Begin a New Journey
                </button>
            </div>
        )
    }

    if (currentScene.characterChallenge) {
      const { character, pinyin, meaning } = currentScene.characterChallenge;
      return (
        <div className="w-full">
            <p className="text-lg mb-4 text-gray-300 whitespace-pre-line">{currentScene.text}</p>
            <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
                <p className="text-center text-yellow-400 font-semibold">Your task:</p>
                <div className="flex justify-center items-center my-4">
                    <p className="text-8xl font-klee font-bold text-white">{character}</p>
                    <div className="ml-6 text-left">
                        <p className="text-2xl text-gray-300">{pinyin}</p>
                        <p className="text-lg text-gray-400">{meaning}</p>
                    </div>
                </div>
                <DrawingCanvas ref={canvasRef} />
                {error && <p className="text-red-400 text-center mt-2">{error}</p>}
                <div className="flex justify-center items-center gap-4 mt-4">
                    <button onClick={handleClearCanvas} disabled={isLoading} className="flex items-center gap-2 bg-gray-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                        <RedoIcon /> Clear
                    </button>
                    <button onClick={handleSubmitDrawing} disabled={isLoading} className="flex items-center gap-2 bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-500 transition-all duration-200 disabled:opacity-50 disabled:bg-green-800 disabled:cursor-wait">
                        {isLoading ? <><LoadingSpinner /> Evaluating...</> : <><BrushIcon /> Submit</>}
                    </button>
                </div>
            </div>
            {renderEvaluation()}
        </div>
      );
    }

    return (
      <div className="text-center">
        <p className="text-lg mb-6 whitespace-pre-line">{currentScene.text}</p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          {currentScene.choices?.map((choice) => (
            <button
              key={choice.nextScene}
              onClick={() => handleChoice(choice.nextScene)}
              className="bg-yellow-500 text-gray-900 font-bold py-3 px-6 rounded-lg hover:bg-yellow-400 transition-transform transform hover:scale-105 shadow-lg focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:ring-opacity-50"
            >
              {choice.text}
            </button>
          ))}
        </div>
      </div>
    );
  };
  
  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-3xl mx-auto">
        <header className="text-center mb-6 border-b-2 border-yellow-500/50 pb-4">
          <h1 className="text-4xl sm:text-5xl font-bold text-yellow-400 font-klee">
            Gemini Chinese Adventure
          </h1>
          <p className="text-gray-400 mt-2">A journey of characters and choices</p>
        </header>

        <main className="bg-gray-800/50 p-6 sm:p-8 rounded-2xl shadow-2xl border border-gray-700">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-white font-klee">{currentScene.title}</h2>
                <div className="text-xl font-semibold bg-yellow-500 text-gray-900 px-4 py-1 rounded-full shadow-md">
                    Score: {totalScore}
                </div>
            </div>
            <div className="flex justify-center">
                {renderContent()}
            </div>
        </main>
         <footer className="text-center mt-8 text-gray-500 text-sm">
            <p>Powered by Google Gemini. Adventure awaits.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
