import { useRef, useState, useCallback } from "react";
import * as THREE from "three";

export function useThreeScene() {
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const mainModelRef = useRef(null);
  const objectsRef = useRef([]);
  const selectedObjectRef = useRef(null);
  const outlineMeshRef = useRef(null);
  const raycasterRef = useRef(new THREE.Raycaster());

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [selectedObjectName, setSelectedObjectName] = useState(null);

  // Select object and add outline
  const selectObject = useCallback((object) => {
    selectedObjectRef.current = object;

    // Remove previous outline
    if (outlineMeshRef.current && sceneRef.current) {
      sceneRef.current.remove(outlineMeshRef.current);
      outlineMeshRef.current.geometry.dispose();
      outlineMeshRef.current.material.dispose();
    }

    // Create outline for selected object
    if (object && sceneRef.current) {
      const outlineGeometry = object.geometry
        ? object.geometry.clone()
        : new THREE.BoxGeometry(1, 1, 1);
      const outlineMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ffff,
        side: THREE.BackSide,
        transparent: true,
        opacity: 0.3,
      });
      const outlineMesh = new THREE.Mesh(outlineGeometry, outlineMaterial);
      outlineMesh.position.copy(object.position);
      outlineMesh.rotation.copy(object.rotation);
      outlineMesh.scale.copy(object.scale).multiplyScalar(1.1);
      sceneRef.current.add(outlineMesh);
      outlineMeshRef.current = outlineMesh;

      // Update selected object name
      if (object === mainModelRef.current) {
        setSelectedObjectName("Main Model (GLB)");
      } else {
        const index = objectsRef.current.indexOf(object);
        setSelectedObjectName(`Decorative Object #${index + 1}`);
      }
    }
  }, []);

  // Deselect object
  const deselectObject = useCallback(() => {
    selectedObjectRef.current = null;
    setSelectedObjectName(null);

    // Remove outline
    if (outlineMeshRef.current && sceneRef.current) {
      sceneRef.current.remove(outlineMeshRef.current);
      outlineMeshRef.current.geometry.dispose();
      outlineMeshRef.current.material.dispose();
      outlineMeshRef.current = null;
    }
  }, []);

  // Handle object click for selection
  const handleObjectClick = useCallback(
    (e, mountRef) => {
      if (!mountRef.current || !cameraRef.current || !sceneRef.current) return;

      const rect = mountRef.current.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1,
      );

      // Raycasting to detect object click
      raycasterRef.current.setFromCamera(mouse, cameraRef.current);

      // Get all interactive objects
      const interactiveObjects = [];

      if (mainModelRef.current) {
        mainModelRef.current.traverse((child) => {
          if (child.isMesh) {
            interactiveObjects.push(child);
          }
        });
      }

      objectsRef.current.forEach((obj) => {
        interactiveObjects.push(obj);
      });

      const intersects = raycasterRef.current.intersectObjects(
        interactiveObjects,
        false,
      );

      if (intersects.length > 0) {
        const clickedObject = intersects[0].object;

        // Determine which parent object was clicked
        let targetObject = null;
        if (clickedObject.userData.isMainModel) {
          targetObject = mainModelRef.current;
        } else if (objectsRef.current.includes(clickedObject)) {
          targetObject = clickedObject;
        }

        if (targetObject) {
          selectObject(targetObject);
        }
      } else {
        deselectObject();
      }
    },
    [selectObject, deselectObject],
  );

  // Add decorative object
  const addObject = useCallback((type) => {
    if (!sceneRef.current) return;

    let geometry;
    switch (type) {
      case "cube":
        geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        break;
      case "sphere":
        geometry = new THREE.SphereGeometry(0.3, 32, 32);
        break;
      case "torus":
        geometry = new THREE.TorusGeometry(0.3, 0.1, 16, 100);
        break;
      case "cone":
        geometry = new THREE.ConeGeometry(0.3, 0.6, 32);
        break;
      default:
        geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    }

    const material = new THREE.MeshStandardMaterial({
      color: Math.random() * 0xffffff,
      metalness: 0.6,
      roughness: 0.3,
      emissive: 0x111111,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(
      (Math.random() - 0.5) * 4,
      Math.random() * 2 + 1,
      (Math.random() - 0.5) * 4,
    );
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData.isDecorativeObject = true;
    mesh.userData.objectType = type;

    sceneRef.current.add(mesh);
    objectsRef.current.push(mesh);
  }, []);

  // Clear all decorative objects
  const clearObjects = useCallback(() => {
    if (!sceneRef.current) return;

    // Deselect if selected object is being cleared
    if (
      selectedObjectRef.current &&
      objectsRef.current.includes(selectedObjectRef.current)
    ) {
      deselectObject();
    }

    objectsRef.current.forEach((obj) => {
      sceneRef.current.remove(obj);
      obj.geometry.dispose();
      obj.material.dispose();
    });
    objectsRef.current = [];
  }, [deselectObject]);

  // Update outline position
  const updateOutline = useCallback(() => {
    if (outlineMeshRef.current && selectedObjectRef.current) {
      outlineMeshRef.current.position.copy(selectedObjectRef.current.position);
      outlineMeshRef.current.rotation.copy(selectedObjectRef.current.rotation);
      outlineMeshRef.current.scale
        .copy(selectedObjectRef.current.scale)
        .multiplyScalar(1.1);
    }
  }, []);

  return {
    sceneRef,
    cameraRef,
    rendererRef,
    mainModelRef,
    objectsRef,
    selectedObjectRef,
    raycasterRef,
    isLoading,
    setIsLoading,
    loadError,
    setLoadError,
    selectedObjectName,
    selectObject,
    deselectObject,
    handleObjectClick,
    addObject,
    clearObjects,
    updateOutline,
  };
}
