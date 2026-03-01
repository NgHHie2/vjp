import { useRef, useCallback } from "react";

export function useCameraControls(cameraRef) {
  const controlsRef = useRef(null);

  // Initialize OrbitControls
  const initControls = useCallback((camera, domElement, OrbitControls) => {
    const controls = new OrbitControls(camera, domElement);

    // Sketchfab-like settings
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 2;
    controls.maxDistance = 20;
    controls.maxPolarAngle = Math.PI / 2; // Don't let camera go below ground
    controls.enablePan = true;
    controls.panSpeed = 0.8;
    controls.rotateSpeed = 0.8;
    controls.zoomSpeed = 1.2;

    // Mouse buttons
    controls.mouseButtons = {
      LEFT: 0, // Rotate
      MIDDLE: 1, // Zoom
      RIGHT: 2, // Pan
    };

    controlsRef.current = controls;
    return controls;
  }, []);

  // Update controls in animation loop
  const updateControls = useCallback(() => {
    if (controlsRef.current) {
      controlsRef.current.update();
    }
  }, []);

  // Reset view
  const resetView = useCallback(() => {
    if (controlsRef.current && cameraRef.current) {
      // Reset camera position
      cameraRef.current.position.set(0, 2, 5);

      // Reset controls target
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  }, [cameraRef]);

  // Dispose controls
  const disposeControls = useCallback(() => {
    if (controlsRef.current) {
      controlsRef.current.dispose();
    }
  }, []);

  return {
    controlsRef,
    initControls,
    updateControls,
    resetView,
    disposeControls,
  };
}
