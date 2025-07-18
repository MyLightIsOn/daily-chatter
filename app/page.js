"use client"
// trend_word_game: Enhanced prototype with scoring, vowel restriction, and popup instructions

import { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";

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
  // If there are no revealed words yet or the array is empty, the game is not complete
  if (!revealedWords || revealedWords.length === 0) {
    return false;
  }
  return revealedWords.every(word => word.every(char => char !== '_'));
}

function getStarRating(guesses, incorrect) {
  const total = guesses.length;

  // Handle case when there are no guesses
  if (total === 0) return '⭐⭐⭐'; // Perfect score for no guesses (edge case)

  const accuracy = 1 - incorrect.length / total;

  if (total <= 12 && accuracy >= 0.9) return '⭐⭐⭐';
  if (total <= 18 && accuracy >= 0.75) return '⭐⭐';
  return '⭐';
}

export default function Home() {
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [guesses, setGuesses] = useState([]);
  const [input, setInput] = useState('');
  const [revealed, setRevealed] = useState([]);
  const [incorrect, setIncorrect] = useState([]);
  const [lastGuessWasVowel, setLastGuessWasVowel] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  // Fetch trending words from the API
  useEffect(() => {
    async function fetchWords() {
      try {
        setLoading(true);
        const response = await fetch('/api/grams');

        if (!response.ok) {
          throw new Error('Failed to fetch words');
        }

        const data = await response.json();

        // Check if we have the expected data format
        if (data.grams && Array.isArray(data.grams) && data.grams.length === 3) {
          setWords(data.grams);
          setRevealed(initializeState(data.grams));
        } else {
          console.warn('Unexpected data format from API', data);
          setError('Unexpected data format from API');
        }
      } catch (err) {
        console.error('Error fetching words:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchWords();
  }, []);


  useEffect(() => {
    setRevealed(updateRevealedWords(guesses, words));
  }, [guesses, words]);

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

    if (!words.some(word => word.toLowerCase().includes(char))) {
      setIncorrect(prev => [...prev, char]);
    }
  };

  const score = gameOver
    ? guesses.length === 0
      ? 36 // Maximum score if no guesses (unlikely but handles edge case)
      : Math.max(
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
                    <li className={"mb-4"}>You can guess any <strong>letter (A–Z)</strong>, <strong>digit (0–9)</strong> or <strong>special character</strong>.</li>
                    <li className={"mb-4"}>If your guess appears in any word, it will be revealed in the correct spots.</li>
                    <li className={"mb-4"}><strong>No back-to-back vowel guesses</strong> (A, E, I, O, U).</li>
                    <li className={"mb-4"}>The fewer guesses and mistakes you make, the higher your score.</li>
                </ul>
                <p className="mt-2">🎯 Solve all three words to reveal your <strong>stars</strong>, <strong>score</strong>, and <strong>accuracy</strong>!</p></div>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="ml-4 text-lg">AI selecting trending words...</p>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-100 text-red-700 rounded mb-4">
          <p>Error loading trending words: {error}</p>
          <p>Please try again later.</p>
        </div>
      ) : words.length === 0 ? (
        <div className="p-4 bg-yellow-100 text-yellow-700 rounded mb-4">
          <p>No words available. Please try again later.</p>
        </div>
      ) : (
        /* Show game UI when not loading, no error, and words are loaded */
        <>
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
                placeholder="Enter a letter, number, or special character"
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
              <p className="text-sm">Accuracy: {guesses.length === 0 ? '100.0' : ((1 - incorrect.length / guesses.length) * 100).toFixed(1)}%</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
