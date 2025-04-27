import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Confetti from 'react-confetti';
import Navbar from '../components/Navbar';

// ✨ Custom Hook: get window width and height
const useWindowSize = () => {
  const [size, setSize] = useState([window.innerWidth, window.innerHeight]);
  
  useEffect(() => {
    const handleResize = () => {
      setSize([window.innerWidth, window.innerHeight]);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  
  return size;
};

const tasks = [
  "Stretch for 2 minutes", "Drink a glass of water", "Take 5 deep breaths", "Look at something green",
  "Walk around for 2 minutes", "Compliment yourself", "Write a positive note", "Do a quick desk cleanup",
  "Look outside a window", "Smile at yourself", "Listen to a song you love", "Close your eyes for a minute",
  "Think of 3 good things", "Stand up and stretch", "Write something you're grateful for", "Draw a doodle",
  "Read a motivational quote", "Visualize a calm place", "Check your posture", "High-five someone (virtually counts!)",
  "Clean your screen", "Do a breathing exercise", "Send a thank-you message", "Name one thing you’re proud of"
];

const getShuffledTasks = () => {
  const copy = [...tasks];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  copy.splice(12, 0, "FREE"); // Insert "FREE" in the center
  return copy;
};

const Bingogame = () => {
  const [board, setBoard] = useState(getShuffledTasks());
  const [selected, setSelected] = useState(Array(25).fill(false));
  const [points, setPoints] = useState(0);
  const [streak, setStreak] = useState(0);
  const [completedLines, setCompletedLines] = useState(new Set());
  const [showBingoPopup, setShowBingoPopup] = useState(false);
  const [width, height] = useWindowSize(); // 🌟 Use custom hook

  const handleClick = (index) => {
    if (board[index] === "FREE") return;
    const updated = [...selected];
    updated[index] = !updated[index];
    setSelected(updated);
    setPoints(prev => updated[index] ? prev + 5 : prev - 5);
  };

  const resetBoard = () => {
    setBoard(getShuffledTasks());
    setSelected(Array(25).fill(false));
    setPoints(0);
    setStreak(0);
    setCompletedLines(new Set());
    setShowBingoPopup(false);
  };

  useEffect(() => {
    const lines = [];

    for (let i = 0; i < 5; i++) {
      lines.push(Array.from({ length: 5 }, (_, j) => i * 5 + j)); // rows
      lines.push(Array.from({ length: 5 }, (_, j) => j * 5 + i)); // cols
    }

    lines.push([0, 6, 12, 18, 24]); // diagonal
    lines.push([4, 8, 12, 16, 20]); // diagonal

    let newCompleted = new Set();

    lines.forEach((line, idx) => {
      const isCompleted = line.every(index => selected[index] || index === 12);
      if (isCompleted && !completedLines.has(idx)) {
        newCompleted.add(idx);
      }
    });

    if (newCompleted.size > 0) {
      setCompletedLines(prev => new Set([...prev, ...newCompleted]));
      setStreak(prev => prev + newCompleted.size);
    }
  }, [selected]);

  useEffect(() => {
    if (streak >= 5) {
      setShowBingoPopup(true);

      const timeout = setTimeout(() => {
        resetBoard();
      }, 4000); // Show for 4 seconds then refresh board

      return () => clearTimeout(timeout);
    }
  }, [streak]);

  return (
    <div className='flex flex-col items-center min-h-screen bg-[url("/bg_img.png")] bg-cover bg-center p-4 pt-20'>
      <Navbar className="relative z-50" />
      <h1 className="text-4xl font-extrabold text-blue-800 mb-4 drop-shadow-lg text-center">Break Time Bingo</h1>
      <p className="text-center text-blue-900 mb-6 max-w-lg font-medium">
        Check off self-care tasks during your breaks. Complete a row, column, or diagonal to win! 🌟
      </p>

      {/* Bingo Board */}
      <div className="grid grid-cols-5 gap-2 mb-6">
        {board.map((task, idx) => (
          <div
            key={idx}
            onClick={() => handleClick(idx)}
            className={`h-24 w-24 p-2 rounded-lg shadow-md text-[11px] text-center flex items-center justify-center font-semibold cursor-pointer transition-all duration-200
              ${selected[idx] ? 'bg-blue-700 text-white scale-105' :
                idx === 12 ? 'bg-blue-500 text-white font-bold' :
                idx % 2 === 0 ? 'bg-white text-blue-800' : 'bg-blue-100 text-blue-900'}
            `}
          >
            {task}
          </div>
        ))}
      </div>

      {/* Score */}
      <div className="flex justify-center items-center gap-10 text-blue-800 font-medium text-lg mb-6">
        <div>Points: <span className="font-bold">{points}</span></div>
        <div>Streak: <span className="font-bold">{streak}</span></div>
      </div>

      {/* Controls */}
      <div className="flex gap-4">
        <button
          onClick={resetBoard}
          className="px-5 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
        >
          New Card
        </button>
        <Link
          to="/"
          className="px-5 py-2 bg-gray-200 text-gray-800 rounded-lg shadow hover:bg-gray-300"
        >
          Back Home
        </Link>
      </div>

      {/* 🎉 Confetti and Popup */}
      {showBingoPopup && (
        <>
          <Confetti width={width} height={height} numberOfPieces={300} recycle={false} />
          <div className="absolute inset-0 bg-black/50 flex flex-col justify-center items-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl text-center">
              <h2 className="text-4xl font-extrabold text-blue-700 mb-4 animate-bounce">🎉 Bingo! 🎉</h2>
              <p className="text-lg text-gray-700">You've earned wellness points!</p>
              <p className="text-sm text-gray-500 mt-2">Refreshing a new Bingo card...</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Bingogame;
