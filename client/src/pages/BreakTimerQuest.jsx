import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function BreakTimerQuest() {
  const [duration, setDuration] = useState(5); // default in minutes
  const [timeLeft, setTimeLeft] = useState(duration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [points, setPoints] = useState(0);
  const [streak, setStreak] = useState(0);
  const intervalRef = useRef(null);

  const formatSeconds = (seconds) => {
    return Math.ceil(seconds);
  };

  const handleDurationChange = (e) => {
    const newDuration = parseInt(e.target.value);
    setDuration(newDuration);
    if (!isRunning) {
      setTimeLeft(newDuration * 60);
    }
  };

  const startTimer = () => {
    if (!isRunning) {
      setIsRunning(true);
      setTimeLeft(duration * 60);
    }
  };

  const resetStreak = () => {
    setStreak(0);
    setPoints(0);
  };

  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          setIsRunning(false);
          setStreak((prevStreak) => prevStreak + 1);
          setPoints((prevPoints) => prevPoints + 10 * (streak + 1));
          return duration * 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [isRunning, duration, streak]);

  const radius = 100;
  const circumference = 2 * Math.PI * radius;
  const progress = circumference - (timeLeft / (duration * 60)) * circumference;

  return (
    <div className='flex flex-col items-center min-h-screen bg-[url("/bg_img.png")] bg-cover bg-center p-4 pt-20'>
      <Navbar className="relative z-50" />
      <h1 className="text-4xl font-extrabold text-indigo-800 mb-4 drop-shadow-sm">
        Break‑Timer Quest
      </h1>
      <p className="text-center text-blue-900 max-w-md mb-6 font-medium">
        Choose your break time and take a screen break to earn wellness points. Boost your streak!
      </p>

      {/* Timer Picker */}
      <div className="mb-6">
        <label className="font-medium text-indigo-800 mr-2">Break Duration:</label>
        <select
          value={duration}
          onChange={handleDurationChange}
          disabled={isRunning}
          className="px-4 py-1 bg-white border border-indigo-300 rounded-md text-indigo-800 shadow-sm"
        >
          <option value={3}>3 minutes</option>
          <option value={5}>5 minutes</option>
          <option value={10}>10 minutes</option>
        </select>
      </div>

      {/* Timer Circle Animation */}
      <div className="relative w-64 h-64 mb-6">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            className="text-blue-200"
            stroke="currentColor"
            strokeWidth="10"
            fill="transparent"
            r={radius}
            cx="50%"
            cy="50%"
          />
          <circle
            className="text-blue-600"
            stroke="currentColor"
            strokeWidth="10"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={progress}
            r={radius}
            cx="50%"
            cy="50%"
            style={{ transition: "stroke-dashoffset 1s linear" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-indigo-800 font-bold text-5xl">
          {formatSeconds(timeLeft)}
          <p className="text-sm mt-1">seconds</p>
        </div>
      </div>

      {/* Start / Message */}
      <div className="mt-4">
        {!isRunning ? (
          <button
            onClick={startTimer}
            className="px-6 py-2 bg-indigo-700 text-white font-semibold rounded-lg shadow hover:bg-indigo-800 transition duration-300"
          >
            Start Break
          </button>
        ) : (
          <p className="text-indigo-700 font-medium mt-2">
            Break in progress… step away from the screen!
          </p>
        )}
      </div>

      {/* Stats */}
      <div className="mt-10 flex gap-10 text-center text-indigo-800">
        <div>
          <p className="text-4xl font-bold">{points}</p>
          <p className="text-sm">Total Points</p>
        </div>
        <div>
          <p className="text-4xl font-bold">{streak}</p>
          <p className="text-sm">Break Streak</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-4 mt-12">
        <button
          onClick={resetStreak}
          className="px-5 py-2 bg-indigo-700 text-white rounded-lg hover:bg-indigo-800 shadow transition"
        >
          Reset Streak
        </button>
        <Link
          to="/"
          className="px-5 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 shadow transition"
        >
          Back Home
        </Link>
      </div>
    </div>
  );
}
