import React from "react";

export default function ControlPanel({
  selectedObjectName,
  backgroundColor,
  setBackgroundColor,
  autoRotate,
  setAutoRotate,
  animationSpeed,
  setAnimationSpeed,
  addObject,
  clearObjects,
  deselectObject,
  objectsCount,
  isLoading,
  loadError,

  // 🔥 thêm 3 props này
  selectedColor,
  setSelectedColor,
  selectedObjectRef,
}) {
  const handleColorChange = (e) => {
    const newColor = e.target.value;
    setSelectedColor(newColor);

    if (selectedObjectRef?.current) {
      selectedObjectRef.current.traverse((child) => {
        if (child.isMesh) {
          child.material = child.material.clone(); // tránh ảnh hưởng object khác
          child.material.color.set(newColor);
        }
      });
    }
  };

  return (
    <aside className="w-80 bg-slate-900/90 backdrop-blur-md border-l border-cyan-500/20 overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Background Color */}
        <div className="space-y-3">
          <label className="block text-cyan-400 font-mono text-sm uppercase tracking-wider">
            Background Color
          </label>
          <div className="flex gap-2">
            <input
              type="color"
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
              className="w-12 h-12 rounded border-2 border-cyan-500/30 cursor-pointer"
            />
            <input
              type="text"
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
              className="flex-1 bg-slate-800/50 border border-cyan-500/30 rounded px-3 text-cyan-300 font-mono text-sm"
            />
          </div>
        </div>

        {/* 🔥 Selected Object Color */}
        {selectedObjectName && (
          <div className="space-y-3">
            <label className="block text-purple-400 font-mono text-sm uppercase tracking-wider">
              Selected Object Color
            </label>
            <input
              type="color"
              value={selectedColor}
              onChange={handleColorChange}
              className="w-full h-12 rounded border-2 border-purple-500/30 cursor-pointer"
            />
            <div className="text-xs text-slate-400 font-mono">
              Editing: {selectedObjectName}
            </div>
          </div>
        )}

        {/* Auto Rotate */}
        <div className="space-y-3">
          <label className="flex items-center justify-between">
            <span className="text-cyan-400 font-mono text-sm uppercase tracking-wider">
              Auto Rotate
            </span>
            <button
              onClick={() => setAutoRotate(!autoRotate)}
              className={`w-12 h-6 rounded-full transition-all ${
                autoRotate ? "bg-cyan-500" : "bg-slate-700"
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                  autoRotate ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </label>

          {autoRotate && (
            <div className="space-y-2">
              <label className="block text-slate-400 text-xs">
                Speed: {animationSpeed.toFixed(1)}x
              </label>
              <input
                type="range"
                min="0.1"
                max="2"
                step="0.1"
                value={animationSpeed}
                onChange={(e) =>
                  setAnimationSpeed(parseFloat(e.target.value))
                }
                className="w-full accent-cyan-500"
              />
            </div>
          )}
        </div>

        {/* Add Objects */}
        <div className="space-y-3">
          <label className="block text-cyan-400 font-mono text-sm uppercase tracking-wider">
            Add Decorative Objects
          </label>

          <div className="grid grid-cols-2 gap-2">
            {["cube", "sphere", "torus", "cone"].map((type) => (
              <button
                key={type}
                onClick={() => addObject(type)}
                className="px-4 py-3 bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 border border-cyan-500/40 text-cyan-300 rounded hover:from-cyan-500/30 hover:to-cyan-600/30 transition-all font-mono text-sm"
              >
                {type.toUpperCase()}
              </button>
            ))}
          </div>

          <button
            onClick={clearObjects}
            className="w-full px-4 py-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded hover:bg-red-500/20 transition-all font-mono text-sm"
          >
            CLEAR ALL OBJECTS
          </button>
        </div>

        {/* Stats */}
        <div className="pt-4 border-t border-cyan-500/20 space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-slate-500">Decorative Objects:</span>
            <span className="text-cyan-400 font-mono">{objectsCount}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-500">Model Loaded:</span>
            <span
              className={`font-mono ${
                isLoading
                  ? "text-yellow-400"
                  : loadError
                  ? "text-red-400"
                  : "text-green-400"
              }`}
            >
              {isLoading ? "LOADING..." : loadError ? "ERROR" : "YES"}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}