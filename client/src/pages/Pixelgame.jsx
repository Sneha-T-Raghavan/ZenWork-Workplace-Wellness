import React, { useEffect, useRef, useState, useContext } from "react";
import Navbar from "../components/Navbar";
import { AppContent } from "../context/AppContext";
import { toast } from "react-toastify";
import axios from "axios";
import quantize from "quantize";

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

  // Dynamic templates and color maps
  const [templates, setTemplates] = useState({
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
      [3, 3, 3, 1, 2, 2, 2, 2, 2, 2, 1, 3, 3, 3, 3],
      [3, 3, 3, 3, 3, 1, 2, 2, 2, 2, 1, 3, 3, 3, 3],
      [3, 3, 3, 3, 3, 3, 1, 2, 2, 1, 3, 3, 3, 3, 3],
      [3, 3, 3, 3, 3, 3, 3, 1, 1, 3, 3, 3, 3, 3, 3],
      [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
      [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
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
  });

  const [colorMaps, setColorMaps] = useState({
    heart: {
      1: "#ffcccc", // Light Pink
      2: "#ff0000", // Red
      3: "#ebc9f6", // Light Purple
    },
    mushroom: {
      1: "#0f103f", // Dark night sky
      2: "#1a237e", // Deep blue
      3: "#e6ee9c", // Stars yellow
      4: "#f5f5f5", // Moon white
      5: "#ff4081", // Mushroom cap
      6: "#f50057", // Darker cap
      7: "#f8bbd0", // Cap spots
      8: "#d7ccc8", // Stem
      9: "#004d40", // Dark grass
      10: "#1b5e20", // Light grass
    },
  });

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

  // Initialize or update grid
  useEffect(() => {
    initializeGrid();
  }, [currentTemplate, gridSize]);

  const initializeGrid = () => {
    while (gridRef.current.firstChild) {
      gridRef.current.removeChild(gridRef.current.firstChild);
    }

    let template;
    if (currentTemplate === "free") {
      template = Array(gridSize)
        .fill()
        .map(() => Array(gridSize).fill(1));
    } else if (currentTemplate === "custom" && !templates.custom) {
      template = Array(gridSize)
        .fill()
        .map(() => Array(gridSize).fill(1));
    } else {
      template = templates[currentTemplate];
    }

    const rows = template.length;
    const cols = template[0].length;

    gridRef.current.style.display = "grid";
    gridRef.current.style.gridTemplateColumns = `repeat(${cols}, 20px)`;
    gridRef.current.style.gridTemplateRows = `repeat(${rows}, 20px)`;

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
          "border-gray-300",
          "no-select"
        );

        cell.dataset.row = rowIndex;
        cell.dataset.col = colIndex;

        if (currentTemplate === "free" || (currentTemplate === "custom" && !templates.custom)) {
          cell.style.backgroundColor = "#ffffff";
        } else {
          cell.dataset.correctCode = code;
          cell.style.backgroundColor = "#233360";
          if (code !== 0) {
            const span = document.createElement("span");
            span.textContent = code;
            span.style.color = "#ddd";
            span.classList.add("pointer-events-none");
            cell.appendChild(span);
          }
        }

        gridRef.current.appendChild(cell);
        newRow.push(cell.style.backgroundColor);
      });
      newGrid.push(newRow);
    });

    setHistory([newGrid]);
    setHistoryIndex(0);
  };

  const saveStateToHistory = () => {
    const cells = gridRef.current.querySelectorAll("div");
    const currentState = Array.from(cells).map(
      (cell) => cell.style.backgroundColor
    );

    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(currentState);

    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleCellClick = (e) => {
    const cell = e.target.closest(".no-select");
    if (!cell) return;

    if (currentTemplate === "free" || (currentTemplate === "custom" && !templates.custom)) {
      cell.style.backgroundColor = selectedColor;
      saveStateToHistory();
    } else {
      const code = parseInt(cell.dataset.correctCode);
      if (code !== 0 && selectedColorCode !== null) {
        if (selectedColorCode === code) {
          cell.style.backgroundColor = colorMaps[currentTemplate][code];
          const span = cell.querySelector("span");
          if (span) {
            span.style.display = "none";
          }
          saveStateToHistory();
        }
      }
    }
  };

  const handleMouseDown = (e) => {
    const cell = e.target.closest(".no-select");
    if (!cell) return;

    e.preventDefault();
    setIsMouseDown(true);
    handleCellClick(e);
  };

  const handleMouseMove = (e) => {
    if (isMouseDown) {
      const cell = e.target.closest(".no-select");
      if (cell) {
        handleCellClick(e);
      }
    }
  };

  const handleMouseUp = () => {
    setIsMouseDown(false);
  };

  // Global mouse event listeners for drag coloring
  useEffect(() => {
    const handleGlobalMouseMove = (e) => {
      handleMouseMove(e);
    };

    const handleGlobalMouseUp = () => {
      setIsMouseDown(false);
    };

    if (isMouseDown) {
      document.addEventListener("mousemove", handleGlobalMouseMove);
      document.addEventListener("mouseup", handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleGlobalMouseMove);
      document.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [isMouseDown]);

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

      if (currentTemplate !== "free" && !(currentTemplate === "custom" && !templates.custom)) {
        const span = cell.querySelector("span");
        if (span) {
          const code = parseInt(cell.dataset.correctCode);
          const coloredBackground = colorMaps[currentTemplate][code];

          if (cell.style.backgroundColor === coloredBackground) {
            span.style.display = "none";
          } else {
            span.style.display = "";
          }
        }
      }
    });
  };

  const clearGrid = () => {
    const cells = gridRef.current.querySelectorAll("div");
    cells.forEach((cell) => {
      if (currentTemplate === "free" || (currentTemplate === "custom" && !templates.custom)) {
        cell.style.backgroundColor = "#ffffff";
      } else {
        const code = parseInt(cell.dataset.correctCode);
        cell.style.backgroundColor = "#233360";

        const span = cell.querySelector("span");
        if (span) {
          span.style.display = "";
        }
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
        templateData: currentTemplate === "custom" ? templates.custom : null,
        colorMap: currentTemplate === "custom" ? colorMaps.custom : null,
        userId: userData._id,
      });

      if (response.data.success) {
        toast.success(response.data.message);
        fetchUserDrawings();
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
      const response = await axios.get(`${backendUrl}/api/pixel/list`, {
        data: { userId: userData._id },
      });

      if (response.data.success) {
        setSavedDrawings(response.data.drawings);
      }
    } catch (error) {
      console.error("Error fetching drawings:", error);
      toast.error(error.response?.data?.message || "Failed to fetch drawings");
    } finally {
      setIsFetchingDrawings(false);
    }
  };

  const loadDrawing = async (id) => {
    try {
      axios.defaults.withCredentials = true;
      const response = await axios.get(`${backendUrl}/api/pixel/${id}`, {
        data: { userId: userData._id },
      });

      if (response.data.success) {
        const { drawing } = response.data;
        setCurrentTemplate(drawing.template);
        if (drawing.template === "free") {
          setGridSize(drawing.gridSize);
        }
        if (drawing.template === "custom") {
          setTemplates((prev) => ({
            ...prev,
            custom: drawing.templateData,
          }));
          setColorMaps((prev) => ({
            ...prev,
            custom: drawing.colorMap,
          }));
        }

        await new Promise((resolve) => setTimeout(resolve, 100));

        const cells = gridRef.current.querySelectorAll("div");
        drawing.pixelData.forEach((color, index) => {
          if (cells[index]) {
            cells[index].style.backgroundColor = color;

            if (currentTemplate !== "free") {
              const span = cells[index].querySelector("span");
              if (span) {
                const code = parseInt(cells[index].dataset.correctCode);
                const coloredBackground = colorMaps[currentTemplate][code];

                if (color === coloredBackground) {
                  span.style.display = "none";
                }
              }
            }
          }
        });

        toast.success("Drawing loaded successfully");
      }
    } catch (error) {
      console.error("Error loading drawing:", error);
      toast.error(error.response?.data?.message || "Failed to load drawing");
    }
  };

  useEffect(() => {
    fetchUserDrawings();
  }, [userData]);

  // Color quantization
  const quantizeColors = async (pixels, maxColors) => {
    const pixelsArray = [];
    for (let i = 0; i < pixels.length; i += 4) {
      pixelsArray.push([pixels[i], pixels[i + 1], pixels[i + 2]]);
    }

    const cmap = quantize(pixelsArray, maxColors);
    const palette = cmap.palette();

    const colorMap = {};
    palette.forEach((color, i) => {
      colorMap[i + 1] = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
    });

    return colorMap;
  };

  // Generate template from pixels
  const generateTemplate = (pixels, colorMap, size) => {
    const template = [];
    for (let y = 0; y < size; y++) {
      const row = [];
      for (let x = 0; x < size; x++) {
        const i = (y * size + x) * 4;
        const rgb = [pixels[i], pixels[i + 1], pixels[i + 2]];
        let closestCode = 1;
        let minDist = Infinity;
        Object.entries(colorMap).forEach(([code, color]) => {
          const [r, g, b] = color.match(/\d+/g).map(Number);
          const dist = Math.sqrt(
            (rgb[0] - r) ** 2 + (rgb[1] - g) ** 2 + (rgb[2] - b) ** 2
          );
          if (dist < minDist) {
            minDist = dist;
            closestCode = parseInt(code);
          }
        });
        row.push(closestCode);
      }
      template.push(row);
    }
    return template;
  };

  // Handle image upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = async () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        const targetSize = gridSize;
        canvas.width = targetSize;
        canvas.height = targetSize;
        ctx.drawImage(img, 0, 0, targetSize, targetSize);

        const imageData = ctx.getImageData(0, 0, targetSize, targetSize);
        const pixels = imageData.data;

        const colorMap = await quantizeColors(pixels, 10);
        const template = generateTemplate(pixels, colorMap, targetSize);

        setCurrentTemplate("custom");
        setTemplates((prev) => ({
          ...prev,
          custom: template,
        }));
        setColorMaps((prev) => ({
          ...prev,
          custom: colorMap,
        }));

        toast.success("Image converted to color-by-number!");
        URL.revokeObjectURL(img.src);
      };
    } catch (error) {
      console.error("Error processing image:", error);
      toast.error("Failed to process image");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-[url('/bg_img.png')] bg-cover bg-center p-4 pt-20">
      <Navbar className="relative z-50" />

      <h1 className="text-4xl font-bold my-6 font-pixelify text-indigo-800 text-shadow-lg shadow-purple-200 mt-10">
        {currentTemplate === "heart"
          ? "Heart Template"
          : currentTemplate === "mushroom"
          ? "Mushroom Template"
          : currentTemplate === "free"
          ? "Free Drawing"
          : "Custom Designs"}
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
        <button
          onClick={() => setCurrentTemplate("custom")}
          className={`px-4 py-2 rounded-lg font-pixelify ${
            currentTemplate === "custom"
              ? "bg-indigo-600 text-white"
              : "bg-white text-indigo-600"
          }`}
        >
          Custom Designs
        </button>
      </div>

      {/* Image Upload */}
      {currentTemplate === "custom" && (
        <div className="flex flex-col items-center gap-2 mb-4 bg-white/80 p-4 rounded-lg shadow-md">
          <h2 className="font-pixelify text-xl">Upload Custom Image</h2>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="p-2 border rounded-lg"
          />
        </div>
      )}

      {/* Grid Size Selection */}
      {(currentTemplate === "free" || (currentTemplate === "custom" && !templates.custom)) && (
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
          {(currentTemplate === "free" || (currentTemplate === "custom" && !templates.custom)) ? "Color Palette" : "Select Color"}
        </h2>
        <div className="flex flex-wrap justify-center gap-3">
          {(currentTemplate === "free" || (currentTemplate === "custom" && !templates.custom))
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
            : Object.entries(colorMaps[currentTemplate]).map(([code, color]) => (
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
              ))}
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
          <h2 className="font-pixelify text-2xl mb-4 text-center">
            Your Saved Drawings
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {savedDrawings.map((drawing) => (
              <div
                key={drawing._id}
                className="border p-2 rounded-lg cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => loadDrawing(drawing._id)}
              >
                <div className="text-sm font-pixelify truncate">
                  {drawing.title}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(drawing.createdAt).toLocaleDateString()}
                </div>
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    if (window.confirm("Delete this drawing?")) {
                      try {
                        axios.defaults.withCredentials = true;
                        await axios.delete(`${backendUrl}/api/pixel/${drawing._id}`, {
                          data: { userId: userData._id },
                        });
                        toast.success("Drawing deleted");
                        fetchUserDrawings();
                      } catch (error) {
                        console.error("Error deleting drawing:", error);
                        toast.error(error.response?.data?.message || "Failed to delete drawing");
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

        .no-select {
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }
      `}</style>
    </div>
  );
};

export default Pixelgame;