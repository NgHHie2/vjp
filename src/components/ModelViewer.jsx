import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { EXRLoader } from "three/examples/jsm/loaders/EXRLoader";
import ViewportOverlay from "./ViewportOverlay";

export default function ModelViewer({
  autoRotate = false,
  animationSpeed = 1,
  selectedObjectName,
  isLoading,
  loadError,
  sceneRef,
  cameraRef,
  rendererRef,
  mainModelRef,
  setIsLoading,
  setLoadError,
  initControls,
  handleObjectClick,
}) {
  const mountRef = useRef(null);
  const meshesRef = useRef([]); // Lưu meshes của xe để đổi màu

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    // ==========================================
    // 1. SCENE, CAMERA & RENDERER (Cấu hình cao)
    // ==========================================
    const scene = new THREE.Scene();
    // Thêm sương mù nhẹ để tạo chiều sâu cho garage
    scene.fog = new THREE.FogExp2(0x1a1a1a, 0.05); 
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      40, // Góc nhìn hẹp giúp xe trông sang trọng hơn
      currentMount.clientWidth / currentMount.clientHeight,
      0.1,
      1000
    );
    camera.position.set(4.5, 2, 6); // Góc nhìn xéo từ trước
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Cấu hình xử lý màu sắc và bóng đổ CHUẨN
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1; // Chỉnh độ sáng tổng thể
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Bóng đổ mềm

    rendererRef.current = renderer;
    currentMount.appendChild(renderer.domElement);

    // ==========================================
    // 2. TẠO MÔ HÌNH STUDIO GARAGE (Bằng Code)
    // ==========================================
    const textureLoader = new THREE.TextureLoader();

    // A. Sàn Bê Tông (Concrete Floor)
    // Bạn nên thay bằng link texture thật để đẹp hơn, tạm thời dùng màu trơn có độ bóng
    const floorGeometry = new THREE.PlaneGeometry(30, 30);
    const floorMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x333333, // Màu xám bê tông tối
      metalness: 0.2,
      roughness: 0.6, // Hơi nhám
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2; // Nằm ngang
    floor.receiveShadow = true; // Nhận bóng đổ từ xe
    scene.add(floor);

    // B. Tường Garage (L shaped wall)
    const wallMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x1a1a1a, // Tường tối để nổi bật xe
      roughness: 0.9,
    });
    
    // Tường sau
    const backWall = new THREE.Mesh(new THREE.PlaneGeometry(30, 10), wallMaterial);
    backWall.position.set(0, 5, -5);
    backWall.receiveShadow = true;
    scene.add(backWall);

    // Tường bên
    const sideWall = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), wallMaterial);
    sideWall.position.set(-10, 5, 0);
    sideWall.rotation.y = Math.PI / 2;
    sideWall.receiveShadow = true;
    scene.add(sideWall);

    // ==========================================
    // 3. ÁNH SÁNG STUDIO GARAGE (Garage Lighting)
    // ==========================================
    
    // A. Ánh sáng môi trường (nhẹ)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    // B. Đèn dải LED trần (Ceiling Light Strips) - Tạo vệt phản chiếu đẹp trên xe
    // Đèn chính 1
    const ceilLight1 = new THREE.RectAreaLight(0xffffff, 4, 1, 10);
    ceilLight1.position.set(2, 5, 2);
    ceilLight1.lookAt(0, 0, 0);
    scene.add(ceilLight1);

    // Đèn chính 2
    const ceilLight2 = new THREE.RectAreaLight(0xffffff, 4, 1, 10);
    ceilLight2.position.set(-2, 5, 2);
    ceilLight2.lookAt(0, 0, 0);
    scene.add(ceilLight2);

    // C. Đèn chiếu điểm (Key Light) để tạo bóng đổ đổ
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.5);
    keyLight.position.set(5, 8, 5);
    keyLight.castShadow = true;
    // Cấu hình bóng đổ sắc nét
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 20;
    scene.add(keyLight);

    // D. Load HDR Environment (để lấy phản chiếu kim loại mượt)
    new EXRLoader().load("/ferndale_studio_12_4k.exr", (texture) => {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      scene.environment = texture; // Chỉ dùng làm môi trường phản chiếu, không làm nền
    });

    // ==========================================
    // 4. CONTROLS
    // ==========================================
    const controls = initControls(camera, renderer.domElement, OrbitControls);
    controls.enableDamping = true;
    controls.minDistance = 3; // Không cho zoom quá gần
    controls.maxDistance = 15; // Không cho zoom quá xa
    controls.maxPolarAngle = Math.PI / 2 - 0.05; // Không cho nhìn dưới sàn

    // ==========================================
    // 5. LOAD MODEL (VF3) & RANDOM COLOR
    // ==========================================
    const loader = new GLTFLoader();
    loader.load(
      "/vf3_hehe.glb",
      (gltf) => {
        const model = gltf.scene;

        // Auto center & scale
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const scale = 2.8 / Math.max(size.x, size.y, size.z); // Scale xe lớn hơn một chút

        model.scale.setScalar(scale);
        // Đặt xe nằm ngay trên mặt sàn (y=0)
        model.position.sub(center.multiplyScalar(scale));
        model.position.y = 0; 

        // Xử lý vật liệu xe
        model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true; // Đổ bóng xuống sàn
            child.receiveShadow = true; // Nhận bóng từ các bộ phận khác
            
            // Tăng độ bóng kim loại cho xe VF3 trông "thật" hơn dưới đèn garage
            if (child.material.name.includes("Paint") || child.material.name.includes("Car")) {
                child.material.roughness = 0.1; 
                child.material.metalness = 0.8;
            }

            // --- Logic Đổi Màu Random (HSL mượt) ---
            // Chỉ đổi màu các phần sơn xe (Car Paint)
            // LƯU Ý: Bạn cần kiểm tra tên material thật trong file .glb của bạn
            if (child.material.name.includes("Paint")) { 
                child.material = child.material.clone();
                child.userData.hue = Math.random(); 
                meshesRef.current.push(child);
            }
          }
        });

        scene.add(model);
        mainModelRef.current = model;
        setIsLoading(false);
      },
      undefined,
      (error) => {
        console.error(error);
        setLoadError("Failed to load car model");
        setIsLoading(false);
      }
    );

    // ==========================================
    // 6. ANIMATION LOOP
    // ==========================================
    let frameId;
    const animate = () => {
      frameId = requestAnimationFrame(animate);

      controls.update();

      if (autoRotate && mainModelRef.current) {
        mainModelRef.current.rotation.y += 0.003 * animationSpeed;
      }

      // --- RANDOM COLOR LOGIC ---
      meshesRef.current.forEach((mesh) => {
        mesh.userData.hue += 0.02; // Tốc độ đổi màu chậm lại cho sang
        if (mesh.userData.hue > 1) mesh.userData.hue = 0;
        // Màu rực rỡ (S=0.9), độ sáng vừa phải (L=0.5)
        mesh.material.color.setHSL(mesh.userData.hue, 0.9, 0.5);
      });

      renderer.render(scene, camera);
    };

    animate();

    // ==========================================
    // 7. CLEANUP & RESIZE
    // ==========================================
    const handleResize = () => {
      if (!currentMount) return;
      camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(frameId);
      
      renderer.dispose();
      // Dispose sàn và tường
      floorGeometry.dispose();
      floorMaterial.dispose();
      wallMaterial.dispose();
      
      meshesRef.current.forEach(m => {
        m.geometry.dispose();
        m.material.dispose();
      });

      if (currentMount && renderer.domElement) {
        if (currentMount.contains(renderer.domElement)) {
          currentMount.removeChild(renderer.domElement);
        }
      }
    };
  }, []);

  // Removed backgroundColor update effect as we use a 3D background

  return (
    <div className="flex-1 relative w-full h-full bg-black"> {/* Nền đen phía sau */}
      <div
        ref={mountRef}
        className="w-full h-full outline-none"
        // onClick thay vì onMouseDown để tránh conflict với OrbitControls
        onClick={(e) => handleObjectClick(e, mountRef)}
      />
      <ViewportOverlay
        selectedObjectName={selectedObjectName}
        isLoading={isLoading}
        loadError={loadError}
      />
    </div>
  );
}