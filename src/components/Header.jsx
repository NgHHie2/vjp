import React from "react";

export default function Header({ onResetView }) {
  return (
    <header className="relative z-10 border-b border-cyan-500/20 backdrop-blur-sm bg-slate-900/50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div>
          <h1
            className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent"
            style={{ fontFamily: "'Orbitron', monospace" }}
          >
            3D MODEL VIEWER
          </h1>
          <p className="text-cyan-300/60 text-sm mt-1 tracking-wider">
            GLTF INTERACTIVE EDITION
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onResetView}
            className="px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded hover:bg-cyan-500/20 transition-all font-mono text-sm"
          >
            RESET VIEW
          </button>
        </div>
      </div>
    </header>
  );
}
