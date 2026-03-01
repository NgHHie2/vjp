import React from "react";

export default function ViewportOverlay({
  selectedObjectName,
  isLoading,
  loadError,
}) {
  return (
    <>
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-cyan-400 font-mono text-lg">LOADING MODEL...</p>
            <p className="text-slate-500 text-sm mt-2">Please wait</p>
          </div>
        </div>
      )}

      {/* Error Overlay */}
      {loadError && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/90 backdrop-blur-sm">
          <div className="text-center max-w-md mx-auto p-8">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <p className="text-red-400 font-mono text-lg mb-2">LOADING ERROR</p>
            <p className="text-slate-400 text-sm mb-4">{loadError}</p>
            <div className="text-left bg-slate-800/50 border border-slate-700 rounded p-4 text-xs text-slate-300 space-y-2">
              <p className="text-cyan-400 font-mono">Setup Instructions:</p>
              <p>1. Place your .glb file in the /public folder</p>
              <p>2. Rename it to vf3.glb</p>
              <p>3. OR update modelPath in ModelViewer.jsx</p>
              <p className="text-yellow-400 mt-2">
                💡 Check browser console for details
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
