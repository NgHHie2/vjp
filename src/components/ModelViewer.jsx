import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import ViewportOverlay from "./ViewportOverlay";

export default function ModelViewer({
  backgroundColor,
  autoRotate,
  animationSpeed,
  selectedObjectName,
  isLoading,
  loadError,
  sceneRef,
  cameraRef,
  rendererRef,
  mainModelRef,
  objectsRef,
  selectedObjectRef,
  setIsLoading,
  setLoadError,
  controlsRef,
  initControls,
  updateControls,
  handleObjectClick,
  updateOutline,
}) {
  const mountRef = useRef(null);

  // Initialize Three.js scene
  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x0a0e1a, 10, 50);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000,
    );
    camera.position.set(0, 2, 5);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(
      mountRef.current.clientWidth,
      mountRef.current.clientHeight,
    );
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    mountRef.current.appendChild(renderer.domElement);

    // Initialize OrbitControls
    const controls = initControls(camera, renderer.domElement, OrbitControls);

    // Lights
    // ============================================
    // LIGHTING SETUP - SÁNG ĐỀU MỌI HƯỚNG
    // ============================================

    // 1. AMBIENT LIGHT - Ánh sáng tổng thể
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2); // Tăng mạnh!
    scene.add(ambientLight);

    // 2. DIRECTIONAL LIGHTS - 4 hướng
    // Từ trên
    const topLight = new THREE.DirectionalLight(0xffffff, 0.6);
    topLight.position.set(0, 10, 0);
    topLight.castShadow = true;
    topLight.shadow.camera.near = 0.1;
    topLight.shadow.camera.far = 50;
    topLight.shadow.mapSize.width = 2048;
    topLight.shadow.mapSize.height = 2048;
    scene.add(topLight);

    // Từ trước
    const frontLight = new THREE.DirectionalLight(0xffffff, 0.5);
    frontLight.position.set(0, 3, 10);
    scene.add(frontLight);

    // Từ sau
    const backLight = new THREE.DirectionalLight(0xffffff, 0.5);
    backLight.position.set(0, 3, -10);
    scene.add(backLight);

    // Từ trái
    const leftLight = new THREE.DirectionalLight(0xffffff, 0.4);
    leftLight.position.set(-10, 3, 0);
    scene.add(leftLight);

    // Từ phải
    const rightLight = new THREE.DirectionalLight(0xffffff, 0.4);
    rightLight.position.set(10, 3, 0);
    scene.add(rightLight);

    // 3. TẮT HOẶC GIẢM POINT LIGHTS (nếu không muốn màu cyan/magenta)
    // Comment 2 dòng này nếu muốn tắt:
    const pointLight1 = new THREE.PointLight(0x00ffff, 0.2, 100);
    pointLight1.position.set(-5, 3, -5);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xff00ff, 0.1, 100);
    pointLight2.position.set(5, 3, 5);
    scene.add(pointLight2);

    // Grid
    const gridHelper = new THREE.GridHelper(20, 20, 0x00ffff, 0x1a2332);
    gridHelper.material.opacity = 0.3;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);

    // Ground plane
    const planeGeometry = new THREE.PlaneGeometry(20, 20);
    const planeMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a2332,
      metalness: 0.3,
      roughness: 0.8,
    });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -2;
    plane.receiveShadow = true;
    scene.add(plane);

    // Load GLB Model
    const loader = new GLTFLoader();
    const modelPath = "/scene.glb";

    loader.load(
      modelPath,
      (gltf) => {
        const model = gltf.scene;

        model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            child.userData.isMainModel = true;
          }
        });

        // Center and scale the model
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 2 / maxDim;
        model.scale.multiplyScalar(scale);

        model.position.x = -center.x * scale;
        model.position.y = -center.y * scale;
        model.position.z = -center.z * scale;

        scene.add(model);
        mainModelRef.current = model;
        setIsLoading(false);
        console.log("✅ Model loaded successfully!");
      },
      (progress) => {
        const percent = ((progress.loaded / progress.total) * 100).toFixed(2);
        console.log("📦 Loading progress:", percent + "%");
      },
      (error) => {
        console.error("❌ Error loading model:", error);
        setLoadError(
          `Failed to load "${modelPath}". Make sure the file exists in the public folder.`,
        );
        setIsLoading(false);
      },
    );

    // Animation loop
    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Update OrbitControls
      updateControls();

      // Auto rotate
      if (autoRotate) {
        if (selectedObjectRef.current) {
          selectedObjectRef.current.rotation.y += 0.01 * animationSpeed;
        } else if (mainModelRef.current) {
          mainModelRef.current.rotation.y += 0.01 * animationSpeed;
        }
      }

      // Animate decorative objects
      objectsRef.current.forEach((obj, index) => {
        if (obj !== selectedObjectRef.current) {
          obj.rotation.x += 0.005 * (index + 1);
          obj.rotation.y += 0.01 * (index + 1);
        }
      });

      // Update outline
      updateOutline();

      renderer.render(scene, camera);
    };
    animate();

    // Handle window resize
    const handleResize = () => {
      if (!mountRef.current) return;
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      controls.dispose();
      renderer.dispose();
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach((mat) => mat.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
    };
  }, []);

  // Update background color
  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.background = new THREE.Color(backgroundColor);
      sceneRef.current.fog.color = new THREE.Color(backgroundColor);
    }
  }, [backgroundColor]);

  // Handle click for object selection
  const handleClick = (e) => {
    // Only select on left click (button 0)
    if (e.button === 0) {
      handleObjectClick(e, mountRef);
    }
  };

  return (
    <div className="flex-1 relative">
      <div
        ref={mountRef}
        className="w-full h-full cursor-pointer"
        onMouseDown={handleClick}
      />

      <ViewportOverlay
        selectedObjectName={selectedObjectName}
        isLoading={isLoading}
        loadError={loadError}
      />
    </div>
  );
}
