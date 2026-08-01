import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { MediaItem, Album, View3DStyle, ThemeMode } from '../types';
import { playSoundEffect } from '../utils/audioSynth';
import { RotateCw, ZoomIn, ZoomOut, Sparkles, Layers, Box, Compass, Volume2, VolumeX, Eye } from 'lucide-react';

interface Gallery3DProps {
  items: MediaItem[];
  albums: Album[];
  onSelectMedia: (item: MediaItem) => void;
  onSelectAlbum: (albumId: string) => void;
  soundEffectsEnabled: boolean;
  backgroundMusicEnabled: boolean;
  onToggleBGM: () => void;
  themeMode?: ThemeMode;
}

export const Gallery3D: React.FC<Gallery3DProps> = ({
  items,
  albums,
  onSelectMedia,
  onSelectAlbum,
  soundEffectsEnabled,
  backgroundMusicEnabled,
  onToggleBGM,
  themeMode = 'dark',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [layoutStyle, setLayoutStyle] = useState<View3DStyle>('floating_cubes');
  const [hoveredItem, setHoveredItem] = useState<{ id: string; name: string; type: string; count?: number; coverUrl?: string } | null>(null);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const meshesRef = useRef<{ mesh: THREE.Mesh; data: any; initialPos: THREE.Vector3 }[]>([]);

  // Drag Orbit Control States
  const isDraggingRef = useRef(false);
  const previousMouseRef = useRef({ x: 0, y: 0 });
  const rotationTargetRef = useRef({ x: 0, y: 0 });
  const rotationCurrentRef = useRef({ x: 0, y: 0 });
  const zoomRef = useRef(18);

  const isLight = themeMode === 'light';
  const isAmoled = themeMode === 'amoled';

  useEffect(() => {
    if (!mountRef.current) return;

    const container = mountRef.current;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || (window.innerHeight - 120);

    // 1. Setup Scene, Camera, Renderer
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Theme dependent Fog & Background
    const fogColor = isLight ? 0xf8fafc : isAmoled ? 0x000000 : 0x060814;
    scene.fog = new THREE.FogExp2(fogColor, 0.02);

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 0, zoomRef.current);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.appendChild(renderer.domElement);

    // 2. Lighting Setup based on Theme Mode
    if (isLight) {
      // High ambient studio light for Light Mode
      const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
      scene.add(ambientLight);

      const mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
      mainLight.position.set(15, 20, 15);
      mainLight.castShadow = true;
      scene.add(mainLight);

      const fillLight = new THREE.PointLight(0x818cf8, 1, 40);
      fillLight.position.set(-10, -10, 10);
      scene.add(fillLight);
    } else if (isAmoled) {
      // Stark neon contrast light for AMOLED Pure Black
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      scene.add(ambientLight);

      const pinkLight = new THREE.PointLight(0xec4899, 4, 50);
      pinkLight.position.set(10, 15, 10);
      scene.add(pinkLight);

      const cyanLight = new THREE.PointLight(0x06b6d4, 4, 50);
      cyanLight.position.set(-10, -10, 10);
      scene.add(cyanLight);
    } else {
      // Default Cyber Dark Mode
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
      scene.add(ambientLight);

      const blueLight = new THREE.PointLight(0x3b82f6, 3, 50);
      blueLight.position.set(10, 15, 10);
      scene.add(blueLight);

      const purpleLight = new THREE.PointLight(0xa855f7, 3, 50);
      purpleLight.position.set(-10, -10, 10);
      scene.add(purpleLight);

      const cyanLight = new THREE.PointLight(0x06b6d4, 2, 40);
      cyanLight.position.set(0, 0, 20);
      scene.add(cyanLight);
    }

    // 3. Futuristic Background Particle System
    const particleCount = 400;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 80;
      particlePositions[i + 1] = (Math.random() - 0.5) * 80;
      particlePositions[i + 2] = (Math.random() - 0.5) * 80;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMaterial = new THREE.PointsMaterial({
      size: 0.25,
      color: isLight ? 0x64748b : isAmoled ? 0xec4899 : 0x818cf8,
      transparent: true,
      opacity: isLight ? 0.4 : 0.6,
      blending: THREE.AdditiveBlending,
    });
    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleSystem);

    // 4. Generate Texture for Mesh Canvas
    const textureLoader = new THREE.TextureLoader();

    // Combine Albums and Media Items for 3D Cards
    const displayData: any[] = [
      ...albums.map((a) => ({
        id: a.id,
        title: a.name,
        type: 'album',
        coverUrl: a.coverUrl,
        count: a.itemCount,
        albumObj: a,
      })),
      ...items.slice(0, 16).map((m) => ({
        id: m.id,
        title: m.title,
        type: 'media',
        coverUrl: m.thumbnailUrl || m.url,
        mediaObj: m,
      })),
    ];

    meshesRef.current = [];

    // Create 3D Cards
    displayData.forEach((data, index) => {
      const geometry = new THREE.BoxGeometry(2.4, 2.4, 0.2);

      // Create fallback colored dynamic canvas texture if image loading
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d')!;

      // Gradient background
      const grad = ctx.createLinearGradient(0, 0, 512, 512);
      if (data.type === 'album') {
        grad.addColorStop(0, '#1e1b4b');
        grad.addColorStop(1, '#312e81');
      } else {
        grad.addColorStop(0, '#0f172a');
        grad.addColorStop(1, '#1e293b');
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 512);

      // Border glow accent
      ctx.strokeStyle = data.type === 'album' ? '#38bdf8' : '#a855f7';
      ctx.lineWidth = 16;
      ctx.strokeRect(8, 8, 496, 496);

      // Title & Badge text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(data.title.substring(0, 20), 256, 430);

      if (data.count !== undefined) {
        ctx.fillStyle = '#38bdf8';
        ctx.font = '24px sans-serif';
        ctx.fillText(`${data.count} Items`, 256, 470);
      }

      const defaultTexture = new THREE.CanvasTexture(canvas);

      // Material materials array (box faces)
      const materials = [
        new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3, metalness: 0.8 }), // right
        new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3, metalness: 0.8 }), // left
        new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3, metalness: 0.8 }), // top
        new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3, metalness: 0.8 }), // bottom
        new THREE.MeshStandardMaterial({ map: defaultTexture, roughness: 0.2, metalness: 0.2 }), // front
        new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 }), // back
      ];

      // Async load actual cover photo texture
      if (data.coverUrl) {
        textureLoader.load(
          data.coverUrl,
          (tex) => {
            tex.colorSpace = THREE.SRGBColorSpace;
            materials[4] = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.1, metalness: 0.1 });
          },
          undefined,
          () => {}
        );
      }

      const mesh = new THREE.Mesh(geometry, materials);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData = data;

      scene.add(mesh);

      meshesRef.current.push({
        mesh,
        data,
        initialPos: new THREE.Vector3(),
      });
    });

    // Update Layout Positions initially
    updateLayoutPositions(layoutStyle, meshesRef.current);

    // 5. Mouse Raycasting for Selection & Hover
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerDown = (e: PointerEvent) => {
      isDraggingRef.current = true;
      previousMouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handlePointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / container.clientWidth) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / container.clientHeight) * 2 + 1;

      if (isDraggingRef.current) {
        const deltaX = e.clientX - previousMouseRef.current.x;
        const deltaY = e.clientY - previousMouseRef.current.y;

        rotationTargetRef.current.y += deltaX * 0.005;
        rotationTargetRef.current.x += deltaY * 0.005;

        previousMouseRef.current = { x: e.clientX, y: e.clientY };

        playSoundEffect('rotate', soundEffectsEnabled);
      }

      // Check Hover
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(meshesRef.current.map((m) => m.mesh));

      if (intersects.length > 0) {
        const hitData = intersects[0].object.userData;
        setHoveredItem({
          id: hitData.id,
          name: hitData.title,
          type: hitData.type,
          count: hitData.count,
          coverUrl: hitData.coverUrl,
        });
        container.style.cursor = 'pointer';
      } else {
        setHoveredItem(null);
        if (!isDraggingRef.current) {
          container.style.cursor = 'grab';
        }
      }
    };

    const handlePointerUp = () => {
      isDraggingRef.current = false;
      container.style.cursor = 'grab';
    };

    const handleClick = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / container.clientWidth) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / container.clientHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(meshesRef.current.map((m) => m.mesh));

      if (intersects.length > 0) {
        const hitData = intersects[0].object.userData;
        playSoundEffect('click', soundEffectsEnabled);

        if (hitData.type === 'album') {
          onSelectAlbum(hitData.id);
        } else if (hitData.type === 'media' && hitData.mediaObj) {
          onSelectMedia(hitData.mediaObj);
        }
      }
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      zoomRef.current = Math.min(Math.max(zoomRef.current + e.deltaY * 0.015, 6), 35);
    };

    container.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    container.addEventListener('click', handleClick);
    container.addEventListener('wheel', handleWheel, { passive: false });

    // 6. Animation Loop (60 FPS Smooth)
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Smooth camera orbit rotation
      rotationCurrentRef.current.x += (rotationTargetRef.current.x - rotationCurrentRef.current.x) * 0.08;
      rotationCurrentRef.current.y += (rotationTargetRef.current.y - rotationCurrentRef.current.y) * 0.08;

      if (cameraRef.current) {
        cameraRef.current.position.x = Math.sin(rotationCurrentRef.current.y) * zoomRef.current;
        cameraRef.current.position.z = Math.cos(rotationCurrentRef.current.y) * zoomRef.current;
        cameraRef.current.position.y = Math.sin(rotationCurrentRef.current.x) * (zoomRef.current * 0.5);
        cameraRef.current.lookAt(0, 0, 0);
      }

      // Gentle Floating Levitation Animation for cards
      meshesRef.current.forEach(({ mesh, initialPos }, i) => {
        mesh.position.y = initialPos.y + Math.sin(elapsedTime * 1.5 + i * 0.5) * 0.15;
        mesh.rotation.y += 0.002;
      });

      // Background particle drift
      particleSystem.rotation.y = elapsedTime * 0.02;

      renderer.render(scene, camera);
    };

    animate();

    // 7. Window Resize Listener
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      container.removeEventListener('click', handleClick);
      container.removeEventListener('wheel', handleWheel);
      if (rendererRef.current && rendererRef.current.domElement) {
        container.removeChild(rendererRef.current.domElement);
      }
    };
  }, [items, albums]);

  // Handle 3D Layout Style Changes
  useEffect(() => {
    if (meshesRef.current.length > 0) {
      updateLayoutPositions(layoutStyle, meshesRef.current);
    }
  }, [layoutStyle]);

  function updateLayoutPositions(style: View3DStyle, meshList: { mesh: THREE.Mesh; initialPos: THREE.Vector3 }[]) {
    const total = meshList.length;

    meshList.forEach(({ mesh, initialPos }, index) => {
      let targetX = 0;
      let targetY = 0;
      let targetZ = 0;

      if (style === 'floating_cubes') {
        // Random 3D Cloud
        const phi = Math.acos(-1 + (2 * index) / total);
        const theta = Math.sqrt(total * Math.PI) * phi;
        const radius = 9;

        targetX = radius * Math.cos(theta) * Math.sin(phi);
        targetY = radius * Math.sin(theta) * Math.sin(phi);
        targetZ = radius * Math.cos(phi);
      } else if (style === 'helix_carousel') {
        // Cylindrical Helix Spiral
        const angle = index * 0.5;
        const radius = 8;
        targetX = radius * Math.sin(angle);
        targetZ = radius * Math.cos(angle);
        targetY = (index - total / 2) * 1.2;
      } else if (style === 'sphere_cloud') {
        // Sphere Globe Orbit
        const phi = Math.acos(-1 + (2 * index) / total);
        const theta = Math.sqrt(total * Math.PI) * phi;
        const radius = 10;
        targetX = radius * Math.cos(theta) * Math.sin(phi);
        targetY = radius * Math.sin(theta) * Math.sin(phi);
        targetZ = radius * Math.cos(phi);
      } else if (style === 'wall_grid') {
        // Curved 3D Wall
        const cols = 5;
        const col = index % cols;
        const row = Math.floor(index / cols);

        targetX = (col - (cols - 1) / 2) * 3.2;
        targetY = (row - 1.5) * -3.2;
        targetZ = -Math.abs(targetX) * 0.15; // subtle curve
      }

      initialPos.set(targetX, targetY, targetZ);
      mesh.position.set(targetX, targetY, targetZ);
      mesh.lookAt(0, 0, 0);
    });
  }

  return (
    <div className="relative w-full h-[calc(100vh-130px)] overflow-hidden bg-slate-950 select-none rounded-2xl border border-slate-800 shadow-2xl">
      {/* 3D Render Canvas Container */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating Futuristic HUD Header */}
      <div className="absolute top-4 left-4 right-4 flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/70 backdrop-blur-md border border-slate-800 shadow-xl pointer-events-auto z-10">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
          <span className="text-sm font-semibold text-slate-100 tracking-wide uppercase">3D Spatial Matrix</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
            60 FPS WebGL
          </span>
        </div>

        {/* 3D Layout Style Selector */}
        <div className="flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => {
              setLayoutStyle('floating_cubes');
              playSoundEffect('click', soundEffectsEnabled);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              layoutStyle === 'floating_cubes'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            Floating
          </button>
          <button
            onClick={() => {
              setLayoutStyle('helix_carousel');
              playSoundEffect('click', soundEffectsEnabled);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              layoutStyle === 'helix_carousel'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Helix 3D
          </button>
          <button
            onClick={() => {
              setLayoutStyle('sphere_cloud');
              playSoundEffect('click', soundEffectsEnabled);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              layoutStyle === 'sphere_cloud'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            Sphere Globe
          </button>
          <button
            onClick={() => {
              setLayoutStyle('wall_grid');
              playSoundEffect('click', soundEffectsEnabled);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              layoutStyle === 'wall_grid'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <RotateCw className="w-3.5 h-3.5" />
            Curved Wall
          </button>
        </div>

        {/* Audio Toggle & Zoom controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleBGM}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
              backgroundMusicEnabled
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-emerald-950/50'
                : 'bg-slate-800/80 text-slate-400 border-slate-700'
            }`}
            title="Toggle Ambient Background Music"
          >
            {backgroundMusicEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-400 animate-pulse" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>{backgroundMusicEnabled ? 'BGM ON' : 'BGM OFF'}</span>
          </button>

          <button
            onClick={() => {
              zoomRef.current = Math.max(zoomRef.current - 4, 6);
              playSoundEffect('click', soundEffectsEnabled);
            }}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              zoomRef.current = Math.min(zoomRef.current + 4, 35);
              playSoundEffect('click', soundEffectsEnabled);
            }}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Holographic Target Info Badge on Hover */}
      {hoveredItem && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 px-5 py-3 rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-purple-500/40 shadow-2xl shadow-purple-950/60 pointer-events-none transition-all animate-in fade-in slide-in-from-bottom-2 z-20">
          {hoveredItem.coverUrl && (
            <img src={hoveredItem.coverUrl} alt="Cover" className="w-12 h-12 rounded-xl object-cover border border-purple-500/30" />
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">{hoveredItem.name}</span>
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {hoveredItem.type}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {hoveredItem.count !== undefined ? `${hoveredItem.count} items in album` : 'Click to open in full screen viewer'}
            </p>
          </div>
          <Eye className="w-4 h-4 text-purple-400 ml-2 animate-bounce" />
        </div>
      )}

      {/* Instructions Footer */}
      <div className="absolute bottom-3 left-4 text-[11px] text-slate-400/80 pointer-events-none hidden sm:block">
        💡 Drag to orbit scene • Scroll to zoom • Click 3D card to open
      </div>
    </div>
  );
};
