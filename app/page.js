"use client"
// trend_word_game: Enhanced prototype with scoring, vowel restriction, and popup instructions

import { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";

const mockWords = ["andy dalton", "fully", "@potus"];
const vowels = ['a', 'e', 'i', 'o', 'u'];

function initializeState(words) {
  return words.map(word => word.split('').map(char => (char === ' ' ? ' ' : '_')));
}

function updateRevealedWords(guesses, words) {
  return words.map(word =>
    word.split('').map(char =>
      char === ' ' ? ' ' : guesses.includes(char.toLowerCase()) ? char : '_'
    )
  );
}

function isGameComplete(revealedWords) {
  return revealedWords.every(word => word.every(char => char !== '_'));
}

function getStarRating(guesses, incorrect) {
  const total = guesses.length;
  const accuracy = 1 - incorrect.length / total;

  if (total <= 12 && accuracy >= 0.9) return '⭐⭐⭐';
  if (total <= 18 && accuracy >= 0.75) return '⭐⭐';
  return '⭐';
}

export default function Home() {
  const [guesses, setGuesses] = useState([]);
  const [input, setInput] = useState('');
  const [revealed, setRevealed] = useState(initializeState(mockWords));
  const [incorrect, setIncorrect] = useState([]);
  const [lastGuessWasVowel, setLastGuessWasVowel] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    setRevealed(updateRevealedWords(guesses, mockWords));
  }, [guesses]);

  useEffect(() => {
    if (isGameComplete(revealed)) {
      setGameOver(true);
    }
  }, [revealed]);

  const handleGuess = () => {
    const char = input.toLowerCase();
    setInput('');
    if (!char || guesses.includes(char) || char.length !== 1) return;

    if (vowels.includes(char) && lastGuessWasVowel) return; // block consecutive vowels

    setGuesses(prev => [...prev, char]);
    setLastGuessWasVowel(vowels.includes(char));

    if (!mockWords.some(word => word.toLowerCase().includes(char))) {
      setIncorrect(prev => [...prev, char]);
    }
  };

  const score = gameOver
    ? Math.max(
        0,
        Math.floor(
          (36 - guesses.length) * (1 - incorrect.length / guesses.length)
        )
      )
    : null;

  return (
    <div className="max-w-xl mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">💬 Daily Chatter</h1>
        <Dialog>
          <DialogTrigger className="text-sm text-blue-600 underline">How to Play</DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>How to Play</DialogTitle>
              <div><ul className="list-disc list-inside space-y-1 mt-2">
                  <li className={"mb-4"}>Guess the three trending words of the day—letter by letter.</li>
                    <li className={"mb-4"}>You can guess any <strong>letter (A–Z)</strong> or <strong>digit (0–9)</strong>.</li>
                    <li className={"mb-4"}>If your guess appears in any word, it will be revealed in the correct spots.</li>
                    <li className={"mb-4"}><strong>No back-to-back vowel guesses</strong> (A, E, I, O, U).</li>
                    <li className={"mb-4"}>The fewer guesses and mistakes you make, the higher your score.</li>
                </ul>
                <p className="mt-2">🎯 Solve all three words to reveal your <strong>stars</strong>, <strong>score</strong>, and <strong>accuracy</strong>!</p></div>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {revealed.map((word, idx) => (
          <Card key={idx}>
            <CardContent className="text-xl font-mono p-4 tracking-wide">
              {word.join(' ')}
            </CardContent>
          </Card>
        ))}
      </div>

      {!gameOver && (
        <div className="mt-6 flex items-center space-x-2">
          <Input
            placeholder="Enter a letter or number"
            value={input}
            maxLength={1}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleGuess()}
          />
          <button onClick={handleGuess} className="bg-blue-500 text-white px-4 py-2 rounded">
            Guess
          </button>
        </div>
      )}

      <div className="mt-4">
        <p className="text-sm text-gray-600">Incorrect guesses: {incorrect.join(', ')}</p>
        <p className="text-sm text-gray-600">Total guesses: {guesses.length}</p>
      </div>

      {gameOver && (
        <div className="mt-6 p-4 bg-green-100 rounded shadow">
          <h2 className="text-lg font-bold mb-2">🎉 Game Complete!</h2>
          <p className="text-2xl">{getStarRating(guesses, incorrect)}</p>
          <p className="text-sm">Your Score: <span className="font-mono">{score}</span></p>
          <p className="text-sm">Incorrect Guesses: {incorrect.length}</p>
          <p className="text-sm">Accuracy: {((1 - incorrect.length / guesses.length) * 100).toFixed(1)}%</p>
        </div>
      )}
    </div>
  );
}
