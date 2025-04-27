import React, { useEffect, useRef, useState, useContext } from "react";
import Navbar from "../components/Navbar";
import { AppContent } from "../context/AppContext";
import { toast } from "react-toastify";
import axios from "axios";

const Pixelgame = () => {
  const { backendUrl, userData } = useContext(AppContent);
  const gridRef = useRef(null);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState("heart");
  const [gridSize, setGridSize] = useState(15);
  const [selectedColor, setSelectedColor] = useState("#000000");
  const [selectedColorCode, setSelectedColorCode] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [savedDrawings, setSavedDrawings] = useState([]);
const [isFetchingDrawings, setIsFetchingDrawings] = useState(false);

  // Color maps for templates
  const colorMaps = {
    heart: {
      1: "#ffcccc", // Light Pink
      2: "#ff0000", // Red
      3: "#ebc9f6", // Light Purple
    },
    mushroom: {
      1: "#ffffff", // White
      2: "#ff0000", // Red
      3: "#000000", // Black
    },
  };

  // Color options for free drawing
  const colorOptions = [
    { name: "Black", value: "#000000" },
    { name: "Red", value: "#ff0000" },
    { name: "Blue", value: "#0000ff" },
    { name: "Green", value: "#00ff00" },
    { name: "Yellow", value: "#ffff00" },
    { name: "Purple", value: "#800080" },
    { name: "Orange", value: "#ffa500" },
    { name: "Pink", value: "#ffc0cb" },
    { name: "White", value: "#ffffff" },
  ];

  // Grid size options
  const gridSizeOptions = [10, 15, 20, 25, 30];

  // Templates
  const templates = {
    heart: [
      [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
      [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
      [3, 3, 3, 3, 1, 1, 3, 3, 1, 1, 3, 3, 3, 3, 3],
      [3, 3, 3, 1, 2, 2, 1, 1, 2, 2, 1, 3, 3, 3, 3],
      [3, 3, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 3, 3, 3],
      [3, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 3, 3],
      [3, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 3, 3],
      [3, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 3, 3],
      [3, 3, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 3, 3, 3],
      [3, 3, 3, 1, 2, 2, 2, 2, 2, 2, 1, 3, 3, 3],
      [3, 3, 3, 3, 3, 1, 2, 2, 2, 2, 1, 3, 3, 3, 3],
      [3, 3, 3, 3, 3, 3, 1, 2, 2, 1, 3, 3, 3, 3, 3],
      [3, 3, 3, 3, 3, 3, 3, 1, 1, 3, 3, 3, 3, 3, 3],
      [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
      [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
    ],
    mushroom: [
      [1, 1, 1, 1, 1, 1, 1, 1, 3, 1, 1, 3, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 1, 1, 1, 1],
      [1, 1, 3, 1, 1, 1, 1, 1, 1, 1, 4, 4, 1, 1, 1, 1, 1, 1, 3, 1],
      [1, 1, 1, 1, 1, 1, 3, 1, 1, 4, 4, 4, 4, 1, 1, 1, 1, 1, 1, 1],
      [1, 3, 1, 1, 1, 1, 1, 1, 1, 4, 4, 4, 1, 1, 1, 3, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 3, 1, 1, 1, 5, 5, 5, 5, 5, 1, 1, 1, 1, 3, 1, 1],
      [1, 1, 1, 1, 1, 1, 5, 5, 5, 5, 5, 5, 5, 5, 5, 1, 1, 1, 1, 1],
      [1, 1, 3, 1, 1, 5, 5, 5, 6, 6, 6, 6, 6, 5, 5, 5, 1, 1, 1, 1],
      [1, 1, 1, 1, 5, 5, 7, 5, 6, 6, 6, 6, 6, 5, 7, 5, 5, 1, 1, 1],
      [1, 1, 1, 5, 5, 5, 5, 6, 6, 6, 6, 6, 6, 6, 5, 5, 5, 5, 1, 1],
      [1, 3, 1, 5, 5, 7, 5, 6, 6, 6, 6, 6, 6, 6, 5, 7, 5, 5, 1, 1],
      [1, 1, 1, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 1, 1],
      [1, 1, 1, 1, 1, 1, 8, 8, 8, 8, 8, 8, 8, 8, 1, 1, 1, 1, 3, 1],
      [1, 1, 3, 1, 1, 1, 8, 8, 8, 8, 8, 8, 8, 8, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 8, 8, 8, 8, 8, 8, 8, 8, 1, 1, 3, 1, 1, 1],
      [1, 1, 1, 1, 1, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 1, 1, 1, 1, 1],
      [1, 3, 1, 1, 9, 9, 10, 9, 9, 10, 9, 9, 10, 9, 9, 9, 1, 1, 1, 1],
      [1, 1, 1, 9, 9, 10, 10, 10, 9, 9, 10, 10, 10, 9, 9, 10, 9, 1, 3, 1],
      [9, 9, 9, 9, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 9, 9, 9, 9],
    ],
  };

  // Initialize or update grid
  useEffect(() => {
    initializeGrid();
  }, [currentTemplate, gridSize]);

  const initializeGrid = () => {
    // Clear the grid
    while (gridRef.current.firstChild) {
      gridRef.current.removeChild(gridRef.current.firstChild);
    }

    const template =
      currentTemplate === "free"
        ? Array(gridSize)
            .fill()
            .map(() => Array(gridSize).fill(1))
        : templates[currentTemplate];

    const rows = template.length;
    const cols = template[0].length;

    // Set grid dimensions
    gridRef.current.style.display = "grid";
    gridRef.current.style.gridTemplateColumns = `repeat(${cols}, 20px)`;
    gridRef.current.style.gridTemplateRows = `repeat(${rows}, 20px)`;

    // Create cells
    const newGrid = [];
    template.forEach((row, rowIndex) => {
      const newRow = [];
      row.forEach((code, colIndex) => {
        const cell = document.createElement("div");
        cell.classList.add(
          "w-5",
          "h-5",
          "box-border",
          "cursor-pointer",
          "flex",
          "items-center",
          "justify-center",
          "text-xs",
          "font-bold",
          "border",
          "border-gray-300"
        );

        cell.dataset.row = rowIndex;
        cell.dataset.col = colIndex;

        if (currentTemplate === "free") {
          cell.style.backgroundColor = "#ffffff";
        } else {
          cell.dataset.correctCode = code;
          cell.style.backgroundColor = "#233360";
          if (code !== 0) {
            cell.textContent = code;
            cell.style.color = "#ddd";
          }
        }

        gridRef.current.appendChild(cell);
        newRow.push(cell.style.backgroundColor);
      });
      newGrid.push(newRow);
    });

    // Save initial state to history
    setHistory([newGrid]);
    setHistoryIndex(0);
  };

  const saveStateToHistory = () => {
    const cells = gridRef.current.querySelectorAll("div");
    const currentState = Array.from(cells).map(
      (cell) => cell.style.backgroundColor
    );

    // If we're not at the end of history, remove future states
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(currentState);

    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleCellClick = (e) => {
    if (!e.target.classList.contains("flex")) return;

    if (currentTemplate === "free") {
      e.target.style.backgroundColor = selectedColor;
      saveStateToHistory();
    } else {
      const code = parseInt(e.target.dataset.correctCode);
      if (code !== 0 && selectedColorCode !== null) {
        if (selectedColorCode === code) {
          e.target.style.backgroundColor = colorMaps[currentTemplate][code];
          e.target.textContent = "";
          saveStateToHistory();
        }
      }
    }
  };

  const handleMouseDown = (e) => {
    if (!e.target.classList.contains("flex")) return;
    setIsMouseDown(true);
    handleCellClick(e);
  };

  const handleMouseMove = (e) => {
    if (isMouseDown) {
      handleCellClick(e);
    }
  };

  const handleMouseUp = () => {
    setIsMouseDown(false);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      applyStateToGrid(prevState);
      setHistoryIndex(historyIndex - 1);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      applyStateToGrid(nextState);
      setHistoryIndex(historyIndex + 1);
    }
  };

  const applyStateToGrid = (state) => {
    const cells = gridRef.current.querySelectorAll("div");
    cells.forEach((cell, index) => {
      cell.style.backgroundColor = state[index];
    });
  };

  const clearGrid = () => {
    const cells = gridRef.current.querySelectorAll("div");
    cells.forEach((cell) => {
      if (currentTemplate === "free") {
        cell.style.backgroundColor = "#ffffff";
      } else {
        const code = parseInt(cell.dataset.correctCode);
        cell.style.backgroundColor = "#233360";
        cell.textContent = code === 0 ? "" : code;
        cell.style.color = "#ddd";
      }
    });
    saveStateToHistory();
  };
  const saveDrawing = async () => {
    if (!userData) {
      toast.error("Please login to save your drawing");
      return;
    }

    const cells = gridRef.current.querySelectorAll("div");
    const pixelData = Array.from(cells).map(
      (cell) => cell.style.backgroundColor || "#ffffff"
    );
    const title = prompt("Enter a title for your drawing:");
    if (!title) return;

    try {
      setIsLoading(true);
      axios.defaults.withCredentials = true;
      const response = await axios.post(`${backendUrl}/api/pixel/save`, {
        title,
        pixelData,
        template: currentTemplate,
        gridSize: currentTemplate === "free" ? gridSize : null,
      });

      if (response.data.success) {
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error saving drawing:", error);
      toast.error(error.response?.data?.message || "Failed to save drawing");
    } finally {
      setIsLoading(false);
    }
  };
  const fetchUserDrawings = async () => {
    if (!userData) return;
    
    try {
      setIsFetchingDrawings(true);
      axios.defaults.withCredentials = true;
      const response = await axios.get(`${backendUrl}/api/pixel/list`);
      
      if (response.data.success) {
        setSavedDrawings(response.data.drawings);
      }
    } catch (error) {
      console.error('Error fetching drawings:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch drawings');
    } finally {
      setIsFetchingDrawings(false);
    }
  };
  
  const loadDrawing = async (id) => {
    try {
      axios.defaults.withCredentials = true;
      const response = await axios.get(`${backendUrl}/api/pixel/${id}`);
      
      if (response.data.success) {
        const { drawing } = response.data;
        setCurrentTemplate(drawing.template);
        if (drawing.template === 'free') {
          setGridSize(drawing.gridSize);
        }
        
        // Wait for grid to initialize
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const cells = gridRef.current.querySelectorAll('div');
        drawing.pixelData.forEach((color, index) => {
          if (cells[index]) {
            cells[index].style.backgroundColor = color;
          }
        });
        
        toast.success('Drawing loaded successfully');
      }
    } catch (error) {
      console.error('Error loading drawing:', error);
      toast.error(error.response?.data?.message || 'Failed to load drawing');
    }
  };
  
  useEffect(() => {
    fetchUserDrawings();
  }, [userData]);

  return (
    <div className='flex flex-col items-center min-h-screen bg-[url("/bg_img.png")] bg-cover bg-center p-4 pt-20'>
      <Navbar className="relative z-50" />

      <h1 className="text-4xl font-bold my-6 font-pixelify text-indigo-800 text-shadow-lg shadow-purple-200 mt-10">
        {currentTemplate === "heart"
          ? "Heart Template"
          : currentTemplate === "mushroom"
          ? "Mushroom Template"
          : "Free Drawing"}
      </h1>

      {/* Template Selection */}
      <div className="flex flex-wrap gap-4 mb-6 justify-center">
        <button
          onClick={() => setCurrentTemplate("heart")}
          className={`px-4 py-2 rounded-lg font-pixelify ${
            currentTemplate === "heart"
              ? "bg-indigo-600 text-white"
              : "bg-white text-indigo-600"
          }`}
        >
          Heart
        </button>
        <button
          onClick={() => setCurrentTemplate("mushroom")}
          className={`px-4 py-2 rounded-lg font-pixelify ${
            currentTemplate === "mushroom"
              ? "bg-indigo-600 text-white"
              : "bg-white text-indigo-600"
          }`}
        >
          Mushroom
        </button>
        <button
          onClick={() => setCurrentTemplate("free")}
          className={`px-4 py-2 rounded-lg font-pixelify ${
            currentTemplate === "free"
              ? "bg-indigo-600 text-white"
              : "bg-white text-indigo-600"
          }`}
        >
          Free Drawing
        </button>
      </div>

      {/* Grid Size Selection */}
      {currentTemplate === "free" && (
        <div className="flex flex-col items-center gap-2 mb-4 bg-white/80 p-4 rounded-lg shadow-md">
          <h2 className="font-pixelify text-xl">Grid Size</h2>
          <div className="flex flex-wrap justify-center gap-2">
            {gridSizeOptions.map((size) => (
              <button
                key={size}
                onClick={() => setGridSize(size)}
                className={`px-3 py-1 rounded-md font-pixelify ${
                  gridSize === size ? "bg-indigo-600 text-white" : "bg-gray-200"
                }`}
              >
                {size}x{size}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Color Palette */}
      <div className="flex flex-col items-center gap-4 mb-6 bg-white/80 p-4 rounded-lg shadow-md">
        <h2 className="font-pixelify text-xl">
          {currentTemplate === "free" ? "Color Palette" : "Select Color"}
        </h2>
        <div className="flex flex-wrap justify-center gap-3">
          {currentTemplate === "free"
            ? colorOptions.map((color) => (
                <div
                  key={color.value}
                  className={`flex flex-col items-center p-1 rounded-lg cursor-pointer transition-all ${
                    selectedColor === color.value
                      ? "ring-2 ring-indigo-600"
                      : ""
                  }`}
                  onClick={() => setSelectedColor(color.value)}
                  title={color.name}
                >
                  <div
                    className="w-8 h-8 rounded-full border-2 border-gray-700"
                    style={{ backgroundColor: color.value }}
                  ></div>
                </div>
              ))
            : Object.entries(colorMaps[currentTemplate]).map(
                ([code, color]) => (
                  <div
                    key={code}
                    className={`flex flex-col items-center p-2 rounded-lg cursor-pointer transition-all ${
                      selectedColorCode === parseInt(code)
                        ? "ring-2 ring-indigo-600"
                        : ""
                    }`}
                    onClick={() => setSelectedColorCode(parseInt(code))}
                  >
                    <div
                      className="w-8 h-8 rounded-full border-2 border-gray-700"
                      style={{ backgroundColor: color }}
                    ></div>
                    <span className="font-pixelify mt-1">{code}</span>
                  </div>
                )
              )}
        </div>
      </div>

      {/* Grid Container */}
      <div className="mb-6 relative z-10 bg-gray-200 p-2 rounded-lg shadow-lg">
        <div
          ref={gridRef}
          className="grid gap-px"
          onClick={handleCellClick}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        ></div>
      </div>

      {/* Controls */}
      <div className="flex gap-4 mb-6 flex-wrap justify-center">
        <button
          onClick={undo}
          disabled={historyIndex <= 0}
          className={`px-4 py-2 rounded-lg font-pixelify ${
            historyIndex <= 0
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600 text-white"
          }`}
        >
          Undo
        </button>
        <button
          onClick={redo}
          disabled={historyIndex >= history.length - 1}
          className={`px-4 py-2 rounded-lg font-pixelify ${
            historyIndex >= history.length - 1
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600 text-white"
          }`}
        >
          Redo
        </button>
        <button
          onClick={clearGrid}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-pixelify"
        >
          Clear
        </button>
        <button
          onClick={saveDrawing}
          disabled={isLoading}
          className={`px-4 py-2 ${
            isLoading ? "bg-gray-500" : "bg-green-500 hover:bg-green-600"
          } text-white rounded-lg transition-colors font-pixelify`}
        >
          {isLoading ? "Saving..." : "Save"}
        </button>
      </div>

      {savedDrawings.length > 0 && (
  <div className="mt-6 bg-white/80 p-4 rounded-lg shadow-md w-full max-w-4xl">
    <h2 className="font-pixelify text-2xl mb-4 text-center">Your Saved Drawings</h2>
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {savedDrawings.map(drawing => (
        <div 
          key={drawing._id} 
          className="border p-2 rounded-lg cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => loadDrawing(drawing._id)}
        >
          <div className="text-sm font-pixelify truncate">{drawing.title}</div>
          <div className="text-xs text-gray-500">
            {new Date(drawing.createdAt).toLocaleDateString()}
          </div>
          <button 
            onClick={async (e) => {
              e.stopPropagation();
              if (window.confirm('Delete this drawing?')) {
                try {
                  axios.defaults.withCredentials = true;
                  await axios.delete(`${backendUrl}/api/pixel/${drawing._id}`);
                  toast.success('Drawing deleted');
                  fetchUserDrawings();
                } catch (error) {
                  toast.error('Failed to delete drawing');
                }
              }
            }}
            className="mt-2 text-xs text-red-500 hover:text-red-700"
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  </div>
)}

      {/* Styles */}
      <style jsx global>{`
        .font-pixelify {
          font-family: "Pixelify Sans", sans-serif;
        }
      `}</style>
    </div>
  );
};

export default Pixelgame;
