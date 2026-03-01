import React, { useState } from "react";
import Header from "./components/Header";
import ModelViewer from "./components/ModelViewer";
import ControlPanel from "./components/ControlPanel";
import { useThreeScene } from "./hooks/useThreeScene";
import { useCameraControls } from "./hooks/useCameraControls";

function App() {
  // State
  const [backgroundColor, setBackgroundColor] = useState("#2a2a2a");
  const [autoRotate, setAutoRotate] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(0.5);

  // Three.js scene management
  const {
    sceneRef,
    cameraRef,
    rendererRef,
    mainModelRef,
    objectsRef,
    selectedObjectRef,
    isLoading,
    setIsLoading,
    loadError,
    setLoadError,
    selectedObjectName,
    deselectObject,
    handleObjectClick,
    addObject,
    clearObjects,
    updateOutline,
  } = useThreeScene();

  // Camera controls with OrbitControls
  const {
    controlsRef,
    initControls,
    updateControls,
    resetView: cameraResetView,
  } = useCameraControls(cameraRef);

  // Combined reset view handler
  const handleResetView = () => {
    cameraResetView();
    deselectObject();
  };

  return (
    <div className="w-full h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden relative">
      {/* Animated background effects */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500 rounded-full filter blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      {/* Header */}
      <Header onResetView={handleResetView} />

      <div className="relative z-10 flex h-[calc(100vh-73px)]">
        {/* 3D Viewport */}
        <ModelViewer
          backgroundColor={backgroundColor}
          autoRotate={autoRotate}
          animationSpeed={animationSpeed}
          selectedObjectName={selectedObjectName}
          isLoading={isLoading}
          loadError={loadError}
          sceneRef={sceneRef}
          cameraRef={cameraRef}
          rendererRef={rendererRef}
          mainModelRef={mainModelRef}
          objectsRef={objectsRef}
          selectedObjectRef={selectedObjectRef}
          setIsLoading={setIsLoading}
          setLoadError={setLoadError}
          controlsRef={controlsRef}
          initControls={initControls}
          updateControls={updateControls}
          handleObjectClick={handleObjectClick}
          updateOutline={updateOutline}
        />

        {/* Control Panel */}
        <ControlPanel
          selectedObjectName={selectedObjectName}
          backgroundColor={backgroundColor}
          setBackgroundColor={setBackgroundColor}
          autoRotate={autoRotate}
          setAutoRotate={setAutoRotate}
          animationSpeed={animationSpeed}
          setAnimationSpeed={setAnimationSpeed}
          addObject={addObject}
          clearObjects={clearObjects}
          deselectObject={deselectObject}
          objectsCount={objectsRef.current.length}
          isLoading={isLoading}
          loadError={loadError}
        />
      </div>
    </div>
  );
}

export default App;
